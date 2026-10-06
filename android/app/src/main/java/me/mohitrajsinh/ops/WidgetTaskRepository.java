package me.mohitrajsinh.ops;

import android.content.Context;
import android.webkit.CookieManager;
import org.json.JSONArray;
import org.json.JSONObject;
import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;

/** Talks directly to the authenticated OPS API so the widget is useful without a WebView. */
public final class WidgetTaskRepository {
  private static final String ORIGIN = "https://ops.mohitrajsinh.me";
  private WidgetTaskRepository() {}

  public static boolean sync(Context context) {
    try {
      JSONObject response = request("GET", "/api/tasks", null);
      if (!response.optBoolean("success")) throw new IllegalStateException("Task sync failed");
      JSONArray remoteTasks = response.optJSONArray("data");
      JSONArray widgetTasks = new JSONArray();
      if (remoteTasks != null) for (int i = 0; i < remoteTasks.length(); i++) {
        JSONObject task = remoteTasks.getJSONObject(i);
        JSONObject widgetTask = new JSONObject();
        widgetTask.put("id", task.optString("_id"));
        widgetTask.put("title", task.optString("name"));
        widgetTask.put("completed", "DONE".equals(task.optString("status")) || "CANCELLED".equals(task.optString("status")));
        widgetTask.put("dueDate", task.optString("deadline"));
        widgetTask.put("projectId", task.optString("project"));
        widgetTask.put("updatedAt", task.optString("updatedAt"));
        widgetTasks.put(widgetTask);
      }
      TasksWidgetStore.save(context, widgetTasks.toString());
      return true;
    } catch (Exception error) { TasksWidgetStore.error(context, friendlyError(error)); return false; }
  }

  public static boolean complete(Context context, String taskId) {
    try { request("PUT", "/api/tasks/" + taskId, new JSONObject().put("status", "DONE").toString()); sync(context); return true; }
    catch (Exception error) { TasksWidgetStore.error(context, friendlyError(error)); return false; }
  }

  public static boolean create(Context context, String title) {
    try { request("POST", "/api/tasks", new JSONObject().put("name", title).put("priority", "P1").put("status", "TODO").toString()); sync(context); return true; }
    catch (Exception error) { TasksWidgetStore.error(context, friendlyError(error)); return false; }
  }

  private static JSONObject request(String method, String path, String body) throws Exception {
    String cookie = CookieManager.getInstance().getCookie(ORIGIN);
    if (cookie == null || cookie.isEmpty()) throw new IllegalStateException("Sign in to OPS once to connect the widget");
    HttpURLConnection connection = (HttpURLConnection) new URL(ORIGIN + path).openConnection();
    connection.setRequestMethod(method); connection.setConnectTimeout(15000); connection.setReadTimeout(15000);
    connection.setRequestProperty("Accept", "application/json"); connection.setRequestProperty("Cookie", cookie);
    if (body != null) { connection.setRequestProperty("Content-Type", "application/json"); connection.setDoOutput(true); try (OutputStream stream = connection.getOutputStream()) { stream.write(body.getBytes(StandardCharsets.UTF_8)); } }
    int status = connection.getResponseCode();
    InputStream stream = status >= 200 && status < 300 ? connection.getInputStream() : connection.getErrorStream();
    String payload = stream == null ? "" : read(stream);
    if (status < 200 || status >= 300) throw new IllegalStateException(status == 401 ? "Sign in to OPS once to connect the widget" : "OPS sync failed (" + status + ")");
    return new JSONObject(payload);
  }

  private static String read(InputStream stream) throws Exception { StringBuilder text = new StringBuilder(); try (BufferedReader reader = new BufferedReader(new InputStreamReader(stream, StandardCharsets.UTF_8))) { String line; while ((line = reader.readLine()) != null) text.append(line); } return text.toString(); }
  private static String friendlyError(Exception error) { String message = error.getMessage(); return message == null || message.isEmpty() ? "Unable to sync tasks" : message; }
}
