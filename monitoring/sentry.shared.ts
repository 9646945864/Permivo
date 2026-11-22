// Shared Sentry privacy settings: send the error and its stack trace, nothing about the person
// or what they typed. Request bodies would include contractors' questions and drafts, so they stay off.
export const sentryPrivacy = {
  tracesSampleRate: 0.1,
  dataCollection: {
    userInfo: false,
    cookies: false,
    httpHeaders: false,
    httpBodies: [] as never[],
    urlQueryParams: false,
    genAI: { inputs: false, outputs: false },
    databaseQueryData: false,
    stackFrameVariables: false,
  },
};
