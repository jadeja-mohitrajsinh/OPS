package me.mohitrajsinh.ops;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.view.View;
import android.widget.RemoteViews;
import org.json.JSONArray;
import org.json.JSONObject;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class TasksWidgetProvider extends AppWidgetProvider {
  private static final String ACTION_COMPLETE = "me.mohitrajsinh.ops.widget.COMPLETE";
  private static final ExecutorService WORKER = Executors.newSingleThreadExecutor();

  @Override public void onUpdate(Context context, AppWidgetManager manager, int[] ids) { for (int id : ids) update(context, id); }
  @Override public void onDeleted(Context context, int[] ids) { for (int id : ids) TasksWidgetStore.remove(context, id); }
  @Override public void onReceive(Context context, Intent intent) {
    super.onReceive(context, intent);
    if (ACTION_COMPLETE.equals(intent.getAction())) {
      String taskId = intent.getStringExtra("taskId");
      if (taskId != null) WORKER.execute(() -> WidgetTaskRepository.complete(context, taskId));
    }
  }

  public static void refreshAll(Context context) {
    AppWidgetManager manager = AppWidgetManager.getInstance(context);
    int[] ids = manager.getAppWidgetIds(new ComponentName(context, TasksWidgetProvider.class));
    for (int id : ids) update(context, id);
  }

  public static void update(Context context, int id) {
    RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_tasks);
    String filter = TasksWidgetStore.filter(context, id);
    views.setTextViewText(R.id.widget_filter, label(filter) + " ▼");
    views.setOnClickPendingIntent(R.id.widget_filter, filterIntent(context, id));
    views.setOnClickPendingIntent(R.id.widget_add, taskIntent(context, "new"));
    views.removeAllViews(R.id.widget_tasks_list);
    try {
      String cacheError = TasksWidgetStore.error(context);
      JSONArray tasks = new JSONArray(TasksWidgetStore.tasks(context));
      int shown = 0;
      int max = maxRows(AppWidgetManager.getInstance(context).getAppWidgetOptions(id).getInt(AppWidgetManager.OPTION_APPWIDGET_MAX_HEIGHT, 180));
      for (int i = 0; i < tasks.length() && shown < max; i++) {
        JSONObject task = tasks.getJSONObject(i);
        if (!matches(task, filter)) continue;
        RemoteViews row = new RemoteViews(context.getPackageName(), R.layout.widget_task_item);
        String idValue = task.optString("id");
        boolean done = task.optBoolean("completed");
        row.setTextViewText(R.id.widget_task_title, task.optString("title"));
        row.setTextViewText(R.id.widget_task_check, done ? "✓" : "○");
        row.setOnClickPendingIntent(R.id.widget_task_title, taskIntent(context, idValue));
        row.setOnClickPendingIntent(R.id.widget_task_check, completeIntent(context, idValue));
        views.addView(R.id.widget_tasks_list, row); shown++;
      }
      views.setViewVisibility(R.id.widget_status, shown == 0 || !cacheError.isEmpty() ? View.VISIBLE : View.GONE);
      views.setTextViewText(R.id.widget_status, !cacheError.isEmpty() ? cacheError : shown == 0 ? "No tasks here\nTap + to add one" : "");
      if (!cacheError.isEmpty()) views.setOnClickPendingIntent(R.id.widget_status, taskIntent(context, ""));
    } catch (Exception error) {
      views.setViewVisibility(R.id.widget_status, View.VISIBLE);
      views.setTextViewText(R.id.widget_status, "Unable to refresh tasks\nTap to open OPS");
      views.setOnClickPendingIntent(R.id.widget_status, taskIntent(context, ""));
    }
    AppWidgetManager.getInstance(context).updateAppWidget(id, views);
  }

  private static boolean matches(JSONObject task, String filter) {
    if (task.optBoolean("completed")) return false;
    String today = new SimpleDateFormat("yyyy-MM-dd", Locale.US).format(new Date());
    if ("today".equals(filter)) return task.optString("dueDate").startsWith(today);
    if ("upcoming".equals(filter)) return task.optString("dueDate").compareTo(today) >= 0;
    return true;
  }
  private static int maxRows(int height) { return Math.max(3, Math.min(12, (height - 72) / 48)); }
  private static String label(String filter) { return "today".equals(filter) ? "Today" : "upcoming".equals(filter) ? "Upcoming" : "All Tasks"; }
  private static PendingIntent taskIntent(Context context, String id) {
    Intent intent = new Intent(context, MainActivity.class).setAction(Intent.ACTION_VIEW).setData(Uri.parse("me.mohitrajsinh.ops://tasks/" + id)).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
    return PendingIntent.getActivity(context, id.hashCode(), intent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
  }
  private static PendingIntent filterIntent(Context context, int id) { return PendingIntent.getActivity(context, id, new Intent(context, TasksWidgetFilterActivity.class).putExtra("widgetId", id), PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE); }
  private static PendingIntent completeIntent(Context context, String id) { Intent intent = new Intent(context, TasksWidgetProvider.class).setAction(ACTION_COMPLETE).putExtra("taskId", id); return PendingIntent.getBroadcast(context, id.hashCode(), intent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE); }
}
