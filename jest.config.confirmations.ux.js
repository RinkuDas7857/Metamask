module.exports = {
  collectCoverageFrom: [
    'app/scripts/lib/ppom/**',
    'ui/components/app/advanced-gas-controls/**',
    'ui/components/app/advanced-gas-fee-popover/**',
    'ui/components/app/advanced-gas-inputs/**',
    'ui/components/app/cancel-speedup-popover/**',
    'ui/components/app/confirm-data/**',
    'ui/components/app/confirm-gas-display/**',
    'ui/components/app/confirm-hexadata/**',
    'ui/components/app/confirm-page-container/**',
    'ui/components/app/confirm-subtitle/**',
    'ui/components/app/confirm-title/**',
    'ui/components/app/confirmation-warning-modal/**',
    'ui/components/app/custom-nonce/**',
    'ui/components/app/custom-spending-cap/**',
    'ui/components/app/edit-gas-display/**',
    'ui/components/app/edit-gas-fee-popover/**',
    'ui/components/app/edit-gas-popover/**',
    'ui/components/app/edit-gas-fee-button/**',
    'ui/components/app/gas-details-item/**',
    'ui/components/app/gas-timing/**',
    'ui/components/app/permission-cell/**',
    'ui/components/app/permission-page-container/**',
    'ui/components/app/permissions-connect-footer/**',
    'ui/components/app/permissions-connect-header/**',
    'ui/components/app/permissions-connect-permission-list/**',
    'ui/components/app/security-provider-banner-alert/**',
    'ui/components/app/security-provider-banner-message/**',
    'ui/components/app/set-approval-for-all-warning/**',
    'ui/components/app/signature-request/**',
    'ui/components/app/signature-request-header/**',
    'ui/components/app/signature-request-original/**',
    'ui/components/app/signature-request-siwe/**',
    'ui/components/app/transaction-activity-log/**',
    'ui/components/app/transaction-alerts/**',
    'ui/components/app/transaction-breakdown/**',
    'ui/components/app/transaction-decoding/**',
    'ui/components/app/transaction-detail/**',
    'ui/components/app/transaction-detail-item/**',
    'ui/components/app/transaction-icon/**',
    'ui/components/app/transaction-list/**',
    'ui/components/app/transaction-list-item/**',
    'ui/components/app/transaction-list-item-details/**',
    'ui/components/app/transaction-status-label/**',
    'ui/components/ui/review-spending-cap/**',
    'ui/components/ui/sender-to-recipient/**',
    'ui/components/ui/simulation-error-message/**',
    'ui/contexts/gasFee.js',
    'ui/ducks/confirm-transaction/**',
    'ui/ducks/gas/**',
    'ui/ducks/send/**',
    'ui/helpers/constants/gas.js',
    'ui/helpers/constants/transactions.js',
    'ui/hooks/gasFeeInput/**',
    'ui/hooks/useApproveTransaction.js',
    'ui/hooks/useDraftTransactionWithTxParams.js',
    'ui/hooks/useGasFeeEstimates*/**',
    'ui/hooks/useIncrementedGasFees.js',
    'ui/hooks/useRejectTransactionModal.js',
    'ui/hooks/useSafeGasEstimatePolling.js',
    'ui/hooks/useShouldAnimateGasEstimations.js',
    'ui/hooks/useShouldShowSpeedUp.js',
    'ui/hooks/useSimulationFailureWarning.js',
    'ui/hooks/useTransactionDisplayData*/**',
    'ui/hooks/useTransactionFunctionType*.js',
    'ui/hooks/useTransactionInfo*/**',
    'ui/hooks/useTransactionInsights.js',
    'ui/pages/confirm-add-suggested-nft/**',
    'ui/pages/confirm-add-suggested-token/**',
    'ui/pages/confirm-approve/**',
    'ui/pages/confirm-contract-interaction/**',
    'ui/pages/confirm-decrypt-message/**',
    'ui/pages/confirm-deploy-contract/**',
    'ui/pages/confirm-encryption-public-key/**',
    'ui/pages/confirm-send-ether/**',
    'ui/pages/confirm-send-token/**',
    'ui/pages/confirm-signature-request/**',
    'ui/pages/confirm-token-transaction-base/**',
    'ui/pages/confirm-transaction/**',
    'ui/pages/confirm-transaction-base/**',
    'ui/pages/confirm-transaction-switch/**',
    'ui/pages/confirmation/**',
    'ui/pages/send/**',
    'ui/pages/token-allowance/**',
    'ui/selectors/confirm-transaction*/**',
    'ui/selectors/custom-gas*/**',
    'ui/selectors/transactions*/**',
  ],
  coverageDirectory: './coverage',
  coveragePathIgnorePatterns: ['.stories.*', '.snap'],
  coverageReporters: ['html', 'json'],
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: 'test/test-results/',
        outputName: 'junit.xml',
      },
    ],
  ],
  // TODO: enable resetMocks
  // resetMocks: true,
  restoreMocks: true,
  setupFiles: ['<rootDir>/test/setup.js', '<rootDir>/test/env.js'],
  setupFilesAfterEnv: ['<rootDir>/test/jest/setup.js'],
  testMatch: [
    '<rootDir>/app/scripts/constants/error-utils.test.js',
    '<rootDir>/app/scripts/controllers/app-state.test.js',
    '<rootDir>/app/scripts/controllers/transactions/etherscan.test.ts',
    '<rootDir>/app/scripts/controllers/transactions/EtherscanRemoteTransactionSource.test.ts',
    '<rootDir>/app/scripts/controllers/transactions/IncomingTransactionHelper.test.ts',
    '<rootDir>/app/scripts/controllers/mmi-controller.test.js',
    '<rootDir>/app/scripts/controllers/permissions/**/*.test.js',
    '<rootDir>/app/scripts/controllers/preferences.test.js',
    '<rootDir>/app/scripts/controllers/sign.test.ts',
    '<rootDir>/app/scripts/controllers/decrypt-message.test.ts',
    '<rootDir>/app/scripts/flask/**/*.test.js',
    '<rootDir>/app/scripts/lib/**/*.test.(js|ts)',
    '<rootDir>/app/scripts/lib/createRPCMethodTrackingMiddleware.test.js',
    '<rootDir>/app/scripts/metamask-controller.test.js',
    '<rootDir>/app/scripts/migrations/*.test.(js|ts)',
    '<rootDir>/app/scripts/platforms/*.test.js',
    '<rootDir>/app/scripts/translate.test.ts',
    '<rootDir>/shared/**/*.test.(js|ts)',
    '<rootDir>/ui/**/*.test.(js|ts|tsx)',
    '<rootDir>/development/fitness-functions/**/*.test.(js|ts|tsx)',
    '<rootDir>/test/e2e/helpers.test.js',
  ],
  testTimeout: 5500,
  // We have to specify the environment we are running in, which is jsdom. The
  // default is 'node'. This can be modified *per file* using a comment at the
  // head of the file. So it may be worthwhile to switch to 'node' in any
  // background tests.
  testEnvironment: 'jsdom',
  testEnvironmentOptions: {
    customExportConditions: ['node', 'node-addons'],
  },
  workerIdleMemoryLimit: '500MB',
};