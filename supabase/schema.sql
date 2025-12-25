-- SnapStudio V2.2 Database Schema
-- Supabase PostgreSQL + Auth + Storage
-- Created: 2024

-- =============================================================================
-- ENUMS
-- =============================================================================

-- User roles for RBAC
CREATE TYPE user_role AS ENUM ('user', 'creator', 'admin');

-- Product status
CREATE TYPE product_status AS ENUM ('draft', 'pending', 'approved', 'rejected');

-- Transaction status
CREATE TYPE transaction_status AS ENUM ('pending', 'completed', 'refunded', 'failed');

-- =============================================================================
-- TABLES
-- =============================================================================

-- -----------------------------------------------------------------------------
-- profiles: User profiles (linked to auth.users)
-- -----------------------------------------------------------------------------
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    username TEXT UNIQUE,
    display_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    role user_role DEFAULT 'user' NOT NULL,
    balance DECIMAL(12, 2) DEFAULT 0.00 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Public profiles are viewable by everyone"
    ON profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can update their own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- -----------------------------------------------------------------------------
-- products: Digital products/artworks
-- -----------------------------------------------------------------------------
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    cover_image TEXT,
    preview_images TEXT[] DEFAULT '{}',
    file_url TEXT, -- The actual downloadable file
    file_type TEXT,
    file_size BIGINT,
    status product_status DEFAULT 'draft' NOT NULL,
    view_count INTEGER DEFAULT 0 NOT NULL,
    download_count INTEGER DEFAULT 0 NOT NULL,
    avg_rating DECIMAL(3, 2) DEFAULT 0.00,
    rating_count INTEGER DEFAULT 0 NOT NULL,
    weighted_score DECIMAL(5, 2) DEFAULT 0.00, -- For ranking algorithm
    is_featured BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Policies for products
CREATE POLICY "Approved products are viewable by everyone"
    ON products FOR SELECT
    USING (status = 'approved' OR creator_id = auth.uid() OR EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    ));

CREATE POLICY "Creators can insert their own products"
    ON products FOR INSERT
    WITH CHECK (
        creator_id = auth.uid() AND 
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('creator', 'admin'))
    );

CREATE POLICY "Creators can update their own products"
    ON products FOR UPDATE
    USING (creator_id = auth.uid() OR EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    ));

CREATE POLICY "Only admins can delete products"
    ON products FOR DELETE
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- -----------------------------------------------------------------------------
-- splits: Revenue split rules for collaborators
-- -----------------------------------------------------------------------------
CREATE TABLE splits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    percentage DECIMAL(5, 2) NOT NULL CHECK (percentage > 0 AND percentage <= 100),
    role_description TEXT, -- e.g., "Artist", "Designer", "Musician"
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(product_id, user_id)
);

-- Enable RLS
ALTER TABLE splits ENABLE ROW LEVEL SECURITY;

-- Policies for splits
CREATE POLICY "Splits are viewable by everyone"
    ON splits FOR SELECT
    USING (true);

CREATE POLICY "Product creators can manage splits"
    ON splits FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM products WHERE id = product_id AND creator_id = auth.uid()
    ));

CREATE POLICY "Product creators can update splits"
    ON splits FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM products WHERE id = product_id AND creator_id = auth.uid()
    ));

CREATE POLICY "Product creators can delete splits"
    ON splits FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM products WHERE id = product_id AND creator_id = auth.uid()
    ));

-- -----------------------------------------------------------------------------
-- transactions: Purchase records and revenue tracking
-- -----------------------------------------------------------------------------
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    platform_fee DECIMAL(10, 2) NOT NULL, -- 10% platform commission
    creator_revenue DECIMAL(10, 2) NOT NULL, -- 90% to creators
    status transaction_status DEFAULT 'pending' NOT NULL,
    payment_method TEXT,
    payment_reference TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    completed_at TIMESTAMPTZ,
    UNIQUE(buyer_id, product_id) -- One purchase per user per product
);

-- Enable RLS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Policies for transactions
CREATE POLICY "Users can view their own transactions"
    ON transactions FOR SELECT
    USING (
        buyer_id = auth.uid() OR 
        EXISTS (SELECT 1 FROM products WHERE id = product_id AND creator_id = auth.uid()) OR
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "Authenticated users can create transactions"
    ON transactions FOR INSERT
    WITH CHECK (buyer_id = auth.uid());

CREATE POLICY "Only system/admin can update transactions"
    ON transactions FOR UPDATE
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- -----------------------------------------------------------------------------
-- split_payments: Individual payments to collaborators from a transaction
-- -----------------------------------------------------------------------------
CREATE TABLE split_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    recipient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    percentage DECIMAL(5, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE split_payments ENABLE ROW LEVEL SECURITY;

-- Policies for split_payments
CREATE POLICY "Recipients can view their payments"
    ON split_payments FOR SELECT
    USING (
        recipient_id = auth.uid() OR
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- -----------------------------------------------------------------------------
-- reviews: Product ratings and reviews
-- -----------------------------------------------------------------------------
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    is_verified_purchase BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(product_id, user_id) -- One review per user per product
);

-- Enable RLS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Policies for reviews
CREATE POLICY "Reviews are viewable by everyone"
    ON reviews FOR SELECT
    USING (true);

CREATE POLICY "Verified purchasers can create reviews"
    ON reviews FOR INSERT
    WITH CHECK (
        user_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM transactions 
            WHERE buyer_id = auth.uid() 
            AND product_id = reviews.product_id 
            AND status = 'completed'
        )
    );

CREATE POLICY "Users can update their own reviews"
    ON reviews FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own reviews"
    ON reviews FOR DELETE
    USING (user_id = auth.uid() OR EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    ));

-- -----------------------------------------------------------------------------
-- posts: Official blog/editorial content (Admin only)
-- -----------------------------------------------------------------------------
CREATE TABLE posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    excerpt TEXT, -- Short summary for listing pages
    content TEXT NOT NULL, -- Rich text or Markdown content
    cover_image TEXT,
    is_published BOOLEAN DEFAULT FALSE NOT NULL,
    is_featured BOOLEAN DEFAULT FALSE,
    view_count INTEGER DEFAULT 0 NOT NULL,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Policies for posts
CREATE POLICY "Published posts are viewable by everyone"
    ON posts FOR SELECT
    USING (is_published = TRUE OR EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    ));

CREATE POLICY "Only admins can create posts"
    ON posts FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    ));

CREATE POLICY "Only admins can update posts"
    ON posts FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    ));

CREATE POLICY "Only admins can delete posts"
    ON posts FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    ));

-- -----------------------------------------------------------------------------
-- user_purchases: Quick lookup for purchased products
-- -----------------------------------------------------------------------------
CREATE TABLE user_purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    purchased_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(user_id, product_id)
);

-- Enable RLS
ALTER TABLE user_purchases ENABLE ROW LEVEL SECURITY;

-- Policies for user_purchases
CREATE POLICY "Users can view their own purchases"
    ON user_purchases FOR SELECT
    USING (user_id = auth.uid() OR EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    ));

-- =============================================================================
-- FUNCTIONS
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Function: Handle new user registration
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, email, username, display_name)
    VALUES (
        NEW.id,
        NEW.email,
        LOWER(SPLIT_PART(NEW.email, '@', 1)),
        SPLIT_PART(NEW.email, '@', 1)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Auto-create profile on user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- -----------------------------------------------------------------------------
-- Function: Update product rating statistics
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_product_rating()
RETURNS TRIGGER AS $$
DECLARE
    avg_r DECIMAL(3, 2);
    count_r INTEGER;
    weighted DECIMAL(5, 2);
    min_votes INTEGER := 5; -- Minimum votes for reliable rating
    global_avg DECIMAL(3, 2) := 3.5; -- Global average assumption
BEGIN
    -- Calculate new average and count
    SELECT AVG(rating), COUNT(*) INTO avg_r, count_r
    FROM reviews
    WHERE product_id = COALESCE(NEW.product_id, OLD.product_id);
    
    -- Weighted rating formula: (v/(v+m)) * R + (m/(v+m)) * C
    -- Where: v = vote count, m = minimum votes, R = average rating, C = global average
    IF count_r > 0 THEN
        weighted := (count_r::DECIMAL / (count_r + min_votes)) * avg_r + 
                    (min_votes::DECIMAL / (count_r + min_votes)) * global_avg;
    ELSE
        weighted := 0;
    END IF;
    
    -- Update product statistics
    UPDATE products
    SET 
        avg_rating = COALESCE(avg_r, 0),
        rating_count = COALESCE(count_r, 0),
        weighted_score = weighted,
        updated_at = NOW()
    WHERE id = COALESCE(NEW.product_id, OLD.product_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers for rating updates
CREATE TRIGGER on_review_insert
    AFTER INSERT ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_product_rating();

CREATE TRIGGER on_review_update
    AFTER UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_product_rating();

CREATE TRIGGER on_review_delete
    AFTER DELETE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_product_rating();

-- -----------------------------------------------------------------------------
-- Function: Process transaction and distribute revenue
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION process_transaction(transaction_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    trans RECORD;
    split RECORD;
    creator_share DECIMAL(10, 2);
BEGIN
    -- Get transaction details
    SELECT * INTO trans FROM transactions WHERE id = transaction_id AND status = 'pending';
    
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    -- Process split payments
    FOR split IN 
        SELECT s.*, p.creator_id 
        FROM splits s 
        JOIN products p ON p.id = s.product_id
        WHERE s.product_id = trans.product_id
    LOOP
        creator_share := trans.creator_revenue * (split.percentage / 100);
        
        -- Record split payment
        INSERT INTO split_payments (transaction_id, recipient_id, amount, percentage)
        VALUES (transaction_id, split.user_id, creator_share, split.percentage);
        
        -- Update recipient balance
        UPDATE profiles 
        SET balance = balance + creator_share, updated_at = NOW()
        WHERE id = split.user_id;
    END LOOP;
    
    -- If no splits defined, pay full amount to creator
    IF NOT FOUND THEN
        SELECT creator_id INTO split FROM products WHERE id = trans.product_id;
        
        INSERT INTO split_payments (transaction_id, recipient_id, amount, percentage)
        VALUES (transaction_id, split.creator_id, trans.creator_revenue, 100);
        
        UPDATE profiles 
        SET balance = balance + trans.creator_revenue, updated_at = NOW()
        WHERE id = split.creator_id;
    END IF;
    
    -- Record purchase
    INSERT INTO user_purchases (user_id, product_id, transaction_id)
    VALUES (trans.buyer_id, trans.product_id, transaction_id);
    
    -- Update transaction status
    UPDATE transactions 
    SET status = 'completed', completed_at = NOW()
    WHERE id = transaction_id;
    
    -- Update product download count
    UPDATE products 
    SET download_count = download_count + 1, updated_at = NOW()
    WHERE id = trans.product_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- -----------------------------------------------------------------------------
-- Function: Calculate platform fee (10%)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION calculate_fees(amount DECIMAL)
RETURNS TABLE(platform_fee DECIMAL, creator_revenue DECIMAL) AS $$
BEGIN
    platform_fee := ROUND(amount * 0.10, 2);
    creator_revenue := amount - platform_fee;
    RETURN NEXT;
END;
$$ LANGUAGE plpgsql;

-- -----------------------------------------------------------------------------
-- Function: Update timestamps
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to all tables
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_reviews_updated_at
    BEFORE UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_posts_updated_at
    BEFORE UPDATE ON posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================================================
-- INDEXES
-- =============================================================================

-- Products indexes
CREATE INDEX idx_products_creator ON products(creator_id);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_weighted_score ON products(weighted_score DESC);
CREATE INDEX idx_products_created_at ON products(created_at DESC);
CREATE INDEX idx_products_slug ON products(slug);

-- Transactions indexes
CREATE INDEX idx_transactions_buyer ON transactions(buyer_id);
CREATE INDEX idx_transactions_product ON transactions(product_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);

-- Reviews indexes
CREATE INDEX idx_reviews_product ON reviews(product_id);
CREATE INDEX idx_reviews_user ON reviews(user_id);

-- Posts indexes
CREATE INDEX idx_posts_slug ON posts(slug);
CREATE INDEX idx_posts_published ON posts(is_published, published_at DESC);
CREATE INDEX idx_posts_author ON posts(author_id);

-- Splits indexes
CREATE INDEX idx_splits_product ON splits(product_id);
CREATE INDEX idx_splits_user ON splits(user_id);

-- User purchases indexes
CREATE INDEX idx_user_purchases_user ON user_purchases(user_id);
CREATE INDEX idx_user_purchases_product ON user_purchases(product_id);

-- =============================================================================
-- VIEWS
-- =============================================================================

-- Top rated products view (using weighted score)
CREATE VIEW top_rated_products AS
SELECT 
    p.*,
    pr.display_name as creator_name,
    pr.avatar_url as creator_avatar
FROM products p
JOIN profiles pr ON pr.id = p.creator_id
WHERE p.status = 'approved' AND p.rating_count >= 1
ORDER BY p.weighted_score DESC, p.rating_count DESC;

-- Latest products view
CREATE VIEW latest_products AS
SELECT 
    p.*,
    pr.display_name as creator_name,
    pr.avatar_url as creator_avatar
FROM products p
JOIN profiles pr ON pr.id = p.creator_id
WHERE p.status = 'approved'
ORDER BY p.published_at DESC NULLS LAST, p.created_at DESC;

-- Platform statistics view (for admin dashboard)
CREATE VIEW platform_stats AS
SELECT 
    (SELECT COUNT(*) FROM profiles) as total_users,
    (SELECT COUNT(*) FROM profiles WHERE role = 'creator') as total_creators,
    (SELECT COUNT(*) FROM products WHERE status = 'approved') as total_products,
    (SELECT COUNT(*) FROM transactions WHERE status = 'completed') as total_transactions,
    (SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE status = 'completed') as total_revenue,
    (SELECT COALESCE(SUM(platform_fee), 0) FROM transactions WHERE status = 'completed') as total_platform_fees,
    (SELECT COUNT(*) FROM posts WHERE is_published = TRUE) as total_posts;

-- =============================================================================
-- STORAGE BUCKETS (Run in Supabase Dashboard)
-- =============================================================================
-- Note: Execute these in Supabase Dashboard > Storage

-- CREATE BUCKET 'avatars' (public)
-- CREATE BUCKET 'products' (private - requires auth)
-- CREATE BUCKET 'covers' (public)
-- CREATE BUCKET 'posts' (public)

-- Storage policies should be configured in Supabase Dashboard:
-- avatars: Public read, authenticated write (own files only)
-- products: Authenticated read (purchased only), creator write
-- covers: Public read, creator write
-- posts: Public read, admin write only
