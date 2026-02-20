'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

const SQL_SCRIPT = `-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'cashier' CHECK (role IN ('admin', 'manager', 'cashier')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Update restaurants table to reference users instead of auth.users
ALTER TABLE restaurants 
DROP CONSTRAINT IF EXISTS restaurants_owner_id_fkey,
ADD CONSTRAINT restaurants_owner_id_fkey 
FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE;

-- Enable RLS for users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
CREATE POLICY "Users can view their own profile"
  ON users FOR SELECT
  USING (id = current_setting('app.current_user_id', true)::UUID);

CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  USING (id = current_setting('app.current_user_id', true)::UUID);`

export default function SQLSetupPage() {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(SQL_SCRIPT)
    toast.success('SQL script copied to clipboard!')
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Database Setup - Manual SQL Required</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Instructions:</h3>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Go to your Supabase project dashboard</li>
                <li>Navigate to the SQL Editor</li>
                <li>Copy and run the SQL script below</li>
                <li>After running the script, go to <code className="bg-gray-100 px-1">/setup</code> to insert sample users</li>
                <li>Then login with: admin@restaurant.com / demo123</li>
              </ol>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold">SQL Script:</h3>
                <Button onClick={copyToClipboard} variant="outline">
                  Copy to Clipboard
                </Button>
              </div>
              <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
                <code>{SQL_SCRIPT}</code>
              </pre>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">After running SQL:</h4>
              <p className="text-blue-700 text-sm">
                Visit <code className="bg-blue-100 px-1">/setup</code> to create sample users, 
                then login with the credentials shown there.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
