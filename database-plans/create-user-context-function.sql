-- Create user context function for RLS
-- This function sets the current user ID for Row Level Security

CREATE OR REPLACE FUNCTION set_user_id(user_id UUID)
RETURNS void AS $$
BEGIN
  PERFORM set_config('app.current_user_id', user_id::text, true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION set_user_id(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION set_user_id(UUID) TO service_role;
