/** Every backend path in one place — mirrors the DRF router in the docs. */
export const endpoints = {
  staff: "/staff/",
  staffDetail: (id: string) => `/staff/${id}/`,
  services: "/services/",
  timeBlocks: "/time-blocks/",
  timeBlockDetail: (id: string) => `/time-blocks/${id}/`,
  timeBlockCopyDay: "/time-blocks/copy-day/",
  leave: "/leave/",
  leaveDetail: (id: string) => `/leave/${id}/`,
  storeSettings: "/store-settings/",
  integrations: "/integrations/",
  integrationConnect: (id: string) => `/integrations/${id}/connect/`,
  integrationDisconnect: (id: string) => `/integrations/${id}/disconnect/`,
  printerSettings: "/printer-settings/",
  printerTest: "/printer-settings/test/",
  docketSettings: "/docket-settings/",
} as const
