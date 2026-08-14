-- RYVE CLOTHING CO. - Supabase schema
-- Run in Supabase SQL Editor on a fresh project.

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  address JSONB DEFAULT '{"street":"","city":"","province":"","postal_code":""}'::jsonb,
  is_admin BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  price NUMERIC(10,2) NOT NULL,
  compare_at_price NUMERIC(10,2),
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  gender TEXT CHECK (gender IN ('men','women','unisex')),
  images TEXT[] NOT NULL DEFAULT '{}',
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  is_new BOOLEAN NOT NULL DEFAULT TRUE,
  is_bestseller BOOLEAN NOT NULL DEFAULT FALSE,
  details JSONB DEFAULT '{"material":"100% French Terry Cotton","fit":"Oversized Streetwear","care":"Machine wash cold"}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  size TEXT NOT NULL,
  color TEXT NOT NULL,
  color_hex TEXT DEFAULT '#000000',
  stock INTEGER NOT NULL DEFAULT 0,
  sku TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  discount_type TEXT CHECK (discount_type IN ('percentage','fixed')),
  discount_value NUMERIC(10,2) NOT NULL,
  min_spend NUMERIC(10,2) DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  expires_at TIMESTAMPTZ
);

CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'Order Placed' CHECK (status IN ('Order Placed','Processing','Packed','Shipped','Delivered','Cancelled')),
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  shipping_address JSONB NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('COD','Bank Transfer','JazzCash','Easypaisa')),
  payment_status TEXT NOT NULL DEFAULT 'Pending' CHECK (payment_status IN ('Pending','Paid','Failed')),
  subtotal NUMERIC(10,2) NOT NULL,
  discount NUMERIC(10,2) DEFAULT 0,
  shipping_fee NUMERIC(10,2) DEFAULT 250,
  total NUMERIC(10,2) NOT NULL,
  tracking_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  variant_id UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  size TEXT NOT NULL,
  color TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  image TEXT
);

CREATE TABLE public.wishlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Automatically create a profile whenever a Supabase Auth user signs up.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- SECURITY DEFINER avoids recursive RLS checks when an admin policy needs to
-- determine whether the current authenticated user is an admin.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = TRUE
  );
$$;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "profiles_select_own_or_admin" ON public.profiles
FOR SELECT USING (auth.uid() = id OR public.is_admin());
CREATE POLICY "profiles_update_own" ON public.profiles
FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_admin_all" ON public.profiles
FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Public catalog, admin write access
CREATE POLICY "categories_public_read" ON public.categories FOR SELECT USING (TRUE);
CREATE POLICY "categories_admin_all" ON public.categories FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "products_public_read" ON public.products FOR SELECT USING (TRUE);
CREATE POLICY "products_admin_all" ON public.products FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "variants_public_read" ON public.product_variants FOR SELECT USING (TRUE);
CREATE POLICY "variants_admin_all" ON public.product_variants FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Orders: guest checkout can insert; authenticated users can see their own; admin can manage.
CREATE POLICY "orders_guest_insert" ON public.orders FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "orders_own_read" ON public.orders FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "orders_admin_all" ON public.orders FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "order_items_insert" ON public.order_items FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "order_items_read" ON public.order_items FOR SELECT USING (TRUE);
CREATE POLICY "order_items_admin_all" ON public.order_items FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Wishlist
CREATE POLICY "wishlist_own_select" ON public.wishlist FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "wishlist_own_insert" ON public.wishlist FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "wishlist_own_delete" ON public.wishlist FOR DELETE USING (auth.uid() = user_id);

-- Reviews
CREATE POLICY "reviews_public_read" ON public.reviews FOR SELECT USING (TRUE);
CREATE POLICY "reviews_auth_insert" ON public.reviews FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "reviews_admin_all" ON public.reviews FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Coupons
CREATE POLICY "coupons_public_active_read" ON public.coupons FOR SELECT USING (is_active = TRUE);
CREATE POLICY "coupons_admin_all" ON public.coupons FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Product media bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-media', 'product-media', TRUE)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "product_media_public_read" ON storage.objects
FOR SELECT USING (bucket_id = 'product-media');
CREATE POLICY "product_media_admin_insert" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'product-media' AND public.is_admin());
CREATE POLICY "product_media_admin_update" ON storage.objects
FOR UPDATE USING (bucket_id = 'product-media' AND public.is_admin())
WITH CHECK (bucket_id = 'product-media' AND public.is_admin());
CREATE POLICY "product_media_admin_delete" ON storage.objects
FOR DELETE USING (bucket_id = 'product-media' AND public.is_admin());

-- Starter categories
INSERT INTO public.categories (name, slug, image_url) VALUES
('Heavyweight Hoodies','heavyweight-hoodies','https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=1000&auto=format&fit=crop'),
('Oversized Tees','oversized-tees','https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1000&auto=format&fit=crop'),
('Cargo Pants & Bottoms','cargo-pants','https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=1000&auto=format&fit=crop'),
('Outerwear & Jackets','outerwear','https://images.unsplash.com/photo-1544022613-e87ca75a784a?q=80&w=1000&auto=format&fit=crop')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.coupons (code, discount_type, discount_value, min_spend) VALUES
('RYVE10','percentage',10,3000),
('FIRSTDROP','fixed',500,5000)
ON CONFLICT (code) DO NOTHING;
