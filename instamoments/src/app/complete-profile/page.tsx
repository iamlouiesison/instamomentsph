'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User, Phone, Smartphone } from 'lucide-react';

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
  completeProfileSchema,
  type CompleteProfileInput,
} from '@/lib/validations/auth';

export default function CompleteProfilePage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { updateProfile, user } = useAuthContext();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<CompleteProfileInput>({
    resolver: zodResolver(completeProfileSchema),
    defaultValues: {
      fullName:
        user?.user_metadata?.full_name || user?.user_metadata?.name || '',
    },
  });

  const onSubmit = async (data: CompleteProfileInput) => {
    setIsLoading(true);

    try {
      const { error } = await updateProfile({
        full_name: data.fullName,
        phone_number: data.phoneNumber || null,
      });

      if (error) {
        setError('root', {
          message: 'Something went wrong. Please try again.',
        });
      } else {
        router.push('/dashboard');
      }
    } catch {
      setError('root', {
        message: 'Something went wrong. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-primary">
                InstaMoments
              </span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-lg border-0 bg-card/95 backdrop-blur">
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                <Smartphone className="w-8 h-8 text-primary-foreground" />
              </div>
              <div className="space-y-2">
                <CardTitle className="text-2xl font-bold">
                  Complete Your Profile
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Add your information to get started with InstaMoments
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {errors.root && (
                  <Alert variant="destructive">{errors.root.message}</Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-sm font-medium">
                    Buong Pangalan *
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Juan dela Cruz"
                      className="pl-10 h-12"
                      {...register('fullName')}
                    />
                  </div>
                  {errors.fullName && (
                    <p className="text-sm text-destructive">
                      {errors.fullName.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNumber" className="text-sm font-medium">
                    Phone Number (Optional)
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      id="phoneNumber"
                      type="tel"
                      placeholder="09123456789"
                      className="pl-10 h-12"
                      {...register('phoneNumber')}
                    />
                  </div>
                  {errors.phoneNumber && (
                    <p className="text-sm text-destructive">
                      {errors.phoneNumber.message}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Para sa mga importanteng updates at notifications
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 text-primary-foreground font-semibold"
                  disabled={isLoading}
                >
                  {isLoading ? 'Sinusave...' : 'Tapusin ang Setup'}
                </Button>
              </form>

              <div className="text-center">
                <p className="text-xs text-muted-foreground">
                  Pwede ninyong i-update ang impormasyon na ito sa settings page
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
