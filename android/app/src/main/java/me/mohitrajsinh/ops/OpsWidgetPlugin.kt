package me.mohitrajsinh.ops

import com.getcapacitor.JSArray
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.annotation.CapacitorPlugin
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import me.mohitrajsinh.ops.widget.WidgetTaskCache
import me.mohitrajsinh.ops.widget.WidgetUpdates

@CapacitorPlugin(name = "OpsWidget")
class OpsWidgetPlugin : Plugin() {
  @com.getcapacitor.PluginMethod
  fun syncTasks(call: PluginCall) {
    val tasks: JSArray = call.getArray("tasks") ?: run { call.reject("tasks is required"); return }
    WidgetTaskCache.save(context, tasks.toString())
    CoroutineScope(Dispatchers.Default).launch { WidgetUpdates.refreshAll(context) }
    call.resolve()
  }

  @com.getcapacitor.PluginMethod
  fun refreshWidget(call: PluginCall) {
    CoroutineScope(Dispatchers.Default).launch { WidgetUpdates.syncAndRefresh(context) }
    call.resolve()
  }

  @com.getcapacitor.PluginMethod
  fun clearTasks(call: PluginCall) {
    WidgetTaskCache.clear(context)
    CoroutineScope(Dispatchers.Default).launch { WidgetUpdates.refreshAll(context) }
    call.resolve()
  }
}
