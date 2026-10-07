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
import androidx.glance.appwidget.action.ActionCallback
import androidx.glance.appwidget.action.actionRunCallback
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
import androidx.glance.unit.ColorProvider
import androidx.glance.appwidget.cornerRadius
import androidx.glance.state.PreferencesGlanceStateDefinition
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import me.mohitrajsinh.ops.MainActivity

private val FilterKey = stringPreferencesKey("task_filter")
private val TaskIdKey = ActionParameters.Key<String>("task_id")

enum class WidgetFilter(val value: String, val label: String) {
  ALL("all", "All Tasks"), STARRED("starred", "Starred"), TODAY("today", "Today"), COLLEGE("college", "College"), PERSONAL("personal", "Personal");
  fun next() = entries[(ordinal + 1) % entries.size]
  companion object { fun from(value: String?) = entries.firstOrNull { it.value == value } ?: ALL }
}

class TasksWidget : GlanceAppWidget() {
  override val stateDefinition = PreferencesGlanceStateDefinition

  override suspend fun provideGlance(context: Context, id: GlanceId) {
    provideContent { WidgetContent() }
  }

  @Composable private fun WidgetContent() {
    val context = LocalContext.current
    val preferences = currentState<Preferences>()
    val filter = WidgetFilter.from(preferences[FilterKey])
    val size = LocalSize.current
    val compact = size.width < 140.dp || size.height < 92.dp
    val matchingTasks = WidgetTaskCache.tasks(context).filter { matches(it, filter) }.sortedBy { it.completed }
    val maxTasks = if (compact) 0 else maxOf(1, ((size.height.value - 66) / 48).toInt())
    val tasks = matchingTasks.take(if (compact) 1 else maxTasks)
    val error = WidgetTaskCache.error(context)

    Box(modifier = GlanceModifier.fillMaxSize().background(Color(0xFF161B26)).cornerRadius(28.dp).padding(18.dp)) {
      if (compact) CompactContent(context, tasks, error) else ExpandedContent(context, filter, tasks, error)
    }
  }

  @Composable private fun CompactContent(context: Context, tasks: List<WidgetTask>, error: String) {
    Column(modifier = GlanceModifier.fillMaxSize(), verticalAlignment = Alignment.Vertical.CenterVertically) {
      Row(modifier = GlanceModifier.fillMaxWidth(), verticalAlignment = Alignment.Vertical.CenterVertically) {
        Text("Tasks", style = TextStyle(color = ColorProvider(Color(0xFFF7F4F2)), fontWeight = FontWeight.Bold))
        Spacer(modifier = GlanceModifier.defaultWeight())
        AddButton(context)
      }
      Spacer(modifier = GlanceModifier.height(10.dp))
      if (error.isNotEmpty()) Text(error, style = TextStyle(color = ColorProvider(Color(0xFFA9AFBB))))
      else if (tasks.isEmpty()) Text("No tasks here", style = TextStyle(color = ColorProvider(Color(0xFFA9AFBB))))
      else TaskRow(context, tasks.first())
    }
  }

  @Composable private fun ExpandedContent(context: Context, filter: WidgetFilter, tasks: List<WidgetTask>, error: String) {
    Column(modifier = GlanceModifier.fillMaxSize()) {
      Row(modifier = GlanceModifier.fillMaxWidth(), verticalAlignment = Alignment.Vertical.CenterVertically) {
        Text("${filter.label} ▾", style = TextStyle(color = ColorProvider(Color(0xFFF7F4F2)), fontWeight = FontWeight.Bold), modifier = GlanceModifier.clickable(actionRunCallback<CycleFilterAction>()))
        Spacer(modifier = GlanceModifier.defaultWeight())
        AddButton(context)
      }
      Spacer(modifier = GlanceModifier.height(10.dp))
      if (error.isNotEmpty()) {
        Text(error, style = TextStyle(color = ColorProvider(Color(0xFFA9AFBB))), modifier = GlanceModifier.clickable(actionRunCallback<OpenLoginAction>()))
      } else if (tasks.isEmpty()) {
        Text("No tasks here", style = TextStyle(color = ColorProvider(Color(0xFFA9AFBB))))
      } else tasks.forEach { task -> TaskRow(context, task) }
    }
  }

  @Composable private fun AddButton(context: Context) {
    Box(modifier = GlanceModifier.background(Color(0xFF9DDBFF)).cornerRadius(16.dp).padding(horizontal = 14.dp, vertical = 8.dp).clickable(actionRunCallback<QuickAddTaskAction>()), contentAlignment = Alignment.Center) {
      Text("+", style = TextStyle(color = ColorProvider(Color(0xFF0B1722)), fontWeight = FontWeight.Bold))
    }
  }

  @Composable private fun TaskRow(context: Context, task: WidgetTask) {
    Row(modifier = GlanceModifier.fillMaxWidth().height(48.dp), verticalAlignment = Alignment.Vertical.CenterVertically) {
      Text(if (task.completed) "●" else "○", style = TextStyle(color = ColorProvider(if (task.completed) Color(0xFF9DDBFF) else Color(0xFFE5E7EB)), fontSize = 24.sp), modifier = GlanceModifier.width(34.dp).clickable(actionRunCallback<ToggleTaskAction>(actionParametersOf(TaskIdKey to task.id))))
      Text(task.title, maxLines = 1, style = TextStyle(color = ColorProvider(if (task.completed) Color(0xFFA9AFBB) else Color(0xFFF7F4F2))), modifier = GlanceModifier.defaultWeight().clickable(actionRunCallback<OpenTaskAction>(actionParametersOf(TaskIdKey to task.id))))
    }
  }

  private fun matches(task: WidgetTask, filter: WidgetFilter): Boolean = when (filter) {
    WidgetFilter.ALL -> true
    WidgetFilter.STARRED -> task.starred
    WidgetFilter.TODAY -> task.dueDate.startsWith(java.text.SimpleDateFormat("yyyy-MM-dd", java.util.Locale.US).format(java.util.Date()))
    WidgetFilter.COLLEGE -> task.area == "College"
    WidgetFilter.PERSONAL -> task.area == "Personal"
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

class CycleFilterAction : ActionCallback {
  override suspend fun onAction(context: Context, glanceId: GlanceId, parameters: ActionParameters) {
    updateAppWidgetState(context, glanceId) { preferences ->
      preferences[FilterKey] = WidgetFilter.from(preferences[FilterKey]).next().value
    }
    TasksWidget().update(context, glanceId)
  }
}
