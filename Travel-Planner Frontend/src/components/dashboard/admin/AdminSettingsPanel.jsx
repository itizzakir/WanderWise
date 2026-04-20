import React, { useMemo, useState } from 'react';

const tabStyles = {
  active: 'border-b-2 border-blue-600 text-blue-700',
  idle: 'text-gray-500 hover:text-gray-700',
};

const initialSettings = {
  general: {
    platformName: 'Wanderwise Admin',
    supportEmail: 'support@wanderwise.com',
    defaultCurrency: 'INR',
    defaultTimezone: 'UTC-05:00',
    maintenanceMode: false,
    autoApproveUsers: true,
  },
  security: {
    enforceAdminMfa: true,
    passwordRotationDays: '90',
    sessionTimeoutMinutes: '30',
    allowLoginFromUnknownDevice: false,
  },
  notifications: {
    emailAlerts: true,
    inAppAlerts: true,
    smsAlerts: false,
    bookingAlerts: true,
    userLifecycleAlerts: true,
    paymentFailureAlerts: true,
  },
};

const SummaryCard = ({ title, value, color = 'text-gray-800' }) => {
  return (
    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
      <p className="text-xs uppercase tracking-wide text-gray-400">{title}</p>
      <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
    </div>
  );
};

const Toggle = ({ checked, onChange, label }) => {
  return (
    <label className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <button
        type="button"
        onClick={onChange}
        className={`w-11 h-6 rounded-full relative transition-colors ${
          checked ? 'bg-blue-600' : 'bg-gray-300'
        }`}
      >
        <span
          className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
            checked ? 'translate-x-5 left-0.5' : 'translate-x-0 left-0.5'
          }`}
        />
      </button>
    </label>
  );
};

const AdminSettingsPanel = () => {
  const [activeTab, setActiveTab] = useState('General');
  const [settings, setSettings] = useState(initialSettings);
  const [saveMessage, setSaveMessage] = useState('');

  const summary = useMemo(() => {
    const enabledChannels = [
      settings.notifications.emailAlerts,
      settings.notifications.inAppAlerts,
      settings.notifications.smsAlerts,
    ].filter(Boolean).length;

    return {
      securityLevel: settings.security.enforceAdminMfa ? 'High' : 'Standard',
      timeout: `${settings.security.sessionTimeoutMinutes} min`,
      channels: `${enabledChannels} channels`,
      mode: settings.general.maintenanceMode ? 'Maintenance' : 'Live',
    };
  }, [settings]);

  const updateSection = (section, key, value) => {
    setSettings((current) => ({
      ...current,
      [section]: {
        ...current[section],
        [key]: value,
      },
    }));
  };

  const handleSave = () => {
    localStorage.setItem('adminSettings', JSON.stringify(settings));
    setSaveMessage('Settings saved successfully.');
    window.setTimeout(() => setSaveMessage(''), 2500);
  };

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Admin Settings</h1>
        <p className="text-sm text-gray-500 mt-1">
          Configure platform defaults, security policy, and notification rules.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SummaryCard title="Environment" value={summary.mode} color="text-blue-700" />
        <SummaryCard title="Security Level" value={summary.securityLevel} color="text-green-700" />
        <SummaryCard title="Session Timeout" value={summary.timeout} />
        <SummaryCard title="Alert Channels" value={summary.channels} />
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <div className="flex gap-6 border-b border-gray-100 mb-6">
          {['General', 'Security', 'Notifications'].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-semibold transition-colors ${
                activeTab === tab ? tabStyles.active : tabStyles.idle
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'General' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="space-y-2">
                <span className="text-sm text-gray-600 font-medium">Platform Name</span>
                <input
                  type="text"
                  value={settings.general.platformName}
                  onChange={(event) => updateSection('general', 'platformName', event.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm text-gray-600 font-medium">Support Email</span>
                <input
                  type="email"
                  value={settings.general.supportEmail}
                  onChange={(event) => updateSection('general', 'supportEmail', event.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm text-gray-600 font-medium">Default Currency</span>
                <select
                  value={settings.general.defaultCurrency}
                  onChange={(event) => updateSection('general', 'defaultCurrency', event.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="INR">INR</option>
                </select>
              </label>
              <label className="space-y-2">
                <span className="text-sm text-gray-600 font-medium">Default Timezone</span>
                <select
                  value={settings.general.defaultTimezone}
                  onChange={(event) => updateSection('general', 'defaultTimezone', event.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="UTC-05:00">UTC-05:00 (Eastern)</option>
                  <option value="UTC+00:00">UTC+00:00 (UTC)</option>
                  <option value="UTC+05:30">UTC+05:30 (India)</option>
                </select>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Toggle
                checked={settings.general.maintenanceMode}
                onChange={() =>
                  updateSection('general', 'maintenanceMode', !settings.general.maintenanceMode)
                }
                label="Enable maintenance mode"
              />
              <Toggle
                checked={settings.general.autoApproveUsers}
                onChange={() =>
                  updateSection('general', 'autoApproveUsers', !settings.general.autoApproveUsers)
                }
                label="Auto-approve verified users"
              />
            </div>
          </div>
        )}

        {activeTab === 'Security' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="space-y-2">
                <span className="text-sm text-gray-600 font-medium">Password Rotation (days)</span>
                <input
                  type="number"
                  min="30"
                  max="365"
                  value={settings.security.passwordRotationDays}
                  onChange={(event) =>
                    updateSection('security', 'passwordRotationDays', event.target.value)
                  }
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm text-gray-600 font-medium">Session Timeout (minutes)</span>
                <input
                  type="number"
                  min="5"
                  max="240"
                  value={settings.security.sessionTimeoutMinutes}
                  onChange={(event) =>
                    updateSection('security', 'sessionTimeoutMinutes', event.target.value)
                  }
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Toggle
                checked={settings.security.enforceAdminMfa}
                onChange={() =>
                  updateSection('security', 'enforceAdminMfa', !settings.security.enforceAdminMfa)
                }
                label="Enforce MFA for all admin accounts"
              />
              <Toggle
                checked={settings.security.allowLoginFromUnknownDevice}
                onChange={() =>
                  updateSection(
                    'security',
                    'allowLoginFromUnknownDevice',
                    !settings.security.allowLoginFromUnknownDevice
                  )
                }
                label="Allow login from unknown devices"
              />
            </div>
          </div>
        )}

        {activeTab === 'Notifications' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Toggle
                checked={settings.notifications.emailAlerts}
                onChange={() =>
                  updateSection('notifications', 'emailAlerts', !settings.notifications.emailAlerts)
                }
                label="Send alerts to admin email"
              />
              <Toggle
                checked={settings.notifications.inAppAlerts}
                onChange={() =>
                  updateSection('notifications', 'inAppAlerts', !settings.notifications.inAppAlerts)
                }
                label="Enable in-app admin alerts"
              />
              <Toggle
                checked={settings.notifications.smsAlerts}
                onChange={() =>
                  updateSection('notifications', 'smsAlerts', !settings.notifications.smsAlerts)
                }
                label="Enable SMS alerts"
              />
              <Toggle
                checked={settings.notifications.bookingAlerts}
                onChange={() =>
                  updateSection(
                    'notifications',
                    'bookingAlerts',
                    !settings.notifications.bookingAlerts
                  )
                }
                label="Notify on new bookings"
              />
              <Toggle
                checked={settings.notifications.userLifecycleAlerts}
                onChange={() =>
                  updateSection(
                    'notifications',
                    'userLifecycleAlerts',
                    !settings.notifications.userLifecycleAlerts
                  )
                }
                label="Notify on user status changes"
              />
              <Toggle
                checked={settings.notifications.paymentFailureAlerts}
                onChange={() =>
                  updateSection(
                    'notifications',
                    'paymentFailureAlerts',
                    !settings.notifications.paymentFailureAlerts
                  )
                }
                label="Notify on payment failures"
              />
            </div>
          </div>
        )}

        <div className="mt-6 pt-5 border-t border-gray-100 flex items-center justify-between">
          <p className="text-sm text-green-700">{saveMessage}</p>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            Save Settings
          </button>
        </div>
      </div>
    </section>
  );
};

export default AdminSettingsPanel;
