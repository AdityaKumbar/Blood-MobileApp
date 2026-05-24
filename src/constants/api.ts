export const apiPaths = {
  auth: {
    login: "/auth/login",
    register: "/auth/register",
    forgotPassword: "/auth/forgot-password",
    profile: "/auth/profile"
  },
  emergency: {
    create: "/emergency-requests/add",
    feed: "/emergency-requests",
    details: (requestId: string) => `/emergency-requests/${requestId}`,
    updateStatus: (requestId: string) => `/emergency-requests/${requestId}/resolve`,
    assignDonor: (requestId: string) => `/emergency-requests/${requestId}/assign`
  },
  search: {
    resources: "/search/resources"
  },
  donor: {
    profile: "/donor/profile",
    register: "/donor/register",
    availability: "/donor/availability",
    history: "/donor/history"
  }
} as const;
