package me.mohitrajsinh.ops;

import android.app.Activity;
import android.app.AlertDialog;
import android.os.Bundle;
import android.text.InputType;
import android.view.inputmethod.InputMethodManager;
import android.content.Context;
import android.widget.EditText;
import android.widget.LinearLayout;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/** A small native composer, so adding a task never needs to open the OPS WebView. */
public class WidgetAddTaskActivity extends Activity {
  private final ExecutorService worker = Executors.newSingleThreadExecutor();

  @Override public void onCreate(Bundle state) {
    super.onCreate(state);
    EditText input = new EditText(this);
    input.setHint("What needs to be done?"); input.setSingleLine(true); input.setInputType(InputType.TYPE_CLASS_TEXT | InputType.TYPE_TEXT_FLAG_CAP_SENTENCES);
    int padding = (int) (24 * getResources().getDisplayMetrics().density);
    LinearLayout container = new LinearLayout(this);
    container.setPadding(padding, 0, padding, 0);
    container.addView(input, new LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT));
    new AlertDialog.Builder(this).setTitle("New task").setView(container)
      .setNegativeButton("Cancel", (dialog, which) -> finish())
      .setPositiveButton("Add", (dialog, which) -> add(input.getText().toString().trim())).setOnDismissListener(dialog -> finish()).show();
    input.requestFocus(); input.postDelayed(() -> ((InputMethodManager) getSystemService(Context.INPUT_METHOD_SERVICE)).showSoftInput(input, InputMethodManager.SHOW_IMPLICIT), 150);
  }

  private void add(String title) {
    if (title.isEmpty()) return;
    worker.execute(() -> { WidgetTaskRepository.create(getApplicationContext(), title); TasksWidgetProvider.refreshAll(getApplicationContext()); });
  }
}
