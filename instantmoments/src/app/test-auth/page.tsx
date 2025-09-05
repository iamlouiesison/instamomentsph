'use client';

import { useAuthContext } from '@/components/providers/AuthProvider';
import { useEffect, useState } from 'react';

export default function TestAuthPage() {
  const { user, profile, loading, error } = useAuthContext();
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  useEffect(() => {
    addLog('Component mounted');
    addLog(`Loading: ${loading}`);
    addLog(`Has user: ${!!user}`);
    addLog(`User ID: ${user?.id || 'none'}`);
    addLog(`Has profile: ${!!profile}`);
    addLog(`Error: ${error || 'none'}`);
  }, [user, profile, loading, error]);

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Authentication Debug Page</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Current State</h2>
            <div className="bg-gray-100 p-4 rounded-lg">
              <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
              <p><strong>Has User:</strong> {user ? 'Yes' : 'No'}</p>
              <p><strong>User ID:</strong> {user?.id || 'None'}</p>
              <p><strong>User Email:</strong> {user?.email || 'None'}</p>
              <p><strong>Has Profile:</strong> {profile ? 'Yes' : 'No'}</p>
              <p><strong>Profile ID:</strong> {profile?.id || 'None'}</p>
              <p><strong>Error:</strong> {error || 'None'}</p>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Debug Logs</h2>
            <div className="bg-gray-100 p-4 rounded-lg max-h-96 overflow-y-auto">
              {logs.map((log, index) => (
                <div key={index} className="text-sm font-mono">
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4">Test API Call</h2>
          <button
            onClick={async () => {
              addLog('Testing API call...');
              try {
                const response = await fetch('/api/events');
                const result = await response.json();
                addLog(`API Response: ${response.status} - ${JSON.stringify(result)}`);
              } catch (error) {
                addLog(`API Error: ${error}`);
              }
            }}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Test API Call
          </button>
        </div>
      </div>
    </div>
  );
}
