package me.mohitrajsinh.ops.widget

import android.app.Activity
import android.graphics.Color
import android.graphics.drawable.GradientDrawable
import android.os.Bundle
import android.view.Gravity
import android.view.ViewGroup
import android.widget.LinearLayout
import android.widget.TextView
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.glance.appwidget.GlanceAppWidgetManager
import androidx.glance.appwidget.state.updateAppWidgetState
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

class WidgetListPickerActivity : Activity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    val appWidgetId = intent.getIntExtra(EXTRA_APP_WIDGET_ID, -1)
    if (appWidgetId == -1) { finish(); return }
    val density = resources.displayMetrics.density
    fun dp(value: Int) = (value * density).toInt()
    fun background(color: Int, radius: Int) = GradientDrawable().apply {
      setColor(color); cornerRadius = dp(radius).toFloat()
    }
    val dark = resources.configuration.uiMode and android.content.res.Configuration.UI_MODE_NIGHT_MASK == android.content.res.Configuration.UI_MODE_NIGHT_YES
    val surface = if (dark) Color.rgb(25, 25, 25) else Color.WHITE
    val text = if (dark) Color.rgb(247, 244, 242) else Color.rgb(29, 27, 26)
    val root = LinearLayout(this).apply {
      orientation = LinearLayout.VERTICAL; setPadding(dp(10), dp(10), dp(10), dp(10))
      background = background(surface, 20)
    }
    WidgetTaskCache.availableLists(this).forEach { list ->
      root.addView(TextView(this).apply {
        this.text = list.label; textSize = 16f; setTextColor(text); gravity = Gravity.CENTER_VERTICAL
        setPadding(dp(18), 0, dp(18), 0)
        setOnClickListener {
          CoroutineScope(Dispatchers.Main).launch {
            val glanceId = GlanceAppWidgetManager(applicationContext).getGlanceIdBy(appWidgetId)
            updateAppWidgetState(applicationContext, glanceId) { state -> state[FilterKey] = list.id }
            TasksWidget().update(applicationContext, glanceId)
            finish()
          }
        }
      }, LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, dp(50)))
    }
    setContentView(root)
    window.setLayout(dp(300), ViewGroup.LayoutParams.WRAP_CONTENT)
  }

  companion object { const val EXTRA_APP_WIDGET_ID = "app_widget_id" }
}
