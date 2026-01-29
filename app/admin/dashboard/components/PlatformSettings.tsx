'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, Globe, Bell, Shield, Palette, Key } from 'lucide-react';

export function PlatformSettings() {
  const settings = [
    {
      category: 'General',
      icon: Settings,
      options: [
        { label: 'Platform Name', value: 'OwnVoice AI', type: 'text' },
        { label: 'Tagline', value: 'Boutique Wellness Content Strategy', type: 'text' },
        { label: 'Support Email', value: 'support@ownvoiceai.com', type: 'email' },
      ],
    },
    {
      category: 'Features',
      icon: Globe,
      options: [
        { label: 'User Registration', value: 'Disabled', type: 'toggle' },
        { label: 'AI Validation', value: 'Enabled', type: 'toggle' },
        { label: 'Trend Scraping', value: 'Manual', type: 'select' },
      ],
    },
    {
      category: 'Notifications',
      icon: Bell,
      options: [
        { label: 'Email Notifications', value: 'Disabled', type: 'toggle' },
        { label: 'Daily Reports', value: 'Disabled', type: 'toggle' },
        { label: 'User Activity Alerts', value: 'Disabled', type: 'toggle' },
      ],
    },
    {
      category: 'Security',
      icon: Shield,
      options: [
        { label: 'Two-Factor Auth', value: 'Coming Soon', type: 'info' },
        { label: 'Session Timeout', value: '24 hours', type: 'select' },
        { label: 'Password Policy', value: 'Strong', type: 'select' },
      ],
    },
  ];

  const apiKeys = [
    { name: 'Gemini API', status: 'Connected', icon: Key, color: 'text-green-600' },
    { name: 'Supabase', status: 'Connected', icon: Key, color: 'text-green-600' },
    { name: 'Firecrawl', status: 'Not Configured', icon: Key, color: 'text-yellow-600' },
  ];

  return (
    <Card className="bg-white rounded-3xl shadow-soft p-8">
      <h2 className="font-serif text-2xl text-sage mb-6">Platform Configuration</h2>

      {/* Settings Sections */}
      <div className="space-y-8">
        {settings.map((section, index) => {
          const Icon = section.icon;
          return (
            <div key={index}>
              <div className="flex items-center gap-2 mb-4">
                <Icon className="w-5 h-5 text-sage" />
                <h3 className="font-semibold text-sage">{section.category}</h3>
              </div>

              <div className="space-y-3 pl-7">
                {section.options.map((option, optIndex) => (
                  <div
                    key={optIndex}
                    className="flex items-center justify-between p-3 bg-sage/5 rounded-2xl"
                  >
                    <span className="text-sm text-sage/80">{option.label}</span>
                    {option.type === 'toggle' ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`text-xs ${
                          option.value === 'Enabled'
                            ? 'text-green-600'
                            : 'text-sage/50'
                        }`}
                      >
                        {option.value}
                      </Button>
                    ) : (
                      <span className="text-sm font-medium text-sage">
                        {option.value}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {/* API Keys Section */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Key className="w-5 h-5 text-sage" />
            <h3 className="font-semibold text-sage">API Integrations</h3>
          </div>

          <div className="space-y-3 pl-7">
            {apiKeys.map((api, index) => {
              const Icon = api.icon;
              return (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-sage/5 rounded-2xl"
                >
                  <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${api.color}`} />
                    <span className="text-sm text-sage/80">{api.name}</span>
                  </div>
                  <span className={`text-xs font-medium ${api.color}`}>
                    {api.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Design System */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Palette className="w-5 h-5 text-sage" />
            <h3 className="font-semibold text-sage">Design System</h3>
          </div>

          <div className="pl-7">
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-sage rounded-2xl">
                <p className="text-xs text-cream mb-1">Sage</p>
                <p className="text-xs font-mono text-cream/70">#556B2F</p>
              </div>
              <div className="p-4 bg-cream border border-sage/20 rounded-2xl">
                <p className="text-xs text-sage mb-1">Cream</p>
                <p className="text-xs font-mono text-sage/70">#FAF9F6</p>
              </div>
              <div className="p-4 bg-dusty-rose rounded-2xl">
                <p className="text-xs text-cream mb-1">Dusty Rose</p>
                <p className="text-xs font-mono text-cream/70">#D4A373</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-sage/10">
        <Button variant="outline" className="w-full" disabled>
          Save Configuration (Coming Soon)
        </Button>
      </div>
    </Card>
  );
}
