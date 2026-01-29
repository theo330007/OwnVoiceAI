'use client';

import { UserStats } from '@/lib/types/user';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import { Eye, BarChart2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  users: UserStats[];
}

export function UsersTable({ users }: Props) {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Card className="bg-white rounded-3xl shadow-soft overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-sage/5 border-b border-sage/10">
            <tr>
              <th className="text-left p-4 text-sm font-semibold text-sage">
                User
              </th>
              <th className="text-left p-4 text-sm font-semibold text-sage">
                Email
              </th>
              <th className="text-center p-4 text-sm font-semibold text-sage">
                Validations
              </th>
              <th className="text-center p-4 text-sm font-semibold text-sage">
                Avg. Score
              </th>
              <th className="text-left p-4 text-sm font-semibold text-sage">
                Last Active
              </th>
              <th className="text-left p-4 text-sm font-semibold text-sage">
                Joined
              </th>
              <th className="text-center p-4 text-sm font-semibold text-sage">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12">
                  <p className="text-sage/50">No users found</p>
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-sage/5 hover:bg-sage/5 transition-colors"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-dusty-rose/20 rounded-full flex items-center justify-center">
                        <span className="text-dusty-rose font-semibold">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-sage">{user.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="text-sm text-sage/70">{user.email}</p>
                  </td>
                  <td className="p-4 text-center">
                    <div className="inline-flex items-center gap-1 px-3 py-1 bg-sage/10 rounded-full">
                      <BarChart2 className="w-3 h-3 text-sage" />
                      <span className="text-sm font-medium text-sage">
                        {user.total_validations}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    {user.avg_relevance_score ? (
                      <span className="text-sm font-semibold text-dusty-rose">
                        {Math.round(user.avg_relevance_score)}
                      </span>
                    ) : (
                      <span className="text-sm text-sage/50">-</span>
                    )}
                  </td>
                  <td className="p-4">
                    {user.last_validation_at ? (
                      <p className="text-sm text-sage/70">
                        {formatDate(user.last_validation_at)}
                      </p>
                    ) : (
                      <p className="text-sm text-sage/50">Never</p>
                    )}
                  </td>
                  <td className="p-4">
                    <p className="text-sm text-sage/70">
                      {formatDate(user.created_at)}
                    </p>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      <Link href={`/admin/users/${user.id}`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-sage hover:bg-sage/10"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
