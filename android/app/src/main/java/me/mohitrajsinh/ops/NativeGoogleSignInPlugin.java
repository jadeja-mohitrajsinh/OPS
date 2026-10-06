package me.mohitrajsinh.ops;

import android.os.CancellationSignal;

import androidx.credentials.Credential;
import androidx.credentials.CredentialManager;
import androidx.credentials.CredentialManagerCallback;
import androidx.credentials.CustomCredential;
import androidx.credentials.GetCredentialRequest;
import androidx.credentials.GetCredentialResponse;
import androidx.credentials.exceptions.GetCredentialException;
import androidx.credentials.exceptions.NoCredentialException;
import androidx.core.content.ContextCompat;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.google.android.libraries.identity.googleid.GetGoogleIdOption;
import com.google.android.libraries.identity.googleid.GoogleIdTokenCredential;

@CapacitorPlugin(name = "NativeGoogleSignIn")
public class NativeGoogleSignInPlugin extends Plugin {
  @PluginMethod
  public void signIn(PluginCall call) {
    String serverClientId = call.getString("serverClientId");
    if (serverClientId == null || serverClientId.trim().isEmpty()) {
      call.reject("Missing Google web client ID.");
      return;
    }
    if (getActivity() == null) {
      call.reject("Google Sign-In is not attached to an Android activity.");
      return;
    }
    requestCredential(call, serverClientId, true);
  }

  private void requestCredential(PluginCall call, String serverClientId, boolean authorizedAccountsOnly) {
    GetGoogleIdOption googleIdOption = new GetGoogleIdOption.Builder()
      .setFilterByAuthorizedAccounts(authorizedAccountsOnly)
      .setServerClientId(serverClientId)
      .setAutoSelectEnabled(false)
      .build();
    GetCredentialRequest request = new GetCredentialRequest.Builder()
      .addCredentialOption(googleIdOption)
      .build();

    CredentialManager credentialManager = CredentialManager.create(getContext());
    credentialManager.getCredentialAsync(
      getActivity(),
      request,
      new CancellationSignal(),
      ContextCompat.getMainExecutor(getContext()),
      new CredentialManagerCallback<GetCredentialResponse, GetCredentialException>() {
        @Override
        public void onResult(GetCredentialResponse response) {
          handleCredential(call, response.getCredential());
        }

        @Override
        public void onError(GetCredentialException error) {
          // First prefer accounts that previously authorized OPS. If none exist,
          // fall back to the device account picker so the user can switch/add one.
          if (authorizedAccountsOnly && error instanceof NoCredentialException) {
            requestCredential(call, serverClientId, false);
            return;
          }
          call.reject(error.getMessage() != null ? error.getMessage() : "Google Sign-In was cancelled or unavailable.");
        }
      }
    );
  }

  private void handleCredential(PluginCall call, Credential credential) {
    if (!(credential instanceof CustomCredential)) {
      call.reject("Google did not return a supported credential.");
      return;
    }
    CustomCredential customCredential = (CustomCredential) credential;
    if (!GoogleIdTokenCredential.TYPE_GOOGLE_ID_TOKEN_CREDENTIAL.equals(customCredential.getType())) {
      call.reject("Google did not return an ID token credential.");
      return;
    }
    try {
      GoogleIdTokenCredential googleCredential = GoogleIdTokenCredential.createFrom(customCredential.getData());
      JSObject result = new JSObject();
      result.put("idToken", googleCredential.getIdToken());
      result.put("email", googleCredential.getId());
      call.resolve(result);
    } catch (Exception error) {
      call.reject("Could not read the Google ID token.", error);
    }
  }
}
