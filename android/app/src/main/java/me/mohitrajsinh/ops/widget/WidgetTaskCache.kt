package me.mohitrajsinh.ops.widget

import android.content.Context
import org.json.JSONArray

object WidgetTaskCache {
  private const val PREFS = "ops_widget_tasks"
  private const val TASKS = "tasks"
  private const val ERROR = "error"
  private const val PENDING_COMPLETIONS = "pending_completions"

  fun save(context: Context, tasks: String) = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit().putString(TASKS, tasks).remove(ERROR).apply()
  fun clear(context: Context) = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit().clear().apply()
  fun error(context: Context, message: String) = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit().putString(ERROR, message).apply()
  fun error(context: Context) = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).getString(ERROR, "") ?: ""
  fun tasks(context: Context): List<WidgetTask> = try {
    val source = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).getString(TASKS, "[]") ?: "[]"
    val array = JSONArray(source)
    List(array.length()) { array.getJSONObject(it).toWidgetTask() }
  } catch (_: Exception) { emptyList() }

  fun markCompleted(context: Context, taskId: String) {
    val prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
    val source = JSONArray(prefs.getString(TASKS, "[]") ?: "[]")
    for (index in 0 until source.length()) if (source.getJSONObject(index).optString("id") == taskId) source.getJSONObject(index).put("completed", true)
    val pending = JSONArray(prefs.getString(PENDING_COMPLETIONS, "[]") ?: "[]")
    if ((0 until pending.length()).none { pending.optString(it) == taskId }) pending.put(taskId)
    prefs.edit().putString(TASKS, source.toString()).putString(PENDING_COMPLETIONS, pending.toString()).remove(ERROR).apply()
  }

  fun pendingCompletions(context: Context): List<String> = try {
    val pending = JSONArray(context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).getString(PENDING_COMPLETIONS, "[]") ?: "[]")
    List(pending.length()) { pending.getString(it) }
  } catch (_: Exception) { emptyList() }

  fun removePendingCompletion(context: Context, taskId: String) {
    val remaining = JSONArray()
    pendingCompletions(context).filterNot { it == taskId }.forEach { remaining.put(it) }
    context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit().putString(PENDING_COMPLETIONS, remaining.toString()).apply()
  }
}
