import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../src/store/store';
import { addMessage, setResponseType } from '../src/store/chatSlice';
import { chatAPI } from '../src/services/api';

const RESPONSE_TYPES = [
  { id: 'empathetic', label: '💝 Empathetic', color: '#FF6B6B' },
  { id: 'motivational', label: '🚀 Motivational', color: '#4ECDC4' },
  { id: 'stress_relief', label: '🌊 Stress Relief', color: '#45B7D1' },
  { id: 'friendly', label: '😊 Friendly', color: '#96CEB4' },
  { id: 'encouragement', label: '🌈 Encouragement', color: '#FFEAA7' },
];

export default function ChatScreen() {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const router = useRouter();
  
  const { messages, currentResponseType, isLoading } = useSelector(
    (state: RootState) => state.chat
  );
  const dispatch = useDispatch();

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const sendMessage = async () => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage || isSending) return;

    setIsSending(true);

    const userMessage = {
      id: Date.now().toString(),
      text: trimmedMessage,
      isUser: true,
      timestamp: new Date(),
      responseType: currentResponseType,
    };

    dispatch(addMessage(userMessage));
    setMessage('');

    try {
      const response = await chatAPI.sendMessage(
        trimmedMessage,
        currentResponseType,
        'user-' + Date.now()
      );

      const botMessage = {
        id: (Date.now() + 1).toString(),
        text: response.response,
        isUser: false,
        timestamp: new Date(),
        responseType: currentResponseType,
        safetyFlag: response.safety_flag,
        emotion: response.emotion,
      };

      dispatch(addMessage(botMessage));
    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        text: "I'm having trouble connecting right now. Please check if the backend server is running on http://localhost:5000",
        isUser: false,
        timestamp: new Date(),
      };

      dispatch(addMessage(errorMessage));
      Alert.alert('Connection Error', 'Make sure your Python backend is running!');
    } finally {
      setIsSending(false);
    }
  };

  const renderMessage = ({ item }: any) => (
    <View
      style={[
        styles.messageBubble,
        item.isUser ? styles.userBubble : styles.botBubble,
        item.safetyFlag && styles.safetyBubble,
      ]}
    >
      <Text
        style={[
          styles.messageText,
          item.isUser ? styles.userText : styles.botText,
        ]}
      >
        {item.text}
      </Text>
      <View style={styles.messageMeta}>
        <Text style={styles.timestamp}>
          {item.timestamp.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </Text>
        {item.emotion && !item.isUser && (
          <Text style={styles.emotionBadge}>Feeling: {item.emotion}</Text>
        )}
      </View>
      {item.safetyFlag && (
        <Text style={styles.safetyNotice}>
          🛡️ Safety response triggered
        </Text>
      )}
    </View>
  );

  const renderResponseTypeSelector = () => (
    <View style={styles.selectorContainer}>
      <Text style={styles.selectorTitle}>Response Style:</Text>
      <FlatList
        horizontal
        data={RESPONSE_TYPES}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.typeButton,
              { backgroundColor: item.color },
              currentResponseType === item.id && styles.selectedType,
            ]}
            onPress={() => dispatch(setResponseType(item.id))}
          >
            <Text style={styles.typeButtonText}>
              {item.label}
            </Text>
          </TouchableOpacity>
        )}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.selectorList}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {renderResponseTypeSelector()}

        <View style={styles.chatContainer}>
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            style={styles.messagesList}
            showsVerticalScrollIndicator={false}
          />
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={message}
            onChangeText={setMessage}
            placeholder="Share what's on your mind..."
            placeholderTextColor="#9CA3AF"
            multiline
            maxLength={500}
            editable={!isSending}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!message.trim() || isSending) && styles.sendButtonDisabled,
            ]}
            onPress={sendMessage}
            disabled={!message.trim() || isSending}
          >
            {isSending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.sendButtonText}>Send</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  keyboardAvoid: {
    flex: 1,
  },
  selectorContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  selectorTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  selectorList: {
    paddingRight: 16,
  },
  typeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    opacity: 0.7,
  },
  selectedType: {
    opacity: 1,
    transform: [{ scale: 1.05 }],
  },
  typeButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
  chatContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  messagesList: {
    flex: 1,
  },
  messageBubble: {
    padding: 16,
    borderRadius: 20,
    marginVertical: 6,
    maxWidth: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#6366F1',
    borderBottomRightRadius: 4,
  },
  botBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
  },
  safetyBubble: {
    backgroundColor: '#FEF3C7',
    borderColor: '#F59E0B',
    borderWidth: 1,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: '#FFFFFF',
  },
  botText: {
    color: '#1F2937',
  },
  messageMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  timestamp: {
    fontSize: 12,
    color: '#6B7280',
  },
  emotionBadge: {
    fontSize: 12,
    color: '#8B5CF6',
    fontWeight: '500',
  },
  safetyNotice: {
    fontSize: 11,
    color: '#D97706',
    marginTop: 4,
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    alignItems: 'flex-end',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    maxHeight: 100,
    backgroundColor: '#F9FAFB',
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    minWidth: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
});