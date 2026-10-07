package me.mohitrajsinh.ops.widget

import android.content.Context
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters

class WidgetSyncWorker(context: Context, parameters: WorkerParameters) : CoroutineWorker(context, parameters) {
  override suspend fun doWork(): Result {
    val synced = WidgetTaskRepository.sync(applicationContext)
    WidgetUpdates.refreshAll(applicationContext)
    return if (synced) Result.success() else Result.retry()
  }
}
