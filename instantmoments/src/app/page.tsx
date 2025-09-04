import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  QrCode,
  Camera,
  Video,
  Heart,
  Smartphone,
  Users,
  CheckCircle,
  ArrowRight,
  Play,
  Facebook,
  Instagram,
  Mail,
  Phone,
} from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      {/* Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                <Camera className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                InstaMoments
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-6">
              <Link
                href="#features"
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                Features
              </Link>
              <Link
                href="#how-it-works"
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                How It Works
              </Link>
              <Link
                href="#pricing"
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                Pricing
              </Link>
              <Button asChild variant="outline" size="sm">
                <Link href="/signin">Sign In</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/signup">Start Free</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 sm:py-32 overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge variant="secondary" className="w-fit">
                  🇵🇭 Made for Filipino Celebrations
                </Badge>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
                  Create Instant Photo Galleries for Your{' '}
                  <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    Filipino Celebrations
                  </span>
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl">
                  No app downloads needed! Guests scan your QR code and
                  instantly start sharing photos and video greetings. Perfect
                  for weddings, birthdays, debuts, and all your special moments.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="h-12 px-8">
                  <Link href="/signup">
                    Start Your Event
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="h-12 px-8"
                >
                  <Link href="#how-it-works">
                    <Play className="mr-2 w-5 h-5" />
                    See How It Works
                  </Link>
                </Button>
              </div>

              <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-success" />
                  <span>Free for small events</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-success" />
                  <span>GCash payments</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-success" />
                  <span>No app download</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative z-10">
                <div className="w-full h-96 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <QrCode className="w-24 h-24 text-primary mx-auto" />
                    <p className="text-muted-foreground">
                      Filipino family celebration with QR code
                    </p>
                  </div>
                </div>
                <div className="absolute -top-4 -right-4 bg-primary text-primary-foreground p-4 rounded-xl shadow-lg">
                  <QrCode className="w-8 h-8" />
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl -rotate-3 scale-105"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold">
              Why Filipino Families Love InstaMoments
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Designed specifically for Philippine celebration culture with
              features that make sharing memories effortless.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="celebration-card">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <QrCode className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>QR Code Magic</CardTitle>
                <CardDescription>
                  Guests scan and instantly access their camera. No app
                  downloads, no complicated setup.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="celebration-card">
              <CardHeader>
                <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-4">
                  <Camera className="w-6 h-6 text-secondary" />
                </div>
                <CardTitle>Real-time Sharing</CardTitle>
                <CardDescription>
                  Photos appear live in the gallery during your event. Everyone
                  sees memories as they&apos;re created.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="celebration-card">
              <CardHeader>
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                  <Video className="w-6 h-6 text-accent-foreground" />
                </div>
                <CardTitle>Video Greetings</CardTitle>
                <CardDescription>
                  20-second personal video messages from all your guests.
                  Perfect for Filipino celebration culture.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="celebration-card">
              <CardHeader>
                <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center mb-4">
                  <Heart className="w-6 h-6 text-success" />
                </div>
                <CardTitle>Filipino-First Design</CardTitle>
                <CardDescription>
                  Built for Philippine celebration culture with local payment
                  methods and cultural considerations.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="celebration-card">
              <CardHeader>
                <div className="w-12 h-12 bg-info/10 rounded-lg flex items-center justify-center mb-4">
                  <Smartphone className="w-6 h-6 text-info" />
                </div>
                <CardTitle>Mobile Optimized</CardTitle>
                <CardDescription>
                  Perfect for Filipino mobile-first users. Works seamlessly on
                  all Android and iOS devices.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="celebration-card">
              <CardHeader>
                <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-warning" />
                </div>
                <CardTitle>Everyone Participates</CardTitle>
                <CardDescription>
                  From grandparents to kids, everyone can easily contribute
                  photos and videos to your celebration.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold">
              How InstaMoments Works
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Creating amazing celebration memories is simple. Just follow these
              4 easy steps.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl font-bold text-primary">1</span>
              </div>
              <h3 className="text-xl font-semibold">Create Your Event</h3>
              <p className="text-muted-foreground">
                Set up your celebration details and get a unique QR code in
                seconds.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl font-bold text-secondary">2</span>
              </div>
              <h3 className="text-xl font-semibold">Guests Scan & Share</h3>
              <p className="text-muted-foreground">
                No app downloads needed! Guests scan your QR code and instantly
                start sharing.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl font-bold text-accent-foreground">
                  3
                </span>
              </div>
              <h3 className="text-xl font-semibold">Real-time Gallery</h3>
              <p className="text-muted-foreground">
                Photos and video greetings appear live in your gallery during
                the event.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl font-bold text-success">4</span>
              </div>
              <h3 className="text-xl font-semibold">Download Memories</h3>
              <p className="text-muted-foreground">
                Get all your celebration photos and videos in one beautiful
                collection.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold">
              Loved by Filipino Families
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Join thousands of families who trust InstaMoments for their
              special celebrations.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <Card className="celebration-card">
              <CardHeader>
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-lg">👰</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">Maria Santos</h4>
                    <p className="text-sm text-muted-foreground">
                      Wedding Planner, Manila
                    </p>
                  </div>
                </div>
                <CardDescription>
                  &quot;InstaMoments made our wedding unforgettable! All our
                  guests could easily share photos without downloading any app.
                  The real-time gallery was magical.&quot;
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="celebration-card">
              <CardHeader>
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center">
                    <span className="text-lg">🎂</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">Roberto Cruz</h4>
                    <p className="text-sm text-muted-foreground">
                      Father, Cebu
                    </p>
                  </div>
                </div>
                <CardDescription>
                  &quot;Perfect for my daughter&apos;s 18th birthday! Even my
                  parents could easily share photos. The video greetings from
                  family abroad were so touching.&quot;
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="celebration-card">
              <CardHeader>
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                    <span className="text-lg">🎓</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">Ana Dela Cruz</h4>
                    <p className="text-sm text-muted-foreground">
                      Graduate, Davao
                    </p>
                  </div>
                </div>
                <CardDescription>
                  &quot;My graduation ceremony was captured beautifully by
                  everyone! The QR code made it so easy for all my classmates
                  and family to share memories.&quot;
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-3xl font-bold text-primary">10,000+</div>
              <div className="text-muted-foreground">Events Created</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-secondary">500,000+</div>
              <div className="text-muted-foreground">Photos Shared</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-accent">50,000+</div>
              <div className="text-muted-foreground">Happy Families</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-success">4.9★</div>
              <div className="text-muted-foreground">User Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Preview Section */}
      <section id="pricing" className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Choose the perfect plan for your celebration. All plans include
              GCash payment options.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="celebration-card">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Free</CardTitle>
                <CardDescription>
                  Perfect for small family gatherings
                </CardDescription>
                <div className="text-4xl font-bold text-primary mt-4">₱0</div>
                <div className="text-muted-foreground">per event</div>
              </CardHeader>
              <div className="px-6 pb-6 space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-success" />
                    <span className="text-sm">Up to 50 photos</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-success" />
                    <span className="text-sm">Up to 10 video greetings</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-success" />
                    <span className="text-sm">QR code access</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-success" />
                    <span className="text-sm">Basic gallery</span>
                  </div>
                </div>
                <Button asChild className="w-full">
                  <Link href="/signup">Get Started Free</Link>
                </Button>
              </div>
            </Card>

            <Card className="celebration-card border-primary relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground">
                  Most Popular
                </Badge>
              </div>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Premium</CardTitle>
                <CardDescription>
                  Ideal for weddings and special events
                </CardDescription>
                <div className="text-4xl font-bold text-primary mt-4">₱299</div>
                <div className="text-muted-foreground">per event</div>
              </CardHeader>
              <div className="px-6 pb-6 space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-success" />
                    <span className="text-sm">Up to 500 photos</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-success" />
                    <span className="text-sm">Up to 50 video greetings</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-success" />
                    <span className="text-sm">Custom QR code design</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-success" />
                    <span className="text-sm">Advanced gallery features</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-success" />
                    <span className="text-sm">Download all photos</span>
                  </div>
                </div>
                <Button asChild className="w-full">
                  <Link href="/signup">Choose Premium</Link>
                </Button>
              </div>
            </Card>

            <Card className="celebration-card">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Professional</CardTitle>
                <CardDescription>
                  For event planners and businesses
                </CardDescription>
                <div className="text-4xl font-bold text-primary mt-4">₱999</div>
                <div className="text-muted-foreground">per month</div>
              </CardHeader>
              <div className="px-6 pb-6 space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-success" />
                    <span className="text-sm">Unlimited events</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-success" />
                    <span className="text-sm">Unlimited photos & videos</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-success" />
                    <span className="text-sm">White-label options</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-success" />
                    <span className="text-sm">Priority support</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-success" />
                    <span className="text-sm">Analytics dashboard</span>
                  </div>
                </div>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/signup">Go Professional</Link>
                </Button>
              </div>
            </Card>
          </div>

          <div className="text-center mt-12">
            <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-success" />
                <span>GCash payments accepted</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-success" />
                <span>PayMaya supported</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-success" />
                <span>Credit cards welcome</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-3xl sm:text-4xl font-bold">
              Ready to Create Amazing Celebration Memories?
            </h2>
            <p className="text-xl text-muted-foreground">
              Join thousands of Filipino families who trust InstaMoments for
              their special moments. Start your first event in minutes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="h-12 px-8">
                <Link href="/signup">
                  Create Your First Event
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-12 px-8">
                <Link href="/signin">Already have an account?</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted/50 border-t">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                  <Camera className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold">InstaMoments</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Creating instant photo galleries for Filipino celebrations. No
                app downloads, just scan and share.
              </p>
              <div className="flex space-x-4">
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-primary"
                >
                  <Facebook className="w-5 h-5" />
                </Link>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-primary"
                >
                  <Instagram className="w-5 h-5" />
                </Link>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Product</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#features" className="hover:text-primary">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#pricing" className="hover:text-primary">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="#how-it-works" className="hover:text-primary">
                    How It Works
                  </Link>
                </li>
                <li>
                  <Link href="/signup" className="hover:text-primary">
                    Get Started
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Support</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-primary">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-primary">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-primary">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-primary">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Contact</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center space-x-2">
                  <Mail className="w-4 h-4" />
                  <span>hello@instamoments.ph</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Phone className="w-4 h-4" />
                  <span>+63 917 123 4567</span>
                </li>
                <li>
                  <span>Metro Manila, Philippines</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>
              &copy; 2025 InstaMoments. All rights reserved. Made with ❤️ for
              Filipino celebrations.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
