-- Add description and image_url columns to order_items table
-- This migration allows storing specific preparation instructions and images with order items

-- Add description column to order_items
ALTER TABLE order_items ADD COLUMN description TEXT;

-- Add image_url column to order_items
ALTER TABLE order_items ADD COLUMN image_url TEXT;

-- Add comments to document the new columns
COMMENT ON COLUMN order_items.description IS 'Specific preparation instructions or notes for this order item';
COMMENT ON COLUMN order_items.image_url IS 'URL of the menu item image at the time of ordering';

-- Update RLS policies to include the new columns (existing policies should already cover them)
-- No additional policy changes needed as existing policies cover all columns

-- Create indexes for better performance if querying by these fields (optional)
-- CREATE INDEX idx_order_items_description ON order_items(description) WHERE description IS NOT NULL;
-- CREATE INDEX idx_order_items_image_url ON order_items(image_url) WHERE image_url IS NOT NULL;
