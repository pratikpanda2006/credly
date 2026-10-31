import React, { useState } from 'react';
import { Send, AlertCircle, Sparkles } from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';

interface PostBoxProps {
  teamId: string;
  onPostCreated: () => void;
}

export const PostBox: React.FC<PostBoxProps> = ({ teamId, onPostCreated }) => {
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmed = text.trim();
    if (!trimmed) {
      setError('Write what you did first.');
      return;
    }
    if (trimmed.length < 8) {
      setError('Add a bit more detail (8+ characters).');
      return;
    }
    if (trimmed.length > 280) {
      setError('Post cannot exceed 280 characters.');
      return;
    }

    setSubmitting(true);
    try {
      await api.createPost(teamId, trimmed);
      setText('');
      showToast('Contribution logged! Waiting for teammates to review.');
      onPostCreated();
    } catch (err: any) {
      setError(err.message || 'Failed to submit post.');
    } finally {
      setSubmitting(false);
    }
  };

  const charCount = text.length;
  const isTooShort = charCount > 0 && charCount < 8;
  const isTooLong = charCount > 280;

  return (
    <div className="w-full rounded-card border border-[var(--bd)] bg-[var(--card)] p-5 shadow-card transition-colors">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-bold tracking-tight text-[var(--tx)] flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[var(--ac)]" />
          <span>What did you do for the group?</span>
        </h3>
        <span className="text-[11px] text-[var(--mu)] bg-[var(--sf)] px-2 py-0.5 rounded-full border border-[var(--bd)]">
          ⭐ 1 base point
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <textarea
            rows={3}
            placeholder="e.g. Conducted 10 user interviews, drafted research methodology section, fixed navigation bug..."
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              if (error) setError(null);
            }}
            className="w-full p-3.5 rounded-control border border-[var(--bd)] bg-[var(--bg)] text-[var(--tx)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ac)] transition-all resize-none leading-relaxed"
          />
        </div>

        {error && (
          <div className="flex items-center gap-1.5 text-xs text-[var(--no)] px-1">
            <AlertCircle className="w-3.5 h-3.5 flex-none" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex items-center justify-between pt-1">
          <div className="text-[11px] tnum text-[var(--mu)]">
            <span
              className={
                isTooShort ? 'text-amber-500 font-medium' : isTooLong ? 'text-[var(--no)] font-bold' : ''
              }
            >
              {charCount}
            </span>
            <span className="text-[var(--mu)]">/280 characters</span>
            {isTooShort && <span className="ml-2 text-amber-500">(min 8)</span>}
          </div>

          <button
            type="submit"
            disabled={submitting || charCount === 0 || isTooLong}
            className="py-2 px-4 rounded-control bg-[var(--ac)] text-[var(--act)] font-semibold text-xs flex items-center gap-1.5 hover:opacity-95 transition-opacity disabled:opacity-50 shadow-sm"
          >
            {submitting ? (
              <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Record Task</span>
                <Send className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
