package me.mohitrajsinh.ops;

import com.getcapacitor.BridgeActivity;
import android.os.Bundle;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.webkit.CookieManager;
import android.webkit.WebView;

public class MainActivity extends BridgeActivity {
  @Override
  public void onCreate(Bundle savedInstanceState) {
    registerPlugin(NativeGoogleSignInPlugin.class);
    registerPlugin(OpsWidgetPlugin.class);
    super.onCreate(savedInstanceState);
    CookieManager.getInstance().setAcceptCookie(true);
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP && getBridge() != null && getBridge().getWebView() != null) {
      CookieManager.getInstance().setAcceptThirdPartyCookies(getBridge().getWebView(), true);
    }
    openWidgetDestination(getIntent());
  }

  @Override public void onNewIntent(Intent intent) { super.onNewIntent(intent); openWidgetDestination(intent); }

  private void openWidgetDestination(Intent intent) {
    Uri uri = intent == null ? null : intent.getData();
    if (uri == null || !"me.mohitrajsinh.ops".equals(uri.getScheme())) return;
    if ("login".equals(uri.getHost())) {
      if (getBridge() != null && getBridge().getWebView() != null) getBridge().getWebView().loadUrl("https://ops.mohitrajsinh.me/login");
      return;
    }
    if (!"tasks".equals(uri.getHost())) return;
    String taskId = uri.getLastPathSegment();
    String destination = "new".equals(taskId) ? "https://ops.mohitrajsinh.me/tasks?add=1" : "https://ops.mohitrajsinh.me/tasks?taskId=" + Uri.encode(taskId == null ? "" : taskId);
    if (getBridge() != null && getBridge().getWebView() != null) getBridge().getWebView().loadUrl(destination);
  }
}
