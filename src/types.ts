export interface MessageAttachment {
  name: string;
  size: string;
  type: string; // mimeType e.g., 'image/png', 'text/plain'
  base64?: string; // actual file data as base64 string
}

export interface GroundingSource {
  title: string;
  url: string;
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  attachment?: MessageAttachment;
  groundingSources?: GroundingSource[];
  isPending?: boolean;
}

export interface ChatSession {
  id: string;
  name: string;
  messages: Message[];
  createdAt: string;
  lastActive: string;
  model: string;
  systemPrompt?: string;
  searchGrounding?: boolean;
  temperature?: number;
}

export interface UserProfile {
  name: string;
  tier: string;
  avatar: string;
}
