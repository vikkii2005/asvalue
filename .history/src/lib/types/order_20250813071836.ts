export interface Order {
  id: string
  product_id: string
  seller_id: string

  // Customer Information
  customer_email: string
  customer_name: string | null
  shipping_address: string

  // Order Details
  quantity: number
  unit_price: number
  total_amount: number
  currency: string

  // Order Status
  status: OrderStatus

  // Payment Information
  paypal_order_id: string | null
  paypal_payment_id: string | null
  payment_status: PaymentStatus

  // Timestamps
  created_at: string
  paid_at: string | null
  shipped_at: string | null
  delivered_at: string | null

  // Optional populated data
  product?: {
    name: string
    image_url: string
    magic_code: string
  }
  seller?: {
    name: string
    business_name: string | null
    email: string
  }
}

export type OrderStatus =
  | 'pending'
  | 'paid'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'completed'
  | 'cancelled'
  | 'refunded'

export type PaymentStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'refunded'

export interface CreateOrderData {
  product_id: string
  customer_email: string
  customer_name?: string
  shipping_address: string
  quantity?: number
}

export interface UpdateOrderData {
  status?: OrderStatus
  payment_status?: PaymentStatus
  paypal_order_id?: string
  paypal_payment_id?: string
  shipped_at?: string
  delivered_at?: string
}

export interface OrderFormData {
  customer_name: string
  customer_email: string
  shipping_address: string
  quantity: string // Form input as string
  special_instructions?: string
}

export interface PayPalOrderResponse {
  id: string
  status: string
  payment_source?: {
    paypal?: {
      email_address: string
      account_id: string
    }
  }
  purchase_units: Array<{
    amount: {
      currency_code: string
      value: string
    }
    shipping?: {
      name: {
        full_name: string
      }
      address: {
        address_line_1: string
        address_line_2?: string
        admin_area_2: string
        admin_area_1: string
        postal_code: string
        country_code: string
      }
    }
  }>
}

export interface OrderAnalytics {
  total_orders: number
  total_revenue: number
  pending_orders: number
  completed_orders: number
  average_order_value: number
  conversion_rate: number
  monthly_revenue: number
  top_products: Array<{
    product_id: string
    product_name: string
    total_orders: number
    total_revenue: number
  }>
}

export interface OrderFilter {
  status?: OrderStatus
  payment_status?: PaymentStatus
  date_from?: string
  date_to?: string
  customer_email?: string
  product_id?: string
  sort_by?: 'created_at' | 'total_amount' | 'status'
  sort_order?: 'asc' | 'desc'
  limit?: number
  offset?: number
}

export interface ShippingAddress {
  line1: string
  line2?: string
  city: string
  state: string
  postal_code: string
  country: string
  full_name: string
}

export interface OrderValidationError {
  field: keyof OrderFormData
  message: string
}

export interface OrderNotification {
  id: string
  order_id: string
  seller_id: string
  type: 'new_order' | 'payment_received' | 'order_updated'
  title: string
  message: string
  is_read: boolean
  created_at: string
}

export const ORDER_STATUS_FLOW: Record<OrderStatus, OrderStatus[]> = {
  pending: ['paid', 'cancelled'],
  paid: ['processing', 'cancelled', 'refunded'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: ['completed'],
  completed: ['refunded'],
  cancelled: [],
  refunded: [],
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pending Payment',
  paid: 'Payment Received',
  processing: 'Processing Order',
  shipped: 'Shipped',
  delivered: 'Delivered',
  completed: 'Completed',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
}

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pending: 'Payment Pending',
  processing: 'Processing Payment',
  completed: 'Payment Complete',
  failed: 'Payment Failed',
  cancelled: 'Payment Cancelled',
  refunded: 'Payment Refunded',
}

export interface OrderEmailTemplate {
  type:
    | 'order_confirmation'
    | 'payment_received'
    | 'shipping_notification'
    | 'delivery_confirmation'
  subject: string
  html_content: string
  text_content: string
}
