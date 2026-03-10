-- Add image_url column to inventory table
-- This migration adds image support for inventory items

-- Add image_url column to inventory table
ALTER TABLE inventory ADD COLUMN image_url TEXT;

-- Add comment to document the new column
COMMENT ON COLUMN inventory.image_url IS 'URL of the inventory item image stored in file system or cloud storage';

-- Create index for better performance if querying by image_url (optional)
-- CREATE INDEX idx_inventory_image_url ON inventory(image_url) WHERE image_url IS NOT NULL;
