/**
 * Chat Service API Client
 * REST endpoints for chat rooms, messages, and members
 */

export interface ChatMessage {
  id: number;
  sender_id: number;
  sender_email: string;
  text: string;
  message_type: 'message' | 'system' | 'notification';
  created_at: string;
  edited_at: string | null;
  is_edited: boolean;
  is_moderated: boolean;
}

export interface ChatRoomMember {
  user_id: number;
  joined_at: string;
  is_muted: boolean;
  is_admin: boolean;
}

export interface ChatRoomList {
  id: number;
  name: string;
  room_type: 'dm' | 'channel' | 'tournament';
  created_at: string;
  updated_at: string;
  member_count: number;
}

export interface ChatRoomDetail extends ChatRoomList {
  messages: ChatMessage[];
  members: ChatRoomMember[];
}

export interface CreateChatRoomPayload {
  name: string;
  room_type: 'dm' | 'channel' | 'tournament';
}

const API_BASE_URL = "/api/chat";

export const chatApi = {
  
  listRooms: async (): Promise<ChatRoomList[]> => {
    const res = await fetch(`${API_BASE_URL}/rooms/`);
    if (!res.ok) throw new Error(`List rooms failed: ${res.statusText}`);
    return res.json();
  },

  
  getMyRooms: async (userId: number): Promise<ChatRoomList[]> => {
    const res = await fetch(`${API_BASE_URL}/rooms/my_rooms/?user_id=${userId}`);
    if (!res.ok) throw new Error(`Get my rooms failed: ${res.statusText}`);
    return res.json();
  },

  
  getRoomDetail: async (roomId: number): Promise<ChatRoomDetail> => {
    const res = await fetch(`${API_BASE_URL}/rooms/${roomId}/`);
    if (!res.ok) throw new Error(`Get room failed: ${res.statusText}`);
    return res.json();
  },

  
  createRoom: async (payload: CreateChatRoomPayload): Promise<ChatRoomList> => {
    const res = await fetch(`${API_BASE_URL}/rooms/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`Create room failed: ${res.statusText}`);
    return res.json();
  },

  
  sendMessage: async (
    roomId: number,
    text: string,
    senderId: number,
    type: string = 'message'
  ): Promise<ChatMessage> => {
    const res = await fetch(`${API_BASE_URL}/rooms/${roomId}/send_message/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text,
        sender_id: senderId,
        type,
      }),
    });
    if (!res.ok) throw new Error(`Send message failed: ${res.statusText}`);
    return res.json();
  },

  
  getRoomMessages: async (
    roomId: number,
    limit: number = 50,
    offset: number = 0
  ): Promise<{ count: number; messages: ChatMessage[] }> => {
    const res = await fetch(
      `${API_BASE_URL}/rooms/${roomId}/messages/?limit=${limit}&offset=${offset}`
    );
    if (!res.ok) throw new Error(`Get messages failed: ${res.statusText}`);
    return res.json();
  },

  
  joinRoom: async (roomId: number, userId: number): Promise<{ joined: boolean; room_id: number }> => {
    const res = await fetch(`${API_BASE_URL}/rooms/${roomId}/join/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId }),
    });
    if (!res.ok) throw new Error(`Join room failed: ${res.statusText}`);
    return res.json();
  },

  
  leaveRoom: async (roomId: number, userId: number): Promise<{ left: boolean }> => {
    const res = await fetch(`${API_BASE_URL}/rooms/${roomId}/leave/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId }),
    });
    if (!res.ok) throw new Error(`Leave room failed: ${res.statusText}`);
    return res.json();
  },

  
  health: async (): Promise<{ status: string; service: string }> => {
    const res = await fetch(`${API_BASE_URL}/health/`);
    if (!res.ok) throw new Error("Health check failed");
    return res.json();
  },
};
