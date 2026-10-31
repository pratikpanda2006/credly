import React, { useState } from 'react';
import { PlusCircle, KeyRound, Sparkles, ArrowRight, ShieldAlert } from 'lucide-react';
import { api } from '../services/api';
import type { Team } from '../types';

interface AddTeamPageProps {
  onTeamSelected: (team: Team) => void;
  onCancel?: () => void;
  hasExistingTeams?: boolean;
}

export const AddTeamPage: React.FC<AddTeamPageProps> = ({
  onTeamSelected,
  onCancel,
  hasExistingTeams = false,
}) => {
  const [teamName, setTeamName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submittingAction, setSubmittingAction] = useState<string | null>(null);

  // Check if user has previously used the demo
  const [hasUsedDemo, setHasUsedDemo] = useState<boolean>(() => {
    return localStorage.getItem('credly_has_used_demo') === 'true';
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const trimmed = teamName.trim();
    if (trimmed.length < 3) {
      setError('Give your team a name (3+ characters).');
      return;
    }

    setSubmittingAction('create');
    try {
      const res = await api.createTeam(trimmed);
      onTeamSelected(res.team);
    } catch (err: any) {
      setError(err.message || 'Failed to create team.');
    } finally {
      setSubmittingAction(null);
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const trimmed = joinCode.trim().toUpperCase();
    if (trimmed.length !== 6) {
      setError('Team codes have 6 characters.');
      return;
    }

    setSubmittingAction('join');
    try {
      const res = await api.joinTeam(trimmed);
      onTeamSelected(res.team);
    } catch (err: any) {
      setError(err.message || 'No team found with this code. Please check it with your team admin.');
    } finally {
      setSubmittingAction(null);
    }
  };

  const handleDemo = async () => {
    setError(null);
    setSubmittingAction('demo');
    try {
      const res = await api.createDemoTeam();
      localStorage.setItem('credly_has_used_demo', 'true');
      setHasUsedDemo(true);
      onTeamSelected(res.team);
    } catch (err: any) {
      setError(err.message || 'Failed to initialize sample demo.');
    } finally {
      setSubmittingAction(null);
    }
  };

  // Card definitions
  const createCard = (
    <div
      key="create"
      className="flex-1 flex flex-col justify-between p-6 rounded-card border border-[var(--bd)] bg-[var(--card)] shadow-card"
    >
      <div>
        <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-4">
          <PlusCircle className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold tracking-tight text-[var(--tx)] mb-2">Create a team</h3>
        <p className="text-xs text-[var(--mu)] leading-relaxed mb-6">
          Start a new project workspace. You will become the Admin and receive a shareable 6-character code.
        </p>
      </div>

      <form onSubmit={handleCreate} className="space-y-4">
        <div>
          <label className="block text-[11px] font-semibold text-[var(--mu)] uppercase tracking-wider mb-1">
            Team Name
          </label>
          <input
            type="text"
            placeholder="e.g. HCI Capstone Project"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            className="w-full px-3 py-2.5 rounded-control border border-[var(--bd)] bg-[var(--bg)] text-[var(--tx)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ac)] transition-all"
          />
        </div>
        <button
          type="submit"
          disabled={submittingAction === 'create'}
          className="w-full py-2.5 px-4 rounded-control bg-[var(--ac)] text-[var(--act)] font-semibold text-xs flex items-center justify-center gap-1.5 hover:opacity-95 transition-opacity disabled:opacity-50 shadow-sm"
        >
          {submittingAction === 'create' ? (
            <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <span>Create Team</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </form>
    </div>
  );

  const joinCard = (
    <div
      key="join"
      className="flex-1 flex flex-col justify-between p-6 rounded-card border border-[var(--bd)] bg-[var(--card)] shadow-card"
    >
      <div>
        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
          <KeyRound className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold tracking-tight text-[var(--tx)] mb-2">Join a team</h3>
        <p className="text-xs text-[var(--mu)] leading-relaxed mb-6">
          Got invited by a teammate? Enter the 6-character join code they shared with you.
        </p>
      </div>

      <form onSubmit={handleJoin} className="space-y-4">
        <div>
          <label className="block text-[11px] font-semibold text-[var(--mu)] uppercase tracking-wider mb-1">
            6-Character Code
          </label>
          <input
            type="text"
            maxLength={6}
            placeholder="e.g. J8M9X2"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            className="w-full px-3 py-2.5 rounded-control border border-[var(--bd)] bg-[var(--bg)] text-[var(--tx)] text-sm font-mono tracking-widest uppercase text-center focus:outline-none focus:ring-2 focus:ring-[var(--ac)] transition-all"
          />
        </div>
        <button
          type="submit"
          disabled={submittingAction === 'join'}
          className="w-full py-2.5 px-4 rounded-control bg-[var(--sf)] border border-[var(--bd)] text-[var(--tx)] font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-[var(--bd)] transition-colors disabled:opacity-50 shadow-sm"
        >
          {submittingAction === 'join' ? (
            <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <span>Join Team</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </form>
    </div>
  );

  const demoCard = (
    <div
      key="demo"
      className="flex-1 flex flex-col justify-between p-6 rounded-card border border-[var(--bd)] bg-[var(--card)] shadow-card relative overflow-hidden"
    >
      <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-semibold uppercase tracking-wider">
        Sample Data
      </div>

      <div>
        <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-4">
          <Sparkles className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold tracking-tight text-[var(--tx)] mb-2">Try the demo</h3>
        <p className="text-xs text-[var(--mu)] leading-relaxed mb-6">
          Explore a realistic sample group project with simulated teammates (Riya, Kabir, Meera), sample contributions, and live votes. Opt-in only.
        </p>
      </div>

      <div>
        <button
          type="button"
          onClick={handleDemo}
          disabled={submittingAction === 'demo'}
          className="w-full py-2.5 px-4 rounded-control bg-purple-600/15 border border-purple-500/30 text-purple-300 font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-purple-600/25 transition-colors disabled:opacity-50 shadow-sm"
        >
          {submittingAction === 'demo' ? (
            <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <span>Load Sample Demo Team</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </div>
    </div>
  );

  // Ordering rule:
  // "The demo card appears FIRST for a brand-new user and moves to LAST once the user has used the demo."
  const cards = hasUsedDemo ? [createCard, joinCard, demoCard] : [demoCard, createCard, joinCard];

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--tx)] p-4 sm:p-6 lg:p-8 flex flex-col items-center justify-center">
      <div className="w-full max-w-5xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--sf)] border border-[var(--bd)] text-[var(--ac)] text-xs font-semibold mb-3">
              Get Started
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">Add a team</h1>
            <p className="text-sm text-[var(--mu)] mt-1">
              Choose how you'd like to get started with Credly.
            </p>
          </div>

          {hasExistingTeams && onCancel && (
            <button
              onClick={onCancel}
              className="self-start sm:self-center px-4 py-2 text-xs font-semibold rounded-control border border-[var(--bd)] hover:bg-[var(--sf)] transition-colors text-[var(--mu)] hover:text-[var(--tx)]"
            >
              Cancel & Return
            </button>
          )}
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-card bg-red-500/10 border border-red-500/20 text-[var(--no)] text-sm flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 flex-none" />
            <span>{error}</span>
          </div>
        )}

        {/* 3 Equal Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">{cards}</div>
      </div>
    </div>
  );
};
