import React, { useState } from 'react';
import {
  Users,
  Share2,
  ChevronRight,
  Plus,
  Play,
  ArrowLeft,
  Check,
  AlertTriangle,
  UserX,
  Edit2,
  Sliders,
} from 'lucide-react';
import type { Team } from '../types';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useShareCode } from '../hooks/useShareCode';

interface MyTeamsPageProps {
  teams: Team[];
  activeTeamId: string | null;
  currentUserId: string;
  onSelectTeam: (team: Team) => void;
  onOpenAddTeam: () => void;
  onReplayWalkthrough: () => void;
  onTeamModified: () => void;
}

export const MyTeamsPage: React.FC<MyTeamsPageProps> = ({
  teams,
  activeTeamId,
  currentUserId,
  onSelectTeam,
  onOpenAddTeam,
  onReplayWalkthrough,
  onTeamModified,
}) => {
  const { showToast } = useToast();
  const { shareTeamCode } = useShareCode();

  // Selected team for details view
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

  // Edit team states
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState('');
  const [savingSettings, setSavingSettings] = useState(false);
  const [leavingConfirm, setLeavingConfirm] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const openDetails = (team: Team) => {
    setSelectedTeam(team);
    setEditName(team.name);
    setIsEditingName(false);
    setLeavingConfirm(false);
  };

  const closeDetails = () => {
    setSelectedTeam(null);
    setLeavingConfirm(false);
  };

  const handleRename = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeam) return;
    const trimmed = editName.trim();
    if (trimmed.length < 3) {
      showToast('Team name needs 3+ characters.');
      return;
    }

    setSavingSettings(true);
    try {
      const res = await api.updateTeam(selectedTeam.id, { name: trimmed });
      setSelectedTeam(res.team);
      setIsEditingName(false);
      showToast('Team renamed successfully.');
      onTeamModified();
    } catch (err: any) {
      showToast(err.message || 'Failed to rename team.');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleToggleWeight = async () => {
    if (!selectedTeam) return;
    const newWeight = !selectedTeam.weightByPosts;
    setSavingSettings(true);
    try {
      const res = await api.updateTeam(selectedTeam.id, { weightByPosts: newWeight });
      setSelectedTeam(res.team);
      showToast(
        newWeight
          ? 'Volume-weighted scoring activated.'
          : 'Quality-based scoring activated.'
      );
      onTeamModified();
    } catch (err: any) {
      showToast(err.message || 'Failed to update scoring setting.');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleRemoveMember = async (userId: string, displayName: string) => {
    if (!selectedTeam) return;
    if (!window.confirm(`Are you sure you want to remove ${displayName} from the team?`)) return;

    try {
      await api.removeMember(selectedTeam.id, userId);
      showToast(`${displayName} removed from team.`);
      // Refresh team details
      const updated = await api.getTeam(selectedTeam.id);
      setSelectedTeam(updated.team);
      onTeamModified();
    } catch (err: any) {
      showToast(err.message || 'Failed to remove member.');
    }
  };

  const handleLeaveTeam = async () => {
    if (!selectedTeam) return;
    setLeaving(true);
    try {
      await api.leaveTeam(selectedTeam.id);
      showToast(`Left team ${selectedTeam.name}.`);
      closeDetails();
      onTeamModified();
    } catch (err: any) {
      showToast(err.message || 'Failed to leave team.');
    } finally {
      setLeaving(false);
    }
  };

  // Determine role of current user in selected team
  const currentUserMembership = selectedTeam?.memberships?.find((m) => m.userId === currentUserId);
  const isAdmin = currentUserMembership?.role === 'ADMIN';

  // ================= VIEW 2: TEAM DETAILS VIEW =================
  if (selectedTeam) {
    return (
      <div className="w-full max-w-4xl mx-auto space-y-6">
        {/* Back navigation */}
        <button
          onClick={closeDetails}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--mu)] hover:text-[var(--tx)] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Teams</span>
        </button>

        {/* Team Header & Rename */}
        <div className="rounded-card border border-[var(--bd)] bg-[var(--card)] p-6 shadow-card space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              {isEditingName ? (
                <form onSubmit={handleRename} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-control border border-[var(--bd)] bg-[var(--bg)] text-[var(--tx)] text-base font-bold focus:outline-none focus:ring-2 focus:ring-[var(--ac)]"
                  />
                  <button
                    type="submit"
                    disabled={savingSettings}
                    className="p-2 rounded-control bg-[var(--ac)] text-[var(--act)] hover:opacity-90"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingName(false)}
                    className="p-2 rounded-control bg-[var(--sf)] text-[var(--mu)] hover:text-[var(--tx)]"
                  >
                    ✕
                  </button>
                </form>
              ) : (
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[var(--tx)]">
                    {selectedTeam.name}
                  </h2>
                  {isAdmin && (
                    <button
                      onClick={() => setIsEditingName(true)}
                      className="p-1.5 rounded-control text-[var(--mu)] hover:text-[var(--tx)] hover:bg-[var(--sf)] transition-colors"
                      title="Rename team"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}
              <span className="text-xs text-[var(--mu)]">
                Created {new Date(selectedTeam.createdAt).toLocaleDateString()}
              </span>
            </div>

            <button
              onClick={() => onSelectTeam(selectedTeam)}
              className="px-4 py-2 rounded-control bg-[var(--ac)] text-[var(--act)] font-semibold text-xs hover:opacity-95 transition-opacity shadow-sm flex-none"
            >
              Open Team Home
            </button>
          </div>

          {/* Join Code Box */}
          <div className="p-4 rounded-control bg-[var(--sf)] border border-[var(--bd)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-semibold text-[var(--mu)] uppercase tracking-wider block">
                Team Join Code
              </span>
              <span className="text-2xl font-extrabold font-mono tracking-widest text-[var(--ac)]">
                {selectedTeam.joinCode}
              </span>
            </div>

            <button
              onClick={() => shareTeamCode(selectedTeam.name, selectedTeam.joinCode)}
              className="px-4 py-2 rounded-control bg-[var(--card)] hover:bg-[var(--bd)] transition-colors border border-[var(--bd)] text-xs font-semibold text-[var(--tx)] flex items-center justify-center gap-2 shadow-sm"
            >
              <Share2 className="w-3.5 h-3.5 text-[var(--ac)]" />
              <span>Share Code</span>
            </button>
          </div>
        </div>

        {/* Scoring Mode Setting (Admin Only) */}
        <div className="rounded-card border border-[var(--bd)] bg-[var(--card)] p-6 shadow-card space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[var(--ac)]" />
                <h3 className="text-sm font-bold text-[var(--tx)]">Weight by Number of Posts</h3>
              </div>
              <p className="text-xs text-[var(--mu)] leading-relaxed max-w-md">
                When enabled, volume of work counts toward the share of work chart (score equals total accepted upvotes). When off (default), scoring measures average helpfulness per contribution.
              </p>
            </div>

            {isAdmin ? (
              <button
                type="button"
                role="switch"
                aria-checked={selectedTeam.weightByPosts}
                disabled={savingSettings}
                onClick={handleToggleWeight}
                className={`w-12 h-6 rounded-full transition-colors relative flex items-center p-1 flex-none ${
                  selectedTeam.weightByPosts ? 'bg-[var(--ac)]' : 'bg-[var(--bd)]'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
                    selectedTeam.weightByPosts ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            ) : (
              <span className="text-xs font-semibold px-2 py-1 rounded bg-[var(--sf)] text-[var(--mu)]">
                {selectedTeam.weightByPosts ? 'Enabled' : 'Disabled (Admin only)'}
              </span>
            )}
          </div>
        </div>

        {/* Member Roster */}
        <div className="rounded-card border border-[var(--bd)] bg-[var(--card)] p-6 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[var(--tx)] flex items-center gap-2">
              <Users className="w-4 h-4 text-[var(--ac)]" />
              <span>Team Members ({selectedTeam.memberships?.length || 0})</span>
            </h3>
            <span className="text-[11px] text-[var(--mu)]">Invite using code {selectedTeam.joinCode}</span>
          </div>

          <div className="divide-y divide-[var(--bd)]">
            {selectedTeam.memberships?.map((m) => (
              <div key={m.id} className="py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[var(--sf)] border border-[var(--bd)] text-[var(--tx)] font-bold text-xs flex items-center justify-center">
                    {m.user?.displayName ? m.user.displayName[0].toUpperCase() : 'U'}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-[var(--tx)]">
                        {m.user?.displayName}
                      </span>
                      {m.userId === currentUserId && (
                        <span className="text-[10px] text-[var(--ac)] font-medium">(You)</span>
                      )}
                    </div>
                    <span className="text-[10px] text-[var(--mu)] font-mono">{m.user?.email}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                      m.role === 'ADMIN'
                        ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                        : 'bg-[var(--sf)] text-[var(--mu)] border border-[var(--bd)]'
                    }`}
                  >
                    {m.role}
                  </span>

                  {isAdmin && m.userId !== currentUserId && (
                    <button
                      onClick={() => handleRemoveMember(m.userId, m.user.displayName)}
                      className="p-1 rounded-control text-[var(--mu)] hover:text-[var(--no)] transition-colors"
                      title="Remove member"
                    >
                      <UserX className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Leave Team Section */}
        <div className="rounded-card border border-[var(--bd)] bg-[var(--card)] p-6 shadow-card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-[var(--no)] flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                <span>Leave this team</span>
              </h3>
              <p className="text-xs text-[var(--mu)] mt-0.5">
                You will no longer see this team's posts or review backlog.
              </p>
            </div>

            {leavingConfirm ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setLeavingConfirm(false)}
                  className="px-3 py-1.5 text-xs text-[var(--mu)] hover:text-[var(--tx)] font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={leaving}
                  onClick={handleLeaveTeam}
                  className="px-3 py-1.5 rounded-control bg-[var(--no)] text-white font-semibold text-xs hover:opacity-90 transition-opacity"
                >
                  {leaving ? 'Leaving...' : 'Yes, Leave Team'}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setLeavingConfirm(true)}
                className="px-3.5 py-1.5 rounded-control border border-red-500/30 text-[var(--no)] hover:bg-red-500/10 font-semibold text-xs transition-colors"
              >
                Leave Team
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ================= VIEW 1: TEAMS LIST VIEW =================
  // "By default ONLY the list of teams (avatar, name, member count, post count, 'to review' count, 'Active' tag)."
  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[var(--tx)]">
          My Teams
        </h2>
        <p className="text-xs text-[var(--mu)] mt-0.5">
          Tap any project to manage members, share codes, or switch workspaces.
        </p>
      </div>

      {/* Teams List */}
      <div className="space-y-3">
        {teams.length === 0 ? (
          <div className="w-full rounded-card border border-[var(--bd)] bg-[var(--card)] p-8 text-center shadow-card flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-[var(--sf)] text-[var(--mu)] flex items-center justify-center mb-3">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-[var(--tx)] mb-1">No teams joined yet</h3>
            <p className="text-xs text-[var(--mu)] max-w-sm mb-4">
              Create a team for your group or enter a join code from a teammate.
            </p>
            <button
              onClick={onOpenAddTeam}
              className="px-4 py-2 rounded-control bg-[var(--ac)] text-[var(--act)] font-semibold text-xs shadow-sm"
            >
              Create or Join Team
            </button>
          </div>
        ) : (
          teams.map((t) => {
            const isActive = t.id === activeTeamId;
            return (
              <div
                key={t.id}
                onClick={() => openDetails(t)}
                className="w-full p-4 rounded-card border border-[var(--bd)] bg-[var(--card)] hover:border-[var(--ac)] cursor-pointer shadow-card transition-all flex items-center justify-between gap-3 group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 font-bold text-base flex items-center justify-center flex-none border border-indigo-500/20">
                    {t.name ? t.name[0].toUpperCase() : 'T'}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[var(--tx)] group-hover:text-[var(--ac)] transition-colors">
                        {t.name}
                      </span>
                      {isActive && (
                        <span className="text-[10px] px-2 py-0.2 rounded-full bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
                          Active
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-[var(--mu)] mt-0.5">
                      <span>{t._count?.memberships ?? 1} members</span>
                      <span>·</span>
                      <span>{t._count?.posts ?? 0} posts</span>
                      {(t.unreadReviewCount ?? 0) > 0 && (
                        <>
                          <span>·</span>
                          <span className="text-[var(--no)] font-bold">
                            {t.unreadReviewCount} to review
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[var(--mu)] group-hover:text-[var(--tx)]">
                  <span className="text-xs font-mono tracking-wider">{t.joinCode}</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Action Buttons Below List */}
      <div className="pt-2 space-y-2.5">
        <button
          onClick={onOpenAddTeam}
          className="w-full py-3 px-4 rounded-card border border-dashed border-[var(--bd)] hover:border-[var(--ac)] bg-[var(--card)] hover:bg-[var(--sf)] transition-colors text-xs font-bold text-[var(--tx)] flex items-center justify-center gap-2 shadow-sm"
        >
          <Plus className="w-4 h-4 text-[var(--ac)]" />
          <span>Create or join a team</span>
        </button>

        <button
          onClick={onReplayWalkthrough}
          className="w-full py-2.5 px-4 rounded-card border border-[var(--bd)] bg-[var(--card)] hover:bg-[var(--sf)] transition-colors text-xs font-semibold text-[var(--mu)] hover:text-[var(--tx)] flex items-center justify-center gap-2 shadow-sm"
        >
          <Play className="w-3.5 h-3.5 text-indigo-400" />
          <span>Replay the introduction</span>
        </button>
      </div>

      {/* Attribution in Footer as required by Section 11 */}
      <footer className="pt-8 text-center text-xs text-[var(--mu)]">
        Credly: fair credit for every contributor. Designed and built by Pratik Panda.
      </footer>
    </div>
  );
};
