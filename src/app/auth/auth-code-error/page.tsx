import Link from 'next/link';
import { AlertTriangle, ArrowLeft } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';

export default function AuthCodeErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-100 p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-lg">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-red-500 to-orange-600 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              May Problema sa Authentication
            </CardTitle>
            <CardDescription className="text-gray-600">
              Hindi namin ma-process ang inyong sign in request
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <div>
                <p className="font-medium">Authentication Error</p>
                <p className="text-sm">
                  May problema sa pag-sign in gamit ang social media. Pakisuyo,
                  subukan ulit o gamitin ang email/password.
                </p>
              </div>
            </Alert>

            <div className="space-y-3">
              <Button asChild className="w-full h-12">
                <Link href="/signin">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Bumalik sa Sign In
                </Link>
              </Button>

              <div className="text-center">
                <Link
                  href="/signup"
                  className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                >
                  Gumawa ng bagong account
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
