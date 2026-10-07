package me.mohitrajsinh.ops.widget

import android.content.Context
import android.content.Intent
import android.net.Uri
import androidx.compose.runtime.Composable
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.glance.GlanceId
import androidx.glance.GlanceModifier
import androidx.glance.LocalContext
import androidx.glance.LocalSize
import androidx.glance.action.ActionParameters
import androidx.glance.action.actionParametersOf
import androidx.glance.appwidget.GlanceAppWidget
import androidx.glance.appwidget.AppWidgetId
import androidx.glance.appwidget.action.ActionCallback
import androidx.glance.appwidget.action.actionRunCallback
import androidx.glance.appwidget.lazy.LazyColumn
import androidx.glance.appwidget.lazy.items
import androidx.glance.appwidget.provideContent
import androidx.glance.appwidget.state.updateAppWidgetState
import androidx.glance.action.clickable
import androidx.glance.background
import androidx.glance.currentState
import androidx.glance.layout.Alignment
import androidx.glance.layout.Box
import androidx.glance.layout.Column
import androidx.glance.layout.Row
import androidx.glance.layout.Spacer
import androidx.glance.layout.fillMaxSize
import androidx.glance.layout.fillMaxWidth
import androidx.glance.layout.height
import androidx.glance.layout.padding
import androidx.glance.layout.width
import androidx.glance.text.FontWeight
import androidx.glance.text.Text
import androidx.glance.text.TextStyle
import androidx.glance.appwidget.cornerRadius
import androidx.glance.state.PreferencesGlanceStateDefinition
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import me.mohitrajsinh.ops.MainActivity

internal val FilterKey = stringPreferencesKey("task_filter")
private val TaskIdKey = ActionParameters.Key<String>("task_id")

class TasksWidget : GlanceAppWidget() {
  override val stateDefinition = PreferencesGlanceStateDefinition

  override suspend fun provideGlance(context: Context, id: GlanceId) {
    provideContent { WidgetContent() }
  }

  @Composable private fun WidgetContent() {
    val context = LocalContext.current
    val preferences = currentState<Preferences>()
    val filter = WidgetListFilter.resolve(preferences[FilterKey], WidgetTaskCache.availableLists(context))
    val size = LocalSize.current
    val compact = size.width < 140.dp || size.height < 92.dp
    val tasks = WidgetTaskCache.tasks(context).filter { filter.matches(it) }.sortedBy { it.completed }
    val error = WidgetTaskCache.error(context)

    Box(modifier = GlanceModifier.fillMaxSize().background(WidgetPalette.surface).cornerRadius(28.dp).padding(18.dp)) {
      if (compact) CompactContent(context, tasks, error) else ExpandedContent(context, filter, tasks, error)
    }
  }

  @Composable private fun CompactContent(context: Context, tasks: List<WidgetTask>, error: String) {
    Column(modifier = GlanceModifier.fillMaxSize(), verticalAlignment = Alignment.Vertical.CenterVertically) {
      Row(modifier = GlanceModifier.fillMaxWidth(), verticalAlignment = Alignment.Vertical.CenterVertically) {
        Text("Tasks", style = TextStyle(color = WidgetPalette.text, fontWeight = FontWeight.Bold))
        Spacer(modifier = GlanceModifier.defaultWeight())
        AddButton(context)
      }
      Spacer(modifier = GlanceModifier.height(10.dp))
      if (error.isNotEmpty()) Text(error, style = TextStyle(color = WidgetPalette.mutedText))
      else if (tasks.isEmpty()) Text("No tasks here", style = TextStyle(color = WidgetPalette.mutedText))
      else TaskRow(context, tasks.first())
    }
  }

  @Composable private fun ExpandedContent(context: Context, filter: WidgetListFilter, tasks: List<WidgetTask>, error: String) {
    Column(modifier = GlanceModifier.fillMaxSize()) {
      Row(modifier = GlanceModifier.fillMaxWidth(), verticalAlignment = Alignment.Vertical.CenterVertically) {
        Text("${filter.label} ▾", style = TextStyle(color = WidgetPalette.text, fontWeight = FontWeight.Bold), modifier = GlanceModifier.clickable(actionRunCallback<OpenListPickerAction>()))
        Spacer(modifier = GlanceModifier.defaultWeight())
        AddButton(context)
      }
      Spacer(modifier = GlanceModifier.height(10.dp))
      if (error.isNotEmpty()) {
        Text(error, style = TextStyle(color = WidgetPalette.mutedText), modifier = GlanceModifier.clickable(actionRunCallback<OpenLoginAction>()))
      } else if (tasks.isEmpty()) {
        Text("No tasks here", style = TextStyle(color = WidgetPalette.mutedText))
      } else {
        // LazyColumn is rendered as a native RemoteViews collection: the launcher
        // owns the scroll position while this list is independently scrollable.
        LazyColumn(modifier = GlanceModifier.fillMaxWidth().defaultWeight()) {
          items(tasks, itemId = { it.id.hashCode().toLong() }) { task -> TaskRow(context, task) }
        }
      }
    }
  }

  @Composable private fun AddButton(context: Context) {
    Box(modifier = GlanceModifier.background(WidgetPalette.accent).cornerRadius(16.dp).padding(horizontal = 14.dp, vertical = 8.dp).clickable(actionRunCallback<QuickAddTaskAction>()), contentAlignment = Alignment.Center) {
      Text("+", style = TextStyle(color = WidgetPalette.accentText, fontWeight = FontWeight.Bold))
    }
  }

  @Composable private fun TaskRow(context: Context, task: WidgetTask) {
    Row(modifier = GlanceModifier.fillMaxWidth().height(48.dp), verticalAlignment = Alignment.Vertical.CenterVertically) {
      Text(if (task.completed) "●" else "○", style = TextStyle(color = if (task.completed) WidgetPalette.completed else WidgetPalette.text, fontSize = 24.sp), modifier = GlanceModifier.width(34.dp).clickable(actionRunCallback<ToggleTaskAction>(actionParametersOf(TaskIdKey to task.id))))
      Text(task.title, maxLines = 1, style = TextStyle(color = if (task.completed) WidgetPalette.completed else WidgetPalette.text), modifier = GlanceModifier.defaultWeight().clickable(actionRunCallback<OpenTaskAction>(actionParametersOf(TaskIdKey to task.id))))
    }
  }
}

class ToggleTaskAction : ActionCallback {
  override suspend fun onAction(context: Context, glanceId: GlanceId, parameters: ActionParameters) {
    parameters[TaskIdKey]?.let { WidgetTaskRepository.toggle(context, it) }
    WidgetUpdates.refreshAll(context)
  }
}

class QuickAddTaskAction : ActionCallback {
  override suspend fun onAction(context: Context, glanceId: GlanceId, parameters: ActionParameters) {
    context.startActivity(
      Intent(context, QuickAddTaskActivity::class.java).addFlags(
        Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_MULTIPLE_TASK or Intent.FLAG_ACTIVITY_NO_HISTORY,
      ),
    )
  }
}

class OpenTaskAction : ActionCallback {
  override suspend fun onAction(context: Context, glanceId: GlanceId, parameters: ActionParameters) {
    val taskId = parameters[TaskIdKey] ?: return
    context.startActivity(Intent(context, MainActivity::class.java).setAction(Intent.ACTION_VIEW).setData(Uri.parse("me.mohitrajsinh.ops://tasks/$taskId")).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP))
  }
}

class OpenLoginAction : ActionCallback {
  override suspend fun onAction(context: Context, glanceId: GlanceId, parameters: ActionParameters) {
    context.startActivity(Intent(context, MainActivity::class.java).setAction(Intent.ACTION_VIEW).setData(Uri.parse("me.mohitrajsinh.ops://login")).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP))
  }
}

class OpenListPickerAction : ActionCallback {
  override suspend fun onAction(context: Context, glanceId: GlanceId, parameters: ActionParameters) {
    val appWidgetId = (glanceId as? AppWidgetId)?.appWidgetId ?: return
    context.startActivity(Intent(context, WidgetListPickerActivity::class.java).apply {
      putExtra(WidgetListPickerActivity.EXTRA_APP_WIDGET_ID, appWidgetId)
      addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_MULTIPLE_TASK or Intent.FLAG_ACTIVITY_NO_HISTORY)
    })
  }
}
