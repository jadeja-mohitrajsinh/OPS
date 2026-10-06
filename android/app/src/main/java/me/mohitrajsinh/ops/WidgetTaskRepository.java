package me.mohitrajsinh.ops;

import android.content.Context;
import android.webkit.CookieManager;
import org.json.JSONArray;
import org.json.JSONObject;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;

public final class WidgetTaskRepository {
  private static final String ORIGIN = "https://ops.mohitrajsinh.me";
  private WidgetTaskRepository() {}
  public static void complete(Context context, String taskId) {
    try {
      String cookie = CookieManager.getInstance().getCookie(ORIGIN);
      if (cookie == null || cookie.isEmpty()) throw new IllegalStateException("No OPS session");
      HttpURLConnection connection = (HttpURLConnection) new URL(ORIGIN + "/api/tasks/" + taskId).openConnection();
      connection.setRequestMethod("PUT"); connection.setRequestProperty("Content-Type", "application/json"); connection.setRequestProperty("Cookie", cookie); connection.setDoOutput(true);
      try (OutputStream stream = connection.getOutputStream()) { stream.write("{\"status\":\"DONE\"}".getBytes()); }
      if (connection.getResponseCode() < 200 || connection.getResponseCode() >= 300) throw new IllegalStateException("Task update failed");
      JSONArray tasks = new JSONArray(TasksWidgetStore.tasks(context));
      for (int i = 0; i < tasks.length(); i++) if (taskId.equals(tasks.getJSONObject(i).optString("id"))) tasks.getJSONObject(i).put("completed", true);
      TasksWidgetStore.save(context, tasks.toString());
    } catch (Exception error) {
      TasksWidgetStore.error(context, "Unable to update task\nTap to open OPS");
    }
    TasksWidgetProvider.refreshAll(context);
  }
}
