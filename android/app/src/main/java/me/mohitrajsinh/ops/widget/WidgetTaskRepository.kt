package me.mohitrajsinh.ops.widget

import android.content.Context
import android.webkit.CookieManager
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONArray
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL

object WidgetTaskRepository {
  private const val ORIGIN = "https://ops.mohitrajsinh.me"

  suspend fun sync(context: Context): Boolean = withContext(Dispatchers.IO) {
    try {
      flushPendingCompletions(context)
      val response = request("GET", "/api/tasks")
      if (!response.optBoolean("success")) error("Task sync failed")
      val tasks = response.optJSONArray("data") ?: JSONArray()
      val cache = JSONArray()
      for (index in 0 until tasks.length()) {
        val task = tasks.getJSONObject(index)
        cache.put(JSONObject().apply {
          put("id", task.optString("_id")); put("title", task.optString("name"))
          put("completed", task.optString("status") in listOf("DONE", "CANCELLED"))
          put("dueDate", task.optString("deadline")); put("area", task.optString("area"))
          put("starred", task.optBoolean("starred")); put("projectId", task.optString("project"))
          put("updatedAt", task.optString("updatedAt"))
        })
      }
      WidgetTaskCache.save(context, cache.toString())
      true
    } catch (error: Exception) { WidgetTaskCache.error(context, error.message ?: "Unable to sync tasks"); false }
  }

  fun toggle(context: Context, taskId: String) {
    val task = WidgetTaskCache.tasks(context).firstOrNull { it.id == taskId } ?: return
    WidgetTaskCache.setCompleted(context, taskId, !task.completed)
    WidgetSyncWork.enqueueNow(context)
  }

  suspend fun create(context: Context, title: String): Boolean = withContext(Dispatchers.IO) {
    try {
      request("POST", "/api/tasks", JSONObject().put("name", title).toString())
      sync(context)
    } catch (error: Exception) {
      WidgetTaskCache.error(context, error.message ?: "Unable to add task")
      false
    }
  }

  private fun flushPendingCompletions(context: Context) {
    WidgetTaskCache.pendingMutations(context).forEach { mutation ->
      request("PUT", "/api/tasks/${mutation.taskId}", JSONObject().put("status", mutation.status).toString())
      WidgetTaskCache.removePendingMutation(context, mutation.taskId)
    }
  }

  private fun request(method: String, path: String, body: String? = null): JSONObject {
    val cookie = CookieManager.getInstance().getCookie(ORIGIN)
      ?: error("Sign in to OPS to view your tasks")
    val connection = (URL(ORIGIN + path).openConnection() as HttpURLConnection).apply {
      requestMethod = method; connectTimeout = 15_000; readTimeout = 15_000
      setRequestProperty("Accept", "application/json"); setRequestProperty("Cookie", cookie)
      if (body != null) { doOutput = true; setRequestProperty("Content-Type", "application/json"); outputStream.use { it.write(body.toByteArray()) } }
    }
    val status = connection.responseCode
    val response = (if (status in 200..299) connection.inputStream else connection.errorStream)?.bufferedReader()?.use { it.readText() }.orEmpty()
    if (status !in 200..299) error(if (status == 401) "Sign in to OPS to view your tasks" else "OPS sync failed ($status)")
    return JSONObject(response)
  }
}
