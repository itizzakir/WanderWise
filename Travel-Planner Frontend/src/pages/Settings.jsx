import React, { useCallback, useEffect, useMemo, useState } from 'react';
import SettingsSidebar from '../components/settings/SettingsSidebar';
import TravelerHeader from '../components/dashboard/traveler/TravelerHeader';
import TabButton from '../components/settings/TabButton';
import { useAuth } from '../lib/useAuth';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080').replace(/\/$/, '');

const LANGUAGE_OPTIONS = ['English', 'Hindi', 'Spanish', 'French'];
const CURRENCY_OPTIONS = ['INR', 'USD', 'EUR', 'GBP'];
const TIME_FORMAT_OPTIONS = [
  { value: '12_HOUR', label: '12-Hour' },
  { value: '24_HOUR', label: '24-Hour' },
];
const TIME_ZONE_OPTIONS = ['Asia/Kolkata', 'UTC', 'America/New_York', 'Europe/London'];

const initialSettingsState = {
  name: '',
  email: '',
  mobileNumber: '',
  avatar: '',
  preferredLanguage: 'English',
  preferredCurrency: 'INR',
  timeFormat: '12_HOUR',
  timeZone: 'Asia/Kolkata',
  emailNotificationsEnabled: true,
  smsNotificationsEnabled: true,
};

const parseJsonSafe = async (response) => {
  try {
    return await response.json();
  } catch {
    return null;
  }
};

const normalizeTimeFormat = (value) => {
  if (!value) {
    return '12_HOUR';
  }

  return String(value).toUpperCase().replace('-', '_').replace(' ', '_');
};

const mapSettingsPayload = (payload) => ({
  name: payload?.name || '',
  email: payload?.email || '',
  mobileNumber: payload?.mobileNumber || '',
  avatar: payload?.avatar || '',
  preferredLanguage: payload?.preferredLanguage || 'English',
  preferredCurrency: payload?.preferredCurrency || 'INR',
  timeFormat: normalizeTimeFormat(payload?.timeFormat),
  timeZone: payload?.timeZone || 'Asia/Kolkata',
  emailNotificationsEnabled:
    typeof payload?.emailNotificationsEnabled === 'boolean'
      ? payload.emailNotificationsEnabled
      : true,
  smsNotificationsEnabled:
    typeof payload?.smsNotificationsEnabled === 'boolean'
      ? payload.smsNotificationsEnabled
      : true,
});

const toTimeFormatLabel = (timeFormat) =>
  TIME_FORMAT_OPTIONS.find((entry) => entry.value === normalizeTimeFormat(timeFormat))?.label || '12-Hour';

export default function SettingsPage() {
  const { token, updateUserProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('Account');
  const [settings, setSettings] = useState(initialSettingsState);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [accountMessage, setAccountMessage] = useState('');
  const [preferencesMessage, setPreferencesMessage] = useState('');
  const [notificationsMessage, setNotificationsMessage] = useState('');
  const [accountError, setAccountError] = useState('');
  const [preferencesError, setPreferencesError] = useState('');
  const [notificationsError, setNotificationsError] = useState('');
  const [isSavingAccount, setIsSavingAccount] = useState(false);
  const [isSavingPreferences, setIsSavingPreferences] = useState(false);
  const [isSavingNotifications, setIsSavingNotifications] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const handleToggleMobileSidebar = useCallback(() => {
    setIsMobileSidebarOpen((current) => !current);
  }, []);

  const handleCloseMobileSidebar = useCallback(() => {
    setIsMobileSidebarOpen(false);
  }, []);

  const profileImage = useMemo(
    () => settings.avatar || `https://i.pravatar.cc/150?u=${settings.email || 'wanderwise-user'}`,
    [settings.avatar, settings.email]
  );

  useEffect(() => {
    const loadSettings = async () => {
      if (!token) {
        setIsLoading(false);
        setFetchError('You need to log in again to view settings.');
        return;
      }

      setIsLoading(true);
      setFetchError('');

      try {
        const response = await fetch(`${API_BASE_URL}/api/users/me/settings`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const payload = await parseJsonSafe(response);
        if (!response.ok) {
          setFetchError(payload?.message || 'Unable to load settings.');
          return;
        }

        setSettings(mapSettingsPayload(payload));
      } catch {
        setFetchError('Unable to connect to backend server.');
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, [token]);

  const saveProfile = async () => {
    if (!token) {
      setAccountError('Your session has expired. Please log in again.');
      return;
    }

    setAccountError('');
    setAccountMessage('');
    setIsSavingAccount(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/users/me/settings/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: settings.name,
          mobileNumber: settings.mobileNumber,
        }),
      });

      const payload = await parseJsonSafe(response);
      if (!response.ok) {
        setAccountError(payload?.message || 'Unable to update account settings.');
        return;
      }

      const nextSettings = mapSettingsPayload(payload);
      setSettings(nextSettings);
      updateUserProfile({
        name: nextSettings.name,
        phone: nextSettings.mobileNumber,
        mobileNumber: nextSettings.mobileNumber,
        avatar: nextSettings.avatar,
      });
      setAccountMessage('Account settings saved successfully.');
    } catch {
      setAccountError('Unable to connect to backend server.');
    } finally {
      setIsSavingAccount(false);
    }
  };

  const savePreferences = async () => {
    if (!token) {
      setPreferencesError('Your session has expired. Please log in again.');
      return;
    }

    setPreferencesError('');
    setPreferencesMessage('');
    setIsSavingPreferences(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/users/me/settings/preferences`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          preferredLanguage: settings.preferredLanguage,
          preferredCurrency: settings.preferredCurrency,
          timeFormat: settings.timeFormat,
          timeZone: settings.timeZone,
        }),
      });

      const payload = await parseJsonSafe(response);
      if (!response.ok) {
        setPreferencesError(payload?.message || 'Unable to update preferences.');
        return;
      }

      setSettings(mapSettingsPayload(payload));
      setPreferencesMessage('Preferences saved successfully.');
    } catch {
      setPreferencesError('Unable to connect to backend server.');
    } finally {
      setIsSavingPreferences(false);
    }
  };

  const saveNotifications = async () => {
    if (!token) {
      setNotificationsError('Your session has expired. Please log in again.');
      return;
    }

    setNotificationsError('');
    setNotificationsMessage('');
    setIsSavingNotifications(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/users/me/settings/notifications`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          emailNotificationsEnabled: settings.emailNotificationsEnabled,
          smsNotificationsEnabled: settings.smsNotificationsEnabled,
        }),
      });

      const payload = await parseJsonSafe(response);
      if (!response.ok) {
        setNotificationsError(payload?.message || 'Unable to update notifications.');
        return;
      }

      setSettings(mapSettingsPayload(payload));
      setNotificationsMessage('Notification settings saved successfully.');
    } catch {
      setNotificationsError('Unable to connect to backend server.');
    } finally {
      setIsSavingNotifications(false);
    }
  };

  const renderAccountTab = () => (
    <section className="glass-card p-6">
      <h2 className="text-lg font-bold text-gray-800 mb-6">Account Settings</h2>
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-56 flex flex-col items-center text-center gap-3">
          <img
            src={profileImage}
            alt={settings.name || 'User'}
            className="w-28 h-28 rounded-full object-cover border-4 border-blue-50"
          />
          <div>
            <p className="font-semibold text-gray-800">{settings.name || 'Traveler'}</p>
            <p className="text-sm text-gray-500">{settings.email}</p>
          </div>
        </div>

        <div className="flex-1 space-y-5">
          <label className="block">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Full Name</span>
            <input
              type="text"
              value={settings.name}
              onChange={(event) =>
                setSettings((current) => ({ ...current, name: event.target.value }))
              }
              className="mt-2 w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
            />
          </label>

          <label className="block">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Email Address</span>
            <input
              type="email"
              value={settings.email}
              readOnly
              className="mt-2 w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-500 bg-gray-50"
            />
          </label>

          <label className="block">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Phone Number</span>
            <input
              type="text"
              value={settings.mobileNumber}
              onChange={(event) =>
                setSettings((current) => ({ ...current, mobileNumber: event.target.value }))
              }
              className="mt-2 w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
            />
          </label>

          <button
            type="button"
            onClick={saveProfile}
            disabled={isSavingAccount}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-all disabled:opacity-70"
          >
            {isSavingAccount ? 'Saving...' : 'Save Changes'}
          </button>

          {accountError ? (
            <p className="text-sm text-red-600">{accountError}</p>
          ) : null}
          {accountMessage ? (
            <p className="text-sm text-green-600">{accountMessage}</p>
          ) : null}
        </div>
      </div>
    </section>
  );

  const renderPreferencesTab = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <section className="glass-card p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-6">Application Settings</h2>
        <div className="space-y-5">
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Language</span>
            <select
              value={settings.preferredLanguage}
              onChange={(event) =>
                setSettings((current) => ({ ...current, preferredLanguage: event.target.value }))
              }
              className="mt-2 w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
            >
              {LANGUAGE_OPTIONS.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-medium text-gray-700">Currency</span>
            <select
              value={settings.preferredCurrency}
              onChange={(event) =>
                setSettings((current) => ({ ...current, preferredCurrency: event.target.value }))
              }
              className="mt-2 w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
            >
              {CURRENCY_OPTIONS.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-medium text-gray-700">Time Format</span>
            <select
              value={settings.timeFormat}
              onChange={(event) =>
                setSettings((current) => ({ ...current, timeFormat: event.target.value }))
              }
              className="mt-2 w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
            >
              {TIME_FORMAT_OPTIONS.map((entry) => (
                <option key={entry.value} value={entry.value}>
                  {entry.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-medium text-gray-700">Time Zone</span>
            <select
              value={settings.timeZone}
              onChange={(event) =>
                setSettings((current) => ({ ...current, timeZone: event.target.value }))
              }
              className="mt-2 w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
            >
              {TIME_ZONE_OPTIONS.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            onClick={savePreferences}
            disabled={isSavingPreferences}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-all disabled:opacity-70"
          >
            {isSavingPreferences ? 'Saving...' : 'Save Preferences'}
          </button>

          {preferencesError ? (
            <p className="text-sm text-red-600">{preferencesError}</p>
          ) : null}
          {preferencesMessage ? (
            <p className="text-sm text-green-600">{preferencesMessage}</p>
          ) : null}
        </div>
      </section>

      <section className="glass-card p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-6">Regional Preferences</h2>
        <div className="space-y-3">
          <div className="border border-gray-100 rounded-lg p-3">
            <p className="text-sm font-semibold text-gray-700">Language</p>
            <p className="text-xs text-gray-500 mt-1">{settings.preferredLanguage}</p>
          </div>
          <div className="border border-gray-100 rounded-lg p-3">
            <p className="text-sm font-semibold text-gray-700">Currency</p>
            <p className="text-xs text-gray-500 mt-1">{settings.preferredCurrency}</p>
          </div>
          <div className="border border-gray-100 rounded-lg p-3">
            <p className="text-sm font-semibold text-gray-700">Time Format</p>
            <p className="text-xs text-gray-500 mt-1">{toTimeFormatLabel(settings.timeFormat)}</p>
          </div>
          <div className="border border-gray-100 rounded-lg p-3">
            <p className="text-sm font-semibold text-gray-700">Time Zone</p>
            <p className="text-xs text-gray-500 mt-1">{settings.timeZone}</p>
          </div>
        </div>
      </section>
    </div>
  );

  const renderNotificationsTab = () => (
    <section className="glass-card p-6">
      <h2 className="text-lg font-bold text-gray-800 mb-6">Notifications</h2>
      <div className="space-y-5">
        <label className="flex items-center justify-between border border-gray-100 rounded-lg p-4">
          <div>
            <p className="text-sm font-semibold text-gray-700">Email Notifications</p>
            <p className="text-xs text-gray-500 mt-1">Booking updates, receipts, and travel reminders.</p>
          </div>
          <input
            type="checkbox"
            checked={settings.emailNotificationsEnabled}
            onChange={(event) =>
              setSettings((current) => ({
                ...current,
                emailNotificationsEnabled: event.target.checked,
              }))
            }
            className="h-4 w-4 accent-blue-600"
          />
        </label>

        <label className="flex items-center justify-between border border-gray-100 rounded-lg p-4">
          <div>
            <p className="text-sm font-semibold text-gray-700">SMS Notifications</p>
            <p className="text-xs text-gray-500 mt-1">Quick alerts for trip status and payment updates.</p>
          </div>
          <input
            type="checkbox"
            checked={settings.smsNotificationsEnabled}
            onChange={(event) =>
              setSettings((current) => ({
                ...current,
                smsNotificationsEnabled: event.target.checked,
              }))
            }
            className="h-4 w-4 accent-blue-600"
          />
        </label>

        <button
          type="button"
          onClick={saveNotifications}
          disabled={isSavingNotifications}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-all disabled:opacity-70"
        >
          {isSavingNotifications ? 'Saving...' : 'Save Notification Settings'}
        </button>

        {notificationsError ? (
          <p className="text-sm text-red-600">{notificationsError}</p>
        ) : null}
        {notificationsMessage ? (
          <p className="text-sm text-green-600">{notificationsMessage}</p>
        ) : null}
      </div>
    </section>
  );

  const renderSecurityTab = () => (
    <section className="glass-card p-6">
      <h2 className="text-lg font-bold text-gray-800">Security</h2>
      <p className="text-sm text-gray-500 mt-2">
        Password update and multi-factor settings are not configured yet. Your login is secured with JWT
        authentication from the backend.
      </p>
    </section>
  );

  const renderActiveTab = () => {
    if (activeTab === 'Account') {
      return renderAccountTab();
    }

    if (activeTab === 'Preferences') {
      return renderPreferencesTab();
    }

    if (activeTab === 'Notifications') {
      return renderNotificationsTab();
    }

    return renderSecurityTab();
  };

  return (
    <div className="page-shell flex min-h-screen">
      <SettingsSidebar
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={handleCloseMobileSidebar}
      />
      <main className="flex-1 flex flex-col">
        <TravelerHeader
          onMenuToggle={handleToggleMobileSidebar}
          isMenuOpen={isMobileSidebarOpen}
        />
        <div className="overflow-y-auto px-4 pb-8 pt-6 md:px-8 md:pb-10 md:pt-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Settings</h1>

          <div className="flex gap-8 border-b border-gray-200 mb-8">
            {['Account', 'Security', 'Preferences', 'Notifications'].map((tab) => (
              <TabButton
                key={tab}
                text={tab}
                active={activeTab === tab}
                onClick={() => setActiveTab(tab)}
              />
            ))}
          </div>

          {fetchError ? (
            <p className="mb-6 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm px-4 py-3">
              {fetchError}
            </p>
          ) : null}

          {isLoading ? (
            <div className="glass-card p-6 text-sm text-gray-500">
              Loading settings...
            </div>
          ) : fetchError ? null : (
            renderActiveTab()
          )}
        </div>
      </main>
    </div>
  );
}
