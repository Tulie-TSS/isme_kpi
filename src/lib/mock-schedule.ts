import { WeeklySchedule, DaySchedule, TimeSlot } from './schedule-types';
import { users } from './mock-data';

// ==================== HELPERS ====================
function getNextMonday(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? 1 : 8 - day; // next Monday
  const nextMon = new Date(now);
  nextMon.setDate(now.getDate() + diff);
  return nextMon.toISOString().split('T')[0];
}

function getWeekDates(mondayStr: string): { date: string; dayLabel: string }[] {
  const labels = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6'];
  const monday = new Date(mondayStr);
  return labels.map((label, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return { date: d.toISOString().split('T')[0], dayLabel: label };
  });
}

// Standard hours: 08:00 to 17:00
export const WORK_HOURS = [
  '08:00', '09:00', '10:00', '11:00',
  '13:00', '14:00', '15:00', '16:00',
];

export const WORK_HOUR_LABELS: Record<string, string> = {
  '08:00': '08:00–09:00',
  '09:00': '09:00–10:00',
  '10:00': '10:00–11:00',
  '11:00': '11:00–12:00',
  '13:00': '13:00–14:00',
  '14:00': '14:00–15:00',
  '15:00': '15:00–16:00',
  '16:00': '16:00–17:00',
};

// ==================== MOCK DATA ====================
const nextMonday = getNextMonday();
const weekDates = getWeekDates(nextMonday);

function makeBusySlots(hourStarts: string[], label: string): TimeSlot[] {
  return hourStarts.map(start => ({
    start,
    end: `${String(parseInt(start) + 1).padStart(2, '0')}:00`,
    label,
  }));
}

// Generate realistic schedules for each user
let _schedules: WeeklySchedule[] = [
  {
    id: 'sch-u1', userId: 'u1', weekStart: nextMonday, lastUpdatedAt: new Date().toISOString().split('T')[0],
    slots: weekDates.map((wd, i) => ({
      date: wd.date, dayLabel: wd.dayLabel,
      busySlots: i === 0 ? makeBusySlots(['08:00', '09:00', '14:00'], 'Họp Ban lãnh đạo')
        : i === 2 ? makeBusySlots(['10:00', '11:00'], 'Họp đối tác')
        : i === 4 ? makeBusySlots(['08:00', '09:00', '10:00'], 'Họp tổng kết tuần')
        : [],
    })),
  },
  {
    id: 'sch-u2', userId: 'u2', weekStart: nextMonday, lastUpdatedAt: new Date().toISOString().split('T')[0],
    slots: weekDates.map((wd, i) => ({
      date: wd.date, dayLabel: wd.dayLabel,
      busySlots: i === 0 ? makeBusySlots(['09:00', '10:00'], 'Giảng dạy')
        : i === 1 ? makeBusySlots(['08:00', '09:00', '10:00', '11:00'], 'Giảng dạy cả buổi sáng')
        : i === 3 ? makeBusySlots(['14:00', '15:00'], 'Họp GV')
        : [],
    })),
  },
  {
    id: 'sch-u3', userId: 'u3', weekStart: nextMonday, lastUpdatedAt: new Date().toISOString().split('T')[0],
    slots: weekDates.map((wd, i) => ({
      date: wd.date, dayLabel: wd.dayLabel,
      busySlots: i === 1 ? makeBusySlots(['09:00', '10:00', '11:00'], 'Họp chương trình DM')
        : i === 2 ? makeBusySlots(['14:00', '15:00', '16:00'], 'Gặp SV')
        : i === 4 ? makeBusySlots(['08:00'], 'Họp tổng kết')
        : [],
    })),
  },
  {
    id: 'sch-u4', userId: 'u4', weekStart: nextMonday, lastUpdatedAt: new Date().toISOString().split('T')[0],
    slots: weekDates.map((wd, i) => ({
      date: wd.date, dayLabel: wd.dayLabel,
      busySlots: i === 0 ? makeBusySlots(['08:00', '09:00'], 'Họp BTEC Academic')
        : i === 2 ? makeBusySlots(['10:00', '11:00', '13:00'], 'Kiểm tra lớp')
        : i === 3 ? makeBusySlots(['08:00', '09:00', '10:00'], 'Họp assessment')
        : [],
    })),
  },
  {
    id: 'sch-u5', userId: 'u5', weekStart: nextMonday, lastUpdatedAt: new Date().toISOString().split('T')[0],
    slots: weekDates.map((wd, i) => ({
      date: wd.date, dayLabel: wd.dayLabel,
      busySlots: i === 0 ? makeBusySlots(['14:00', '15:00'], 'Gặp GV NHTC')
        : i === 1 ? makeBusySlots(['08:00', '09:00'], 'Giảng dạy')
        : i === 4 ? makeBusySlots(['08:00', '09:00', '10:00'], 'Họp tổng kết')
        : [],
    })),
  },
  {
    id: 'sch-u6', userId: 'u6', weekStart: nextMonday, lastUpdatedAt: new Date().toISOString().split('T')[0],
    slots: weekDates.map((wd, i) => ({
      date: wd.date, dayLabel: wd.dayLabel,
      busySlots: i === 1 ? makeBusySlots(['10:00', '11:00'], 'Họp UWE partnership')
        : i === 3 ? makeBusySlots(['08:00', '09:00', '14:00', '15:00'], 'Dạy + họp GV')
        : [],
    })),
  },
  {
    id: 'sch-u7', userId: 'u7', weekStart: nextMonday, lastUpdatedAt: new Date().toISOString().split('T')[0],
    slots: weekDates.map((wd, i) => ({
      date: wd.date, dayLabel: wd.dayLabel,
      busySlots: i === 0 ? makeBusySlots(['10:00', '11:00', '13:00'], 'Họp CU')
        : i === 2 ? makeBusySlots(['08:00', '09:00'], 'Giảng dạy')
        : i === 4 ? makeBusySlots(['08:00', '09:00', '10:00'], 'Họp tổng kết')
        : [],
    })),
  },
  {
    id: 'sch-u8', userId: 'u8', weekStart: nextMonday, lastUpdatedAt: new Date().toISOString().split('T')[0],
    slots: weekDates.map((wd, i) => ({
      date: wd.date, dayLabel: wd.dayLabel,
      busySlots: i === 0 ? makeBusySlots(['08:00', '09:00'], 'Điều phối BBAE')
        : i === 2 ? makeBusySlots(['14:00', '15:00', '16:00'], 'Hỗ trợ lớp BBAE')
        : [],
    })),
  },
  {
    id: 'sch-u9', userId: 'u9', weekStart: nextMonday, lastUpdatedAt: '',
    slots: weekDates.map(wd => ({
      date: wd.date, dayLabel: wd.dayLabel,
      busySlots: [], // Chưa cập nhật
    })),
  },
  {
    id: 'sch-u10', userId: 'u10', weekStart: nextMonday, lastUpdatedAt: new Date().toISOString().split('T')[0],
    slots: weekDates.map((wd, i) => ({
      date: wd.date, dayLabel: wd.dayLabel,
      busySlots: i === 1 ? makeBusySlots(['08:00', '09:00', '10:00'], 'Họp Andrews')
        : i === 3 ? makeBusySlots(['14:00', '15:00'], 'Họp Lincoln GV')
        : i === 4 ? makeBusySlots(['08:00', '09:00', '10:00'], 'Họp tổng kết')
        : [],
    })),
  },
];

// ==================== CRUD ====================
let _scheduleListeners: (() => void)[] = [];
export function subscribeSchedules(fn: () => void) { _scheduleListeners.push(fn); return () => { _scheduleListeners = _scheduleListeners.filter(f => f !== fn); }; }
function _notifySchedule() { _scheduleListeners.forEach(fn => fn()); }

export function getScheduleByUser(userId: string, weekStart?: string): WeeklySchedule | undefined {
  const ws = weekStart || nextMonday;
  return _schedules.find(s => s.userId === userId && s.weekStart === ws);
}

export function getAllSchedules(weekStart?: string): WeeklySchedule[] {
  const ws = weekStart || nextMonday;
  return _schedules.filter(s => s.weekStart === ws);
}

export function getNextMondayDate(): string {
  return nextMonday;
}

export function getWeekDatesForMonday(mondayStr: string) {
  return getWeekDates(mondayStr);
}

export function updateUserSchedule(userId: string, weekStart: string, slots: DaySchedule[]): void {
  const idx = _schedules.findIndex(s => s.userId === userId && s.weekStart === weekStart);
  if (idx >= 0) {
    _schedules[idx] = { ..._schedules[idx], slots, lastUpdatedAt: new Date().toISOString().split('T')[0] };
  } else {
    _schedules.push({
      id: 'sch-' + userId + '-' + Date.now(),
      userId, weekStart, lastUpdatedAt: new Date().toISOString().split('T')[0],
      slots,
    });
  }
  _schedules = [..._schedules]; // trigger reactivity
  _notifySchedule();
}

// ==================== MEETING FINDER ====================
export interface MeetingSlotInfo {
  date: string;
  dayLabel: string;
  hour: string;
  hourLabel: string;
  busyCount: number;
  totalPeople: number;
  freeCount: number;
  busyUsers: string[];   // user names
  freeUsers: string[];   // user names
}

export function getTeamAvailabilityHeatmap(weekStart?: string): MeetingSlotInfo[] {
  const ws = weekStart || nextMonday;
  const schedules = getAllSchedules(ws);
  const dates = getWeekDates(ws);
  const activeUsers = users.filter(u => u.active && u.id !== 'u0');
  const result: MeetingSlotInfo[] = [];

  for (const wd of dates) {
    for (const hour of WORK_HOURS) {
      const busyUserNames: string[] = [];
      const freeUserNames: string[] = [];

      for (const user of activeUsers) {
        const schedule = schedules.find(s => s.userId === user.id);
        const daySlot = schedule?.slots.find(s => s.date === wd.date);
        const isBusy = daySlot?.busySlots.some(bs => bs.start === hour) || false;
        if (isBusy) {
          busyUserNames.push(user.name);
        } else {
          freeUserNames.push(user.name);
        }
      }

      result.push({
        date: wd.date,
        dayLabel: wd.dayLabel,
        hour,
        hourLabel: WORK_HOUR_LABELS[hour],
        busyCount: busyUserNames.length,
        totalPeople: activeUsers.length,
        freeCount: freeUserNames.length,
        busyUsers: busyUserNames,
        freeUsers: freeUserNames,
      });
    }
  }

  return result;
}

export function findBestMeetingSlots(weekStart?: string, topN: number = 3): MeetingSlotInfo[] {
  const all = getTeamAvailabilityHeatmap(weekStart);
  return [...all].sort((a, b) => a.busyCount - b.busyCount).slice(0, topN);
}

export function getScheduleUpdateStatus(): { userId: string; name: string; updated: boolean }[] {
  const activeUsers = users.filter(u => u.active && u.id !== 'u0');
  return activeUsers.map(u => {
    const schedule = getScheduleByUser(u.id);
    return {
      userId: u.id,
      name: u.name,
      updated: !!(schedule && schedule.lastUpdatedAt),
    };
  });
}
