const constants = {
  footers: {
    DEFAULT: `You received this email because you recently created an account on MySR, or have been an active  user. If none of these is true, you can safely delete or ignore this email.`,
  },
  mongooseModels: {
    USER: 'User',
    FUNDRAISER: 'FundRaiser',
    TRANSACTION: 'Transaction',
    SUBSCRIPTION: 'Subscription',
    REPORT: 'Report',
  },
  userRoles: {
    USER: 'user',
    ADMIN: 'admin',
    SUPER_ADMIN: 'super-admin',
  },

  transactionTypes: {
    DEFAULT_DEPOSIT: 'default-deposit',
    FUNDRAISER_DEPOSIT: 'fundraiser-deposit',
    WITHDRAWAL: 'withdrawal',
  },

  transactionStatus: {
    INITIATED: 'initiated',
    SUCCESSFUL: 'successful',
    FAILED: 'failed',
  },
};

export default constants;
