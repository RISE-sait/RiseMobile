// app/(instructor)/(tabs)/instructorCalendar.tsx
import SharedCalendar from "@/components/shared/SharedCalendar"

export default function InstructorCalendar() {
  return <SharedCalendar userRole="instructor" title="Calendar" subtitle="Refresh" />
}
