import { useCallback, useEffect, useState } from 'react';
import { Bell, Lock, Monitor, Smartphone, Globe, Trash2, User, LogOut } from 'lucide-react';
import { listSessions, revokeSession, revokeOtherSessions } from '../../../services/sessionService';
import type { UserSession } from '../../../types/account';

function getDeviceIcon(deviceInfo?: string) {
  const d = (deviceInfo ?? '').toLowerCase();
  if (d.includes('android') || d.includes('ios') || d.includes('iphone') || d.includes('ipad')) {
    return Smartphone;
  }
  if (d.includes('chrome') || d.includes('firefox') || d.includes('safari') || d.includes('edge')) {
    return Globe;
  }
  return Monitor;
}

function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function SettingsTab() {
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [sessionReminders, setSessionReminders] = useState(false);
  const [saved, setSaved] = useState(false);

  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [sessionsError, setSessionsError] = useState<string | null>(null);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [revokingAll, setRevokingAll] = useState(false);

  const loadSessions = useCallback(async () => {
    setSessionsLoading(true);
    setSessionsError(null);
    try {
      const data = await listSessions();
      setSessions(data);
    } catch {
      setSessionsError('Could not load sessions.');
    } finally {
      setSessionsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSessions();
  }, [loadSessions]);

  const handleRevoke = useCallback(async (id: string) => {
    setRevokingId(id);
    try {
      await revokeSession(id);
      setSessions((prev) => prev.filter((s) => s.id !== id));
    } catch {
      setSessionsError('Failed to revoke session. Please try again.');
    } finally {
      setRevokingId(null);
    }
  }, []);

  const handleRevokeOthers = useCallback(async () => {
    setRevokingAll(true);
    try {
      await revokeOtherSessions();
      await loadSessions();
    } catch {
      setSessionsError('Failed to revoke sessions. Please try again.');
    } finally {
      setRevokingAll(false);
    }
  }, [loadSessions]);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="account-tab">
      <h2 className="account-tab__heading">Settings</h2>

      {/* Notifications */}
      <div className="account-tab__settings-section">
        <div className="account-tab__settings-section-header">
          <Bell size={16} aria-hidden />
          <span>Notifications</span>
        </div>
        <div className="account-tab__settings-row">
          <div>
            <p className="account-tab__settings-label">Email notifications</p>
            <p className="account-tab__settings-desc">Receive updates about your account and interviews</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={emailNotifs}
            className={`account-tab__toggle ${emailNotifs ? 'account-tab__toggle--on' : ''}`}
            onClick={() => setEmailNotifs((v) => !v)}
          >
            <span className="account-tab__toggle-thumb" />
          </button>
        </div>
        <div className="account-tab__settings-row">
          <div>
            <p className="account-tab__settings-label">Session reminders</p>
            <p className="account-tab__settings-desc">Get reminded before scheduled interview sessions</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={sessionReminders}
            className={`account-tab__toggle ${sessionReminders ? 'account-tab__toggle--on' : ''}`}
            onClick={() => setSessionReminders((v) => !v)}
          >
            <span className="account-tab__toggle-thumb" />
          </button>
        </div>
      </div>

      {/* Profile */}
      <div className="account-tab__settings-section">
        <div className="account-tab__settings-section-header">
          <User size={16} aria-hidden />
          <span>Profile</span>
        </div>
        <div className="account-tab__settings-row account-tab__settings-row--col">
          <label htmlFor="display-name" className="account-tab__settings-label">Display name</label>
          <input
            id="display-name"
            type="text"
            placeholder="Your display name"
            className="account-tab__settings-input"
            disabled
          />
          <p className="account-tab__settings-desc">Name changes are managed via your auth provider.</p>
        </div>
      </div>

      {/* Security */}
      <div className="account-tab__settings-section">
        <div className="account-tab__settings-section-header">
          <Lock size={16} aria-hidden />
          <span>Security</span>
        </div>
        <div className="account-tab__settings-row">
          <div>
            <p className="account-tab__settings-label">Two-factor authentication</p>
            <p className="account-tab__settings-desc">Coming soon — additional account security</p>
          </div>
          <span className="account-tab__badge account-tab__badge--soon">Soon</span>
        </div>
      </div>

      {/* Active Sessions */}
      <div className="account-tab__settings-section">
        <div className="account-tab__settings-section-header">
          <Monitor size={16} aria-hidden />
          <span>Active Sessions</span>
        </div>

        <p className="account-tab__settings-desc" style={{ marginBottom: '1rem' }}>
          These are the devices and browsers currently logged into your account.
        </p>

        {sessionsError && (
          <p className="account-sessions__error">{sessionsError}</p>
        )}

        {sessionsLoading ? (
          <div className="account-sessions__list">
            {[1, 2].map((i) => (
              <div key={i} className="account-sessions__skeleton" />
            ))}
          </div>
        ) : sessions.length === 0 ? (
          <p className="account-tab__settings-desc">No active sessions found.</p>
        ) : (
          <div className="account-sessions__list">
            {sessions.map((session, idx) => {
              const DeviceIcon = getDeviceIcon(session.deviceInfo);
              const isFirst = idx === 0;
              return (
                <div key={session.id} className={`account-sessions__card ${isFirst ? 'account-sessions__card--current' : ''}`}>
                  <div className="account-sessions__card-icon">
                    <DeviceIcon size={20} aria-hidden />
                  </div>
                  <div className="account-sessions__card-info">
                    <div className="account-sessions__card-device">
                      {session.deviceInfo ?? 'Unknown device'}
                      {isFirst && (
                        <span className="account-sessions__current-badge">Current</span>
                      )}
                    </div>
                    <div className="account-sessions__card-meta">
                      {session.ipAddress && (
                        <span className="account-sessions__card-ip">{session.ipAddress}</span>
                      )}
                      <span className="account-sessions__card-time">
                        Last active {formatRelativeTime(session.lastUsedAt)}
                      </span>
                      <span className="account-sessions__card-time">
                        Signed in {formatRelativeTime(session.createdAt)}
                      </span>
                    </div>
                  </div>
                  {!isFirst && (
                    <button
                      type="button"
                      className="account-sessions__revoke-btn"
                      onClick={() => void handleRevoke(session.id)}
                      disabled={revokingId === session.id}
                      aria-label={`Revoke session on ${session.deviceInfo ?? 'unknown device'}`}
                    >
                      {revokingId === session.id ? (
                        <span className="account-sessions__spinner" />
                      ) : (
                        <Trash2 size={14} aria-hidden />
                      )}
                      <span>Revoke</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {sessions.length > 1 && (
          <button
            type="button"
            className="account-sessions__revoke-all-btn"
            onClick={() => void handleRevokeOthers()}
            disabled={revokingAll}
          >
            <LogOut size={14} aria-hidden />
            {revokingAll ? 'Revoking…' : 'Sign out of all other sessions'}
          </button>
        )}
      </div>

      <div className="account-tab__settings-footer">
        <button type="button" className="account-tab__btn-primary" onClick={handleSave}>
          {saved ? '✓ Saved' : 'Save preferences'}
        </button>
      </div>
    </div>
  );
}
