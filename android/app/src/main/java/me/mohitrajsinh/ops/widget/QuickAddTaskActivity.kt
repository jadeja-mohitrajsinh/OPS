package me.mohitrajsinh.ops.widget

import android.app.Activity
import android.app.DatePickerDialog
import android.content.Context
import android.graphics.Color
import android.graphics.drawable.ColorDrawable
import android.graphics.drawable.GradientDrawable
import android.os.Bundle
import android.view.Gravity
import android.view.KeyEvent
import android.view.View
import android.view.ViewGroup
import android.view.inputmethod.EditorInfo
import android.view.inputmethod.InputMethodManager
import android.widget.ArrayAdapter
import android.widget.Button
import android.widget.EditText
import android.widget.FrameLayout
import android.widget.LinearLayout
import android.widget.Spinner
import android.widget.TextView
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Locale

class QuickAddTaskActivity : Activity() {
  private var saving = false

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    val density = resources.displayMetrics.density
    fun dp(value: Int) = (value * density).toInt()
    fun darkRound(color: Int, radius: Int = 16) = GradientDrawable().apply {
      setColor(color); cornerRadius = dp(radius).toFloat()
    }
    fun control(text: String) = Button(this).apply {
      this.text = text; isAllCaps = false; textSize = 13f
      setTextColor(Color.rgb(247, 244, 242)); background = darkRound(Color.rgb(25, 25, 25), 14)
      minHeight = 0; minimumHeight = dp(38); setPadding(dp(10), 0, dp(10), 0)
    }

    window.setBackgroundDrawable(ColorDrawable(Color.TRANSPARENT))
    window.setGravity(Gravity.BOTTOM)
    window.setSoftInputMode(android.view.WindowManager.LayoutParams.SOFT_INPUT_STATE_ALWAYS_VISIBLE or android.view.WindowManager.LayoutParams.SOFT_INPUT_ADJUST_RESIZE)
    window.setLayout(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT)
    setFinishOnTouchOutside(true)

    val root = FrameLayout(this).apply { setPadding(dp(12), 0, dp(12), dp(12)) }
    val sheet = LinearLayout(this).apply {
      orientation = LinearLayout.VERTICAL
      setPadding(dp(20), dp(16), dp(20), dp(16))
      background = darkRound(Color.rgb(17, 17, 17), 26)
    }
    val listLabel = TextView(this).apply {
      text = "My Tasks ▾"; textSize = 14f; setTextColor(Color.rgb(169, 175, 187))
    }
    val titleInput = EditText(this).apply {
      hint = "New task"; setHintTextColor(Color.rgb(169, 175, 187)); setTextColor(Color.WHITE)
      textSize = 20f; isSingleLine = true; imeOptions = EditorInfo.IME_ACTION_DONE
      background = ColorDrawable(Color.TRANSPARENT); setPadding(0, dp(10), 0, dp(12))
    }
    val projects = listOf("My Tasks") + WidgetTaskCache.tasks(this).map { it.projectId }.filter { it.isNotBlank() }.distinct().sorted()
    val projectAdapter = object : ArrayAdapter<String>(this, android.R.layout.simple_spinner_item, projects) {
      override fun getView(position: Int, convertView: View?, parent: ViewGroup): View {
        return (super.getView(position, convertView, parent) as TextView).apply {
          setTextColor(Color.rgb(247, 244, 242)); textSize = 13f; setPadding(dp(12), 0, dp(8), 0)
        }
      }
      override fun getDropDownView(position: Int, convertView: View?, parent: ViewGroup): View {
        return (super.getDropDownView(position, convertView, parent) as TextView).apply {
          setTextColor(Color.rgb(247, 244, 242)); setBackgroundColor(Color.rgb(25, 25, 25)); setPadding(dp(14), dp(12), dp(14), dp(12))
        }
      }
    }
    val projectPicker = Spinner(this).apply {
      adapter = projectAdapter
      background = darkRound(Color.rgb(25, 25, 25), 14)
      setPopupBackgroundDrawable(darkRound(Color.rgb(25, 25, 25), 14))
      setSelection(0)
    }
    val detailsInput = EditText(this).apply {
      hint = "Details"; setHintTextColor(Color.rgb(169, 175, 187)); setTextColor(Color.WHITE)
      textSize = 15f; minLines = 2; visibility = View.GONE
      background = darkRound(Color.rgb(25, 25, 25), 14); setPadding(dp(12), dp(8), dp(12), dp(8))
    }
    val detailsButton = control("☰ Details")
    val dueButton = control("◷ Due")
    val starButton = control("☆")
    val saveButton = control("Save").apply {
      setTextColor(Color.WHITE); background = darkRound(Color.rgb(255, 59, 48), 14)
    }
    var starred = false
    var dueDate = ""
    val controls = LinearLayout(this).apply { gravity = Gravity.CENTER_VERTICAL; orientation = LinearLayout.HORIZONTAL }
    fun addControl(view: View, weight: Float = 0f) = controls.addView(view, LinearLayout.LayoutParams(0, dp(40), weight).apply { rightMargin = dp(8) })
    addControl(projectPicker, 1.2f); addControl(detailsButton, 1.1f); addControl(dueButton, 0.9f); addControl(starButton, 0.45f); addControl(saveButton, 0.85f)

    detailsButton.setOnClickListener {
      detailsInput.visibility = if (detailsInput.visibility == View.VISIBLE) View.GONE else View.VISIBLE
      detailsButton.text = if (detailsInput.visibility == View.VISIBLE) "☰ Hide" else "☰ Details"
    }
    dueButton.setOnClickListener {
      val calendar = Calendar.getInstance()
      DatePickerDialog(this, { _, year, month, day ->
        calendar.set(year, month, day, 0, 0, 0)
        dueDate = SimpleDateFormat("yyyy-MM-dd", Locale.US).format(calendar.time)
        dueButton.text = "◷ $dueDate"
      }, calendar.get(Calendar.YEAR), calendar.get(Calendar.MONTH), calendar.get(Calendar.DAY_OF_MONTH)).show()
    }
    starButton.setOnClickListener {
      starred = !starred
      starButton.text = if (starred) "★" else "☆"
      starButton.setTextColor(if (starred) Color.rgb(242, 184, 75) else Color.rgb(247, 244, 242))
    }

    fun submit() {
      if (saving) return
      val taskTitle = titleInput.text.toString().trim()
      if (taskTitle.isEmpty()) { titleInput.error = "Enter a task"; return }
      saving = true; titleInput.isEnabled = false; saveButton.isEnabled = false
      val project = projectPicker.selectedItem?.toString().orEmpty().takeUnless { it == "My Tasks" }.orEmpty()
      CoroutineScope(Dispatchers.Main).launch {
        if (WidgetTaskRepository.create(applicationContext, taskTitle, project, detailsInput.text.toString().trim(), dueDate, starred)) {
          WidgetUpdates.refreshAll(applicationContext)
          finish()
        } else {
          saving = false; titleInput.isEnabled = true; saveButton.isEnabled = true
          titleInput.error = WidgetTaskCache.error(applicationContext).ifBlank { "Could not add task" }
          titleInput.requestFocus()
        }
      }
    }
    titleInput.setOnEditorActionListener { _, actionId, event ->
      if (actionId == EditorInfo.IME_ACTION_DONE || event?.keyCode == KeyEvent.KEYCODE_ENTER) { submit(); true } else false
    }
    saveButton.setOnClickListener { submit() }

    sheet.addView(listLabel)
    sheet.addView(titleInput, LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT))
    sheet.addView(detailsInput, LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT).apply { bottomMargin = dp(10) })
    sheet.addView(controls, LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, dp(40)))
    root.addView(sheet, FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT, Gravity.BOTTOM))
    setContentView(root)
    titleInput.post {
      titleInput.requestFocus()
      (getSystemService(Context.INPUT_METHOD_SERVICE) as InputMethodManager).showSoftInput(titleInput, InputMethodManager.SHOW_IMPLICIT)
    }
  }
}
