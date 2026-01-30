import Link from 'next/link';
import { Sparkles, TrendingUp, BookOpen, ArrowRight, Users, Settings, LogIn, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function Home() {
  const user = await getCurrentUser();

  // If user is logged in, redirect to dashboard
  if (user) {
    redirect('/dashboard');
  }

  return (
    <main className="min-h-screen bg-cream">
      {/* Top Bar for Non-Authenticated Users */}
      <div className="border-b border-sage/10 bg-white sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-sage rounded-2xl flex items-center justify-center">
              <span className="text-cream font-serif text-xl font-bold">O</span>
            </div>
            <span className="font-serif text-xl text-sage hidden sm:block">
              OwnVoice AI
            </span>
          </div>
          <div className="flex gap-3">
            <Link href="/auth/login">
              <Button variant="outline" className="border-sage/20 hover:bg-sage/5">
                <LogIn className="w-4 h-4 mr-2" />
                Login
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button className="bg-sage hover:bg-sage/90 text-cream">
                <UserPlus className="w-4 h-4 mr-2" />
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="container mx-auto px-6 py-16">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <h1 className="font-serif text-6xl md:text-7xl text-sage mb-6">
            OwnVoice AI
          </h1>
          <p className="text-2xl md:text-3xl text-sage/80 mb-4 font-light">
            Boutique Wellness Content Strategy Platform
          </p>
          <p className="text-lg text-sage/60 leading-relaxed mb-8 max-w-2xl mx-auto">
            Validate your content ideas with AI-powered trend analysis and
            scientific research. Built for wellness entrepreneurs who value
            data-driven content strategies.
          </p>

          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/auth/signup">
              <Button size="lg" className="bg-sage hover:bg-sage/90 text-cream">
                <UserPlus className="w-5 h-5 mr-2" />
                Get Started Free
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button
                size="lg"
                variant="outline"
                className="border-sage/20 hover:bg-sage/5"
              >
                Sign In
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card className="p-8 text-center">
            <div className="w-16 h-16 bg-sage/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-sage" />
            </div>
            <h3 className="font-serif text-xl text-sage mb-3">
              AI Validation
            </h3>
            <p className="text-sage/70 text-sm leading-relaxed">
              Get instant validation for your content ideas with relevance
              scores, trend alignment, and refined hooks optimized for
              engagement.
            </p>
          </Card>

          <Card className="p-8 text-center">
            <div className="w-16 h-16 bg-dusty-rose/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-8 h-8 text-dusty-rose" />
            </div>
            <h3 className="font-serif text-xl text-sage mb-3">
              Trend Intelligence
            </h3>
            <p className="text-sage/70 text-sm leading-relaxed">
              Stay ahead with macro and niche wellness trends. Understand what's
              resonating in your industry right now.
            </p>
          </Card>

          <Card className="p-8 text-center">
            <div className="w-16 h-16 bg-sage/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-sage" />
            </div>
            <h3 className="font-serif text-xl text-sage mb-3">
              Scientific Anchors
            </h3>
            <p className="text-sage/70 text-sm leading-relaxed">
              Ground your content in credible research. Access a curated
              knowledge base of scientific studies and findings.
            </p>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <div className="max-w-2xl mx-auto bg-gradient-to-br from-sage/5 to-dusty-rose/5 rounded-3xl p-12 border border-sage/10">
            <h2 className="font-serif text-3xl text-sage mb-4">
              Ready to Transform Your Content Strategy?
            </h2>
            <p className="text-sage/70 mb-8 leading-relaxed">
              Join wellness entrepreneurs who are creating data-driven content that resonates.
              Start validating your ideas today.
            </p>
            <Link href="/auth/signup">
              <Button size="lg" className="bg-sage hover:bg-sage/90 text-cream">
                <UserPlus className="w-5 h-5 mr-2" />
                Create Free Account
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
