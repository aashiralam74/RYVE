# RYVE Clothing Co.

React + Vite + Tailwind CSS + Supabase storefront.

## Setup

1. Copy `.env.example` to `.env` and add your Supabase URL and publishable/anon key.
2. Run the SQL in `supabase/schema.sql` in the Supabase SQL Editor.
3. Run `npm install`.
4. Run `npm run dev`.

## Admin

Create the admin account through Supabase Auth, then set `profiles.is_admin` to `true` for that user's profile.
