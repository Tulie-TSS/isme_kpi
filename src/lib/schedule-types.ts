// Schedule types for weekly work schedule
export interface WeeklySchedule {
  id: string;
  userId: string;
  weekStart: string;         // ISO date: Monday of the week
  lastUpdatedAt: string;
  slots: DaySchedule[];
}

export interface DaySchedule {
  date: string;              // ISO date
  dayLabel: string;          // "Thứ 2", "Thứ 3"...
  busySlots: TimeSlot[];
}

export interface TimeSlot {
  start: string;             // "08:00"
  end: string;               // "10:00"
  label: string;             // "Họp với GV Marketing"
}

export type ScheduleUpdateStatus = 'updated' | 'not_updated';
