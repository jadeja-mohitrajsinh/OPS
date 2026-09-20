import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

const CHANNELS = {
  TIMELINE: {
    id: 'timeline_reminders',
    name: 'Timeline & Routine Transitions',
    description: 'Alerts when schedule blocks start, end, or transition to the next block.',
    importance: 5, // Max
    visibility: 1, // Public
    vibration: true,
  },
  MEETINGS: {
    id: 'meeting_reminders',
    name: 'Meeting Alerts',
    description: 'Upcoming meeting reminders 10m before and at start time.',
    importance: 5,
    visibility: 1,
    vibration: true,
  },
  TASKS: {
    id: 'task_reminders',
    name: 'Task & MIT Deadlines',
    description: 'Reminders for daily MITs, task deadlines and focus routines.',
    importance: 4,
    visibility: 1,
    vibration: true,
  },
};

let channelsCreated = false;

/**
 * Initialize Android notification channels
 */
export async function initializeNotificationChannels() {
  if (!Capacitor.isNativePlatform()) return;
  if (channelsCreated) return;

  try {
    for (const ch of Object.values(CHANNELS)) {
      await LocalNotifications.createChannel(ch);
    }
    channelsCreated = true;
  } catch (err) {
    console.warn('Failed to create notification channels:', err);
  }
}

/**
 * Check permission status
 * Returns: 'granted' | 'denied' | 'prompt' | 'unsupported'
 */
export async function checkNotificationPermission() {
  if (Capacitor.isNativePlatform()) {
    try {
      const status = await LocalNotifications.checkPermissions();
      return status.display; // 'granted' | 'denied' | 'prompt'
    } catch (err) {
      console.warn('Error checking native permissions:', err);
      return 'denied';
    }
  }

  // Web fallback
  if (typeof window !== 'undefined' && 'Notification' in window) {
    return Notification.permission; // 'granted' | 'denied' | 'default'
  }

  return 'unsupported';
}

/**
 * Request notification permission from user
 */
export async function requestNotificationPermission() {
  if (Capacitor.isNativePlatform()) {
    try {
      await initializeNotificationChannels();
      const result = await LocalNotifications.requestPermissions();
      return result.display === 'granted';
    } catch (err) {
      console.error('Error requesting native notification permission:', err);
      return false;
    }
  }

  // Web fallback
  if (typeof window !== 'undefined' && 'Notification' in window) {
    try {
      const res = await Notification.requestPermission();
      return res === 'granted';
    } catch (err) {
      console.error('Error requesting web notification permission:', err);
      return false;
    }
  }

  return false;
}

/**
 * Helper to generate numeric 32-bit integer IDs for LocalNotifications
 */
function createNotificationId(prefixStr) {
  let hash = 0;
  for (let i = 0; i < prefixStr.length; i++) {
    const char = prefixStr.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash % 2147483647);
}

/**
 * Parses time string 'HH:mm' to today's Date object
 */
function parseTimeToToday(timeStr) {
  if (!timeStr) return null;
  const [hStr, mStr] = timeStr.split(':');
  const d = new Date();
  d.setHours(parseInt(hStr, 10), parseInt(mStr, 10), 0, 0);
  return d;
}

/**
 * Schedule a single notification (Native Capacitor or Web Timer Fallback)
 */
export async function scheduleNotification({ id, title, body, scheduleAt, channelId = 'timeline_reminders', extra = {} }) {
  const targetDate = new Date(scheduleAt);
  const now = new Date();

  // If in the past, skip
  if (targetDate <= now) {
    return null;
  }

  if (Capacitor.isNativePlatform()) {
    await initializeNotificationChannels();
    const numId = typeof id === 'number' ? id : createNotificationId(String(id));

    const notificationOptions = {
      notifications: [
        {
          id: numId,
          title,
          body,
          schedule: { at: targetDate, allowWhileIdle: true },
          channelId,
          smallIcon: 'ic_stat_ops',
          iconColor: '#6d28d9',
          sound: 'beep.wav',
          extra,
        },
      ],
    };

    await LocalNotifications.schedule(notificationOptions);
    return { id: numId, title, body, scheduleAt: targetDate.toISOString(), channelId };
  }

  // Web Fallback: Schedule timer if running in foreground browser tab
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    const delay = targetDate.getTime() - now.getTime();
    const timerId = setTimeout(() => {
      try {
        new Notification(title, {
          body,
          icon: '/favicon.ico',
          tag: String(id),
        });
      } catch (err) {
        console.warn('Web notification trigger error:', err);
      }
    }, delay);

    return { id, title, body, scheduleAt: targetDate.toISOString(), channelId, timerId };
  }

  return { id, title, body, scheduleAt: targetDate.toISOString(), channelId };
}

/**
 * Cancel all active / pending notifications
 */
export async function cancelAllReminders() {
  if (Capacitor.isNativePlatform()) {
    try {
      const pending = await LocalNotifications.getPending();
      if (pending.notifications && pending.notifications.length > 0) {
        await LocalNotifications.cancel({ notifications: pending.notifications });
      }
    } catch (err) {
      console.warn('Error cancelling native notifications:', err);
    }
  }

  if (typeof window !== 'undefined') {
    localStorage.removeItem('ops_scheduled_reminders_v1');
  }
}

/**
 * Send an immediate test notification to verify setup
 */
export async function sendTestNotification() {
  const perm = await checkNotificationPermission();
  if (perm !== 'granted') {
    const granted = await requestNotificationPermission();
    if (!granted) {
      throw new Error('Notification permission not granted');
    }
  }

  const now = new Date();
  const testId = createNotificationId(`test_${now.getTime()}`);

  if (Capacitor.isNativePlatform()) {
    await initializeNotificationChannels();
    await LocalNotifications.schedule({
      notifications: [
        {
          id: testId,
          title: '⚡ OPS Reminder Engine Active',
          body: 'Android notification service is connected to your daily timeline & meetings!',
          schedule: { at: new Date(Date.now() + 1000), allowWhileIdle: true },
          channelId: CHANNELS.TIMELINE.id,
          smallIcon: 'ic_stat_ops',
          iconColor: '#6d28d9',
        },
      ],
    });
    return true;
  }

  // Web fallback
  if (typeof window !== 'undefined' && 'Notification' in window) {
    new Notification('⚡ OPS Reminder Engine Active', {
      body: 'Web & Android reminder service is running and ready!',
      icon: '/favicon.ico',
    });
    return true;
  }

  return false;
}

/**
 * Synchronize and schedule all of today's reminders:
 * 1. Timeline block start warnings (5 mins before)
 * 2. Timeline block start alerts with assigned task MITs
 * 3. Timeline block transition / ending alerts (5 mins before end ➔ Next up)
 * 4. Upcoming meeting alerts (10 mins before & at start)
 * 5. P0/P1 Task deadlines
 */
export async function syncAllTodayReminders({
  schedule = [],
  tasks = [],
  blockAssignments = {},
  meetings = [],
  settings = {
    notifyBlockStart: true,
    notifyBlockPre: true,
    notifyBlockEnd: true,
    notifyMeetings: true,
    notifyTasks: true,
  },
}) {
  const perm = await checkNotificationPermission();
  if (perm !== 'granted') return { success: false, reason: 'permission_needed', count: 0 };

  // Cancel prior scheduled notifications to prevent duplication
  await cancelAllReminders();

  const scheduledList = [];
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  // 1. TIMELINE BLOCKS & TRANSITIONS
  if (Array.isArray(schedule) && schedule.length > 0) {
    // Sort blocks chronologically
    const sortedBlocks = [...schedule].sort((a, b) => a.time.localeCompare(b.time));

    for (let i = 0; i < sortedBlocks.length; i++) {
      const block = sortedBlocks[i];
      const nextBlock = sortedBlocks[i + 1] || null;

      const startTime = parseTimeToToday(block.time);
      if (!startTime) continue;

      // Find tasks assigned to this block
      const assignedTaskIds = blockAssignments[block.id] || [];
      const assignedTasks = tasks.filter(t => assignedTaskIds.includes(t._id));
      const taskSummary = assignedTasks.length > 0
        ? `Focus: ${assignedTasks.map(t => t.name).slice(0, 2).join(', ')}${assignedTasks.length > 2 ? ` (+${assignedTasks.length - 2} more)` : ''}`
        : 'Deep focus session';

      // (A) 5-minute Pre-Start Warning
      if (settings.notifyBlockPre) {
        const preStart = new Date(startTime.getTime() - 5 * 60 * 1000);
        if (preStart > now) {
          const item = await scheduleNotification({
            id: `block_pre_${todayStr}_${block.id}`,
            title: `⏳ Starting in 5 min: ${block.label}`,
            body: taskSummary,
            scheduleAt: preStart,
            channelId: CHANNELS.TIMELINE.id,
            extra: { type: 'timeline_pre', blockId: block.id },
          });
          if (item) scheduledList.push(item);
        }
      }

      // (B) Exact Block Start Alert
      if (settings.notifyBlockStart) {
        if (startTime > now) {
          const item = await scheduleNotification({
            id: `block_start_${todayStr}_${block.id}`,
            title: `🎯 ${block.label} Started`,
            body: taskSummary,
            scheduleAt: startTime,
            channelId: CHANNELS.TIMELINE.id,
            extra: { type: 'timeline_start', blockId: block.id },
          });
          if (item) scheduledList.push(item);
        }
      }

      // (C) Block End / Transition Alert (if next block exists or estimated 1 hr block)
      if (settings.notifyBlockEnd) {
        let endTime = nextBlock ? parseTimeToToday(nextBlock.time) : new Date(startTime.getTime() + 60 * 60 * 1000);
        if (endTime) {
          // 5 mins before block end
          const transitionAlertTime = new Date(endTime.getTime() - 5 * 60 * 1000);
          if (transitionAlertTime > now) {
            const nextLabel = nextBlock ? nextBlock.label : 'Daily Wrap-up';
            const nextTimeStr = nextBlock ? `at ${nextBlock.time}` : 'soon';

            const item = await scheduleNotification({
              id: `block_end_${todayStr}_${block.id}`,
              title: `⏰ Wrap up: ${block.label}`,
              body: `Ending in 5m. Next up: ${nextLabel} (${nextTimeStr}).`,
              scheduleAt: transitionAlertTime,
              channelId: CHANNELS.TIMELINE.id,
              extra: { type: 'timeline_end', blockId: block.id, nextBlockId: nextBlock?.id },
            });
            if (item) scheduledList.push(item);
          }
        }
      }
    }
  }

  // 2. MEETINGS REMINDERS
  if (settings.notifyMeetings && Array.isArray(meetings)) {
    for (const meeting of meetings) {
      if (!meeting.startTime) continue;
      const meetingStart = parseTimeToToday(meeting.startTime);
      if (!meetingStart) continue;

      const peopleStr = meeting.people?.length > 0 ? ` with ${meeting.people.join(', ')}` : '';
      const linkStr = meeting.meetingLink ? ` | Link: ${meeting.meetingLink}` : '';

      // (A) 10-min Pre-meeting Warning
      const preMeeting = new Date(meetingStart.getTime() - 10 * 60 * 1000);
      if (preMeeting > now) {
        const item = await scheduleNotification({
          id: `meet_pre_${todayStr}_${meeting._id}`,
          title: `📅 Meeting in 10 mins: ${meeting.title}`,
          body: `${meeting.startTime}${peopleStr}${linkStr}`,
          scheduleAt: preMeeting,
          channelId: CHANNELS.MEETINGS.id,
          extra: { type: 'meeting_pre', meetingId: meeting._id, link: meeting.meetingLink },
        });
        if (item) scheduledList.push(item);
      }

      // (B) Meeting Start Alert
      if (meetingStart > now) {
        const item = await scheduleNotification({
          id: `meet_start_${todayStr}_${meeting._id}`,
          title: `🚨 Meeting starting now: ${meeting.title}`,
          body: `Join now: ${meeting.startTime}${peopleStr}`,
          scheduleAt: meetingStart,
          channelId: CHANNELS.MEETINGS.id,
          extra: { type: 'meeting_start', meetingId: meeting._id, link: meeting.meetingLink },
        });
        if (item) scheduledList.push(item);
      }
    }
  }

  // 3. HIGH PRIORITY TASKS DEADLINES
  if (settings.notifyTasks && Array.isArray(tasks)) {
    const urgentTasks = tasks.filter(t => t.priority === 'P0' || t.priority === 'P1');
    for (const task of urgentTasks) {
      if (task.deadline) {
        const deadlineDate = new Date(task.deadline);
        const warningTime = new Date(deadlineDate.getTime() - 30 * 60 * 1000); // 30m before
        if (warningTime > now) {
          const item = await scheduleNotification({
            id: `task_due_${task._id}`,
            title: `🔥 [${task.priority}] Task Due Soon: ${task.name}`,
            body: `Deadline in 30 mins (${task.project ? `Project: ${task.project}` : task.area})`,
            scheduleAt: warningTime,
            channelId: CHANNELS.TASKS.id,
            extra: { type: 'task_deadline', taskId: task._id },
          });
          if (item) scheduledList.push(item);
        }
      }
    }
  }

  // Persist scheduled reminders list in localStorage for live UI inspection
  if (typeof window !== 'undefined') {
    localStorage.setItem('ops_scheduled_reminders_v1', JSON.stringify(scheduledList));
  }

  return { success: true, count: scheduledList.length, reminders: scheduledList };
}

/**
 * Get currently stored scheduled reminders
 */
export function getStoredScheduledReminders() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('ops_scheduled_reminders_v1');
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}
