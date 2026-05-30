import api from "./api";

export type AdminSummary = {
    totalUsers: number;
    activeUsers: number;
    lockedUsers: number;
    customerUsers: number;
    managerUsers: number;
    technicianUsers: number;
    notificationCount: number;
    auditLogCount: number;
};

export type AdminUser = {
    id: number;
    email: string;
    phone?: string;
    userType: string;
    status: string;
    createdAt?: string;
    displayName: string;
};

export type AuditLogEntry = {
    id: number;
    userId?: number;
    userEmail?: string;
    action: string;
    entity: string;
    entityId?: number;
    ipAddress?: string;
    createdAt?: string;
};

export type NotificationLogEntry = {
    id: number;
    userId?: number;
    userEmail?: string;
    message: string;
    status: string;
    createdAt?: string;
};

export type NotificationTemplateEntry = {
    id?: number;
    templateKey: string;
    templateTitle?: string;
    templateBody?: string;
    enabled: boolean;
    createdAt?: string;
    updatedAt?: string;
};

export type SystemSettingEntry = {
    id?: number;
    settingKey: string;
    settingValue?: string;
    settingDescription?: string;
    updatedAt?: string;
};

export type SystemInfo = {
    applicationName: string;
    backendService: string;
    javaVersion: string;
    osName: string;
    serverTime: string;
    sessionTimeoutMinutes: number;
    readOnlyMode: boolean;
    brandPrimaryColor: string;
    passwordPolicy: {
        minLength: number;
        requireUppercase: boolean;
        requireNumber: boolean;
        requireSpecial: boolean;
    };
};

export type SettingsExportSnapshot = {
    exportedAt: string;
    applicationName: string;
    settings: SystemSettingEntry[];
    systemInfo: SystemInfo;
};

export const getAdminSummary = async () => {
    const response = await api.get<AdminSummary>("/admin/summary");
    return response.data;
};

export const getAdminUsers = async (role?: string, status?: string) => {
    const response = await api.get<AdminUser[]>("/admin/users", {
        params: {
            role: role || undefined,
            status: status || undefined,
        },
    });
    return response.data;
};

export const updateAdminUserStatus = async (userId: number, status: string, actorUserId?: number) => {
    const response = await api.put<AdminUser>(`/admin/users/${userId}/status`, null, {
        params: {
            status,
            actorUserId: actorUserId || undefined,
        },
    });
    return response.data;
};

export const getAuditLogs = async (action?: string, entity?: string) => {
    const response = await api.get<AuditLogEntry[]>("/admin/audit-logs", {
        params: {
            action: action || undefined,
            entity: entity || undefined,
        },
    });
    return response.data;
};

export const getNotificationLogs = async (status?: string) => {
    const response = await api.get<NotificationLogEntry[]>("/admin/notifications", {
        params: {
            status: status || undefined,
        },
    });
    return response.data;
};

export const resendNotification = async (notificationId: number, actorUserId?: number) => {
    const response = await api.post<NotificationLogEntry>(`/admin/notifications/${notificationId}/resend`, null, {
        params: {
            actorUserId: actorUserId || undefined,
        },
    });
    return response.data;
};

export const getNotificationTemplates = async () => {
    const response = await api.get<NotificationTemplateEntry[]>("/admin/notification-templates");
    return response.data;
};

export const updateNotificationTemplate = async (
    templateKey: string,
    payload: Partial<NotificationTemplateEntry>,
    actorUserId?: number
) => {
    const response = await api.put<NotificationTemplateEntry>(
        `/admin/notification-templates/${templateKey}`,
        payload,
        {
            params: {
                actorUserId: actorUserId || undefined,
            },
        }
    );
    return response.data;
};

export const testSendNotificationTemplate = async (templateKey: string, userId: number, actorUserId?: number) => {
    const response = await api.post<{ templateKey: string; userId: number; message: string }>(
        `/admin/notification-templates/${templateKey}/test-send`,
        null,
        {
            params: {
                userId,
                actorUserId: actorUserId || undefined,
            },
        }
    );
    return response.data;
};

export const getSystemSettings = async () => {
    const response = await api.get<SystemSettingEntry[]>("/admin/settings");
    return response.data;
};

export const exportSystemSettings = async () => {
    const response = await api.get<SettingsExportSnapshot>("/admin/settings/export");
    return response.data;
};

export const importSystemSettings = async (
    payload: { settings: Partial<SystemSettingEntry>[] },
    actorUserId?: number
) => {
    const response = await api.post<SystemSettingEntry[]>("/admin/settings/import", payload, {
        params: {
            actorUserId: actorUserId || undefined,
        },
    });
    return response.data;
};

export const updateSystemSetting = async (
    settingKey: string,
    payload: Partial<SystemSettingEntry>,
    actorUserId?: number
) => {
    const response = await api.put<SystemSettingEntry>(
        `/admin/settings/${settingKey}`,
        payload,
        {
            params: {
                actorUserId: actorUserId || undefined,
            },
        }
    );
    return response.data;
};

export const getSystemInfo = async () => {
    const response = await api.get<SystemInfo>("/admin/system-info");
    return response.data;
};

export const resetNotificationTemplates = async (actorUserId?: number) => {
    const response = await api.post<NotificationTemplateEntry[]>("/admin/notification-templates/reset-defaults", null, {
        params: {
            actorUserId: actorUserId || undefined,
        },
    });
    return response.data;
};
