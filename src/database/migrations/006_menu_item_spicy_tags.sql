-- Migration 006: Add spice_level, tags, and is_egg to menu_items
-- Also ensures menu_item_variants index exists

ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS spice_level TEXT DEFAULT 'NONE';
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS is_egg BOOLEAN DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_menu_items_spice_level ON menu_items(spice_level);
CREATE INDEX IF NOT EXISTS idx_menu_item_variants_item ON menu_item_variants(menu_item_id);
