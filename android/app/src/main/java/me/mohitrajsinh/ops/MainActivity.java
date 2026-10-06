package me.mohitrajsinh.ops;

import com.getcapacitor.BridgeActivity;
import android.os.Bundle;

public class MainActivity extends BridgeActivity {
  @Override
  public void onCreate(Bundle savedInstanceState) {
    registerPlugin(NativeGoogleSignInPlugin.class);
    super.onCreate(savedInstanceState);
  }
}
