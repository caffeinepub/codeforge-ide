import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface AIMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

interface AIStore {
  messages: AIMessage[];
  isTyping: boolean;
  addMessage: (msg: Omit<AIMessage, "id" | "timestamp">) => void;
  setTyping: (typing: boolean) => void;
  clearMessages: () => void;
}

export const useAIStore = create<AIStore>()(
  persist(
    (set) => ({
      messages: [
        {
          id: "welcome",
          role: "assistant",
          content:
            "👋 Hello! I'm your **CodeVeda AI Assistant**. I can help you explain code, fix bugs, generate snippets, and more. What would you like to work on?",
          timestamp: Date.now(),
        },
      ],
      isTyping: false,
      addMessage: (msg) => {
        const id = `msg_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 5)}`;
        set((state) => ({
          messages: [...state.messages, { ...msg, id, timestamp: Date.now() }],
        }));
      },
      setTyping: (typing) => set({ isTyping: typing }),
      clearMessages: () =>
        set({
          messages: [
            {
              id: "welcome",
              role: "assistant",
              content:
                "👋 Hello! I'm your **CodeVeda AI Assistant**. I can help you explain code, fix bugs, generate snippets, and more. What would you like to work on?",
              timestamp: Date.now(),
            },
          ],
        }),
    }),
    { name: "codeveda-ai-messages" },
  ),
);
