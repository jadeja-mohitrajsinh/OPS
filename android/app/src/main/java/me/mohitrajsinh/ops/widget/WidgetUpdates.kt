package me.mohitrajsinh.ops.widget

import android.content.Context
import androidx.glance.appwidget.updateAll
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

object WidgetUpdates {
  suspend fun refreshAll(context: Context) = withContext(Dispatchers.Default) { TasksWidget().updateAll(context) }
  suspend fun syncAndRefresh(context: Context) { WidgetTaskRepository.sync(context); refreshAll(context) }
}
