from flask import Flask, request, jsonify
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials, firestore
import json
import logging
from datetime import datetime
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Firebase (we'll set this up later)
try:
    if not firebase_admin._apps:
        # For now, we'll use a dummy initialization
        # We'll set up Firebase properly in Week 3
        print("Firebase will be set up in Week 3")
    db = None  # We'll initialize this later
    logger.info("Firebase will be initialized in Week 3")
except Exception as e:
    logger.warning(f"Firebase not set up yet: {str(e)}")

class SafetyLayer:
    def __init__(self):
        self.toxic_keywords = [
            'kill myself', 'suicide', 'self-harm', 'hurt myself',
            'end it all', 'want to die', 'harm myself'
        ]
        self.concerning_phrases = [
            'depressed', 'hopeless', 'can\'t go on', 'no reason to live'
        ]
    
    def check_safety(self, text):
        """
        Comprehensive safety check for user messages
        Returns: (is_safe, message, risk_level)
        """
        text_lower = text.lower()
        
        # High-risk phrases - immediate crisis response
        for phrase in self.toxic_keywords:
            if phrase in text_lower:
                return False, "I'm really concerned about what you're sharing. Please contact a mental health professional immediately or call emergency services if you're in crisis. You can also text HOME to 741741 to connect with a crisis counselor.", "high"
        
        # Medium-risk phrases - gentle guidance
        for phrase in self.concerning_phrases:
            if phrase in text_lower:
                return False, "It sounds like you're going through a really tough time. While I'm here to listen, I strongly encourage you to speak with a mental health professional who can provide the proper support you deserve.", "medium"
        
        return True, "Safe", "low"

class EmotionDetector:
    def __init__(self):
        self.emotion_categories = {
            'joy': ['happy', 'excited', 'joyful', 'great', 'good', 'amazing', 'wonderful'],
            'sadness': ['sad', 'unhappy', 'depressed', 'miserable', 'terrible', 'awful', 'crying'],
            'anger': ['angry', 'mad', 'furious', 'annoyed', 'pissed', 'hate'],
            'fear': ['scared', 'afraid', 'worried', 'anxious', 'nervous', 'panic'],
            'surprise': ['surprised', 'shocked', 'amazed', 'unexpected'],
            'love': ['love', 'caring', 'affection', 'loving', 'romantic'],
            'neutral': ['okay', 'fine', 'alright', 'normal', 'whatever']
        }
    
    def detect_emotion_basic(self, text):
        """
        Basic rule-based emotion detection (will be replaced with ML model)
        """
        text_lower = text.lower()
        emotion_scores = {emotion: 0 for emotion in self.emotion_categories.keys()}
        
        for emotion, keywords in self.emotion_categories.items():
            for keyword in keywords:
                if keyword in text_lower:
                    emotion_scores[emotion] += 1
        
        # Get dominant emotion
        dominant_emotion = max(emotion_scores, key=emotion_scores.get)
        return dominant_emotion, emotion_scores

class ResponseGenerator:
    def __init__(self):
        self.response_templates = {
            'empathetic': {
                'joy': [
                    "I'm so happy to hear that you're feeling joyful! 😊",
                    "That sounds absolutely wonderful! Your happiness is contagious!",
                    "It's beautiful to hear about your joyful experience!"
                ],
                'sadness': [
                    "I hear the sadness in your words, and I want you to know that it's okay to feel this way.",
                    "That sounds really difficult. I'm here with you in this moment.",
                    "Your feelings are completely valid. Thank you for sharing this with me."
                ],
                'anger': [
                    "I can feel the frustration in your message. That sounds really challenging.",
                    "It's completely understandable to feel angry in that situation.",
                    "That would make anyone feel upset. I'm here to listen."
                ],
                'fear': [
                    "It sounds like you're feeling really worried right now. That must be scary.",
                    "I can hear the fear in your words. Let's breathe through this together.",
                    "That sounds anxiety-provoking. You're not alone in this."
                ],
                'surprise': [
                    "Wow, that's quite surprising! How are you feeling about it?",
                    "That sounds unexpected! Tell me more about what happened.",
                    "What a surprising turn of events! How are you processing this?"
                ],
                'love': [
                    "It's beautiful to hear about the love you're experiencing! 💖",
                    "That sounds so heartwarming! Love is such a powerful emotion.",
                    "How wonderful to hear about these loving feelings!"
                ],
                'neutral': [
                    "Thanks for sharing that with me. How are you feeling about it?",
                    "I appreciate you telling me about this. Want to explore it more?",
                    "Thanks for the update. How's everything else going?"
                ]
            },
            'motivational': {
                'joy': [
                    "Your positive energy is inspiring! Keep shining your light! ✨",
                    "This joyful energy will carry you far! Embrace it fully!",
                    "Your happiness is fuel for amazing things ahead!"
                ],
                'sadness': [
                    "Even in this difficult moment, I see your strength. This feeling will pass.",
                    "You have overcome challenges before, and you will overcome this too.",
                    "Your resilience is greater than you know. Keep going, one step at a time."
                ],
                'anger': [
                    "Your passion shows you care deeply. Channel this energy positively!",
                    "This fire inside you can fuel positive change. You've got this!",
                    "Your strong feelings mean you have strong values. That's powerful!"
                ],
                'fear': [
                    "Courage isn't the absence of fear, but moving forward despite it.",
                    "You're stronger than your fears. Take one small brave step today.",
                    "Every courageous act begins with feeling afraid but doing it anyway."
                ],
                'default': [
                    "You're capable of amazing things! Believe in yourself!",
                    "Every step forward, no matter how small, is progress.",
                    "Your journey matters, and you're doing better than you think!"
                ]
            },
            'stress_relief': {
                'default': [
                    "Let's take a deep breath together... Inhale slowly... and exhale... 🍃",
                    "When stress comes, remember to be gentle with yourself. This moment will pass.",
                    "Would you like to try a quick grounding exercise? Name 5 things you can see around you...",
                    "Stress is temporary. Let's focus on your breathing for a moment."
                ]
            },
            'friendly': {
                'default': [
                    "Hey there! Thanks for chatting with me today! 😊",
                    "I'm always here to listen, anytime you want to talk.",
                    "How has your day been going? I'd love to hear more!",
                    "Friendship and support can make tough times easier. I'm here for you!"
                ]
            },
            'encouragement': {
                'default': [
                    "You're doing better than you think you are! 🌟",
                    "I see how hard you're trying, and I'm genuinely proud of you.",
                    "Your efforts matter more than you know. Keep going!",
                    "You have so much strength within you. Trust yourself!"
                ]
            }
        }
    
    def generate_response(self, user_message, response_type, detected_emotion):
        """Generate appropriate response based on type and emotion"""
        import random
        
        # Get responses for the specific emotion and type, fallback to default
        responses = self.response_templates.get(response_type, {}).get(
            detected_emotion, 
            self.response_templates.get(response_type, {}).get('default', [])
        )
        
        if not responses:
            # Ultimate fallback
            fallback_responses = [
                "Thank you for sharing that with me. I'm here to support you.",
                "I appreciate you opening up to me. How can I support you right now?",
                "Thanks for telling me about this. I'm listening carefully."
            ]
            responses = fallback_responses
        
        return random.choice(responses)

# Initialize components
safety_layer = SafetyLayer()
emotion_detector = EmotionDetector()
response_generator = ResponseGenerator()

@app.route('/api/ping', methods=['GET'])
def ping():
    """Health check endpoint"""
    return jsonify({
        "status": "active", 
        "message": "Emotional Support Chatbot API is running",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0"
    })

@app.route('/api/chat', methods=['POST'])
def chat():
    """Main chat endpoint"""
    try:
        data = request.json
        user_message = data.get('message', '').strip()
        response_type = data.get('response_type', 'empathetic')
        user_id = data.get('user_id', 'anonymous')
        
        print(f"Received message: {user_message}")  # Debug print
        
        # Validate input
        if not user_message:
            return jsonify({
                "error": "Message cannot be empty",
                "response": "I'd love to chat! Could you please share what's on your mind?"
            }), 400
        
        if response_type not in ['empathetic', 'motivational', 'stress_relief', 'friendly', 'encouragement']:
            response_type = 'empathetic'
        
        # Safety check first
        is_safe, safety_message, risk_level = safety_layer.check_safety(user_message)
        if not is_safe:
            logger.warning(f"Safety triggered for user {user_id}: {user_message}")
            return jsonify({
                "response": safety_message,
                "safety_flag": True,
                "risk_level": risk_level,
                "emotion": "concern"
            })
        
        # Emotion detection
        detected_emotion, emotion_scores = emotion_detector.detect_emotion_basic(user_message)
        
        # Generate response
        response = response_generator.generate_response(
            user_message, response_type, detected_emotion
        )
        
        print(f"Generated response: {response}")  # Debug print
        
        return jsonify({
            "response": response,
            "emotion": detected_emotion,
            "emotion_scores": emotion_scores,
            "response_type": response_type,
            "safety_flag": False,
            "risk_level": risk_level,
            "timestamp": datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error in chat endpoint: {str(e)}")
        return jsonify({
            "error": "I'm having trouble processing your message right now. Please try again.",
            "response": "I'm experiencing some technical difficulties. Could you please try again in a moment?"
        }), 500

@app.route('/api/safety-check', methods=['POST'])
def safety_check():
    """Dedicated safety check endpoint"""
    try:
        data = request.json
        text = data.get('text', '')
        
        is_safe, message, risk_level = safety_layer.check_safety(text)
        
        return jsonify({
            "is_safe": is_safe,
            "message": message,
            "risk_level": risk_level
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/history', methods=['GET'])
def get_history():
    """Get chat history for a user"""
    try:
        user_id = request.args.get('user_id', 'anonymous')
        
        # In a real app, you'd fetch actual message history
        # For now, return mock data
        return jsonify({
            "user_id": user_id,
            "history": [],
            "message": "History endpoint ready - will connect to database in Week 3"
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    print("🚀 Starting Emotional Support Chatbot Backend...")
    print("📍 Server running at: http://localhost:5000")
    print("📋 Available endpoints:")
    print("   GET  /api/ping")
    print("   POST /api/chat")
    print("   POST /api/safety-check")
    print("   GET  /api/history")
    print("=" * 50)
    app.run(debug=True, host='0.0.0.0', port=5000)