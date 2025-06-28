import google.generativeai as genai
from flask import current_app
import json
import os
import re

class GeminiService:
    def __init__(self):
        api_key = os.getenv('GEMINI_API_KEY')
        self.api_key_available = bool(api_key)
        self.model = None
        
        if api_key:
            try:
                genai.configure(api_key=api_key)
                
                # Try different model names in order of preference
                model_names = [
                    'gemini-1.5-flash',
                    'gemini-1.5-pro', 
                    'gemini-pro',
                    'models/gemini-1.5-flash',
                    'models/gemini-1.5-pro',
                    'models/gemini-pro'
                ]
                
                for model_name in model_names:
                    try:
                        self.model = genai.GenerativeModel(model_name)
                        print(f"✅ Gemini AI initialized successfully with {model_name}")
                        break
                    except Exception as model_error:
                        print(f"⚠️ Failed to initialize {model_name}: {model_error}")
                        continue
                
                if not self.model:
                    print("❌ All Gemini model names failed. Using fallback mode.")
                    
            except Exception as e:
                print(f"❌ Failed to configure Gemini AI: {e}")
                self.model = None
        else:
            print("⚠️ GEMINI_API_KEY not found in environment variables")
            self.model = None
    
    def generate_summary_and_questions(self, note_title, note_content):
        """Generate AI summary and related questions for a note"""
        print(f"🤖 Generating AI content for note: {note_title}")
        
        if not self.model:
            print("📝 Using fallback questions (no AI model)")
            # Fallback if no API key
            return {
                "summary": f"Summary for '{note_title}': This note contains important information that should be reviewed regularly to maintain strong memory retention.",
                "questions": [
                    f"What are the main concepts covered in '{note_title}'?",
                    f"How can you apply the knowledge from '{note_title}' in practice?", 
                    f"What additional information would strengthen your understanding of '{note_title}'?"
                ]
            }
            
        prompt = f"""
        You are a memory retention expert. Analyze this note and provide EXACTLY the following JSON structure:

        Note Title: {note_title}
        Note Content: {note_content}

        Return ONLY valid JSON in this exact format:
        {{
            "summary": "Write a clear 2-sentence summary of the main concepts",
            "questions": [
                "Specific question about key concepts from the content",
                "Question about practical applications or examples", 
                "Question about connections to other topics or deeper understanding"
            ]
        }}
        
        Make sure questions are specific to the actual content, not generic.
        """
        
        try:
            print("🔄 Calling Gemini API...")
            response = self.model.generate_content(prompt)
            response_text = response.text.strip()
            print(f"📥 Raw AI response: {response_text[:200]}...")
            
            # Try to extract JSON from response (sometimes AI adds extra text)
            json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
            if json_match:
                json_text = json_match.group()
                result = json.loads(json_text)
                print("✅ Successfully parsed AI response")
                return result
            else:
                raise ValueError("No JSON found in AI response")
                
        except Exception as e:
            print(f"❌ Gemini AI Error: {str(e)}")
            if current_app:
                current_app.logger.error(f"Gemini AI Error: {str(e)}")
            
            # Enhanced fallback based on content
            return {
                "summary": f"This note covers {note_title} with detailed information that requires careful study and regular review to maintain in active memory.",
                "questions": [
                    f"What are the key principles or concepts explained in this {note_title} note?",
                    f"Can you provide examples or applications of the concepts from {note_title}?",
                    f"How does the information in {note_title} connect to what you already know?"
                ]
            }
    
    def validate_answer(self, question, user_answer, note_content):
        """Check if user's answer demonstrates understanding"""
        print(f"🔍 Validating answer for question: {question[:50]}...")
        
        if not self.model:
            print("📝 Using fallback validation (no AI model)")
            # If AI fails, be generous and accept any non-empty answer
            is_valid = len(user_answer.strip()) > 10
            print(f"✅ Fallback validation result: {is_valid}")
            return is_valid
            
        prompt = f"""
        Evaluate if this answer shows good understanding of the note content.
        
        Original Note Content: {note_content}
        Question Asked: {question}
        User's Answer: {user_answer}
        
        Respond with ONLY one word: "VALID" if the answer demonstrates understanding of the content, or "INVALID" if it doesn't.
        Be generous - if the answer shows any reasonable engagement with the topic, respond VALID.
        """
        
        try:
            print("🔄 Calling Gemini API for validation...")
            response = self.model.generate_content(prompt)
            response_text = response.text.strip().upper()
            is_valid = "VALID" in response_text
            print(f"✅ AI validation result: {is_valid} (response: {response_text})")
            return is_valid
        except Exception as e:
            print(f"❌ AI validation error: {e}")
            # If AI fails, be generous and accept any non-empty answer
            is_valid = len(user_answer.strip()) > 10
            print(f"📝 Fallback validation result: {is_valid}")
            return is_valid

gemini_service = GeminiService()
