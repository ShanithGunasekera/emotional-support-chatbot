import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  responseType?: string;
  safetyFlag?: boolean;
  emotion?: string;
  avatar?: string;
}

interface ChatState {
  messages: Message[];
  currentResponseType: string;
  isLoading: boolean;
  botAvatar: string;
}

const initialState: ChatState = {
  messages: [],
  currentResponseType: 'empathetic',
  isLoading: false,
  botAvatar: '🤖',
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addMessage: (state, action: PayloadAction<Message>) => {
      state.messages.push(action.payload);
    },
    setResponseType: (state, action: PayloadAction<string>) => {
      state.currentResponseType = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    clearChat: (state) => {
      state.messages = [];
    },
    loadMessages: (state, action: PayloadAction<Message[]>) => {
      state.messages = action.payload;
    },
    setBotAvatar: (state, action: PayloadAction<string>) => {
      state.botAvatar = action.payload;
    },
  },
});

export const { addMessage, setResponseType, setLoading, clearChat, loadMessages, setBotAvatar } = chatSlice.actions;

// Thunk to save messages to AsyncStorage
export const saveMessages = () => async (dispatch: any, getState: any) => {
  const { messages } = getState().chat;
  try {
    await AsyncStorage.setItem('conversations', JSON.stringify(messages));
  } catch (error) {
    console.error('Error saving messages:', error);
  }
};

// Thunk to load messages from AsyncStorage
export const loadSavedMessages = () => async (dispatch: any) => {
  try {
    const savedMessages = await AsyncStorage.getItem('conversations');
    if (savedMessages) {
      const messages = JSON.parse(savedMessages).map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
      }));
      dispatch(loadMessages(messages));
    } else {
      // Initial welcome message
      dispatch(addMessage({
        id: '1',
        text: "Hello! I'm your Mindful Companion. I'm here to listen, support, and help you through whatever you're feeling. How are you today?",
        isUser: false,
        timestamp: new Date(),
        responseType: 'friendly',
        avatar: '🤖'
      }));
    }
  } catch (error) {
    console.error('Error loading messages:', error);
  }
};

export default chatSlice.reducer;