package me.mohitrajsinh.ops;

import android.content.Context;
import androidx.annotation.NonNull;
import androidx.work.Worker;
import androidx.work.WorkerParameters;

/** Android runs this on a connected network at its battery-aware periodic cadence. */
public class TasksWidgetSyncWorker extends Worker {
  public TasksWidgetSyncWorker(@NonNull Context context, @NonNull WorkerParameters parameters) { super(context, parameters); }

  @NonNull @Override public Result doWork() {
    boolean synced = WidgetTaskRepository.sync(getApplicationContext());
    TasksWidgetProvider.refreshAll(getApplicationContext());
    return synced ? Result.success() : Result.retry();
  }
}
