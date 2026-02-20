-- Add category column to menu_items table
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS category TEXT;

-- Update existing menu items with default categories based on their names
UPDATE menu_items SET category = 'Salads' WHERE name ILIKE '%salad%';
UPDATE menu_items SET category = 'Sandwiches' WHERE name ILIKE '%sandwich%';
UPDATE menu_items SET category = 'Soups' WHERE name ILIKE '%soup%';
UPDATE menu_items SET category = 'Seafood' WHERE name ILIKE '%salmon%' OR name ILIKE '%tuna%';
UPDATE menu_items SET category = 'Steaks' WHERE name ILIKE '%steak%' OR name ILIKE '%ribeye%';
UPDATE menu_items SET category = 'Sushi' WHERE name ILIKE '%roll%' OR name ILIKE '%sushi%';
UPDATE menu_items SET category = 'Pizza' WHERE name ILIKE '%pizza%';

-- Set a default category for any remaining items
UPDATE menu_items SET category = 'Other' WHERE category IS NULL;
