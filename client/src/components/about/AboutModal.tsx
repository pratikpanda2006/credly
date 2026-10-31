import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, HelpCircle, Heart, ExternalLink } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-lg rounded-card border border-[var(--bd)] bg-[var(--card)] p-6 sm:p-8 shadow-card relative max-h-[90vh] overflow-y-auto"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full text-[var(--mu)] hover:text-[var(--tx)] hover:bg-[var(--sf)] transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-6">
            <img src="/logo.png" alt="Credly" className="h-10 w-auto rounded-lg shadow-sm" />
            <div>
              <h3 className="text-xl font-bold tracking-tight text-[var(--tx)]">About Credly</h3>
              <span className="text-xs text-[var(--mu)] font-mono">Version 1.0.0 (Production Build)</span>
            </div>
          </div>

          <div className="space-y-4 text-xs text-[var(--tx)] leading-relaxed">
            <div className="p-4 rounded-control bg-[var(--sf)] border border-[var(--bd)]">
              <h4 className="font-semibold text-sm mb-1.5 text-[var(--ac)] flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4" />
                How Share of Work is Calculated
              </h4>
              <p className="text-[var(--mu)] mb-2">
                Credly ensures mathematical fairness for student and project teams through two configurable scoring modes:
              </p>
              <ul className="space-y-2 list-disc list-inside text-[var(--tx)]">
                <li>
                  <strong className="text-[var(--tx)]">Mode 1: Quality-based scoring (Default):</strong>{' '}
                  Measures average helpfulness per contribution. For each member:{' '}
                  <span className="font-mono text-[var(--ac)]">ratio = total upvotes / total posts</span>.
                  Your share slice is your ratio divided by the sum of all members' ratios.
                </li>
                <li>
                  <strong className="text-[var(--tx)]">Mode 2: Volume-weighted scoring:</strong>{' '}
                  When enabled in Team Settings, volume of accepted work counts. Member score = total upvotes received.
                </li>
                <li>
                  <strong className="text-[var(--tx)]">Zero-upvote safeguard:</strong>{' '}
                  If no upvotes have been received yet, Credly displays an honest "No chart yet" empty state rather than a misleading equal split.
                </li>
              </ul>
            </div>

            <div className="p-4 rounded-control border border-[var(--bd)] bg-[var(--card)]">
              <h4 className="font-semibold text-sm mb-1 text-[var(--tx)]">Voting & Integrity Rules</h4>
              <p className="text-[var(--mu)]">
                Teammates answer "Was this helpful?" with <strong>For the group</strong> (+1),{' '}
                <strong>For me</strong> (+1), or <strong>No</strong> (requires a written reason of at least 5 characters).
                Self-voting is strictly forbidden.
              </p>
            </div>

            <div className="pt-2 text-center">
              <p className="font-medium text-sm text-[var(--tx)] mb-1">
                Credly: fair credit for every contributor.
              </p>
              <p className="text-[var(--mu)] flex items-center justify-center gap-1.5">
                <span>Designed and built by Pratik Panda.</span>
                <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" />
              </p>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-[var(--bd)]">
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="text-[var(--ac)] hover:underline inline-flex items-center gap-1 font-semibold"
              >
                <span>Share Feedback</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-control bg-[var(--ac)] text-[var(--act)] font-semibold text-xs hover:opacity-95 transition-opacity"
              >
                Close
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
