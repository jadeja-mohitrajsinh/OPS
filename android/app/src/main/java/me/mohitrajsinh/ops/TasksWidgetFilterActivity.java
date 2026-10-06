package me.mohitrajsinh.ops;

import android.app.AlertDialog;
import android.app.Activity;
import android.os.Bundle;

public class TasksWidgetFilterActivity extends Activity {
  @Override public void onCreate(Bundle state) {
    super.onCreate(state);
    int widgetId = getIntent().getIntExtra("widgetId", -1);
    String[] labels = { "All Tasks", "Today", "Upcoming" };
    String[] values = { "all", "today", "upcoming" };
    new AlertDialog.Builder(this).setTitle("Widget list").setItems(labels, (dialog, which) -> {
      if (widgetId != -1) { TasksWidgetStore.filter(this, widgetId, values[which]); TasksWidgetProvider.update(this, widgetId); }
      finish();
    }).setOnCancelListener(dialog -> finish()).show();
  }
}
