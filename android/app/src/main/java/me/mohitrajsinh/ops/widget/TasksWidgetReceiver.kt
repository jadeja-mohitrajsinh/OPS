package me.mohitrajsinh.ops.widget

import android.content.Context
import android.appwidget.AppWidgetManager
import androidx.glance.appwidget.GlanceAppWidgetReceiver
import androidx.work.Constraints
import androidx.work.ExistingPeriodicWorkPolicy
import androidx.work.NetworkType
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkManager
import java.util.concurrent.TimeUnit
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
  override fun onDisabled(context: Context) { WorkManager.getInstance(context).cancelUniqueWork(SYNC_WORK); super.onDisabled(context) }

  private fun schedule(context: Context) {
    val request = PeriodicWorkRequestBuilder<WidgetSyncWorker>(15, TimeUnit.MINUTES)
      .setConstraints(Constraints.Builder().setRequiredNetworkType(NetworkType.CONNECTED).build()).build()
    WorkManager.getInstance(context).enqueueUniquePeriodicWork(SYNC_WORK, ExistingPeriodicWorkPolicy.UPDATE, request)
  }
  companion object { private const val SYNC_WORK = "ops-tasks-widget-sync" }
}
