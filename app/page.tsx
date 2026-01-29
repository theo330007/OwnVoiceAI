import Link from 'next/link';
import { Sparkles, TrendingUp, BookOpen, ArrowRight, Users, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function Home() {
  return (
    <main className="min-h-screen bg-cream">
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
            <Link href="/lab">
              <Button size="lg" className="bg-sage hover:bg-sage/90">
                <Sparkles className="w-5 h-5 mr-2" />
                Open AI Lab
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button
                size="lg"
                variant="outline"
                className="border-sage/20 hover:bg-sage/5"
              >
                View Dashboard
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

        {/* Admin Access */}
        <div className="mt-16">
          <div className="max-w-md mx-auto bg-gradient-to-br from-sage/10 to-dusty-rose/10 rounded-3xl p-8 border-2 border-sage/20">
            <p className="text-sm text-sage/70 mb-3 text-center">Admin Portal</p>
            <Link href="/admin/dashboard">
              <Button
                size="lg"
                className="w-full bg-sage hover:bg-sage/90 text-cream mb-4"
              >
                <Settings className="w-5 h-5 mr-2" />
                Open Admin Dashboard
              </Button>
            </Link>
            <div className="flex gap-3 justify-center flex-wrap text-xs">
              <Link
                href="/admin/users"
                className="inline-flex items-center gap-1 text-sage/60 hover:text-sage transition-colors"
              >
                <Users className="w-3 h-3" />
                Users
              </Link>
              <Link
                href="/admin/trends"
                className="text-sage/60 hover:text-sage transition-colors"
              >
                Trends
              </Link>
              <Link
                href="/admin/knowledge"
                className="text-sage/60 hover:text-sage transition-colors"
              >
                Knowledge
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
