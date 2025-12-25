/**
 * Database types for Supabase
 * These types mirror the SQL schema defined in supabase/schema.sql
 */

// Enum types
export type UserRole = "user" | "creator" | "admin";

// Homepage Settings type
export interface HomepageSettings {
  id: string;
  hero_title_line1: string;
  hero_title_line2: string;
  hero_subtitle: string;
  hero_button_primary_text: string;
  hero_button_primary_link: string;
  hero_button_secondary_text: string;
  hero_button_secondary_link: string;
  cta_title: string;
  cta_subtitle: string;
  cta_button_text: string;
  cta_button_link: string;
  section_top_rated_title: string;
  section_latest_title: string;
  section_blog_title: string;
  updated_at: string;
  updated_by: string | null;
}
export type ProductStatus = "draft" | "pending" | "approved" | "rejected";
export type TransactionStatus = "pending" | "completed" | "refunded" | "failed";

// Profile type
export interface Profile {
  id: string;
  email: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  role: UserRole;
  balance: number;
  created_at: string;
  updated_at: string;
}

// Product type
export interface Product {
  id: string;
  creator_id: string;
  title: string;
  slug: string;
  description: string | null;
  price: number;
  cover_image: string | null;
  preview_images: string[];
  file_url: string | null;
  file_type: string | null;
  file_size: number | null;
  status: ProductStatus;
  view_count: number;
  download_count: number;
  avg_rating: number;
  rating_count: number;
  weighted_score: number;
  is_featured: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

// Product with creator info
export interface ProductWithCreator extends Product {
  creator_name: string | null;
  creator_avatar: string | null;
}

// Split type
export interface Split {
  id: string;
  product_id: string;
  user_id: string;
  percentage: number;
  role_description: string | null;
  created_at: string;
}

// Split with user info
export interface SplitWithUser extends Split {
  user: {
    display_name: string | null;
    avatar_url: string | null;
    username: string | null;
  };
}

// Transaction type
export interface Transaction {
  id: string;
  buyer_id: string;
  product_id: string;
  amount: number;
  platform_fee: number;
  creator_revenue: number;
  status: TransactionStatus;
  payment_method: string | null;
  payment_reference: string | null;
  created_at: string;
  completed_at: string | null;
}

// Transaction with product info
export interface TransactionWithProduct extends Transaction {
  product: {
    title: string;
    cover_image: string | null;
    slug: string;
  };
}

// Split payment type
export interface SplitPayment {
  id: string;
  transaction_id: string;
  recipient_id: string;
  amount: number;
  percentage: number;
  created_at: string;
}

// Review type
export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  is_verified_purchase: boolean;
  created_at: string;
  updated_at: string;
}

// Review with user info
export interface ReviewWithUser extends Review {
  user: {
    display_name: string | null;
    avatar_url: string | null;
    username: string | null;
  };
}

// Post (Blog) type
export interface Post {
  id: string;
  author_id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image: string | null;
  is_published: boolean;
  is_featured: boolean;
  view_count: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

// Post with author info
export interface PostWithAuthor extends Post {
  author: {
    display_name: string | null;
    avatar_url: string | null;
    username: string | null;
  };
}

// User purchase type
export interface UserPurchase {
  id: string;
  user_id: string;
  product_id: string;
  transaction_id: string;
  purchased_at: string;
}

// Platform statistics
export interface PlatformStats {
  total_users: number;
  total_creators: number;
  total_products: number;
  total_transactions: number;
  total_revenue: number;
  total_platform_fees: number;
  total_posts: number;
}

// Database schema type for Supabase client
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, "created_at" | "updated_at">;
        Update: Partial<Omit<Profile, "id" | "created_at">>;
      };
      products: {
        Row: Product;
        Insert: Omit<Product, "id" | "created_at" | "updated_at" | "view_count" | "download_count" | "avg_rating" | "rating_count" | "weighted_score">;
        Update: Partial<Omit<Product, "id" | "created_at" | "creator_id">>;
      };
      splits: {
        Row: Split;
        Insert: Omit<Split, "id" | "created_at">;
        Update: Partial<Omit<Split, "id" | "created_at" | "product_id">>;
      };
      transactions: {
        Row: Transaction;
        Insert: Omit<Transaction, "id" | "created_at" | "completed_at">;
        Update: Partial<Omit<Transaction, "id" | "created_at" | "buyer_id" | "product_id">>;
      };
      split_payments: {
        Row: SplitPayment;
        Insert: Omit<SplitPayment, "id" | "created_at">;
        Update: never;
      };
      reviews: {
        Row: Review;
        Insert: Omit<Review, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Review, "id" | "created_at" | "product_id" | "user_id">>;
      };
      posts: {
        Row: Post;
        Insert: Omit<Post, "id" | "created_at" | "updated_at" | "view_count">;
        Update: Partial<Omit<Post, "id" | "created_at" | "author_id">>;
      };
      user_purchases: {
        Row: UserPurchase;
        Insert: Omit<UserPurchase, "id" | "purchased_at">;
        Update: never;
      };
    };
    Views: {
      top_rated_products: {
        Row: ProductWithCreator;
      };
      latest_products: {
        Row: ProductWithCreator;
      };
      platform_stats: {
        Row: PlatformStats;
      };
    };
    Functions: {
      calculate_fees: {
        Args: { amount: number };
        Returns: { platform_fee: number; creator_revenue: number };
      };
      process_transaction: {
        Args: { transaction_id: string };
        Returns: boolean;
      };
    };
  };
}
