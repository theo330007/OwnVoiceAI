'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  addProjectCollaborationNote,
  deleteCollaborationNote,
  type CollaborationNote,
} from '@/app/actions/collaboration';
import { Card } from '@/components/ui/card';
import { MessageSquare, Plus, Trash2, Pin } from 'lucide-react';

interface Props {
  projectId: string;
  userId: string;
  notes: CollaborationNote[];
}

export function CollaborationNotes({ projectId, userId, notes }: Props) {
  const router = useRouter();
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    note_type: 'general' as 'strategy' | 'recommendation' | 'insight' | 'general',
    title: '',
    content: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await addProjectCollaborationNote(projectId, userId, {
        note_type: formData.note_type,
        title: formData.title || undefined,
        content: formData.content,
      });

      setFormData({
        note_type: 'general',
        title: '',
        content: '',
      });

      setIsAdding(false);
      router.refresh();
    } catch (error: any) {
      alert(error.message || 'Failed to add note');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this note?')) {
      return;
    }

    try {
      await deleteCollaborationNote(noteId, projectId);
      router.refresh();
    } catch (error: any) {
      alert(error.message || 'Failed to delete note');
    }
  };

  const getNoteTypeColor = (type: string) => {
    switch (type) {
      case 'strategy':
        return 'bg-dusty-rose/20 text-dusty-rose';
      case 'recommendation':
        return 'bg-sage/20 text-sage';
      case 'insight':
        return 'bg-amber-100 text-amber-700';
      default:
        return 'bg-sage/10 text-sage/70';
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Card className="bg-white rounded-3xl shadow-soft p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <MessageSquare className="w-5 h-5 text-sage" />
          <h3 className="font-serif text-xl text-sage">Collaboration Notes</h3>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 px-4 py-2 bg-sage text-cream rounded-2xl hover:bg-sage/90 transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          Add Note
        </button>
      </div>

      {/* Add Form */}
      {isAdding && (
        <form
          onSubmit={handleSubmit}
          className="mb-6 p-4 bg-sage/5 rounded-2xl space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-sage mb-2">
              Note Type
            </label>
            <select
              value={formData.note_type}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  note_type: e.target.value as any,
                })
              }
              className="w-full px-4 py-2 rounded-xl border border-sage/20 focus:border-sage focus:outline-none"
            >
              <option value="general">General Note</option>
              <option value="strategy">Strategy Discussion</option>
              <option value="recommendation">Recommendation</option>
              <option value="insight">Insight</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-sage mb-2">
              Title (Optional)
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 rounded-xl border border-sage/20 focus:border-sage focus:outline-none"
              placeholder="Brief title for this note"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-sage mb-2">
              Note
            </label>
            <textarea
              value={formData.content}
              onChange={(e) =>
                setFormData({ ...formData, content: e.target.value })
              }
              className="w-full px-4 py-2 rounded-xl border border-sage/20 focus:border-sage focus:outline-none min-h-[100px]"
              placeholder="Add your strategic notes here..."
              required
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-sage text-cream rounded-xl hover:bg-sage/90 transition-colors disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Note'}
            </button>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 bg-sage/10 text-sage rounded-xl hover:bg-sage/20 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Notes List */}
      <div className="space-y-3">
        {notes.length === 0 ? (
          <p className="text-sage/50 text-center py-8">
            No collaboration notes yet. Add strategic notes to guide this user's
            content strategy.
          </p>
        ) : (
          notes.map((note) => (
            <div
              key={note.id}
              className="p-4 bg-sage/5 rounded-2xl hover:bg-sage/10 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getNoteTypeColor(
                        note.note_type
                      )}`}
                    >
                      {note.note_type}
                    </span>
                    {note.is_pinned && (
                      <Pin className="w-3 h-3 text-dusty-rose fill-dusty-rose" />
                    )}
                  </div>
                  {note.title && (
                    <h4 className="font-semibold text-sage mb-1">{note.title}</h4>
                  )}
                  <p className="text-sm text-sage/80 whitespace-pre-wrap">
                    {note.content}
                  </p>
                  <p className="text-xs text-sage/50 mt-2">
                    {formatDate(note.created_at)}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(note.id)}
                  className="ml-3 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete note"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
