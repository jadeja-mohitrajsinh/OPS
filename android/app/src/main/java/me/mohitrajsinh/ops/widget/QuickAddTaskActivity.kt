package me.mohitrajsinh.ops.widget

import android.app.Activity
import android.graphics.Color
import android.graphics.drawable.GradientDrawable
import android.os.Bundle
import android.view.Gravity
import android.view.ViewGroup
import android.widget.Button
import android.widget.EditText
import android.widget.LinearLayout
import android.widget.TextView
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

class QuickAddTaskActivity : Activity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    val density = resources.displayMetrics.density
    fun dp(value: Int) = (value * density).toInt()
    val container = LinearLayout(this).apply {
      orientation = LinearLayout.VERTICAL
      setPadding(dp(24), dp(22), dp(24), dp(20))
      background = GradientDrawable().apply { setColor(Color.rgb(22, 27, 38)); cornerRadius = dp(24).toFloat() }
    }
    val title = TextView(this).apply { text = "New task"; textSize = 20f; setTextColor(Color.WHITE) }
    val input = EditText(this).apply {
      hint = "What needs to be done?"
      setHintTextColor(Color.rgb(169, 175, 187)); setTextColor(Color.WHITE)
      background = GradientDrawable().apply { setColor(Color.rgb(34, 42, 57)); cornerRadius = dp(12).toFloat() }
      setPadding(dp(14), dp(8), dp(14), dp(8)); isSingleLine = true
    }
    val actions = LinearLayout(this).apply { gravity = Gravity.END; orientation = LinearLayout.HORIZONTAL }
    val cancel = Button(this).apply { text = "Cancel"; setOnClickListener { finish() } }
    val save = Button(this).apply { text = "Add" }
    actions.addView(cancel); actions.addView(save)
    container.addView(title)
    container.addView(input, LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT).apply { topMargin = dp(14) })
    container.addView(actions, LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT).apply { topMargin = dp(12) })
    save.setOnClickListener {
      val taskTitle = input.text.toString().trim()
      if (taskTitle.isEmpty()) { input.error = "Enter a task"; return@setOnClickListener }
      save.isEnabled = false
      CoroutineScope(Dispatchers.Main).launch {
        if (WidgetTaskRepository.create(applicationContext, taskTitle)) {
          WidgetUpdates.refreshAll(applicationContext)
          finish()
        } else {
          save.isEnabled = true
          input.error = WidgetTaskCache.error(applicationContext).ifBlank { "Could not add task" }
        }
      }
    }
    setContentView(container)
    window.setLayout(dp(360), ViewGroup.LayoutParams.WRAP_CONTENT)
    input.requestFocus()
  }
}
