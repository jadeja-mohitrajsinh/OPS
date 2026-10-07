package me.mohitrajsinh.ops.widget

import android.app.Activity
import android.content.Context
import android.graphics.Color
import android.graphics.drawable.ColorDrawable
import android.graphics.drawable.GradientDrawable
import android.os.Bundle
import android.view.Gravity
import android.view.KeyEvent
import android.view.ViewGroup
import android.view.inputmethod.EditorInfo
import android.view.inputmethod.InputMethodManager
import android.widget.EditText
import android.widget.FrameLayout
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

class QuickAddTaskActivity : Activity() {
  private var saving = false

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    val density = resources.displayMetrics.density
    fun dp(value: Int) = (value * density).toInt()

    window.setBackgroundDrawable(ColorDrawable(Color.TRANSPARENT))
    window.setDimAmount(0f)
    window.setGravity(Gravity.CENTER)
    window.setLayout(dp(360), ViewGroup.LayoutParams.WRAP_CONTENT)
    setFinishOnTouchOutside(true)

    val input = EditText(this).apply {
      hint = "Type task..."
      setHintTextColor(Color.rgb(169, 175, 187))
      setTextColor(Color.WHITE)
      textSize = 17f
      isSingleLine = true
      imeOptions = EditorInfo.IME_ACTION_DONE
      setPadding(dp(18), dp(12), dp(18), dp(12))
      background = GradientDrawable().apply {
        setColor(Color.rgb(22, 27, 38))
        cornerRadius = dp(18).toFloat()
        setStroke(dp(1), Color.rgb(64, 75, 96))
      }
    }
    val root = FrameLayout(this).apply {
      setPadding(dp(18), dp(18), dp(18), dp(18))
      addView(input, FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT, Gravity.CENTER))
    }

    fun submit() {
      if (saving) return
      val taskTitle = input.text.toString().trim()
      if (taskTitle.isEmpty()) { input.error = "Enter a task"; return }
      saving = true
      input.isEnabled = false
      CoroutineScope(Dispatchers.Main).launch {
        if (WidgetTaskRepository.create(applicationContext, taskTitle)) {
          WidgetUpdates.refreshAll(applicationContext)
          finish()
        } else {
          saving = false
          input.isEnabled = true
          input.error = WidgetTaskCache.error(applicationContext).ifBlank { "Could not add task" }
          input.requestFocus()
        }
      }
    }

    input.setOnEditorActionListener { _, actionId, event ->
      if (actionId == EditorInfo.IME_ACTION_DONE || event?.keyCode == KeyEvent.KEYCODE_ENTER) {
        submit()
        true
      } else false
    }
    setContentView(root)
    input.post {
      input.requestFocus()
      (getSystemService(Context.INPUT_METHOD_SERVICE) as InputMethodManager).showSoftInput(input, InputMethodManager.SHOW_IMPLICIT)
    }
  }
}
