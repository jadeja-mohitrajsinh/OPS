package me.mohitrajsinh.ops.widget

import androidx.compose.ui.graphics.Color
import androidx.glance.unit.ColorProvider

/** OPS redline palette shared by the native widget and its quick-add sheet. */
object WidgetPalette {
  val surface = ColorProvider(Color(0xFF111111))
  val surfaceMuted = ColorProvider(Color(0xFF191919))
  val text = ColorProvider(Color(0xFFF7F4F2))
  val mutedText = ColorProvider(Color(0xFFAAA5A3))
  val accent = ColorProvider(Color(0xFFFF3B30))
  val accentText = ColorProvider(Color(0xFFFFFFFF))
  val completed = ColorProvider(Color(0xFF77736E))
}
