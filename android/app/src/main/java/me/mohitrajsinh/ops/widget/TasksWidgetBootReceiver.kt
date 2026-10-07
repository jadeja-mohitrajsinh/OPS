package me.mohitrajsinh.ops.widget

import android.appwidget.AppWidgetManager
import android.content.BroadcastReceiver
import android.content.ComponentName
import android.content.Context
import android.content.Intent

class TasksWidgetBootReceiver : BroadcastReceiver() {
  override fun onReceive(context: Context, intent: Intent) {
    if (intent.action != Intent.ACTION_BOOT_COMPLETED) return
    val ids = AppWidgetManager.getInstance(context).getAppWidgetIds(ComponentName(context, TasksWidgetReceiver::class.java))
    if (ids.isNotEmpty()) {
      WidgetSyncWork.schedulePeriodic(context)
      WidgetSyncWork.enqueueNow(context)
    }
  }
}
