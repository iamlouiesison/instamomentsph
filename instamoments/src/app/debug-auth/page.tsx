'use client';

import { useAuthContext } from '@/components/providers/AuthProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function DebugAuthPage() {
  const { user, profile, loading, error, signOut } = useAuthContext();
  const router = useRouter();
  const [apiTest, setApiTest] = useState<any>(null);

  const testApiCall = async () => {
    try {
      const response = await fetch('/api/events');
      const result = await response.json();
      setApiTest({
        success: result.success,
        error: result.error,
        status: response.status,
        data: result.data,
      });
    } catch (error) {
      setApiTest({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        status: 'error',
      });
    }
  };

  useEffect(() => {
    console.log('Debug Auth - User state changed:', {
      hasUser: !!user,
      userId: user?.id,
      userEmail: user?.email,
      loading,
      error,
      profile: profile?.id,
    });
  }, [user, loading, error, profile]);

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Authentication Debug</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Current Authentication State</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <strong>Loading:</strong> {loading ? 'Yes' : 'No'}
            </div>
            <div>
              <strong>Has User:</strong> {user ? 'Yes' : 'No'}
            </div>
            {user && (
              <>
                <div>
                  <strong>User ID:</strong> {user.id}
                </div>
                <div>
                  <strong>User Email:</strong> {user.email}
                </div>
                <div>
                  <strong>User Created:</strong> {new Date(user.created_at).toLocaleString()}
                </div>
              </>
            )}
            <div>
              <strong>Has Profile:</strong> {profile ? 'Yes' : 'No'}
            </div>
            {profile && (
              <>
                <div>
                  <strong>Profile ID:</strong> {profile.id}
                </div>
                <div>
                  <strong>Full Name:</strong> {profile.full_name}
                </div>
              </>
            )}
            {error && (
              <div className="text-red-500">
                <strong>Error:</strong> {error}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>API Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={testApiCall} disabled={loading}>
              Test API Call to /api/events
            </Button>
            {apiTest && (
              <div className="bg-gray-100 p-4 rounded">
                <pre>{JSON.stringify(apiTest, null, 2)}</pre>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button onClick={() => router.push('/signin')}>
            Go to Sign In
          </Button>
          <Button onClick={() => router.push('/dashboard')}>
            Go to Dashboard
          </Button>
          {user && (
            <Button onClick={signOut} variant="outline">
              Sign Out
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
