package me.mohitrajsinh.ops.widget

import androidx.glance.unit.ColorProvider
import me.mohitrajsinh.ops.R

/**
 * Resource-backed colours deliberately resolve from values/ and values-night/.
 * That lets RemoteViews redraw correctly when the launcher changes appearance,
 * rather than freezing the widget in the theme active when it was first added.
 */
object WidgetPalette {
  val surface = ColorProvider(R.color.widget_surface)
  val surfaceMuted = ColorProvider(R.color.widget_surface_muted)
  val text = ColorProvider(R.color.widget_text)
  val mutedText = ColorProvider(R.color.widget_text_muted)
  val accent = ColorProvider(R.color.widget_accent)
  val accentText = ColorProvider(R.color.widget_accent_text)
  val completed = ColorProvider(R.color.widget_completed_text)
}
