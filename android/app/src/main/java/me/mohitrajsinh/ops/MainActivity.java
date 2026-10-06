package me.mohitrajsinh.ops;

import com.getcapacitor.BridgeActivity;
import android.os.Bundle;
import android.content.Intent;
import android.net.Uri;

public class MainActivity extends BridgeActivity {
  @Override
  public void onCreate(Bundle savedInstanceState) {
    registerPlugin(NativeGoogleSignInPlugin.class);
    registerPlugin(TasksWidgetPlugin.class);
    super.onCreate(savedInstanceState);
    openWidgetDestination(getIntent());
  }

  @Override public void onNewIntent(Intent intent) { super.onNewIntent(intent); openWidgetDestination(intent); }

  private void openWidgetDestination(Intent intent) {
    Uri uri = intent == null ? null : intent.getData();
    if (uri == null || !"me.mohitrajsinh.ops".equals(uri.getScheme()) || !"tasks".equals(uri.getHost())) return;
    String taskId = uri.getLastPathSegment();
    String destination = "new".equals(taskId) ? "https://ops.mohitrajsinh.me/tasks?add=1" : "https://ops.mohitrajsinh.me/tasks?taskId=" + Uri.encode(taskId == null ? "" : taskId);
    if (getBridge() != null && getBridge().getWebView() != null) getBridge().getWebView().loadUrl(destination);
  }
}
