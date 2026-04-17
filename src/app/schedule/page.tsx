'use client';
import React, { useState, useEffect } from 'react';
import { useApp } from '@/lib/context';
import { getUserById } from '@/lib/mock-data';
import {
  getScheduleByUser, updateUserSchedule, getNextMondayDate, getWeekDatesForMonday,
  WORK_HOURS, WORK_HOUR_LABELS, getTeamAvailabilityHeatmap, findBestMeetingSlots,
  getScheduleUpdateStatus, subscribeSchedules, MeetingSlotInfo
} from '@/lib/mock-schedule';
import { DaySchedule, TimeSlot } from '@/lib/schedule-types';
import { Calendar, Clock, Users, CheckCircle, AlertTriangle, Star, X } from 'lucide-react';

export default function SchedulePage() {
  const { currentUserId, hasAnyRole, currentRole } = useApp();
  const user = getUserById(currentUserId);
  const [activeTab, setActiveTab] = useState<'my' | 'team'>('my');
  const [, forceUpdate] = useState(0);
  const nextMonday = getNextMondayDate();
  const weekDates = getWeekDatesForMonday(nextMonday);

  useEffect(() => {
    const unsub = subscribeSchedules(() => forceUpdate(n => n + 1));
    return unsub;
  }, []);

  const canViewTeam = hasAnyRole('manager', 'institute_leader', 'coordinator_director') || currentRole === 'manager' || currentRole === 'admin';

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Lịch làm việc</h1>
          <p style={{ fontSize: 14, color: 'var(--gray-500)' }}>Tuần {nextMonday} · {user?.name}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Calendar size={16} color="var(--gray-400)" />
          <span style={{ fontSize: 12, color: 'var(--gray-400)' }}>Cập nhật trước Thứ 7</span>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 24, borderBottom: '2px solid var(--gray-100)' }}>
        <button
          onClick={() => setActiveTab('my')}
          style={{
            padding: '10px 24px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
            border: 'none', background: 'none',
            borderBottom: activeTab === 'my' ? '2px solid var(--isme-red)' : '2px solid transparent',
            color: activeTab === 'my' ? 'var(--gray-800)' : 'var(--gray-400)',
            marginBottom: -2,
          }}
        >
          <Clock size={14} style={{ marginRight: 6, verticalAlign: -2 }} />
          Lịch của tôi
        </button>
        {canViewTeam && (
          <button
            onClick={() => setActiveTab('team')}
            style={{
              padding: '10px 24px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
              border: 'none', background: 'none',
              borderBottom: activeTab === 'team' ? '2px solid var(--isme-red)' : '2px solid transparent',
              color: activeTab === 'team' ? 'var(--gray-800)' : 'var(--gray-400)',
              marginBottom: -2,
            }}
          >
            <Users size={14} style={{ marginRight: 6, verticalAlign: -2 }} />
            Tìm giờ họp
          </button>
        )}
      </div>

      {activeTab === 'my' ? (
        <MyScheduleTab userId={currentUserId} nextMonday={nextMonday} weekDates={weekDates} />
      ) : (
        <TeamScheduleTab nextMonday={nextMonday} weekDates={weekDates} />
      )}
    </div>
  );
}

// ==================== MY SCHEDULE TAB ====================
function MyScheduleTab({ userId, nextMonday, weekDates }: { userId: string; nextMonday: string; weekDates: { date: string; dayLabel: string }[] }) {
  const schedule = getScheduleByUser(userId, nextMonday);
  const isUpdated = !!(schedule && schedule.lastUpdatedAt);

  const [localSlots, setLocalSlots] = useState<DaySchedule[]>(() => {
    return weekDates.map(wd => {
      const existing = schedule?.slots.find(s => s.date === wd.date);
      return existing || { date: wd.date, dayLabel: wd.dayLabel, busySlots: [] };
    });
  });

  const toggleSlot = (dateIdx: number, hour: string) => {
    setLocalSlots(prev => {
      const next = [...prev];
      const day = { ...next[dateIdx], busySlots: [...next[dateIdx].busySlots] };
      const existing = day.busySlots.findIndex(s => s.start === hour);
      if (existing >= 0) {
        day.busySlots.splice(existing, 1);
      } else {
        day.busySlots.push({ start: hour, end: `${String(parseInt(hour) + 1).padStart(2, '0')}:00`, label: 'Bận' });
      }
      next[dateIdx] = day;
      return next;
    });
  };

  const handleSave = () => {
    updateUserSchedule(userId, nextMonday, localSlots);
  };

  const isBusy = (dateIdx: number, hour: string) => {
    return localSlots[dateIdx]?.busySlots.some(s => s.start === hour) || false;
  };

  return (
    <div>
      {/* Status Banner */}
      <div className="card" style={{
        display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20,
        background: isUpdated ? '#F0FDF4' : '#FEF3C7',
        border: isUpdated ? '1px solid #BBF7D0' : '1px solid #FDE68A',
      }}>
        {isUpdated ? (
          <>
            <CheckCircle size={18} color="#16A34A" />
            <span style={{ fontSize: 13, color: '#16A34A', fontWeight: 600 }}>Đã cập nhật lịch tuần tới</span>
          </>
        ) : (
          <>
            <AlertTriangle size={18} color="#D97706" />
            <span style={{ fontSize: 13, color: '#D97706', fontWeight: 600 }}>Chưa cập nhật! Vui lòng cập nhật lịch trước Thứ 7</span>
          </>
        )}
      </div>

      <div className="card" style={{ padding: 0, overflow: 'auto' }}>
        <div style={{ padding: '16px 20px 8px', borderBottom: '1px solid var(--gray-100)' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--gray-800)' }}>Click vào ô để đánh dấu bận/rảnh</div>
          <div style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 2 }}>
            <span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: 3, background: '#FEE2E2', border: '1px solid #FECACA', marginRight: 4, verticalAlign: -1 }} />Bận
            <span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: 3, background: '#F0FDF4', border: '1px solid #BBF7D0', marginRight: 4, marginLeft: 12, verticalAlign: -1 }} />Rảnh
          </div>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
          <thead>
            <tr style={{ background: 'var(--gray-800)', color: 'white' }}>
              <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: 12, fontWeight: 700, width: 100 }}>Giờ</th>
              {weekDates.map(wd => (
                <th key={wd.date} style={{ padding: '10px 12px', textAlign: 'center', fontSize: 12, fontWeight: 700 }}>
                  {wd.dayLabel}<br />
                  <span style={{ fontWeight: 500, fontSize: 11, opacity: 0.7 }}>{wd.date.slice(5)}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {WORK_HOURS.map(hour => (
              <tr key={hour}>
                <td style={{ padding: '8px 12px', fontSize: 12, fontWeight: 600, color: 'var(--gray-500)', borderBottom: '1px solid var(--gray-100)' }}>
                  {WORK_HOUR_LABELS[hour]}
                </td>
                {weekDates.map((wd, dateIdx) => {
                  const busy = isBusy(dateIdx, hour);
                  return (
                    <td
                      key={wd.date + hour}
                      onClick={() => toggleSlot(dateIdx, hour)}
                      style={{
                        padding: 4, textAlign: 'center', cursor: 'pointer',
                        borderBottom: '1px solid var(--gray-100)',
                        background: busy ? '#FEE2E2' : '#F0FDF4',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.opacity = '0.7'}
                      onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                    >
                      {busy ? (
                        <span style={{ fontSize: 11, color: '#DC2626', fontWeight: 600 }}>Bận</span>
                      ) : (
                        <span style={{ fontSize: 11, color: '#16A34A', fontWeight: 500 }}>Rảnh</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={handleSave}
          style={{
            padding: '10px 32px', borderRadius: 8, border: 'none', cursor: 'pointer',
            fontSize: 14, fontWeight: 700, color: 'white', background: 'var(--isme-red)',
            transition: 'opacity 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >
          💾 Lưu lịch tuần tới
        </button>
      </div>
    </div>
  );
}

// ==================== TEAM SCHEDULE TAB ====================
function TeamScheduleTab({ nextMonday, weekDates }: { nextMonday: string; weekDates: { date: string; dayLabel: string }[] }) {
  const heatmap = getTeamAvailabilityHeatmap(nextMonday);
  const bestSlots = findBestMeetingSlots(nextMonday, 5);
  const updateStatus = getScheduleUpdateStatus();
  const [selectedSlot, setSelectedSlot] = useState<MeetingSlotInfo | null>(null);

  const getHeatColor = (busyCount: number, total: number) => {
    const ratio = busyCount / total;
    if (ratio <= 0.1) return '#DCFCE7';
    if (ratio <= 0.2) return '#BBF7D0';
    if (ratio <= 0.3) return '#FEF9C3';
    if (ratio <= 0.5) return '#FED7AA';
    if (ratio <= 0.7) return '#FECACA';
    return '#FCA5A5';
  };

  const getHeatTextColor = (busyCount: number, total: number) => {
    const ratio = busyCount / total;
    if (ratio <= 0.3) return '#166534';
    if (ratio <= 0.5) return '#92400E';
    return '#991B1B';
  };

  return (
    <div>
      {/* Update Status */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, color: 'var(--gray-700)' }}>Tình trạng cập nhật lịch</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {updateStatus.map(u => (
            <span
              key={u.userId}
              style={{
                padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                background: u.updated ? '#DCFCE7' : '#FEF3C7',
                color: u.updated ? '#166534' : '#92400E',
                border: u.updated ? '1px solid #BBF7D0' : '1px solid #FDE68A',
              }}
            >
              {u.updated ? '✅' : '⚠️'} {u.name}
            </span>
          ))}
        </div>
      </div>

      {/* Best Meeting Slots */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, color: 'var(--gray-700)' }}>
          <Star size={14} style={{ marginRight: 4, verticalAlign: -2, color: '#F59E0B' }} />
          Top khung giờ ít người bận nhất
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {bestSlots.map((slot, i) => (
            <button
              key={i}
              onClick={() => setSelectedSlot(slot)}
              style={{
                padding: '8px 16px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                background: i === 0 ? '#DCFCE7' : 'var(--gray-50)',
                border: i === 0 ? '2px solid #4ADE80' : '1px solid var(--gray-200)',
                color: 'var(--gray-700)',
              }}
            >
              {slot.dayLabel} {slot.hourLabel} — {slot.freeCount}/{slot.totalPeople} rảnh
              {i === 0 && <span style={{ marginLeft: 6, color: '#16A34A' }}>★ Tối ưu</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Heatmap */}
      <div className="card" style={{ padding: 0, overflow: 'auto' }}>
        <div style={{ padding: '16px 20px 8px', borderBottom: '1px solid var(--gray-100)' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--gray-800)' }}>Heatmap — Số người bận theo khung giờ</div>
          <div style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 2 }}>Click vào ô để xem chi tiết ai bận / ai rảnh</div>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
          <thead>
            <tr style={{ background: 'var(--gray-800)', color: 'white' }}>
              <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: 12, fontWeight: 700, width: 100 }}>Giờ</th>
              {weekDates.map(wd => (
                <th key={wd.date} style={{ padding: '10px 12px', textAlign: 'center', fontSize: 12, fontWeight: 700 }}>
                  {wd.dayLabel}<br />
                  <span style={{ fontWeight: 500, fontSize: 11, opacity: 0.7 }}>{wd.date.slice(5)}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {WORK_HOURS.map(hour => (
              <tr key={hour}>
                <td style={{ padding: '8px 12px', fontSize: 12, fontWeight: 600, color: 'var(--gray-500)', borderBottom: '1px solid var(--gray-100)' }}>
                  {WORK_HOUR_LABELS[hour]}
                </td>
                {weekDates.map(wd => {
                  const slot = heatmap.find(h => h.date === wd.date && h.hour === hour);
                  if (!slot) return <td key={wd.date + hour} />;
                  return (
                    <td
                      key={wd.date + hour}
                      onClick={() => setSelectedSlot(slot)}
                      style={{
                        padding: '6px 4px', textAlign: 'center', cursor: 'pointer',
                        borderBottom: '1px solid var(--gray-100)',
                        background: getHeatColor(slot.busyCount, slot.totalPeople),
                        transition: 'all 0.15s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.opacity = '0.7'}
                      onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                    >
                      <div style={{ fontSize: 16, fontWeight: 800, color: getHeatTextColor(slot.busyCount, slot.totalPeople) }}>
                        {slot.busyCount}
                      </div>
                      <div style={{ fontSize: 10, color: getHeatTextColor(slot.busyCount, slot.totalPeople), opacity: 0.7 }}>
                        /{slot.totalPeople}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      {selectedSlot && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setSelectedSlot(null)}>
          <div className="card" style={{ maxWidth: 400, width: '90%', maxHeight: '80vh', overflow: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--gray-800)' }}>{selectedSlot.dayLabel} — {selectedSlot.hourLabel}</div>
                <div style={{ fontSize: 12, color: 'var(--gray-400)' }}>{selectedSlot.freeCount} rảnh · {selectedSlot.busyCount} bận</div>
              </div>
              <button onClick={() => setSelectedSlot(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={18} color="var(--gray-400)" />
              </button>
            </div>

            {selectedSlot.freeUsers.length > 0 && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#16A34A', textTransform: 'uppercase', marginBottom: 6 }}>Rảnh ({selectedSlot.freeUsers.length})</div>
                {selectedSlot.freeUsers.map(name => (
                  <div key={name} style={{ padding: '4px 0', fontSize: 13, color: 'var(--gray-600)' }}>
                    <CheckCircle size={12} color="#16A34A" style={{ marginRight: 6, verticalAlign: -1 }} />{name}
                  </div>
                ))}
              </div>
            )}

            {selectedSlot.busyUsers.length > 0 && (
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#DC2626', textTransform: 'uppercase', marginBottom: 6 }}>Bận ({selectedSlot.busyUsers.length})</div>
                {selectedSlot.busyUsers.map(name => (
                  <div key={name} style={{ padding: '4px 0', fontSize: 13, color: 'var(--gray-600)' }}>
                    <AlertTriangle size={12} color="#DC2626" style={{ marginRight: 6, verticalAlign: -1 }} />{name}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
