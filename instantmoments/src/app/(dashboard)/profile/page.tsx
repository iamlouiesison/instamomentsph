'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useAuthContext } from '@/components/providers/AuthProvider';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Phone, Mail, Camera, Save } from 'lucide-react';
import {
  profileUpdateSchema,
  type ProfileUpdateInput,
} from '@/lib/validations/auth';

export default function ProfilePage() {
  const [isLoading, setIsLoading] = useState(false);
  const { profile, updateProfile } = useAuthContext();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<ProfileUpdateInput>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      fullName: profile?.full_name || '',
      phoneNumber: profile?.phone_number || '',
    },
  });

  const onSubmit = async (data: ProfileUpdateInput) => {
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
        // Show success message (you could use a toast here)
        alert('Profile updated successfully!');
      }
    } catch {
      setError('root', {
        message: 'May hindi inaasahang error. Pakisuyo, subukan ulit.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      {/* Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                InstaMoments
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Button asChild variant="outline" size="sm">
                <Link href="/dashboard">Back to Dashboard</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Profile Settings</h1>
          <p className="text-muted-foreground text-lg">
            Manage your account information and preferences
          </p>
        </div>

        <div className="space-y-6">
          {/* Profile Picture Section */}
          <Card className="border-0 bg-card/95 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center mr-3">
                  <Camera className="w-4 h-4 text-primary" />
                </div>
                Profile Picture
              </CardTitle>
              <CardDescription>Update your profile picture</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-6">
                <Avatar className="w-20 h-20">
                  <AvatarImage
                    src={profile?.avatar_url || ''}
                    alt={profile?.full_name || ''}
                  />
                  <AvatarFallback className="text-lg">
                    {profile?.full_name ? getInitials(profile.full_name) : 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Button variant="outline" disabled>
                    Upload New Photo
                  </Button>
                  <p className="text-sm text-muted-foreground mt-2">
                    Avatar upload coming soon
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile Information */}
          <Card className="border-0 bg-card/95 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center">
                <div className="w-8 h-8 bg-secondary/10 rounded-lg flex items-center justify-center mr-3">
                  <User className="w-4 h-4 text-secondary" />
                </div>
                Profile Information
              </CardTitle>
              <CardDescription>
                Update your personal information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {errors.root && (
                  <Alert variant="destructive">{errors.root.message}</Alert>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-sm font-medium">
                      Full Name *
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
                    <Label
                      htmlFor="phoneNumber"
                      className="text-sm font-medium"
                    >
                      Phone Number
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
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      id="email"
                      type="email"
                      value={profile?.email || ''}
                      disabled
                      className="pl-10 h-12 bg-muted"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Email address cannot be changed
                  </p>
                </div>

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    className="h-12 px-8 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-primary-foreground font-semibold"
                    disabled={isLoading}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Account Information */}
          <Card className="border-0 bg-card/95 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center">
                <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center mr-3">
                  <Mail className="w-4 h-4 text-accent-foreground" />
                </div>
                Account Information
              </CardTitle>
              <CardDescription>
                Your account details and subscription information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm font-medium text-foreground">
                    Account Type
                  </span>
                  <span className="text-sm text-muted-foreground capitalize">
                    {profile?.subscription_tier || 'Free'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm font-medium text-foreground">
                    Member Since
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {profile?.created_at
                      ? new Date(profile.created_at).toLocaleDateString()
                      : 'N/A'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
