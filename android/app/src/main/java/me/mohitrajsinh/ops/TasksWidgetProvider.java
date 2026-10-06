package me.mohitrajsinh.ops;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.view.View;
import android.widget.RemoteViews;
import androidx.work.Constraints;
import androidx.work.ExistingPeriodicWorkPolicy;
import androidx.work.NetworkType;
import androidx.work.PeriodicWorkRequest;
import androidx.work.WorkManager;
import org.json.JSONArray;
import org.json.JSONObject;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

public class TasksWidgetProvider extends AppWidgetProvider {
  static final String ACTION_COMPLETE = "me.mohitrajsinh.ops.widget.COMPLETE";
  static final String ACTION_REFRESH = "me.mohitrajsinh.ops.widget.REFRESH";
  private static final String SYNC_WORK = "ops-tasks-widget-sync";
  private static final ExecutorService WORKER = Executors.newSingleThreadExecutor();

  @Override public void onEnabled(Context context) { scheduleSync(context); }
  @Override public void onDisabled(Context context) { WorkManager.getInstance(context).cancelUniqueWork(SYNC_WORK); }
  @Override public void onUpdate(Context context, AppWidgetManager manager, int[] ids) { for (int id : ids) update(context, id); requestSync(context); }
  @Override public void onDeleted(Context context, int[] ids) { for (int id : ids) TasksWidgetStore.remove(context, id); }
  @Override public void onReceive(Context context, Intent intent) {
    super.onReceive(context, intent);
    String action = intent.getAction();
    if (ACTION_COMPLETE.equals(action)) {
      String taskId = intent.getStringExtra("taskId");
      if (taskId != null) WORKER.execute(() -> { WidgetTaskRepository.complete(context, taskId); refreshAll(context); });
    } else if (ACTION_REFRESH.equals(action)) requestSync(context);
  }

  static void scheduleSync(Context context) {
    PeriodicWorkRequest request = new PeriodicWorkRequest.Builder(TasksWidgetSyncWorker.class, 15, TimeUnit.MINUTES)
      .setConstraints(new Constraints.Builder().setRequiredNetworkType(NetworkType.CONNECTED).build()).build();
    WorkManager.getInstance(context).enqueueUniquePeriodicWork(SYNC_WORK, ExistingPeriodicWorkPolicy.UPDATE, request);
  }
  static void requestSync(Context context) { WORKER.execute(() -> { WidgetTaskRepository.sync(context); refreshAll(context); }); }
  public static void refreshAll(Context context) {
    AppWidgetManager manager = AppWidgetManager.getInstance(context);
    for (int id : manager.getAppWidgetIds(new ComponentName(context, TasksWidgetProvider.class))) update(context, id);
  }
  public static void update(Context context, int id) {
    RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_tasks);
    String filter = TasksWidgetStore.filter(context, id);
    views.setTextViewText(R.id.widget_filter, label(filter) + " ▼");
    views.setOnClickPendingIntent(R.id.widget_filter, filterIntent(context, id));
    views.setOnClickPendingIntent(R.id.widget_refresh, refreshIntent(context, id));
    views.setOnClickPendingIntent(R.id.widget_add, addIntent(context, id));
    views.removeAllViews(R.id.widget_tasks_list);
    try {
      String cacheError = TasksWidgetStore.error(context);
      JSONArray tasks = new JSONArray(TasksWidgetStore.tasks(context));
      int shown = 0;
      int max = maxRows(AppWidgetManager.getInstance(context).getAppWidgetOptions(id).getInt(AppWidgetManager.OPTION_APPWIDGET_MAX_HEIGHT, 180));
      for (int i = 0; i < tasks.length() && shown < max; i++) {
        JSONObject task = tasks.getJSONObject(i); if (!matches(task, filter)) continue;
        RemoteViews row = new RemoteViews(context.getPackageName(), R.layout.widget_task_item);
        String idValue = task.optString("id"); boolean done = task.optBoolean("completed");
        row.setTextViewText(R.id.widget_task_title, task.optString("title"));
        row.setTextViewText(R.id.widget_task_check, done ? "✓" : "○");
        row.setOnClickPendingIntent(R.id.widget_task_check, completeIntent(context, idValue));
        views.addView(R.id.widget_tasks_list, row); shown++;
      }
      views.setViewVisibility(R.id.widget_status, shown == 0 || !cacheError.isEmpty() ? View.VISIBLE : View.GONE);
      views.setTextViewText(R.id.widget_status, !cacheError.isEmpty() ? cacheError : shown == 0 ? "No tasks here\nTap + to add one" : "");
    } catch (Exception error) { views.setViewVisibility(R.id.widget_status, View.VISIBLE); views.setTextViewText(R.id.widget_status, "Unable to show tasks"); }
    AppWidgetManager.getInstance(context).updateAppWidget(id, views);
  }
  private static boolean matches(JSONObject task, String filter) { if (task.optBoolean("completed")) return false; String today = new SimpleDateFormat("yyyy-MM-dd", Locale.US).format(new Date()); if ("today".equals(filter)) return task.optString("dueDate").startsWith(today); if ("upcoming".equals(filter)) return task.optString("dueDate").compareTo(today) >= 0; return true; }
  private static int maxRows(int height) { return Math.max(3, Math.min(12, (height - 72) / 48)); }
  private static String label(String filter) { return "today".equals(filter) ? "Today" : "upcoming".equals(filter) ? "Upcoming" : "All Tasks"; }
  private static PendingIntent filterIntent(Context context, int id) { return PendingIntent.getActivity(context, id, new Intent(context, TasksWidgetFilterActivity.class).putExtra("widgetId", id), PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE); }
  private static PendingIntent addIntent(Context context, int id) { return PendingIntent.getActivity(context, id, new Intent(context, WidgetAddTaskActivity.class), PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE); }
  private static PendingIntent refreshIntent(Context context, int id) { return PendingIntent.getBroadcast(context, id, new Intent(context, TasksWidgetProvider.class).setAction(ACTION_REFRESH), PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE); }
  private static PendingIntent completeIntent(Context context, String id) { return PendingIntent.getBroadcast(context, id.hashCode(), new Intent(context, TasksWidgetProvider.class).setAction(ACTION_COMPLETE).putExtra("taskId", id), PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE); }
}
