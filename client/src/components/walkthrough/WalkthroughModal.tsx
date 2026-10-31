import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Edit3, CheckCircle, PieChart, ArrowRight, X } from 'lucide-react';

interface WalkthroughModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const STEPS = [
  {
    icon: Sparkles,
    badge: 'Welcome to Credly 👋',
    title: 'Fair credit for every contributor',
    description:
      'Group projects go wrong when nobody can prove who did what. Credly keeps an honest, transparent, shared record where everyone gets the credit they deserve.',
  },
  {
    icon: Edit3,
    badge: 'Step 1 of 3',
    title: 'Post what you do',
    description:
      'Record even small contributions in My Work — like "Collected 20 survey replies", "Designed the slide template", or "Read reference papers".',
  },
  {
    icon: CheckCircle,
    badge: 'Step 2 of 3',
    title: 'Teammates review it',
    description:
      'In Contributions, your team marks your work as "For the group", "For me", or "No" (a written reason is required for No votes to ensure fair accountability).',
  },
  {
    icon: PieChart,
    badge: 'Step 3 of 3',
    title: 'See the fair share',
    description:
      'Home transforms reviews into a mathematical share-of-work donut chart, while Analytics shows every stat, breakdown, and historical trend.',
  },
];

export const WalkthroughModal: React.FC<WalkthroughModalProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = React.useState(0);

  if (!isOpen) return null;

  const step = STEPS[currentStep];
  const Icon = step.icon;
  const isLast = currentStep === STEPS.length - 1;

  const handleNext = () => {
    if (isLast) {
      onClose();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-md rounded-card border border-[var(--bd)] bg-[var(--card)] p-6 sm:p-8 shadow-card relative overflow-hidden"
        >
          {/* Close / Skip button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full text-[var(--mu)] hover:text-[var(--tx)] hover:bg-[var(--sf)] transition-colors"
            aria-label="Close walkthrough"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Icon Badge */}
          <div className="w-12 h-12 rounded-xl bg-[var(--sf)] text-[var(--ac)] flex items-center justify-center mb-5 shadow-sm">
            <Icon className="w-6 h-6" />
          </div>

          <span className="text-xs font-semibold text-[var(--ac)] uppercase tracking-wider block mb-1">
            {step.badge}
          </span>
          <h3 className="text-xl font-bold tracking-tight text-[var(--tx)] mb-3">
            {step.title}
          </h3>
          <p className="text-sm text-[var(--mu)] leading-relaxed mb-6">
            {step.description}
          </p>

          {/* Stepper Dots */}
          <div className="flex items-center justify-between pt-4 border-t border-[var(--bd)]">
            <div className="flex items-center gap-1.5">
              {STEPS.map((_, i) => (
                <div
                  key={i}
                  className={`h-2 rounded-full transition-all duration-200 ${
                    i === currentStep
                      ? 'w-6 bg-[var(--ac)]'
                      : 'w-2 bg-[var(--bd)]'
                  }`}
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-2 text-xs font-semibold text-[var(--mu)] hover:text-[var(--tx)] transition-colors"
              >
                Skip
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="py-2 px-4 rounded-control bg-[var(--ac)] text-[var(--act)] font-semibold text-xs flex items-center gap-1.5 hover:opacity-95 transition-opacity shadow-sm"
              >
                <span>{isLast ? 'Get Started' : 'Next'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
