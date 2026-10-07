package me.mohitrajsinh.ops.widget

import android.content.Context
import androidx.work.CoroutineWorker
import androidx.work.Constraints
import androidx.work.ExistingPeriodicWorkPolicy
import androidx.work.ExistingWorkPolicy
import androidx.work.NetworkType
import androidx.work.OneTimeWorkRequestBuilder
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkerParameters
import androidx.work.WorkManager
import java.util.concurrent.TimeUnit

class WidgetSyncWorker(context: Context, parameters: WorkerParameters) : CoroutineWorker(context, parameters) {
  override suspend fun doWork(): Result {
    val synced = WidgetTaskRepository.sync(applicationContext)
    WidgetUpdates.refreshAll(applicationContext)
    return when {
      synced -> Result.success()
      WidgetTaskCache.error(applicationContext).startsWith("Sign in") -> Result.success()
      else -> Result.retry()
    }
  }
}

object WidgetSyncWork {
  private const val PERIODIC_SYNC = "ops-tasks-widget-periodic-sync"
  private const val IMMEDIATE_SYNC = "ops-tasks-widget-immediate-sync"
  private val network = Constraints.Builder().setRequiredNetworkType(NetworkType.CONNECTED).build()

  fun schedulePeriodic(context: Context) {
    val request = PeriodicWorkRequestBuilder<WidgetSyncWorker>(15, TimeUnit.MINUTES)
      .setConstraints(network)
      .build()
    WorkManager.getInstance(context).enqueueUniquePeriodicWork(PERIODIC_SYNC, ExistingPeriodicWorkPolicy.UPDATE, request)
  }

  fun enqueueNow(context: Context) {
    val request = OneTimeWorkRequestBuilder<WidgetSyncWorker>().setConstraints(network).build()
    WorkManager.getInstance(context).enqueueUniqueWork(IMMEDIATE_SYNC, ExistingWorkPolicy.KEEP, request)
  }

  fun cancel(context: Context) {
    WorkManager.getInstance(context).cancelUniqueWork(PERIODIC_SYNC)
    WorkManager.getInstance(context).cancelUniqueWork(IMMEDIATE_SYNC)
  }
}
