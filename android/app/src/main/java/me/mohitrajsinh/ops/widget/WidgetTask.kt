package me.mohitrajsinh.ops.widget

import org.json.JSONObject

data class WidgetTask(
  val id: String,
  val title: String,
  val completed: Boolean,
  val starred: Boolean,
  val dueDate: String,
  val area: String,
  val projectId: String,
  val updatedAt: String,
)

fun JSONObject.toWidgetTask() = WidgetTask(
  id = optString("id", optString("_id")),
  title = optString("title", optString("name")),
  completed = optBoolean("completed") || optString("status") in listOf("DONE", "CANCELLED"),
  starred = optBoolean("starred"),
  dueDate = optString("dueDate", optString("deadline")),
  area = optString("area"),
  projectId = optString("projectId", optString("project")),
  updatedAt = optString("updatedAt"),
)
