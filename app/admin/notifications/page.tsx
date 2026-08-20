import type { Metadata } from "next"

import { NotificationsSection } from "@/components/notifications/notifications-section"

export const metadata: Metadata = {
  title: "Notifications · Workshop Admin",
  description: "Manage the SMS and email messages sent to customers and staff.",
}

export default function NotificationsPage() {
  return <NotificationsSection />
}
