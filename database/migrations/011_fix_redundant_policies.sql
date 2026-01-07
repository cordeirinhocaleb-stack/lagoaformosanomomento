
-- Migration: 011_fix_redundant_policies
-- Description: Drop redundant permissive RLS policies to improve performance.

-- ad_plan_placements
DROP POLICY IF EXISTS "ad_place_sel_v1.193" ON ad_plan_placements;

-- ad_plans
DROP POLICY IF EXISTS "ad_plans_sel_v1.193" ON ad_plans;

-- ad_prices
DROP POLICY IF EXISTS "ad_prices_sel_v1.193" ON ad_prices;

-- advertisers
DROP POLICY IF EXISTS "ads_select_v1.193" ON advertisers;
DROP POLICY IF EXISTS "advertisers_read_all" ON advertisers;

-- engagement_interactions
DROP POLICY IF EXISTS "eng_insert_v1.193" ON engagement_interactions;
DROP POLICY IF EXISTS "eng_select_v1.193" ON engagement_interactions;

-- jobs
DROP POLICY IF EXISTS "jobs_select_v1.193" ON jobs;

-- settings
DROP POLICY IF EXISTS "settings_sel_v1.193" ON settings;

-- social_posts
DROP POLICY IF EXISTS "social_select_v1.193" ON social_posts;

-- support_messages
-- Conflicts with support_msg_all_staff_v1.193
DROP POLICY IF EXISTS "support_msg_insert_v1.193" ON support_messages;
DROP POLICY IF EXISTS "support_msg_select_v1.193" ON support_messages;

-- system_settings
DROP POLICY IF EXISTS "sys_settings_select_v1.193" ON system_settings;

-- users
DROP POLICY IF EXISTS "users_select_v1.193" ON users;
