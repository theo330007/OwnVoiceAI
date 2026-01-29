'use client';

import { useState } from 'react';
import { createUser } from '@/app/actions/users';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, UserPlus } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function NewUserPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    business_name: '',
    industry: '',
    bio: '',
    subscription_tier: 'free' as 'free' | 'pro' | 'enterprise',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const user = await createUser({
        name: formData.name,
        email: formData.email,
        business_name: formData.business_name || undefined,
        industry: formData.industry || undefined,
        bio: formData.bio || undefined,
        subscription_tier: formData.subscription_tier,
      });

      alert('User created successfully!');
      router.push(`/admin/users/${user.id}`);
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream p-8">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/admin/users"
          className="inline-flex items-center gap-2 text-sage/70 hover:text-sage transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Users
        </Link>

        <h1 className="font-serif text-4xl text-sage mb-2">Add New User</h1>
        <p className="text-sage/70 mb-8">
          Create a new user account with profile information
        </p>

        <Card className="bg-white rounded-3xl shadow-soft p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-sage mb-2">
                Name <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g., Sarah Johnson"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-sage mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="sarah@example.com"
                required
              />
            </div>

            {/* Business Name */}
            <div>
              <label className="block text-sm font-medium text-sage mb-2">
                Business Name
              </label>
              <Input
                type="text"
                value={formData.business_name}
                onChange={(e) =>
                  setFormData({ ...formData, business_name: e.target.value })
                }
                placeholder="e.g., Fertile Ground Wellness"
              />
            </div>

            {/* Industry */}
            <div>
              <label className="block text-sm font-medium text-sage mb-2">
                Industry
              </label>
              <select
                value={formData.industry}
                onChange={(e) =>
                  setFormData({ ...formData, industry: e.target.value })
                }
                className="flex h-10 w-full rounded-2xl border border-sage/20 bg-white px-4 py-2 text-sm text-sage focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage/50"
              >
                <option value="">Select industry...</option>
                <option value="fertility">Fertility</option>
                <option value="nutrition">Nutrition</option>
                <option value="holistic wellness">Holistic Wellness</option>
                <option value="hormones">Hormonal Health</option>
                <option value="gut health">Gut Health</option>
                <option value="stress management">Stress Management</option>
                <option value="sleep optimization">Sleep Optimization</option>
              </select>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-sage mb-2">
                Bio
              </label>
              <Textarea
                value={formData.bio}
                onChange={(e) =>
                  setFormData({ ...formData, bio: e.target.value })
                }
                placeholder="Tell us about this user..."
                rows={4}
              />
            </div>

            {/* Subscription Tier */}
            <div>
              <label className="block text-sm font-medium text-sage mb-2">
                Subscription Tier
              </label>
              <select
                value={formData.subscription_tier}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    subscription_tier: e.target.value as any,
                  })
                }
                className="flex h-10 w-full rounded-2xl border border-sage/20 bg-white px-4 py-2 text-sm text-sage focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage/50"
              >
                <option value="free">Free</option>
                <option value="pro">Pro</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-sage hover:bg-sage/90 text-cream"
            >
              {isSubmitting ? (
                'Creating...'
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Create User
                </>
              )}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
