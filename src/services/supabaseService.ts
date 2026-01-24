
// Re-export core singleton
export { initSupabase, getSupabase, checkConnection } from './core/supabaseClient';

// Re-export User services
export {
    createUser,
    updateUser,
    getEmailByUsername,
    checkEmailExists,
    registerAuthFailure,
    resetAuthSecurity,
    checkAuthLockout,
    requestPasswordRecovery,
    resendActivationEmail,
    triggerPasswordResetByAdmin,
    deleteUser,

    userPurchaseItem,
    getUserByDocument,
    getUserByName
} from './users/userService';

// Re-export Content services
export {
    fetchSiteData,
    createNews,
    updateNews,
    deleteNews,
    upsertAdvertiser,
    deleteAdvertiser,
    incrementAdvertiserClick,
    saveSystemSetting,
    getSystemSetting,
    fetchDailyBreadWithLookahead,
    recordEngagementVote,
    saveSocialPost,
    getDatabaseSchemaSQL
} from './content/contentService';

// Re-export Admin services
export {
    adminPurchaseForUser,
    sendErrorReport,
    getErrorReports,
    resolveErrorReport,
    createSupportTicket,
    getUserTickets,
    getAllTickets,
    getTicketMessages,
    addTicketMessage,
    updateTicketStatus,
    getOpenTicketsCount,
    getPendingTicketsUsers
} from './admin/adminService';

// Re-export Audit services
export { logAction, getAuditLogs } from './admin/auditService';
