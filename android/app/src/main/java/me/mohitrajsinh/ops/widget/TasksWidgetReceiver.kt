package me.mohitrajsinh.ops.widget

import android.content.Context
import android.appwidget.AppWidgetManager
import androidx.glance.appwidget.GlanceAppWidgetReceiver
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

class TasksWidgetReceiver : GlanceAppWidgetReceiver() {
  override val glanceAppWidget = TasksWidget()
  override fun onEnabled(context: Context) { super.onEnabled(context); schedule(context) }
  override fun onUpdate(context: Context, appWidgetManager: AppWidgetManager, appWidgetIds: IntArray) {
    super.onUpdate(context, appWidgetManager, appWidgetIds)
    CoroutineScope(Dispatchers.IO).launch { WidgetUpdates.syncAndRefresh(context) }
  }
  override fun onDisabled(context: Context) { WidgetSyncWork.cancel(context); super.onDisabled(context) }

  private fun schedule(context: Context) = WidgetSyncWork.schedulePeriodic(context)
}
