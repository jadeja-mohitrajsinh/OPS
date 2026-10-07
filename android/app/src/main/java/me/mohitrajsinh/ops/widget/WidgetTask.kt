package me.mohitrajsinh.ops.widget

import org.json.JSONObject

data class WidgetTask(
  val id: String,
  val title: String,
  val completed: Boolean,
  val dueDate: String,
  val area: String,
)

fun JSONObject.toWidgetTask() = WidgetTask(
  id = optString("id", optString("_id")),
  title = optString("title", optString("name")),
  completed = optBoolean("completed") || optString("status") in listOf("DONE", "CANCELLED"),
  dueDate = optString("dueDate", optString("deadline")),
  area = optString("area"),
)
