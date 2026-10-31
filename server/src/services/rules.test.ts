import { describe, it, expect } from 'vitest';
import { z } from 'zod';

const createPostSchema = z.object({
  text: z
    .string()
    .trim()
    .min(8, 'Add a bit more detail (8+ characters).')
    .max(280, 'Post cannot exceed 280 characters.'),
});

const voteSchema = z.object({
  type: z.enum(['GROUP', 'SELF', 'NO'], {
    errorMap: () => ({ message: 'Vote must be GROUP, SELF, or NO.' }),
  }),
  reason: z.string().trim().optional(),
});

function validateVote(type: 'GROUP' | 'SELF' | 'NO', reason?: string) {
  const result = voteSchema.safeParse({ type, reason });
  if (!result.success) return { valid: false, error: result.error.errors[0].message };
  if (type === 'NO' && (!reason || reason.trim().length < 5)) {
    return { valid: false, error: 'Please explain why (5+ characters).' };
  }
  return { valid: true };
}

function checkDuplicatePost(existingPosts: string[], newText: string): boolean {
  return existingPosts.some(
    (existing) => existing.toLowerCase().trim() === newText.toLowerCase().trim()
  );
}

describe('Business Rules & Validation Test Suite', () => {
  describe('Post Validation', () => {
    it('accepts posts between 8 and 280 characters', () => {
      const valid = createPostSchema.safeParse({
        text: 'Conducted 10 user interviews today',
      });
      expect(valid.success).toBe(true);
    });

    it('rejects posts with fewer than 8 characters', () => {
      const result = createPostSchema.safeParse({ text: 'Done' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Add a bit more detail (8+ characters).');
      }
    });

    it('trims whitespace and validates length accurately', () => {
      const result = createPostSchema.safeParse({ text: '    abc    ' });
      expect(result.success).toBe(false);
    });

    it('rejects duplicate posts for the same user (case-insensitive)', () => {
      const existing = ['Wrote the introduction and problem statement'];
      const duplicateAttempt = 'wrote the introduction and problem statement';
      const distinctAttempt = 'Wrote the methodology section';

      expect(checkDuplicatePost(existing, duplicateAttempt)).toBe(true);
      expect(checkDuplicatePost(existing, distinctAttempt)).toBe(false);
    });
  });

  describe('Voting Rules', () => {
    it('allows GROUP and SELF votes without reason', () => {
      expect(validateVote('GROUP').valid).toBe(true);
      expect(validateVote('SELF').valid).toBe(true);
    });

    it('rejects NO votes when reason is missing or less than 5 characters', () => {
      const emptyReason = validateVote('NO');
      expect(emptyReason.valid).toBe(false);
      expect(emptyReason.error).toBe('Please explain why (5+ characters).');

      const shortReason = validateVote('NO', 'bad');
      expect(shortReason.valid).toBe(false);
      expect(shortReason.error).toBe('Please explain why (5+ characters).');
    });

    it('accepts NO vote when reason is at least 5 characters', () => {
      const validNo = validateVote('NO', 'No references provided in the draft');
      expect(validNo.valid).toBe(true);
    });
  });
});
