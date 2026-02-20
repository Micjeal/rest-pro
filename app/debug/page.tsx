'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function DebugPage() {
  const [tables, setTables] = useState<any[]>([])
  const [usersTableExists, setUsersTableExists] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    checkDatabase()
  }, [])

  const checkDatabase = async () => {
    try {
      const response = await fetch('/api/check-tables')
      const data = await response.json()
      
      setTables(data.tables || [])
      setUsersTableExists(data.usersTableExists)
      setError(data.error || '')
    } catch (err) {
      setError('Failed to check database')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Database Debug Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Users Table Status:</h3>
              <div className={`p-3 rounded ${usersTableExists ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {usersTableExists ? '✅ Users table exists' : '❌ Users table does not exist'}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Database Tables:</h3>
              {tables.length > 0 ? (
                <ul className="list-disc list-inside space-y-1">
                  {tables.map((table: any) => (
                    <li key={table.table_name} className="text-sm">
                      {table.table_name}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">No tables found</p>
              )}
            </div>

            {error && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Error:</h3>
                <div className="bg-red-100 text-red-800 p-3 rounded">
                  {error}
                </div>
              </div>
            )}

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Next Steps:</h4>
              {usersTableExists ? (
                <p className="text-blue-700 text-sm">
                  Users table exists. Visit <code className="bg-blue-100 px-1">/setup</code> to create sample users.
                </p>
              ) : (
                <p className="text-blue-700 text-sm">
                  Users table missing. Visit <code className="bg-blue-100 px-1">/sql-setup</code> to get the SQL script.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
