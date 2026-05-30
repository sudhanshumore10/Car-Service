import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import "./AdminConsole.css";
import {
    AdminSummary,
    AdminUser,
    AuditLogEntry,
    NotificationLogEntry,
    NotificationTemplateEntry,
    SettingsExportSnapshot,
    SystemInfo,
    SystemSettingEntry,
    exportSystemSettings,
    getAdminSummary,
    getAdminUsers,
    getAuditLogs,
    getNotificationLogs,
    getNotificationTemplates,
    importSystemSettings,
    resetNotificationTemplates,
    getSystemInfo,
    getSystemSettings,
    resendNotification,
    testSendNotificationTemplate,
    updateAdminUserStatus,
    updateNotificationTemplate,
    updateSystemSetting,
} from "../../services/adminService";

const dateTime = (value?: string) =>
    value ? new Date(value).toLocaleString() : "N/A";

const downloadCsv = (filename: string, rows: Array<Record<string, unknown>>) => {
    const headers = rows.length ? Object.keys(rows[0]) : [];
    const content = [
        headers.join(","),
        ...rows.map((row) =>
            headers
                .map((header) => `"${String(row[header] ?? "").replace(/"/g, '""')}"`)
                .join(",")
        ),
    ].join("\n");
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

const downloadJson = (filename: string, payload: unknown) => {
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

const AdminConsole = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    const [summary, setSummary] = useState<AdminSummary | null>(null);
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
    const [notifications, setNotifications] = useState<NotificationLogEntry[]>([]);
    const [templates, setTemplates] = useState<NotificationTemplateEntry[]>([]);
    const [settings, setSettings] = useState<SystemSettingEntry[]>([]);
    const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [userRoleFilter, setUserRoleFilter] = useState("");
    const [userStatusFilter, setUserStatusFilter] = useState("");
    const [auditActionFilter, setAuditActionFilter] = useState("");
    const [auditEntityFilter, setAuditEntityFilter] = useState("");
    const [notificationStatusFilter, setNotificationStatusFilter] = useState("");
    const [templateTestUserId, setTemplateTestUserId] = useState("");
    const [activeTab, setActiveTab] = useState<"users" | "audit" | "notifications" | "templates" | "settings">("users");
    const [showSettingsImport, setShowSettingsImport] = useState(false);
    const [settingsImportText, setSettingsImportText] = useState("");
    const [importingSettings, setImportingSettings] = useState(false);
    const actorUserId = user?.userId ?? user?.id;

    const loadDashboard = useCallback(async () => {
        setLoading(true);
        try {
            const [
                summaryData,
                userData,
                auditData,
                notificationData,
                templateData,
                settingData,
                systemInfoData,
            ] = await Promise.all([
                getAdminSummary(),
                getAdminUsers(userRoleFilter, userStatusFilter),
                getAuditLogs(auditActionFilter, auditEntityFilter),
                getNotificationLogs(notificationStatusFilter),
                getNotificationTemplates(),
                getSystemSettings(),
                getSystemInfo(),
            ]);
            setSummary(summaryData);
            setUsers(userData);
            setAuditLogs(auditData);
            setNotifications(notificationData);
            setTemplates(templateData);
            setSettings(settingData);
            setSystemInfo(systemInfoData);
        } catch (error: any) {
            toast.error(error.response?.data?.errorMessage || "Failed to load admin console");
        } finally {
            setLoading(false);
        }
    }, [auditActionFilter, auditEntityFilter, notificationStatusFilter, userRoleFilter, userStatusFilter]);

    useEffect(() => {
        loadDashboard();
    }, [loadDashboard]);

    const displayName = useMemo(() => user?.fullName || "Admin", [user?.fullName]);

    const handleStatusChange = async (targetUserId: number, nextStatus: string) => {
        try {
            const updated = await updateAdminUserStatus(targetUserId, nextStatus, actorUserId);
            setUsers((current) => current.map((entry) => entry.id === targetUserId ? updated : entry));
            if (summary) {
                await loadDashboard();
            }
            toast.success(`User moved to ${nextStatus}`);
        } catch (error: any) {
            toast.error(error.response?.data?.errorMessage || "Failed to update user status");
        }
    };

    const handleResendNotification = async (notificationId: number) => {
        try {
            const resent = await resendNotification(notificationId, actorUserId);
            setNotifications((current) => [resent, ...current]);
            toast.success("Notification requeued");
        } catch (error: any) {
            toast.error(error.response?.data?.errorMessage || "Failed to resend notification");
        }
    };

    const handleTemplateFieldChange = (templateKey: string, field: keyof NotificationTemplateEntry, value: string | boolean) => {
        setTemplates((current) =>
            current.map((entry) => entry.templateKey === templateKey ? { ...entry, [field]: value } : entry)
        );
    };

    const handleTemplateSave = async (entry: NotificationTemplateEntry) => {
        try {
            const saved = await updateNotificationTemplate(entry.templateKey, {
                templateTitle: entry.templateTitle,
                templateBody: entry.templateBody,
                enabled: entry.enabled,
            }, actorUserId);
            setTemplates((current) => current.map((item) => item.templateKey === saved.templateKey ? saved : item));
            toast.success(`Template ${entry.templateKey} saved`);
        } catch (error: any) {
            toast.error(error.response?.data?.errorMessage || "Failed to save template");
        }
    };

    const handleTemplateTestSend = async (templateKey: string) => {
        const targetUserId = Number(templateTestUserId);
        if (!targetUserId) {
            toast.error("Enter a valid user id for test send");
            return;
        }
        try {
            await testSendNotificationTemplate(templateKey, targetUserId, actorUserId);
            toast.success(`Template ${templateKey} queued for test send`);
            await loadDashboard();
        } catch (error: any) {
            toast.error(error.response?.data?.errorMessage || "Failed to test send template");
        }
    };

    const handleSettingValueChange = (settingKey: string, value: string) => {
        setSettings((current) =>
            current.map((entry) => entry.settingKey === settingKey ? { ...entry, settingValue: value } : entry)
        );
    };

    const handleSettingSave = async (entry: SystemSettingEntry) => {
        try {
            const saved = await updateSystemSetting(entry.settingKey, {
                settingValue: entry.settingValue,
                settingDescription: entry.settingDescription,
            }, actorUserId);
            setSettings((current) => current.map((item) => item.settingKey === saved.settingKey ? saved : item));
            setSystemInfo(await getSystemInfo());
            toast.success(`Setting ${entry.settingKey} saved`);
        } catch (error: any) {
            toast.error(error.response?.data?.errorMessage || "Failed to save setting");
        }
    };

    const renderSettingInput = (entry: SystemSettingEntry) => {
        const currentValue = entry.settingValue || "";
        const normalizedValue = currentValue.toLowerCase();

        if (normalizedValue === "true" || normalizedValue === "false") {
            return (
                <select
                    className="admin-template-input"
                    value={currentValue}
                    onChange={(e) => handleSettingValueChange(entry.settingKey, e.target.value)}
                >
                    <option value="true">true</option>
                    <option value="false">false</option>
                </select>
            );
        }

        if (entry.settingKey.includes("COLOR")) {
            return (
                <div className="admin-color-row">
                    <input
                        type="color"
                        className="admin-color-input"
                        value={currentValue || "#ff5b2e"}
                        onChange={(e) => handleSettingValueChange(entry.settingKey, e.target.value)}
                    />
                    <input
                        className="admin-template-input"
                        value={currentValue}
                        onChange={(e) => handleSettingValueChange(entry.settingKey, e.target.value)}
                    />
                </div>
            );
        }

        if (entry.settingKey.includes("TIMEOUT") || entry.settingKey.includes("LENGTH")) {
            return (
                <input
                    type="number"
                    min={1}
                    className="admin-template-input"
                    value={currentValue}
                    onChange={(e) => handleSettingValueChange(entry.settingKey, e.target.value)}
                />
            );
        }

        return (
            <input
                className="admin-template-input"
                value={currentValue}
                onChange={(e) => handleSettingValueChange(entry.settingKey, e.target.value)}
            />
        );
    };

    const handleExportSettings = async () => {
        try {
            const snapshot = await exportSystemSettings();
            downloadJson("carservice-settings-backup.json", snapshot);
            toast.success("Settings backup exported");
        } catch (error: any) {
            toast.error(error.response?.data?.errorMessage || "Failed to export settings");
        }
    };

    const handleImportSettings = async () => {
        try {
            setImportingSettings(true);
            const parsed = JSON.parse(settingsImportText || "{}") as SettingsExportSnapshot | { settings: SystemSettingEntry[] };
            const importedSettings = await importSystemSettings({
                settings: Array.isArray(parsed.settings) ? parsed.settings : [],
            }, actorUserId);
            setSettings(importedSettings);
            setSystemInfo(await getSystemInfo());
            setShowSettingsImport(false);
            setSettingsImportText("");
            toast.success("Settings backup imported");
        } catch (error: any) {
            if (error instanceof SyntaxError) {
                toast.error("Import JSON is invalid");
            } else {
                toast.error(error.response?.data?.errorMessage || "Failed to import settings");
            }
        } finally {
            setImportingSettings(false);
        }
    };

    const handleResetTemplates = async () => {
        try {
            const restored = await resetNotificationTemplates(actorUserId);
            setTemplates(restored);
            toast.success("Default notification templates restored");
        } catch (error: any) {
            toast.error(error.response?.data?.errorMessage || "Failed to restore templates");
        }
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/");
        window.location.reload();
    };

    return (
        <div className="admin-console-page">
            <div className="admin-console-shell">
                <aside className="admin-console-sidebar">
                    <div className="admin-brand-card">
                        <span className="admin-badge">ADMIN</span>
                        <h1>CarService</h1>
                        <p>{displayName}</p>
                    </div>

                    <div className="admin-nav-card">
                        <button
                            type="button"
                            className={activeTab === "users" ? "active" : ""}
                            onClick={() => setActiveTab("users")}
                        >
                            Users
                        </button>
                        <button
                            type="button"
                            className={activeTab === "audit" ? "active" : ""}
                            onClick={() => setActiveTab("audit")}
                        >
                            Audit Logs
                        </button>
                        <button
                            type="button"
                            className={activeTab === "notifications" ? "active" : ""}
                            onClick={() => setActiveTab("notifications")}
                        >
                            Notifications
                        </button>
                        <button
                            type="button"
                            className={activeTab === "templates" ? "active" : ""}
                            onClick={() => setActiveTab("templates")}
                        >
                            Templates
                        </button>
                        <button
                            type="button"
                            className={activeTab === "settings" ? "active" : ""}
                            onClick={() => setActiveTab("settings")}
                        >
                            Settings
                        </button>
                    </div>

                    <button type="button" className="admin-logout-btn" onClick={logout}>
                        Logout
                    </button>
                </aside>

                <main className="admin-console-main">
                    <header className="admin-console-header">
                        <div>
                            <h2>Admin Console</h2>
                            <p>Operational control for users, audit trails, and outbound notifications.</p>
                        </div>
                        <button type="button" className="admin-refresh-btn" onClick={loadDashboard}>
                            Refresh
                        </button>
                    </header>

                    <section className="admin-summary-grid">
                        <article className="admin-stat-card">
                            <span>Total Users</span>
                            <strong>{summary?.totalUsers ?? 0}</strong>
                        </article>
                        <article className="admin-stat-card">
                            <span>Active Users</span>
                            <strong>{summary?.activeUsers ?? 0}</strong>
                        </article>
                        <article className="admin-stat-card">
                            <span>Locked Users</span>
                            <strong>{summary?.lockedUsers ?? 0}</strong>
                        </article>
                        <article className="admin-stat-card">
                            <span>Audit Entries</span>
                            <strong>{summary?.auditLogCount ?? 0}</strong>
                        </article>
                        <article className="admin-stat-card">
                            <span>Notifications</span>
                            <strong>{summary?.notificationCount ?? 0}</strong>
                        </article>
                    </section>

                    {loading ? (
                        <div className="admin-panel-card">Loading admin console...</div>
                    ) : (
                        <>
                            {activeTab === "users" && (
                                <section className="admin-panel-card">
                                    <div className="admin-panel-header">
                                        <h3>User Access Control</h3>
                                        <div className="admin-filter-row">
                                            <select value={userRoleFilter} onChange={(e) => setUserRoleFilter(e.target.value)}>
                                                <option value="">All Roles</option>
                                                <option value="ADMIN">Admin</option>
                                                <option value="MANAGER">Manager</option>
                                                <option value="TECHNICIAN">Technician</option>
                                                <option value="CUSTOMER">Customer</option>
                                            </select>
                                            <select value={userStatusFilter} onChange={(e) => setUserStatusFilter(e.target.value)}>
                                                <option value="">All Statuses</option>
                                                <option value="ACTIVE">Active</option>
                                                <option value="INACTIVE">Inactive</option>
                                                <option value="LOCKED">Locked</option>
                                            </select>
                                            <button
                                                type="button"
                                                className="admin-inline-btn"
                                                onClick={() => downloadCsv("admin-users.csv", users)}
                                            >
                                                Export CSV
                                            </button>
                                        </div>
                                    </div>

                                    <div className="admin-table-wrap">
                                        <table className="admin-table">
                                            <thead>
                                                <tr>
                                                    <th>User</th>
                                                    <th>Role</th>
                                                    <th>Status</th>
                                                    <th>Created</th>
                                                    <th>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {users.map((entry) => (
                                                    <tr key={entry.id}>
                                                        <td>
                                                            <strong>{entry.displayName}</strong>
                                                            <span>{entry.email}</span>
                                                        </td>
                                                        <td>{entry.userType}</td>
                                                        <td>{entry.status}</td>
                                                        <td>{dateTime(entry.createdAt)}</td>
                                                        <td>
                                                            <div className="admin-action-row">
                                                                {["ACTIVE", "INACTIVE", "LOCKED"].map((status) => (
                                                                    <button
                                                                        key={status}
                                                                        type="button"
                                                                        className={entry.status === status ? "selected" : ""}
                                                                        disabled={entry.status === status}
                                                                        onClick={() => handleStatusChange(entry.id, status)}
                                                                    >
                                                                        {status}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </section>
                            )}

                            {activeTab === "audit" && (
                                <section className="admin-panel-card">
                                    <div className="admin-panel-header">
                                        <h3>Audit Trail</h3>
                                        <div className="admin-filter-row">
                                            <input
                                                value={auditActionFilter}
                                                onChange={(e) => setAuditActionFilter(e.target.value)}
                                                placeholder="Filter by action"
                                            />
                                            <input
                                                value={auditEntityFilter}
                                                onChange={(e) => setAuditEntityFilter(e.target.value)}
                                                placeholder="Filter by entity"
                                            />
                                            <button
                                                type="button"
                                                className="admin-inline-btn"
                                                onClick={() => downloadCsv("audit-logs.csv", auditLogs)}
                                            >
                                                Export CSV
                                            </button>
                                        </div>
                                    </div>

                                    <div className="admin-table-wrap">
                                        <table className="admin-table">
                                            <thead>
                                                <tr>
                                                    <th>Time</th>
                                                    <th>User</th>
                                                    <th>Action</th>
                                                    <th>Entity</th>
                                                    <th>Target</th>
                                                    <th>IP / Agent</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {auditLogs.map((entry) => (
                                                    <tr key={entry.id}>
                                                        <td>{dateTime(entry.createdAt)}</td>
                                                        <td>{entry.userEmail || "SYSTEM"}</td>
                                                        <td>{entry.action}</td>
                                                        <td>{entry.entity}</td>
                                                        <td>{entry.entityId ?? "-"}</td>
                                                        <td>{entry.ipAddress || "-"}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </section>
                            )}

                            {activeTab === "notifications" && (
                                <section className="admin-panel-card">
                                    <div className="admin-panel-header">
                                        <h3>Notification Log</h3>
                                        <div className="admin-filter-row">
                                            <select value={notificationStatusFilter} onChange={(e) => setNotificationStatusFilter(e.target.value)}>
                                                <option value="">All Statuses</option>
                                                <option value="BOOKING_CONFIRMED">Booking Confirmed</option>
                                                <option value="BOOKING_CANCELLED">Booking Cancelled</option>
                                                <option value="BOOKING_RESCHEDULED">Booking Rescheduled</option>
                                                <option value="ESTIMATE_READY">Estimate Ready</option>
                                                <option value="PAYMENT_RECORDED">Payment Recorded</option>
                                                <option value="RESENT">Resent</option>
                                            </select>
                                            <button
                                                type="button"
                                                className="admin-inline-btn"
                                                onClick={() => downloadCsv("notification-log.csv", notifications)}
                                            >
                                                Export CSV
                                            </button>
                                        </div>
                                    </div>

                                    <div className="admin-table-wrap">
                                        <table className="admin-table">
                                            <thead>
                                                <tr>
                                                    <th>Time</th>
                                                    <th>User</th>
                                                    <th>Status</th>
                                                    <th>Message</th>
                                                    <th>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {notifications.map((entry) => (
                                                    <tr key={entry.id}>
                                                        <td>{dateTime(entry.createdAt)}</td>
                                                        <td>{entry.userEmail || "N/A"}</td>
                                                        <td>{entry.status}</td>
                                                        <td>{entry.message}</td>
                                                        <td>
                                                            <button
                                                                type="button"
                                                                className="admin-resend-btn"
                                                                onClick={() => handleResendNotification(entry.id)}
                                                            >
                                                                Resend
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </section>
                            )}

                            {activeTab === "templates" && (
                                <section className="admin-panel-card">
                                    <div className="admin-panel-header">
                                        <div>
                                            <h3>Notification Templates</h3>
                                            <p className="admin-muted">Edit placeholder-based messages and test send them to any user id.</p>
                                        </div>
                                        <div className="admin-filter-row">
                                            <input
                                                value={templateTestUserId}
                                                onChange={(e) => setTemplateTestUserId(e.target.value)}
                                                placeholder="Test send user id"
                                            />
                                            <button
                                                type="button"
                                                className="admin-inline-btn"
                                                onClick={() => downloadCsv("notification-templates.csv", templates)}
                                            >
                                                Export CSV
                                            </button>
                                            <button
                                                type="button"
                                                className="admin-inline-btn"
                                                onClick={handleResetTemplates}
                                            >
                                                Restore Defaults
                                            </button>
                                        </div>
                                    </div>

                                    <div className="admin-template-grid">
                                        {templates.map((entry) => (
                                            <article key={entry.templateKey} className="admin-template-card">
                                                <div className="admin-template-top">
                                                    <div>
                                                        <strong>{entry.templateKey}</strong>
                                                        <span>{entry.templateTitle || "Untitled Template"}</span>
                                                    </div>
                                                    <label className="admin-toggle">
                                                        <input
                                                            type="checkbox"
                                                            checked={entry.enabled}
                                                            onChange={(e) => handleTemplateFieldChange(entry.templateKey, "enabled", e.target.checked)}
                                                        />
                                                        Enabled
                                                    </label>
                                                </div>

                                                <input
                                                    className="admin-template-input"
                                                    value={entry.templateTitle || ""}
                                                    onChange={(e) => handleTemplateFieldChange(entry.templateKey, "templateTitle", e.target.value)}
                                                    placeholder="Template title"
                                                />
                                                <textarea
                                                    className="admin-template-textarea"
                                                    value={entry.templateBody || ""}
                                                    onChange={(e) => handleTemplateFieldChange(entry.templateKey, "templateBody", e.target.value)}
                                                    rows={5}
                                                />
                                                <div className="admin-template-meta">
                                                    <span>Updated: {dateTime(entry.updatedAt)}</span>
                                                </div>
                                                <div className="admin-action-row">
                                                    <button type="button" onClick={() => handleTemplateSave(entry)}>
                                                        Save
                                                    </button>
                                                    <button type="button" onClick={() => handleTemplateTestSend(entry.templateKey)}>
                                                        Test Send
                                                    </button>
                                                </div>
                                            </article>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {activeTab === "settings" && (
                                <section className="admin-panel-card">
                                    <div className="admin-panel-header">
                                        <div>
                                            <h3>System Settings</h3>
                                            <p className="admin-muted">Manage password policy, session timeout, branding, and maintenance controls.</p>
                                        </div>
                                        <div className="admin-filter-row">
                                            <button type="button" className="admin-inline-btn" onClick={handleExportSettings}>
                                                Export JSON
                                            </button>
                                            <button
                                                type="button"
                                                className="admin-inline-btn"
                                                onClick={() => setShowSettingsImport((current) => !current)}
                                            >
                                                {showSettingsImport ? "Hide Import" : "Import JSON"}
                                            </button>
                                        </div>
                                    </div>

                                    {showSettingsImport && (
                                        <div className="admin-import-box">
                                            <h4>Restore Settings Snapshot</h4>
                                            <p>Paste a previously exported JSON snapshot to restore branding, session, and policy configuration.</p>
                                            <textarea
                                                value={settingsImportText}
                                                onChange={(e) => setSettingsImportText(e.target.value)}
                                                rows={8}
                                                placeholder='{"settings":[{"settingKey":"BRAND_APP_NAME","settingValue":"CarService"}]}'
                                            />
                                            <div className="admin-action-row">
                                                <button type="button" onClick={handleImportSettings} disabled={importingSettings}>
                                                    {importingSettings ? "Importing..." : "Apply Import"}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setShowSettingsImport(false);
                                                        setSettingsImportText("");
                                                    }}
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    <div className="admin-settings-layout">
                                        <div className="admin-settings-list">
                                            {settings.map((entry) => (
                                                <article key={entry.settingKey} className="admin-setting-card">
                                                    <div className="admin-setting-header">
                                                        <strong>{entry.settingKey}</strong>
                                                        <span>{entry.settingDescription || "System setting"}</span>
                                                    </div>
                                                    {renderSettingInput(entry)}
                                                    <div className="admin-setting-footer">
                                                        <span>Updated: {dateTime(entry.updatedAt)}</span>
                                                        <button type="button" className="admin-resend-btn" onClick={() => handleSettingSave(entry)}>
                                                            Save
                                                        </button>
                                                    </div>
                                                </article>
                                            ))}
                                        </div>

                                        <aside className="admin-system-info-card">
                                            <h4>System Info</h4>
                                            <div className="admin-info-row"><span>App</span><strong>{systemInfo?.applicationName || "CarService"}</strong></div>
                                            <div className="admin-info-row"><span>Backend</span><strong>{systemInfo?.backendService || "-"}</strong></div>
                                            <div className="admin-info-row"><span>Java</span><strong>{systemInfo?.javaVersion || "-"}</strong></div>
                                            <div className="admin-info-row"><span>OS</span><strong>{systemInfo?.osName || "-"}</strong></div>
                                            <div className="admin-info-row"><span>Server Time</span><strong>{dateTime(systemInfo?.serverTime)}</strong></div>
                                            <div className="admin-info-row"><span>Session Timeout</span><strong>{systemInfo?.sessionTimeoutMinutes ?? 0} mins</strong></div>
                                            <div className="admin-info-row"><span>Read Only</span><strong>{systemInfo?.readOnlyMode ? "Enabled" : "Disabled"}</strong></div>
                                            <div className="admin-info-row"><span>Brand Color</span><strong>{systemInfo?.brandPrimaryColor || "-"}</strong></div>
                                            <div className="admin-policy-card">
                                                <h5>Password Policy</h5>
                                                <ul>
                                                    <li>Min Length: {systemInfo?.passwordPolicy?.minLength ?? 0}</li>
                                                    <li>Uppercase: {systemInfo?.passwordPolicy?.requireUppercase ? "Required" : "Optional"}</li>
                                                    <li>Number: {systemInfo?.passwordPolicy?.requireNumber ? "Required" : "Optional"}</li>
                                                    <li>Special: {systemInfo?.passwordPolicy?.requireSpecial ? "Required" : "Optional"}</li>
                                                </ul>
                                            </div>
                                        </aside>
                                    </div>
                                </section>
                            )}
                        </>
                    )}
                </main>
            </div>
        </div>
    );
};

export default AdminConsole;
