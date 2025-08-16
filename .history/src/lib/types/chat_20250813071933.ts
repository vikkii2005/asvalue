export interface ChatMessage {
  id: string
  product_id: string
  customer_session: string
  sender_type: MessageSender
  message: string
  metadata: ChatMetadata | null

  // Message Status
  is_read: boolean
  is_escalated: boolean

  created_at: string

  // Optional populated data
  product?: {
    name: string
    seller_id: string
    seller_name: string
  }
}

export type MessageSender = 'ai' | 'customer' | 'seller'

export interface ChatMetadata {
  ai_confidence?: number // 0-100
  question_type?: AIQuestionType
  suggested_responses?: string[]
  escalation_reason?: string
  customer_info?: {
    ip_address?: string
    user_agent?: string
    location?: string
  }
  ai_model?: string
  processing_time?: number
}

export type AIQuestionType =
  | 'size_question'
  | 'shipping_question'
  | 'return_policy'
  | 'price_negotiation'
  | 'product_details'
  | 'availability'
  | 'custom_request'
  | 'complaint'
  | 'general_inquiry'

export interface ChatSession {
  session_id: string
  product_id: string
  customer_ip?: string
  is_active: boolean
  last_message_at: string
  message_count: number
  has_seller_response: boolean
  escalated_at: string | null
  created_at: string

  // Recent messages for context
  messages?: ChatMessage[]

  // Product info for context
  product?: {
    name: string
    price: number
    seller_name: string
  }
}

export interface SendMessageData {
  product_id: string
  customer_session: string
  message: string
  sender_type: MessageSender
  metadata?: Partial<ChatMetadata>
}

export interface AIResponse {
  message: string
  confidence: number
  question_type: AIQuestionType
  suggested_followups: string[]
  should_escalate: boolean
  escalation_reason?: string
}

export interface ChatNotification {
  id: string
  seller_id: string
  product_id: string
  customer_session: string
  type: ChatNotificationType
  title: string
  message: string
  is_read: boolean
  created_at: string

  // Context data
  customer_message?: string
  product_name?: string
}

export type ChatNotificationType =
  | 'new_customer_message'
  | 'ai_escalation'
  | 'customer_waiting'
  | 'session_timeout'
  | 'high_value_customer'

export interface ChatAnalytics {
  total_sessions: number
  active_sessions: number
  average_session_length: number
  message_volume_24h: number
  ai_resolution_rate: number
  escalation_rate: number
  customer_satisfaction: number
  response_time_avg: number

  // Breakdown by question type
  question_types: Array<{
    type: AIQuestionType
    count: number
    ai_success_rate: number
  }>

  // Daily stats
  daily_stats: Array<{
    date: string
    sessions: number
    messages: number
    escalations: number
  }>
}

export interface ChatFilter {
  product_id?: string
  sender_type?: MessageSender
  is_escalated?: boolean
  is_read?: boolean
  date_from?: string
  date_to?: string
  customer_session?: string
  sort_by?: 'created_at' | 'is_escalated' | 'is_read'
  sort_order?: 'asc' | 'desc'
  limit?: number
  offset?: number
}

export interface QuickReply {
  id: string
  text: string
  category: AIQuestionType
  is_default: boolean
}

export const DEFAULT_QUICK_REPLIES: QuickReply[] = [
  {
    id: '1',
    text: 'What size should I order?',
    category: 'size_question',
    is_default: true,
  },
  {
    id: '2',
    text: 'How much is shipping?',
    category: 'shipping_question',
    is_default: true,
  },
  {
    id: '3',
    text: 'What is your return policy?',
    category: 'return_policy',
    is_default: true,
  },
  {
    id: '4',
    text: 'Is this item available?',
    category: 'availability',
    is_default: true,
  },
  {
    id: '5',
    text: 'Can you tell me more about this product?',
    category: 'product_details',
    is_default: true,
  },
]

export interface ChatUIState {
  isOpen: boolean
  isLoading: boolean
  isTyping: boolean
  hasNewMessages: boolean
  currentSession: string | null
  messages: ChatMessage[]
  error: string | null
}

export interface TypingIndicator {
  session_id: string
  sender_type: MessageSender
  is_typing: boolean
  timestamp: string
}

export const AI_CONFIDENCE_THRESHOLDS = {
  HIGH: 80,
  MEDIUM: 60,
  LOW: 40,
  ESCALATE: 30,
} as const

export const ESCALATION_REASONS = {
  LOW_CONFIDENCE: 'AI confidence below threshold',
  COMPLEX_QUERY: 'Query too complex for AI',
  CUSTOMER_REQUEST: 'Customer requested human agent',
  COMPLAINT: 'Customer complaint detected',
  PRICE_NEGOTIATION: 'Price negotiation attempt',
  TECHNICAL_ISSUE: 'Technical issue detected',
} as const

export const CHAT_EVENTS = {
  MESSAGE_SENT: 'message_sent',
  MESSAGE_RECEIVED: 'message_received',
  TYPING_START: 'typing_start',
  TYPING_STOP: 'typing_stop',
  SESSION_START: 'session_start',
  SESSION_END: 'session_end',
  ESCALATION: 'escalation',
  AI_RESPONSE: 'ai_response',
} as const

export type ChatEvent = (typeof CHAT_EVENTS)[keyof typeof CHAT_EVENTS]
