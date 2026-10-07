package me.mohitrajsinh.ops.widget

import android.content.Context
import org.json.JSONArray
import org.json.JSONObject

object WidgetTaskCache {
  private const val PREFS = "ops_widget_tasks"
  private const val TASKS = "tasks"
  private const val ERROR = "error"
  private const val PENDING_MUTATIONS = "pending_mutations"

  fun save(context: Context, tasks: String) = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit().putString(TASKS, tasks).remove(ERROR).apply()
  fun clear(context: Context) = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit().clear().apply()
  fun error(context: Context, message: String) = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit().putString(ERROR, message).apply()
  fun error(context: Context) = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).getString(ERROR, "") ?: ""
  fun tasks(context: Context): List<WidgetTask> = try {
    val source = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).getString(TASKS, "[]") ?: "[]"
    val array = JSONArray(source)
    List(array.length()) { array.getJSONObject(it).toWidgetTask() }
  } catch (_: Exception) { emptyList() }

  /** Smart lists plus the user's real project and area values from /api/tasks. */
  fun availableLists(context: Context): List<WidgetListFilter> {
    val tasks = tasks(context)
    val lists = mutableListOf(
      WidgetListFilter("all", "My Tasks"),
      WidgetListFilter("starred", "Starred"),
      WidgetListFilter("today", "Today"),
    )
    tasks.map { it.projectId.trim() }.filter { it.isNotEmpty() }.distinct().sorted().forEach {
      lists += WidgetListFilter("project:$it", it)
    }
    tasks.map { it.area.trim() }.filter { it.isNotEmpty() }.distinct().sorted().forEach {
      if (lists.none { list -> list.label.equals(it, ignoreCase = true) }) {
        lists += WidgetListFilter("area:$it", it)
      }
    }
    return lists
  }

  fun setCompleted(context: Context, taskId: String, completed: Boolean) {
    val prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
    val source = JSONArray(prefs.getString(TASKS, "[]") ?: "[]")
    for (index in 0 until source.length()) if (source.getJSONObject(index).optString("id") == taskId) source.getJSONObject(index).put("completed", completed)
    val pending = try { JSONObject(prefs.getString(PENDING_MUTATIONS, "{}") ?: "{}") } catch (_: Exception) { JSONObject() }
    pending.put(taskId, if (completed) "DONE" else "TODO")
    prefs.edit().putString(TASKS, source.toString()).putString(PENDING_MUTATIONS, pending.toString()).remove(ERROR).apply()
  }

  data class PendingMutation(val taskId: String, val status: String)

  fun pendingMutations(context: Context): List<PendingMutation> = try {
    val pending = JSONObject(context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).getString(PENDING_MUTATIONS, "{}") ?: "{}")
    pending.keys().asSequence().map { PendingMutation(it, pending.optString(it, "DONE")) }.toList()
  } catch (_: Exception) { emptyList() }

  fun removePendingMutation(context: Context, taskId: String) {
    val prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
    val pending = try { JSONObject(prefs.getString(PENDING_MUTATIONS, "{}") ?: "{}") } catch (_: Exception) { JSONObject() }
    pending.remove(taskId)
    prefs.edit().putString(PENDING_MUTATIONS, pending.toString()).apply()
  }
}
