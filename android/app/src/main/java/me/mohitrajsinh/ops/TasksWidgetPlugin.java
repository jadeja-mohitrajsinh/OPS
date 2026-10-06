package me.mohitrajsinh.ops;

import com.getcapacitor.JSArray;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "TasksWidget")
public class TasksWidgetPlugin extends Plugin {
  @PluginMethod
  public void sync(PluginCall call) {
    JSArray tasks = call.getArray("tasks");
    if (tasks == null) { call.reject("tasks is required"); return; }
    TasksWidgetStore.save(getContext(), tasks.toString());
    TasksWidgetProvider.refreshAll(getContext());
    call.resolve();
  }
}
