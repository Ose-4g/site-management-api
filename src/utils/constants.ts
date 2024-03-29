const constants = {
  footers: {
    DEFAULT: `You received this email because you recently created an account on MySR, or have been an active  user. If none of these is true, you can safely delete or ignore this email.`,
  },
  mongooseModels: {
    USER: 'User',
    REPORT: 'Report',
    COMPANY: 'Company',
    SITE: 'Site',
    DEVICE: 'Device',
    MANAGER: 'Manager',
    HEARTBEAT: 'HeartBeat',
    MAINTENANCE_LOG: 'MaintenanceLog',
  },
  userRoles: {
    USER: 'user',
    ADMIN: 'admin',
    SUPER_ADMIN: 'super-admin',
  },
};

export default constants;
