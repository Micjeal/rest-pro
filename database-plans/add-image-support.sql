-- Add image support to menu_items table
-- This migration adds image_url column to store menu item images

-- Add image_url column to menu_items table
ALTER TABLE menu_items ADD COLUMN image_url TEXT;

-- Add comment to document the new column
COMMENT ON COLUMN menu_items.image_url IS 'URL of the menu item image stored in file system or cloud storage';

-- Update RLS policies to include the new column (existing policies should already cover it)
-- No additional policy changes needed as existing policies cover all columns

-- Create index for better performance if querying by image_url (optional)
-- CREATE INDEX idx_menu_items_image_url ON menu_items(image_url) WHERE image_url IS NOT NULL;
