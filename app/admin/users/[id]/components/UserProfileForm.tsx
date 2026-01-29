'use client';

import { useState } from 'react';
import { updateUser, toggleUserStatus, deleteUser } from '@/app/actions/users';
import { User } from '@/lib/types/user';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Save, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Props {
  user: User;
}

export function UserProfileForm({ user }: Props) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name,
    business_name: user.business_name || '',
    industry: user.industry || '',
    bio: user.bio || '',
    website_url: user.website_url || '',
    subscription_tier: user.subscription_tier,
    is_active: user.is_active,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await updateUser(user.id, formData);
      alert('User updated successfully!');
      router.refresh();
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async () => {
    const newStatus = !formData.is_active;
    setFormData({ ...formData, is_active: newStatus });

    try {
      await toggleUserStatus(user.id, newStatus);
      router.refresh();
    } catch (error: any) {
      alert(`Error: ${error.message}`);
      setFormData({ ...formData, is_active: !newStatus });
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteUser(user.id);
      alert('User deleted successfully!');
      router.push('/admin/users');
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <Card className="bg-white rounded-3xl shadow-soft p-8">
      <h2 className="font-serif text-2xl text-sage mb-6">User Profile</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-sage mb-2">
            Name <span className="text-red-500">*</span>
          </label>
          <Input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            placeholder="Tell us about yourself..."
            rows={4}
          />
        </div>

        {/* Website */}
        <div>
          <label className="block text-sm font-medium text-sage mb-2">
            Website URL
          </label>
          <Input
            type="url"
            value={formData.website_url}
            onChange={(e) =>
              setFormData({ ...formData, website_url: e.target.value })
            }
            placeholder="https://..."
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

        {/* Active Status */}
        <div className="flex items-center justify-between p-4 bg-sage/5 rounded-2xl">
          <div>
            <p className="font-medium text-sage">Account Status</p>
            <p className="text-sm text-sage/70">
              {formData.is_active ? 'Active' : 'Inactive'}
            </p>
          </div>
          <Button
            type="button"
            onClick={handleToggleStatus}
            variant={formData.is_active ? 'outline' : 'default'}
            size="sm"
          >
            {formData.is_active ? 'Deactivate' : 'Activate'}
          </Button>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-sage/10">
          <Button
            type="button"
            variant="ghost"
            onClick={handleDelete}
            className="text-red-600 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete User
          </Button>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-sage hover:bg-sage/90 text-cream"
          >
            {isSubmitting ? (
              'Saving...'
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
}
