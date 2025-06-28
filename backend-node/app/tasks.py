from . import db
from .models import Note, NoteStatus
from .ai_service import gemini_service
from flask import current_app
from datetime import datetime

def archive_expired_notes():
    """Background task to archive expired notes"""
    with current_app.app_context():
        expired_notes = Note.query.filter_by(status=NoteStatus.ACTIVE).all()
        
        archived_count = 0
        for note in expired_notes:
            if note.is_expired:
                # Generate AI content before archiving
                if not note.ai_summary or not note.ai_questions:
                    try:
                        ai_result = gemini_service.generate_summary_and_questions(
                            note.title, note.content
                        )
                        note.ai_summary = ai_result['summary']
                        note.ai_questions = ai_result['questions']
                    except Exception as e:
                        current_app.logger.error(f"AI generation failed for note {note.id}: {e}")
                
                note.archive()
                archived_count += 1
        
        if archived_count > 0:
            db.session.commit()
            current_app.logger.info(f"Archived {archived_count} expired notes")
        
        return archived_count

def get_stats_for_all_users():
    """Get global statistics for admin purposes"""
    with current_app.app_context():
        active_count = Note.query.filter_by(status=NoteStatus.ACTIVE).count()
        archived_count = Note.query.filter_by(status=NoteStatus.ARCHIVED).count()
        revived_count = Note.query.filter_by(status=NoteStatus.REVIVED).count()
        
        return {
            'active_notes': active_count,
            'archived_notes': archived_count,
            'revived_notes': revived_count,
            'total_notes': active_count + archived_count + revived_count
        }
