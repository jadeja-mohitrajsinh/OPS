import { LocalNotifications } from '@capacitor/local-notifications';

let isInitialized = false;

export async function initializeNotifications() {
  if (isInitialized) return;
  
  try {
    const isCapacitor = typeof window !== 'undefined' && 'Capacitor' in window;
    if (isCapacitor) {
      const result = await LocalNotifications.requestPermissions();
      console.log('Notification permissions:', result);
      isInitialized = true;
    }
  } catch (error) {
    console.error('Failed to initialize notifications:', error);
  }
}

export async function requestNotificationPermission() {
  try {
    const result = await LocalNotifications.requestPermissions();
    return result.display === 'granted';
  } catch (error) {
    console.error('Failed to request notification permission:', error);
    return false;
  }
}

export async function checkNotificationPermission() {
  try {
    const result = await LocalNotifications.checkPermissions();
    return result.display === 'granted';
  } catch (error) {
    console.error('Failed to check notification permission:', error);
    return false;
  }
}

export async function scheduleTaskNotification(task) {
  if (!task.deadline) return;
  
  try {
    const deadline = new Date(task.deadline);
    const now = new Date();
    
    // Don't schedule if deadline is in the past
    if (deadline <= now) return;
    
    // Schedule notification at deadline
    const notificationId = Date.now();
    
    await LocalNotifications.schedule({
      notifications: [
        {
          id: notificationId,
          title: 'Task Due: ' + task.name,
          body: `Your task "${task.name}" is due now!`,
          schedule: { at: deadline },
          sound: 'beep.wav',
          smallIcon: 'ic_stat_ops',
          largeIcon: 'ic_launcher',
          extra: { taskId: task._id },
        },
      ],
    });
    
    // Also schedule reminder 1 hour before
    const reminderTime = new Date(deadline.getTime() - 60 * 60 * 1000);
    if (reminderTime > now) {
      await LocalNotifications.schedule({
        notifications: [
          {
            id: notificationId + 1,
            title: 'Task Reminder: ' + task.name,
            body: `Your task "${task.name}" is due in 1 hour`,
            schedule: { at: reminderTime },
            sound: 'beep.wav',
            smallIcon: 'ic_stat_ops',
            largeIcon: 'ic_launcher',
            extra: { taskId: task._id },
          },
        ],
      });
    }
    
    // Schedule reminder 1 day before
    const dayReminderTime = new Date(deadline.getTime() - 24 * 60 * 60 * 1000);
    if (dayReminderTime > now) {
      await LocalNotifications.schedule({
        notifications: [
          {
            id: notificationId + 2,
            title: 'Task Due Tomorrow: ' + task.name,
            body: `Your task "${task.name}" is due tomorrow`,
            schedule: { at: dayReminderTime },
            sound: 'beep.wav',
            smallIcon: 'ic_stat_ops',
            largeIcon: 'ic_launcher',
            extra: { taskId: task._id },
          },
        ],
      });
    }
    
    console.log('Scheduled notifications for task:', task.name);
  } catch (error) {
    console.error('Failed to schedule notification:', error);
  }
}

export async function cancelTaskNotifications(taskId) {
  try {
    // Cancel all notifications related to this task
    // Note: Capacitor doesn't have a direct way to cancel by extra data
    // You'll need to track notification IDs separately
    const pending = await LocalNotifications.getPending();
    const toCancel = pending.notifications.filter(n => n.extra?.taskId === taskId);
    
    for (const notification of toCancel) {
      await LocalNotifications.cancel({ notifications: [notification.id] });
    }
    
    console.log('Cancelled notifications for task:', taskId);
  } catch (error) {
    console.error('Failed to cancel notifications:', error);
  }
}

export async function cancelAllNotifications() {
  try {
    await LocalNotifications.cancel();
    console.log('Cancelled all notifications');
  } catch (error) {
    console.error('Failed to cancel all notifications:', error);
  }
}

export async function getPendingNotifications() {
  try {
    const result = await LocalNotifications.getPending();
    return result.notifications;
  } catch (error) {
    console.error('Failed to get pending notifications:', error);
    return [];
  }
}
