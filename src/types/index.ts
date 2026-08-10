export type ProductCategory =
  | 'Meaningful'
  | 'Modern'
  | 'Animals'
  | 'Sports'
  | 'Gardens & Flowers'
  | 'Actors'
  | 'Trending'

export type OrderStatus =
  | 'Pending'
  | 'Processing'
  | 'Shipped'
  | 'Delivered'
  | 'Cancelled'

export type NotificationType =
  | 'Order_Update'
  | 'Admin_Announcement'

export interface ProductSize {
  name: string
  price: number
}

export interface Product {
  id: string
  title: string
  description: string
  price: number
  images: string[]
  is_featured: boolean
  category: ProductCategory
  sizes: ProductSize[]
  stock: number        
  is_sold_out: boolean 
  created_at: string
}

export interface Profile {
  id: string
  full_name: string
  phone_number: string
  shipping_address: string
  avatar_url: string
  is_admin: boolean
}

export interface Order {
  id: string
  user_id: string
  product_id: string
  quantity: number
  total_price: number
  status: OrderStatus
  size: string | null       
  group_id: string          
  full_name: string        
  phone_number: string     
  shipping_address: string 
  created_at: string
  product?: Product
  profile?: Profile
}

export interface Notification {
  id: string
  user_id: string | null
  title: string
  message: string
  type: NotificationType
  is_read: boolean
  created_at: string
}

export interface Review {
  id: string
  product_id: string
  user_id: string
  rating: number
  comment: string | null
  created_at: string
  profile?: {
    full_name: string | null
    avatar_url: string | null
  }
}

export interface ReviewSummary {
  average: number
  total: number
  distribution: { stars: number; count: number; percentage: number }[]
}

export interface CartItem extends Product {
  quantity: number
  selected_size?: string 
}

export const CATEGORIES: ProductCategory[] = [
  'Meaningful',
  'Modern',
  'Animals',
  'Sports',
  'Gardens & Flowers',
  'Actors',
  'Trending',
]

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  'Meaningful': 'ذات معنى',
  'Modern': 'عصرية',
  'Animals': 'حيوانات',
  'Sports': 'رياضة',
  'Gardens & Flowers': 'حدائق وزهور',
  'Actors': 'ممثلين',
  'Trending': 'رائجة',
}

export const STATUS_LABELS: Record<OrderStatus, string> = {
  'Pending': 'قيد الانتظار',
  'Processing': 'قيد المعالجة',
  'Shipped': 'تم الشحن',
  'Delivered': 'تم التسليم',
  'Cancelled': 'ملغي',
}

export const STATUS_COLORS: Record<OrderStatus, string> = {
  'Pending': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  'Processing': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'Shipped': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  'Delivered': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  'Cancelled': 'bg-red-500/20 text-red-400 border-red-500/30',
}