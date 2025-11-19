from flask import Flask, request, jsonify
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials, firestore
import json
import logging
from datetime import datetime
import os
from dotenv import load_dotenv
import torch
from transformers import pipeline, AutoTokenizer, AutoModelForSequenceClassification
import requests

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Firebase
try:
    if not firebase_admin._apps:
        print("Firebase will be set up in Week 3")
    db = None
except Exception as e:
    logger.warning(f"Firebase not set up yet: {str(e)}")

class AdvancedSafetyLayer:
    def __init__(self):
        self.crisis_phrases = [
            'kill myself', 'suicide', 'end my life', 'want to die',
            'self harm', 'hurt myself', 'no reason to live'
        ]
        self.concerning_phrases = [
            'depressed', 'hopeless', 'can\'t go on', 'overwhelmed',
            'anxious', 'panic attack', 'mental breakdown'
        ]
    
    def check_safety(self, text):
        text_lower = text.lower()
        
        # High-risk phrases
        for phrase in self.crisis_phrases:
            if phrase in text_lower:
                return False, "I'm really concerned about your safety. Please contact emergency services immediately or call a crisis helpline. You matter and there are people who want to help you.", "crisis"
        
        # Medium-risk phrases
        for phrase in self.concerning_phrases:
            if phrase in text_lower:
                return False, "It sounds like you're going through an incredibly difficult time. While I'm here to listen, I strongly encourage you to reach out to a mental health professional for proper support.", "concerning"
        
        return True, "Safe", "low"

class AIResponseGenerator:
    def __init__(self):
        # Initialize emotion classifier (using a small model for now)
        try:
            self.emotion_classifier = pipeline(
                "text-classification",
                model="j-hartmann/emotion-english-distilroberta-base",
                return_all_scores=True
            )
        except:
            self.emotion_classifier = None
            print("Emotion model not available, using fallback")
        
        self.response_strategies = {
            'empathetic': self._empathetic_response,
            'motivational': self._motivational_response,
            'stress_relief': self._stress_relief_response,
            'friendly': self._friendly_response,
            'encouragement': self._encouragement_response
        }
    
    def detect_emotion(self, text):
        """Detect emotion using AI model"""
        if self.emotion_classifier:
            try:
                results = self.emotion_classifier(text[:512])  # Limit text length
                emotions = {result['label']: result['score'] for result in results[0]}
                primary_emotion = max(emotions, key=emotions.get)
                return primary_emotion, emotions
            except:
                pass
        
        # Fallback emotion detection
        emotions = {
            'joy': ['happy', 'excited', 'great', 'good', 'amazing', 'wonderful', 'love'],
            'sadness': ['sad', 'unhappy', 'depressed', 'miserable', 'terrible', 'crying'],
            'anger': ['angry', 'mad', 'furious', 'annoyed', 'hate', 'pissed'],
            'fear': ['scared', 'afraid', 'worried', 'anxious', 'nervous', 'panic'],
            'surprise': ['surprised', 'shocked', 'amazed', 'unexpected'],
            'disgust': ['disgusting', 'gross', 'awful', 'horrible'],
            'neutral': ['okay', 'fine', 'alright', 'normal', 'whatever']
        }
        
        text_lower = text.lower()
        emotion_scores = {emotion: 0 for emotion in emotions.keys()}
        
        for emotion, keywords in emotions.items():
            for keyword in keywords:
                if keyword in text_lower:
                    emotion_scores[emotion] += 1
        
        primary_emotion = max(emotion_scores, key=emotion_scores.get)
        return primary_emotion, emotion_scores

    def generate_response(self, user_message, response_type, conversation_history=None):
        """Generate AI-powered response"""
        strategy = self.response_strategies.get(response_type, self._empathetic_response)
        emotion, emotion_scores = self.detect_emotion(user_message)
        
        return strategy(user_message, emotion, conversation_history)

    def _empathetic_response(self, message, emotion, history):
        empathetic_responses = {
            'joy': [
                "I can feel your happiness shining through! That's absolutely wonderful to hear. 😊",
                "Your joy is contagious! I'm so glad you're experiencing this positive moment.",
                "This sounds like such a beautiful experience! Thank you for sharing your happiness with me."
            ],
            'sadness': [
                "I hear the weight in your words, and I want you to know your feelings are completely valid.",
                "That sounds incredibly difficult. I'm here with you in this moment, and you're not alone.",
                "I can sense the sadness in what you're sharing. It takes courage to express these feelings."
            ],
            'anger': [
                "I can feel the intensity in your message. That situation sounds really frustrating.",
                "It's completely understandable to feel angry when things don't go the way we hope.",
                "Your feelings of anger make sense given what you've experienced. I'm here to listen."
            ],
            'fear': [
                "That sounds really scary. I'm here with you, and we can face this together.",
                "I can hear the worry in your words. Let's take a deep breath and work through this.",
                "Feeling afraid in that situation makes complete sense. You're being really brave by talking about it."
            ],
            'disgust': [
                "That sounds really unpleasant. I understand why you'd feel that way.",
                "I can sense your discomfort with that situation. Your reaction is completely valid.",
                "That does sound difficult to process. I'm here to help you work through these feelings."
            ],
            'surprise': [
                "Wow, that's quite unexpected! How are you feeling about this surprise?",
                "That sounds like quite a revelation! Take your time to process this new information.",
                "What an unexpected turn of events! I'm here to help you make sense of it."
            ],
            'neutral': [
                "Thank you for sharing that with me. How are you feeling about it?",
                "I appreciate you telling me about this. Would you like to explore it further?",
                "Thanks for the update. I'm here whenever you want to talk more about it."
            ]
        }
        
        import random
        responses = empathetic_responses.get(emotion, empathetic_responses['neutral'])
        return random.choice(responses)

    def _motivational_response(self, message, emotion, history):
        motivational_responses = {
            'joy': [
                "Your positive energy is inspiring! Keep radiating that beautiful light! ✨",
                "This joyful momentum will carry you to amazing places! Embrace every moment!",
                "Your happiness is fuel for incredible achievements ahead! Shine on!"
            ],
            'sadness': [
                "Even in this difficult moment, I see your incredible strength. This too shall pass.",
                "You've overcome challenges before, and you have the resilience to overcome this too.",
                "Every storm eventually passes. Your courage in facing this is truly admirable."
            ],
            'anger': [
                "Your passion shows how much you care. Channel this energy into positive action!",
                "This fire inside you can ignite incredible change. You've got this!",
                "Strong feelings often mean strong values. Use this as fuel for your growth!"
            ],
            'fear': [
                "Courage isn't the absence of fear, but moving forward despite it. You're doing great!",
                "Every step forward, no matter how small, is a victory over fear. Keep going!",
                "You're stronger than your fears. Take one small brave step today."
            ],
            'default': [
                "You're capable of amazing things! Believe in yourself as much as I believe in you!",
                "Every step forward, no matter how small, is progress worth celebrating.",
                "Your journey matters, and you're doing better than you realize. Keep going!"
            ]
        }
        
        import random
        responses = motivational_responses.get(emotion, motivational_responses['default'])
        return random.choice(responses)

    def _stress_relief_response(self, message, emotion, history):
        techniques = [
            "Let's take a deep breath together... Inhale slowly for 4 counts... hold for 4... exhale for 6... 🍃",
            "When stress comes, remember: this moment is temporary. Be gentle with yourself right now.",
            "Would you like to try a quick grounding exercise? Name 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, and 1 you can taste.",
            "Stress is like a wave - it builds, peaks, and then recedes. You're riding it beautifully.",
            "Let's pause for a moment. Place your hand on your heart and take three slow, deep breaths."
        ]
        import random
        return random.choice(techniques)

    def _friendly_response(self, message, emotion, history):
        friendly_chat = [
            "Hey there! Thanks for chatting with me today! 😊 How's your day been?",
            "I'm always here to listen, anytime you want to talk. What's on your mind?",
            "Friendship and support can make tough times easier. I'm here for you!",
            "It's really good to hear from you! Tell me more about what's been happening.",
            "I appreciate you reaching out! How can I be a good friend to you right now?"
        ]
        import random
        return random.choice(friendly_chat)

    def _encouragement_response(self, message, emotion, history):
        encouragement = [
            "You're doing better than you think you are! 🌟 I see your progress!",
            "I see how hard you're trying, and I'm genuinely proud of you.",
            "Your efforts matter more than you know. Every small step counts!",
            "You have so much strength within you. Trust yourself and keep moving forward!",
            "I believe in you completely. You have everything you need to get through this."
        ]
        import random
        return random.choice(encouragement)

# Initialize components
safety_layer = AdvancedSafetyLayer()
ai_generator = AIResponseGenerator()

# Store conversation history (in production, use database)
conversation_memory = {}

@app.route('/api/ping', methods=['GET'])
def ping():
    return jsonify({
        "status": "active", 
        "message": "Mindful Companion API is running",
        "timestamp": datetime.now().isoformat(),
        "version": "2.0.0"
    })

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        user_message = data.get('message', '').strip()
        response_type = data.get('response_type', 'empathetic')
        user_id = data.get('user_id', 'anonymous')
        session_id = data.get('session_id', 'default')
        
        if not user_message:
            return jsonify({"error": "Message cannot be empty"}), 400

        # Safety check
        is_safe, safety_message, risk_level = safety_layer.check_safety(user_message)
        if not is_safe:
            return jsonify({
                "response": safety_message,
                "safety_flag": True,
                "risk_level": risk_level,
                "emotion": "concern"
            })

        # Get conversation history
        memory_key = f"{user_id}_{session_id}"
        if memory_key not in conversation_memory:
            conversation_memory[memory_key] = []
        
        # Add user message to memory
        conversation_memory[memory_key].append({
            "role": "user",
            "message": user_message,
            "timestamp": datetime.now().isoformat()
        })

        # Generate AI response
        response = ai_generator.generate_response(
            user_message, 
            response_type, 
            conversation_memory[memory_key]
        )

        # Add bot response to memory
        conversation_memory[memory_key].append({
            "role": "assistant",
            "message": response,
            "timestamp": datetime.now().isoformat()
        })

        # Keep only last 20 messages to prevent memory overload
        if len(conversation_memory[memory_key]) > 20:
            conversation_memory[memory_key] = conversation_memory[memory_key][-20:]

        emotion, emotion_scores = ai_generator.detect_emotion(user_message)

        return jsonify({
            "response": response,
            "emotion": emotion,
            "emotion_scores": emotion_scores,
            "response_type": response_type,
            "safety_flag": False,
            "risk_level": risk_level,
            "timestamp": datetime.now().isoformat(),
            "memory_length": len(conversation_memory[memory_key])
        })
        
    except Exception as e:
        logger.error(f"Error in chat endpoint: {str(e)}")
        return jsonify({
            "error": "I'm having trouble processing your message right now. Please try again.",
            "response": "I'm experiencing some technical difficulties. Could you please try again in a moment?"
        }), 500

@app.route('/api/games/daily', methods=['GET'])
def daily_games():
    """Get daily mood-lifting games"""
    games = [
        {
            "id": 1,
            "name": "Gratitude Journal",
            "description": "Write down three things you're grateful for today",
            "type": "journal",
            "duration": "5 minutes"
        },
        {
            "id": 2,
            "name": "Breathing Exercise",
            "description": "Follow the guided 4-7-8 breathing technique",
            "type": "meditation", 
            "duration": "2 minutes"
        },
        {
            "id": 3,
            "name": "Positive Affirmations",
            "description": "Repeat empowering statements about yourself",
            "type": "affirmation",
            "duration": "3 minutes"
        },
        {
            "id": 4,
            "name": "Mindful Observation",
            "description": "Observe your surroundings with full attention",
            "type": "mindfulness",
            "duration": "4 minutes"
        }
    ]
    return jsonify({"games": games})

@app.route('/api/user/register', methods=['POST'])
def register():
    """User registration endpoint"""
    try:
        data = request.json
        # In Week 3, this will connect to Firebase Auth
        return jsonify({
            "message": "Registration endpoint ready",
            "user_id": f"user_{datetime.now().timestamp()}",
            "status": "success"
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/user/login', methods=['POST'])
def login():
    """User login endpoint"""
    try:
        data = request.json
        # In Week 3, this will connect to Firebase Auth
        return jsonify({
            "message": "Login endpoint ready", 
            "user_id": "demo_user",
            "status": "success"
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    print("🚀 Starting Mindful Companion Backend...")
    print("📍 Server running at: http://localhost:5000")
    print("🤖 AI Emotion Detection: Active")
    app.run(debug=True, host='0.0.0.0', port=5000)