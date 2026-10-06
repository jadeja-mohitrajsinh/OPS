package me.mohitrajsinh.ops;

import android.content.Context;

public final class TasksWidgetStore {
  private static final String PREFS = "ops_tasks_widget";
  private static final String TASKS = "tasks";
  private static final String ERROR = "error";
  private static final String FILTER_PREFIX = "filter_";
  private TasksWidgetStore() {}
  public static void save(Context context, String tasks) { context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit().putString(TASKS, tasks).remove(ERROR).apply(); }
  public static String tasks(Context context) { return context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).getString(TASKS, "[]"); }
  public static String error(Context context) { return context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).getString(ERROR, ""); }
  public static void error(Context context, String message) { context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit().putString(ERROR, message).apply(); }
  public static String filter(Context context, int widgetId) { return context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).getString(FILTER_PREFIX + widgetId, "all"); }
  public static void filter(Context context, int widgetId, String filter) { context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit().putString(FILTER_PREFIX + widgetId, filter).apply(); }
  public static void remove(Context context, int widgetId) { context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit().remove(FILTER_PREFIX + widgetId).apply(); }
}
