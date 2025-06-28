from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from .models import Note, NoteStatus
from .ai_service import gemini_service
from . import db
from datetime import datetime
from sqlalchemy import or_

notes_bp = Blueprint('notes', __name__)

@notes_bp.route('/', methods=['GET'])
@jwt_required()
def get_notes():
    """Get all active notes for user, archive expired ones"""
    user_id = get_jwt_identity()
    
    # First, archive any expired notes
    expired_notes = Note.query.filter_by(
        user_id=user_id, 
        status=NoteStatus.ACTIVE
    ).all()
    
    for note in expired_notes:
        if note.is_expired:
            note.archive()
    
    db.session.commit()
    
    # Get all active notes
    notes = Note.query.filter_by(
        user_id=user_id, 
        status=NoteStatus.ACTIVE
    ).order_by(Note.last_revised.desc()).all()
    
    return jsonify({
        'notes': [note.to_dict() for note in notes]
    }), 200

@notes_bp.route('/', methods=['POST'])
@jwt_required()
def create_note():
    """Create a new note"""
    user_id = get_jwt_identity()
    data = request.get_json()
    
    title = data.get('title', '').strip()
    content = data.get('content', '').strip()
    decay_minutes = data.get('decay_minutes', 1440)  # Default 24 hours
    
    if not title or not content:
        return jsonify({'error': 'Title and content are required'}), 400
    
    if decay_minutes < 1 or decay_minutes > 10080:  # Max 1 week
        return jsonify({'error': 'Decay time must be between 1 minute and 1 week'}), 400
    
    note = Note(
        title=title,
        content=content,
        user_id=user_id,
        decay_minutes=decay_minutes,
        original_decay_minutes=decay_minutes  # Store the original decay time
    )
    
    db.session.add(note)
    db.session.commit()
    
    return jsonify({
        'message': 'Note created successfully',
        'note': note.to_dict()
    }), 201

@notes_bp.route('/<int:note_id>', methods=['GET'])
@jwt_required()
def get_note(note_id):
    """Get specific note and update last_revised (touching the note)"""
    user_id = get_jwt_identity()
    
    note = Note.query.filter_by(id=note_id, user_id=user_id).first()
    if not note:
        return jsonify({'error': 'Note not found'}), 404
    
    # If note is active and not expired, touch it
    if note.status == NoteStatus.ACTIVE and not note.is_expired:
        note.touch()
        db.session.commit()
    
    return jsonify({'note': note.to_dict()}), 200

@notes_bp.route('/<int:note_id>', methods=['PUT'])
@jwt_required()
def update_note(note_id):
    """Update note content and refresh timer"""
    user_id = get_jwt_identity()
    data = request.get_json()
    
    note = Note.query.filter_by(id=note_id, user_id=user_id).first()
    if not note:
        return jsonify({'error': 'Note not found'}), 404
    
    if note.status == NoteStatus.ARCHIVED:
        return jsonify({'error': 'Cannot edit archived note. Revive it first.'}), 400
    
    # Update fields
    if 'title' in data:
        note.title = data['title'].strip()
    if 'content' in data:
        note.content = data['content'].strip()
    if 'decay_minutes' in data:
        new_decay = data['decay_minutes']
        # If changing decay time, update both current and original, and reset penalties
        if new_decay != note.original_decay_minutes:
            note.original_decay_minutes = new_decay
            note.decay_minutes = new_decay
            note.reset_penalties()  # Reset penalties when decay time is changed
    
    # Touch the note (reset timer)
    note.touch()
    
    db.session.commit()
    
    return jsonify({
        'message': 'Note updated successfully',
        'note': note.to_dict()
    }), 200

@notes_bp.route('/<int:note_id>/ai-revision', methods=['POST'])
@jwt_required()
def get_ai_revision(note_id):
    """Generate AI summary and questions for note revision"""
    user_id = get_jwt_identity()
    
    note = Note.query.filter_by(id=note_id, user_id=user_id).first()
    if not note:
        return jsonify({'error': 'Note not found'}), 404
    
    if note.status == NoteStatus.ARCHIVED:
        return jsonify({'error': 'Cannot revise archived note. Try to revive it first.'}), 400
    
    # Generate AI content
    ai_result = gemini_service.generate_summary_and_questions(note.title, note.content)
    
    # Store AI content in note
    note.ai_summary = ai_result['summary']
    note.ai_questions = ai_result['questions']
    
    # Touch the note (engaging with it extends timer)
    note.touch()
    
    db.session.commit()
    
    return jsonify({
        'summary': ai_result['summary'],
        'questions': ai_result['questions'],
        'note': note.to_dict(),
        'message': 'Ready for revision! Answer the questions to test your memory.'
    }), 200

@notes_bp.route('/<int:note_id>/answer-question', methods=['POST'])
@jwt_required()
def answer_revision_question(note_id):
    """Answer a revision question during active study session"""
    user_id = get_jwt_identity()
    data = request.get_json()
    
    note = Note.query.filter_by(id=note_id, user_id=user_id).first()
    if not note:
        return jsonify({'error': 'Note not found'}), 404
    
    if note.status == NoteStatus.ARCHIVED:
        return jsonify({'error': 'Cannot answer questions for archived note.'}), 400
    
    question_index = data.get('question_index', 0)
    user_answer = data.get('answer', '').strip()
    
    if not user_answer:
        return jsonify({'error': 'Answer is required'}), 400
    
    # Ensure AI questions exist
    if not note.ai_questions or question_index >= len(note.ai_questions):
        return jsonify({'error': 'No questions available or invalid question index'}), 400
    
    question = note.ai_questions[question_index]
    
    # Validate answer with AI
    is_valid = gemini_service.validate_answer(question, user_answer, note.content)
    
    if is_valid:
        # Correct answer - touch the note to extend timer
        note.touch()
        db.session.commit()
        
        return jsonify({
            'correct': True,
            'message': 'Correct! Your memory is strong. Timer refreshed.',
            'note': note.to_dict()
        }), 200
    else:
        # Wrong answer - apply penalty immediately
        penalty_info = note.apply_wrong_answer_penalty()
        note.touch()  # Still touch to refresh timer, but with reduced time
        db.session.commit()
        
        return jsonify({
            'correct': False,
            'message': f'Incorrect answer. Decay time reduced to {penalty_info["new_decay_minutes"]} minutes.',
            'penalty_info': penalty_info,
            'note': note.to_dict(),
            'feedback': 'Study this note more carefully before the next revision!'
        }), 200

@notes_bp.route('/archived', methods=['GET'])
@jwt_required()
def get_archived_notes():
    """Get all archived notes"""
    user_id = get_jwt_identity()
    
    notes = Note.query.filter_by(
        user_id=user_id, 
        status=NoteStatus.ARCHIVED
    ).order_by(Note.archived_at.desc()).all()
    
    return jsonify({
        'archived_notes': [note.to_dict() for note in notes]
    }), 200

@notes_bp.route('/<int:note_id>/revive', methods=['POST'])
@jwt_required()
def revive_note(note_id):
    """Revive archived note by answering AI question"""
    user_id = get_jwt_identity()
    data = request.get_json()
    
    note = Note.query.filter_by(id=note_id, user_id=user_id).first()
    if not note:
        return jsonify({'error': 'Note not found'}), 404
    
    if note.status != NoteStatus.ARCHIVED:
        return jsonify({'error': 'Note is not archived'}), 400
    
    question_index = data.get('question_index', 0)
    user_answer = data.get('answer', '').strip()
    
    if not user_answer:
        return jsonify({'error': 'Answer is required'}), 400
    
    # Generate AI questions if not present
    if not note.ai_questions:
        ai_result = gemini_service.generate_summary_and_questions(note.title, note.content)
        note.ai_summary = ai_result['summary']
        note.ai_questions = ai_result['questions']
        db.session.commit()
    
    if question_index >= len(note.ai_questions):
        return jsonify({'error': 'Invalid question'}), 400
    
    question = note.ai_questions[question_index]
    
    # Validate answer with AI
    is_valid = gemini_service.validate_answer(question, user_answer, note.content)
    
    if is_valid:
        # Correct answer - revive the note and reset penalties
        note.revive()
        db.session.commit()
        
        return jsonify({
            'message': 'Note revived successfully! Memory restored and penalties cleared.',
            'note': note.to_dict(),
            'correct_answer': True
        }), 200
    else:
        # Wrong answer - apply penalty and keep note archived
        penalty_info = note.apply_wrong_answer_penalty()
        db.session.commit()
        
        return jsonify({
            'error': f'Answer needs more detail. Decay time reduced to {penalty_info["new_decay_minutes"]} minutes due to wrong answer.',
            'penalty_info': penalty_info,
            'note': note.to_dict(),
            'correct_answer': False,
            'hint': 'Try to provide more specific details about the content to revive this memory.'
        }, 400)

@notes_bp.route('/<int:note_id>', methods=['DELETE'])
@jwt_required()
def delete_note(note_id):
    """Permanently delete a note"""
    user_id = get_jwt_identity()
    
    note = Note.query.filter_by(id=note_id, user_id=user_id).first()
    if not note:
        return jsonify({'error': 'Note not found'}), 404
    
    db.session.delete(note)
    db.session.commit()
    
    return jsonify({'message': 'Note deleted permanently'}), 200

@notes_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_stats():
    """Get user's note statistics"""
    user_id = get_jwt_identity()
    
    active_count = Note.query.filter_by(user_id=user_id, status=NoteStatus.ACTIVE).count()
    archived_count = Note.query.filter_by(user_id=user_id, status=NoteStatus.ARCHIVED).count()
    revived_count = Note.query.filter_by(user_id=user_id, status=NoteStatus.REVIVED).count()
    
    return jsonify({
        'stats': {
            'active_notes': active_count,
            'archived_notes': archived_count,
            'revived_notes': revived_count,
            'total_notes': active_count + archived_count + revived_count
        }
    }), 200

@notes_bp.route('/batch-archive', methods=['POST'])
@jwt_required()
def batch_archive_expired():
    """Manually trigger archiving of expired notes"""
    user_id = get_jwt_identity()
    
    expired_notes = Note.query.filter_by(
        user_id=user_id, 
        status=NoteStatus.ACTIVE
    ).all()
    
    archived_count = 0
    for note in expired_notes:
        if note.is_expired:
            # Generate AI content before archiving if not present
            if not note.ai_summary or not note.ai_questions:
                try:
                    ai_result = gemini_service.generate_summary_and_questions(
                        note.title, note.content
                    )
                    note.ai_summary = ai_result['summary']
                    note.ai_questions = ai_result['questions']
                except Exception as e:
                    pass  # Continue even if AI fails
            
            note.archive()
            archived_count += 1
    
    db.session.commit()
    
    return jsonify({
        'message': f'Archived {archived_count} expired notes',
        'archived_count': archived_count
    }), 200

@notes_bp.route('/<int:note_id>/reset-penalties', methods=['POST'])
@jwt_required()
def reset_note_penalties(note_id):
    """Reset penalties for a note (admin/premium feature)"""
    user_id = get_jwt_identity()
    
    note = Note.query.filter_by(id=note_id, user_id=user_id).first()
    if not note:
        return jsonify({'error': 'Note not found'}), 404
    
    old_decay = note.decay_minutes
    note.reset_penalties()
    db.session.commit()
    
    return jsonify({
        'message': 'Penalties reset successfully',
        'note': note.to_dict(),
        'decay_restored_from': old_decay,
        'decay_restored_to': note.decay_minutes
    }), 200

@notes_bp.route('/<int:note_id>/penalty-info', methods=['GET'])
@jwt_required()
def get_penalty_info(note_id):
    """Get detailed penalty information for a note"""
    user_id = get_jwt_identity()
    
    note = Note.query.filter_by(id=note_id, user_id=user_id).first()
    if not note:
        return jsonify({'error': 'Note not found'}), 404
    
    penalty_percentage = 0
    if note.penalty_applied and note.original_decay_minutes > 0:
        penalty_percentage = round(((note.original_decay_minutes - note.decay_minutes) / note.original_decay_minutes) * 100, 1)
    
    return jsonify({
        'note_id': note.id,
        'title': note.title,
        'wrong_answers_count': note.wrong_answers_count,
        'penalty_applied': note.penalty_applied,
        'penalty_percentage': penalty_percentage,
        'original_decay_minutes': note.original_decay_minutes,
        'current_decay_minutes': note.decay_minutes,
        'time_reduction_minutes': note.original_decay_minutes - note.decay_minutes,
        'max_penalties_reached': note.wrong_answers_count >= 5,  # After 5 wrong answers, 62.5% reduction
        'next_penalty_reduction': min(12.5, 62.5 - penalty_percentage) if penalty_percentage < 62.5 else 0
    }), 200

@notes_bp.route('/<int:note_id>/complete-revision', methods=['POST'])
@jwt_required()
def complete_revision_session(note_id):
    """Complete a revision session and get final results"""
    user_id = get_jwt_identity()
    data = request.get_json()
    
    note = Note.query.filter_by(id=note_id, user_id=user_id).first()
    if not note:
        return jsonify({'error': 'Note not found'}), 404
    
    # Get session results
    correct_answers = data.get('correct_answers', 0)
    total_questions = data.get('total_questions', 0)
    
    if total_questions == 0:
        return jsonify({'error': 'No questions answered'}), 400
    
    score_percentage = (correct_answers / total_questions) * 100
    
    # Touch the note to refresh timer
    note.touch()
    
    # Bonus: If user gets all questions right, give a small bonus
    bonus_applied = False
    if score_percentage == 100 and note.penalty_applied:
        # Reduce penalty by 25% for perfect score
        old_wrong_count = note.wrong_answers_count
        note.wrong_answers_count = max(0, note.wrong_answers_count - 1)
        
        # Recalculate decay time
        if note.wrong_answers_count == 0:
            note.reset_penalties()
        else:
            penalty_percentage = min(0.125 * note.wrong_answers_count, 0.625)
            new_decay_minutes = int(note.original_decay_minutes * (1 - penalty_percentage))
            note.decay_minutes = max(new_decay_minutes, 30)
        
        bonus_applied = True
    
    db.session.commit()
    
    return jsonify({
        'session_complete': True,
        'score': {
            'correct': correct_answers,
            'total': total_questions,
            'percentage': round(score_percentage, 1)
        },
        'note': note.to_dict(),
        'message': f'Revision complete! Score: {correct_answers}/{total_questions} ({score_percentage:.1f}%)',
        'bonus_applied': bonus_applied
    }), 200
