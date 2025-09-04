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
          message:
            'May problema sa pag-update ng profile. Pakisuyo, subukan ulit.',
        });
      } else {
        router.push('/dashboard');
      }
    } catch {
      setError('root', {
        message: 'May hindi inaasahang error. Pakisuyo, subukan ulit.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-lg">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
              <Smartphone className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Kumpletuhin ang Profile
            </CardTitle>
            <CardDescription className="text-gray-600">
              Ilagay ang inyong impormasyon para makapag-start na kayo sa
              InstaMoments
            </CardDescription>
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
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Juan dela Cruz"
                    className="pl-10 h-12"
                    {...register('fullName')}
                  />
                </div>
                {errors.fullName && (
                  <p className="text-sm text-red-600">
                    {errors.fullName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber" className="text-sm font-medium">
                  Phone Number (Optional)
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="phoneNumber"
                    type="tel"
                    placeholder="09123456789"
                    className="pl-10 h-12"
                    {...register('phoneNumber')}
                  />
                </div>
                {errors.phoneNumber && (
                  <p className="text-sm text-red-600">
                    {errors.phoneNumber.message}
                  </p>
                )}
                <p className="text-xs text-gray-500">
                  Para sa mga importanteng updates at notifications
                </p>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold"
                disabled={isLoading}
              >
                {isLoading ? 'Sinusave...' : 'Tapusin ang Setup'}
              </Button>
            </form>

            <div className="text-center">
              <p className="text-xs text-gray-500">
                Pwede ninyong i-update ang impormasyon na ito sa settings page
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
