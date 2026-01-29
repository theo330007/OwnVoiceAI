'use client';

import { Card } from '@/components/ui/card';
import Link from 'next/link';
import {
  Users,
  TrendingUp,
  BookOpen,
  Settings,
  BarChart3,
  Sparkles,
  Target,
  FileText,
} from 'lucide-react';

export function QuickActions() {
  const actions = [
    {
      title: 'Manage Users',
      description: 'View, edit, and manage user accounts',
      icon: Users,
      href: '/admin/users',
      color: 'bg-sage/10 text-sage hover:bg-sage/20',
    },
    {
      title: 'Add Trends',
      description: 'Add macro or niche wellness trends',
      icon: TrendingUp,
      href: '/admin/trends',
      color: 'bg-dusty-rose/10 text-dusty-rose hover:bg-dusty-rose/20',
    },
    {
      title: 'Add Knowledge',
      description: 'Add scientific articles to knowledge base',
      icon: BookOpen,
      href: '/admin/knowledge',
      color: 'bg-sage/10 text-sage hover:bg-sage/20',
    },
    {
      title: 'View Dashboard',
      description: 'See public trends dashboard',
      icon: BarChart3,
      href: '/dashboard',
      color: 'bg-dusty-rose/10 text-dusty-rose hover:bg-dusty-rose/20',
    },
    {
      title: 'AI Lab',
      description: 'Test content validation agent',
      icon: Sparkles,
      href: '/lab',
      color: 'bg-sage/10 text-sage hover:bg-sage/20',
    },
    {
      title: 'Analytics',
      description: 'View platform analytics (Coming Soon)',
      icon: Target,
      href: '#',
      color: 'bg-dusty-rose/10 text-dusty-rose hover:bg-dusty-rose/20',
      disabled: true,
    },
  ];

  return (
    <Card className="bg-white rounded-3xl shadow-soft p-8">
      <h2 className="font-serif text-2xl text-sage mb-6">Quick Actions</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {actions.map((action, index) => {
          const Icon = action.icon;
          const content = (
            <div
              className={`p-5 rounded-2xl transition-all cursor-pointer ${
                action.disabled
                  ? 'opacity-50 cursor-not-allowed bg-sage/5'
                  : action.color
              }`}
            >
              <div className="flex items-start gap-4">
                <Icon className="w-6 h-6 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">
                    {action.title}
                    {action.disabled && (
                      <span className="ml-2 text-xs px-2 py-1 bg-sage/20 rounded-full">
                        Soon
                      </span>
                    )}
                  </h3>
                  <p className="text-sm opacity-80">{action.description}</p>
                </div>
              </div>
            </div>
          );

          return action.disabled ? (
            <div key={index}>{content}</div>
          ) : (
            <Link key={index} href={action.href}>
              {content}
            </Link>
          );
        })}
      </div>
    </Card>
  );
}
