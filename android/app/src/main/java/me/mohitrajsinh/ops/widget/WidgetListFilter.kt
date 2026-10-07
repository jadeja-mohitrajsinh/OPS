package me.mohitrajsinh.ops.widget

import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

data class WidgetListFilter(val id: String, val label: String) {
  fun matches(task: WidgetTask): Boolean = when {
    id == "all" -> true
    id == "starred" -> task.starred
    id == "today" -> task.dueDate.startsWith(SimpleDateFormat("yyyy-MM-dd", Locale.US).format(Date()))
    id.startsWith("project:") -> task.projectId == id.removePrefix("project:")
    id.startsWith("area:") -> task.area == id.removePrefix("area:")
    else -> true
  }

  companion object {
    fun resolve(id: String?, lists: List<WidgetListFilter>) =
      lists.firstOrNull { it.id == id } ?: lists.first()
  }
}
