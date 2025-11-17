import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  responseType?: string;
  safetyFlag?: boolean;
  emotion?: string;
}

interface ChatState {
  messages: Message[];
  currentResponseType: string;
  isLoading: boolean;
}

const initialState: ChatState = {
  messages: [
    {
      id: '1',
      text: "Hello! I'm your emotional support companion. How are you feeling today?",
      isUser: false,
      timestamp: new Date(),
      responseType: 'friendly'
    }
  ],
  currentResponseType: 'empathetic',
  isLoading: false,
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
      state.messages = [initialState.messages[0]];
    },
  },
});

export const { addMessage, setResponseType, setLoading, clearChat } = chatSlice.actions;
export default chatSlice.reducer;