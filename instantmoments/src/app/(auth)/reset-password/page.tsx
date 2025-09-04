'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';
import { useAuthContext } from '@/components/providers/AuthProvider';
import {
  resetPasswordSchema,
  type ResetPasswordInput,
} from '@/lib/validations/auth';

export default function ResetPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { resetPassword } = useAuthContext();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordInput) => {
    setIsLoading(true);

    try {
      const { error } = await resetPassword(data.email);

      if (error) {
        setError('root', {
          message:
            'May problema sa pag-send ng reset email. Pakisuyo, subukan ulit.',
        });
      } else {
        setIsSuccess(true);
      }
    } catch {
      setError('root', {
        message: 'May hindi inaasahang error. Pakisuyo, subukan ulit.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-lg">
            <CardHeader className="text-center space-y-2">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Na-send na ang email!
              </CardTitle>
              <CardDescription className="text-gray-600">
                Nag-send kami ng password reset link sa inyong email. Pakisuyo,
                i-check ang inyong inbox.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <Alert>
                <Mail className="h-4 w-4" />
                <div>
                  <p className="font-medium">Check ang inyong email</p>
                  <p className="text-sm">
                    Hindi ninyo nakita ang email? I-check ang spam folder o
                    mag-try ulit.
                  </p>
                </div>
              </Alert>

              <div className="space-y-3">
                <Button
                  onClick={() => setIsSuccess(false)}
                  variant="outline"
                  className="w-full h-12"
                >
                  Mag-try ulit
                </Button>

                <div className="text-center">
                  <Link
                    href="/signin"
                    className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                  >
                    Bumalik sa Sign In
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-lg">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Reset Password
            </CardTitle>
            <CardDescription className="text-gray-600">
              Ilagay ang inyong email address at mag-send kami ng link para sa
              bagong password
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {errors.root && (
                <Alert variant="destructive">{errors.root.message}</Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="inyong.email@example.com"
                    className="pl-10 h-12"
                    {...register('email')}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold"
                disabled={isLoading}
              >
                {isLoading ? 'Nag-send ng email...' : 'Send Reset Link'}
              </Button>
            </form>

            <div className="text-center">
              <Link
                href="/signin"
                className="inline-flex items-center text-blue-600 hover:text-blue-800 hover:underline font-medium"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Bumalik sa Sign In
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
