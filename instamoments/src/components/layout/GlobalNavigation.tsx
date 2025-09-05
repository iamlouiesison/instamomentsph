'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthContext } from '@/components/providers/AuthProvider';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Camera,
  LogOut,
  User,
  Plus,
  Menu,
  X,
  Home,
  BarChart3,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface GlobalNavigationProps {
  className?: string;
}

export function GlobalNavigation({ className }: GlobalNavigationProps) {
  const { user, profile, signOut, loading } = useAuthContext();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    setIsMobileMenuOpen(false);
  };

  // Determine if we're on a public page (landing, auth pages)
  const isPublicPage =
    pathname === '/' ||
    pathname.startsWith('/signin') ||
    pathname.startsWith('/signup') ||
    pathname.startsWith('/reset-password');

  // Navigation items for authenticated users
  const authenticatedNavItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: Home,
      current: pathname === '/dashboard',
    },
    {
      name: 'Create Event',
      href: '/create-event',
      icon: Plus,
      current: pathname === '/create-event',
    },
    {
      name: 'Profile',
      href: '/profile',
      icon: User,
      current: pathname === '/profile',
    },
  ];

  // Public navigation items (for landing page)
  const publicNavItems = [
    {
      name: 'Features',
      href: '#features',
      current: false,
    },
    {
      name: 'How It Works',
      href: '#how-it-works',
      current: false,
    },
    {
      name: 'Pricing',
      href: '#pricing',
      current: false,
    },
  ];

  const isActiveRoute = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  // Show loading state
  if (loading) {
    return (
      <nav
        className={cn(
          'border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50',
          className
        )}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Camera className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-primary">
                InstaMoments
              </span>
            </div>
            <div className="w-24 h-8 bg-muted animate-pulse rounded" />
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav
      className={cn(
        'border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50',
        className
      )}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            href={user ? '/dashboard' : '/'}
            className="flex items-center space-x-2 group"
          >
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
              <Camera className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-primary">InstaMoments</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {user
              ? // Authenticated navigation
                authenticatedNavItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link key={item.name} href={item.href}>
                      <Button
                        variant={isActiveRoute(item.href) ? 'default' : 'ghost'}
                        size="sm"
                        className={cn(
                          'flex items-center space-x-2 transition-all',
                          isActiveRoute(item.href)
                            ? 'bg-primary text-primary-foreground shadow-sm'
                            : 'hover:bg-accent hover:text-accent-foreground'
                        )}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.name}</span>
                      </Button>
                    </Link>
                  );
                })
              : // Public navigation (only on landing page)
                isPublicPage &&
                publicNavItems.map((item) => (
                  <Link key={item.name} href={item.href}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-sm font-medium hover:text-primary transition-colors"
                    >
                      {item.name}
                    </Button>
                  </Link>
                ))}
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {user ? (
              // Authenticated user menu
              <>
                {/* User Info - Desktop */}
                <div className="hidden sm:block">
                  <span className="text-sm text-muted-foreground">
                    Hello, {profile?.full_name || user?.email?.split('@')[0]}!
                  </span>
                </div>

                {/* User Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center space-x-2"
                    >
                      <User className="w-4 h-4" />
                      <span className="hidden sm:inline">Account</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-3 py-2">
                      <p className="text-sm font-medium">
                        {profile?.full_name || 'User'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="flex items-center">
                        <User className="w-4 h-4 mr-2" />
                        Profile Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" className="flex items-center">
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleSignOut}
                      className="text-destructive focus:text-destructive"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              // Unauthenticated user actions
              <div className="flex items-center space-x-4">
                {isPublicPage ? (
                  // Landing page actions
                  <>
                    <Button asChild variant="outline" size="sm">
                      <Link href="/signin">Sign In</Link>
                    </Button>
                    <Button asChild size="sm">
                      <Link href="/signup">Start Free</Link>
                    </Button>
                  </>
                ) : (
                  // Auth page actions
                  <Button asChild variant="outline" size="sm">
                    <Link href="/signin">Sign In</Link>
                  </Button>
                )}
              </div>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t bg-background/95 backdrop-blur">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {user ? (
                // Authenticated mobile menu
                <>
                  {authenticatedNavItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Button
                          variant={
                            isActiveRoute(item.href) ? 'default' : 'ghost'
                          }
                          size="sm"
                          className={cn(
                            'w-full justify-start flex items-center space-x-3',
                            isActiveRoute(item.href)
                              ? 'bg-primary text-primary-foreground'
                              : 'hover:bg-accent hover:text-accent-foreground'
                          )}
                        >
                          <Icon className="w-4 h-4" />
                          <span>{item.name}</span>
                        </Button>
                      </Link>
                    );
                  })}
                  {/* Mobile User Info */}
                  <div className="px-3 py-2 border-t mt-2">
                    <p className="text-sm font-medium">
                      {profile?.full_name || 'User'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {user?.email}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSignOut}
                      className="w-full mt-2 text-destructive hover:text-destructive"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </Button>
                  </div>
                </>
              ) : (
                // Public mobile menu
                <>
                  {isPublicPage &&
                    publicNavItems.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start text-sm font-medium hover:text-primary transition-colors"
                        >
                          {item.name}
                        </Button>
                      </Link>
                    ))}
                  <div className="px-3 py-2 border-t mt-2 space-y-2">
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      <Link
                        href="/signin"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Sign In
                      </Link>
                    </Button>
                    <Button asChild size="sm" className="w-full">
                      <Link
                        href="/signup"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Start Free
                      </Link>
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
