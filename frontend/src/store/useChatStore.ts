import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "axios";

import { axiosInstance } from "../lib/axios";
import { useAuthStore, type User } from "./useAuthStore";
import toast from "react-hot-toast";

export interface Message {
  _id: string;
  senderId: string;
  receiverId: string;
  text?: string;
  image?: string;
  video?: string;
  createdAt: string;
  updatedAt?: string;
}

export type SidebarTab = "chats" | "users";

export interface SendMediaMessageParams {
  conversationId: string;
  file: File;
}

export interface ChatState {
  users: User[];
  conversations: User[];
  messages: Message[];
  selectedUser: User | null;
  isConversationsLoading: boolean;
  isUsersLoading: boolean;
  isMessagesLoading: boolean;
  activeConversationId: string | null;
  searchQuery: string;
  sidebarTab: SidebarTab;
  composerText: string;
  isSoundEnabled: boolean;
  isSendingMedia: boolean;

  getUsers: () => Promise<void>;
  getConversations: () => Promise<void>;
  getMessages: (userId: string) => Promise<void>;
  sendMessage: (messageData: { text: string } | FormData) => Promise<boolean>;
  subscribeToMessages: (userId: string) => void;
  unsubscribeFromMessages: () => void;
  setSelectedUser: (selectedUser: User | null) => void;
  setActiveConversationId: (activeConversationId: string | null) => void;
  setSearchQuery: (searchQuery: string) => void;
  setSidebarTab: (sidebarTab: SidebarTab) => void;
  setComposerText: (composerText: string) => void;
  setSoundEnabled: (isSoundEnabled: boolean) => void;
  sendTextMessage: (conversationId: string) => Promise<boolean>;
  sendMediaMessage: (params: SendMediaMessageParams) => Promise<boolean>;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      users: [],
      conversations: [],
      messages: [],
      selectedUser: null,
      isConversationsLoading: false,
      isUsersLoading: false,
      isMessagesLoading: false,
      activeConversationId: null,
      searchQuery: "",
      sidebarTab: "chats",
      composerText: "",
      isSoundEnabled: true,
      isSendingMedia: false,

      getUsers: async () => {
        set({ isUsersLoading: true });
        try {
          const res = await axiosInstance.get<User[]>("/messages/users");
          set((state) => ({
            users: res.data,
            selectedUser:
              state.selectedUser && res.data.some((user) => user._id === state.selectedUser?._id)
                ? state.selectedUser
                : null,
          }));
        } catch (error: unknown) {
          if (axios.isAxiosError(error)) {
            console.log("Error in get Users", error.message);
          } else if (error instanceof Error) {
            console.log("Error in get Users", error.message);
          }
        } finally {
          set({ isUsersLoading: false });
        }
      },

      getConversations: async () => {
        set({ isConversationsLoading: true });
        try {
          const res = await axiosInstance.get<User[]>("/messages/conversations");
          set({ conversations: res.data });
        } catch (error: unknown) {
          if (axios.isAxiosError(error)) {
            console.log("Error in getConversations", error.message);
          } else if (error instanceof Error) {
            console.log("Error in getConversations", error.message);
          }
        } finally {
          set({ isConversationsLoading: false });
        }
      },

      getMessages: async (userId: string) => {
        if (!userId) return;
        set({ isMessagesLoading: true });
        try {
          const res = await axiosInstance.get<Message[]>(`/messages/${userId}`);
          set({ messages: res.data });
        } catch (error: unknown) {
          if (axios.isAxiosError(error)) {
            toast.error(error.response?.data?.message || "Failed to load messages");
          } else {
            toast.error("Failed to load messages");
          }
        } finally {
          set({ isMessagesLoading: false });
        }
      },

      sendMessage: async (messageData: { text: string } | FormData) => {
        const { selectedUser, messages } = get();
        if (!selectedUser) return false;

        try {
          const res = await axiosInstance.post<Message>(`/messages/send/${selectedUser._id}`, messageData);
          set({ messages: [...messages, res.data], composerText: "" });
          get().getConversations();
          return true;
        } catch (error: unknown) {
          if (axios.isAxiosError(error)) {
            toast.error(error.response?.data?.message || "Failed to send message");
          } else {
            toast.error("Failed to send message");
          }
          return false;
        }
      },

      subscribeToMessages: (userId: string) => {
        if (!userId) return;

        const socket = useAuthStore.getState().socket;
        if (!socket) return;

        socket.off("newMessage");
        socket.on("newMessage", (newMessage: Message) => {
          // if im not the receiver don't do anything just return
          if (String(newMessage.senderId) !== String(userId)) return;

          set({ messages: [...get().messages, newMessage] });

          get().getConversations();
        });
      },

      unsubscribeFromMessages: () => {
        const socket = useAuthStore.getState().socket;
        socket?.off("newMessage");
      },

      setSelectedUser: (selectedUser: User | null) => set({ selectedUser }),

      setActiveConversationId: (activeConversationId: string | null) => {
        set((state) => ({
          activeConversationId,
          selectedUser:
            state.users.find((user) => user._id === activeConversationId) ||
            state.conversations.find((user) => user._id === activeConversationId) ||
            null,
          messages: activeConversationId ? state.messages : [],
        }));
      },

      setSearchQuery: (searchQuery: string) => set({ searchQuery }),
      setSidebarTab: (sidebarTab: SidebarTab) => set({ sidebarTab }),
      setComposerText: (composerText: string) => set({ composerText }),
      setSoundEnabled: (isSoundEnabled: boolean) => set({ isSoundEnabled }),

      sendTextMessage: async (conversationId: string) => {
        const messageText = get().composerText.trim();
        if (!conversationId || !messageText) return false;

        return get().sendMessage({ text: messageText });
      },

      sendMediaMessage: async ({ conversationId, file }: SendMediaMessageParams) => {
        if (!conversationId || !file) return false;

        const formData = new FormData();
        formData.append("media", file);

        set({ isSendingMedia: true });
        try {
          return await get().sendMessage(formData);
        } finally {
          set({ isSendingMedia: false });
        }
      },
    }),
    {
      name: "imessage-storage",
      partialize: (state) => ({ isSoundEnabled: state.isSoundEnabled }),
    },
  ),
);