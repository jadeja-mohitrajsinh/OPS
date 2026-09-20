# OPS - Android APK Automated Build Pipeline
# Encoding: ASCII-safe (no emoji to avoid PowerShell UTF-8 parse errors)
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  OPS Android APK Build Pipeline         " -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir
Set-Location $ProjectRoot

# 1. Locate Java JDK 17/21 (Android Studio JBR or installed JDK)
$JavaCandidates = @(
  "C:\Program Files\Android\Android Studio\jbr",
  "C:\Program Files\Java\jdk-21",
  "C:\Program Files\Java\jdk-17",
  "C:\Program Files\Eclipse Adoptium\jdk-21",
  "C:\Program Files\Eclipse Adoptium\jdk-17"
)
if ($env:JAVA_HOME) { $JavaCandidates += $env:JAVA_HOME }

$ResolvedJavaHome = $null

foreach ($cand in $JavaCandidates) {
  if (-not $cand) { continue }

  # Resolve glob patterns
  $expanded = Get-Item -Path $cand -ErrorAction SilentlyContinue
  if (-not $expanded) {
    # Try wildcard
    $expanded = Get-ChildItem -Path (Split-Path $cand -Parent) -Filter (Split-Path $cand -Leaf) -ErrorAction SilentlyContinue
  }

  foreach ($m in @($expanded)) {
    $javaExe = Join-Path $m.FullName "bin\java.exe"
    if (Test-Path $javaExe) {
      $ResolvedJavaHome = $m.FullName
      break
    }
  }
  if ($ResolvedJavaHome) { break }
}

if (-not $ResolvedJavaHome) {
  Write-Host "[ERROR] Could not locate a valid Java 17/21 installation." -ForegroundColor Red
  Write-Host "        Install Android Studio or JDK 17/21 and set JAVA_HOME." -ForegroundColor Red
  exit 1
}

$env:JAVA_HOME = $ResolvedJavaHome
Write-Host "[OK] Using JAVA_HOME: $env:JAVA_HOME" -ForegroundColor Green

# 2. Check Android SDK
$SdkPath = "C:\Users\$env:USERNAME\AppData\Local\Android\Sdk"
if (-not (Test-Path $SdkPath)) {
  if ($env:ANDROID_HOME -and (Test-Path $env:ANDROID_HOME)) {
    $SdkPath = $env:ANDROID_HOME
  }
}

if (Test-Path $SdkPath) {
  $escapedSdk = $SdkPath.Replace('\', '/')
  # Write WITHOUT BOM - Java Properties.load() cannot handle UTF-8 BOM
  $noBomUtf8 = [System.Text.UTF8Encoding]::new($false)
  [System.IO.File]::WriteAllText("$ProjectRoot\android\local.properties", "sdk.dir=$escapedSdk`n", $noBomUtf8)
  Write-Host "[OK] Configured Android SDK: $SdkPath" -ForegroundColor Green
} else {
  Write-Host "[WARN] Android SDK not found. Continuing anyway..." -ForegroundColor Yellow
}

# 3. Sync Capacitor Native Assets
Write-Host ""
Write-Host "[Step 1/3] Syncing Capacitor Android assets..." -ForegroundColor Yellow
npx cap sync android
if ($LASTEXITCODE -ne 0) {
  Write-Host "[ERROR] Capacitor sync failed." -ForegroundColor Red
  exit 1
}
Write-Host "[OK] Capacitor sync completed." -ForegroundColor Green

# 4. Build Android Debug APK with Gradle
Write-Host ""
Write-Host "[Step 2/3] Compiling APK via Gradle..." -ForegroundColor Yellow
Set-Location "$ProjectRoot\android"
.\gradlew.bat :app:assembleDebug
if ($LASTEXITCODE -ne 0) {
  Write-Host "[ERROR] Gradle compilation failed." -ForegroundColor Red
  Set-Location $ProjectRoot
  exit 1
}
Set-Location $ProjectRoot
Write-Host "[OK] Gradle build completed successfully." -ForegroundColor Green

# 5. Copy and Output Binary
Write-Host ""
Write-Host "[Step 3/3] Packaging and verifying APK..." -ForegroundColor Yellow
$GradleApk = "$ProjectRoot\android\app\build\outputs\apk\debug\app-debug.apk"
$DestApk   = "$ProjectRoot\ops-debug.apk"

if (Test-Path $GradleApk) {
  Copy-Item $GradleApk $DestApk -Force
  $sizeMb = [math]::Round((Get-Item $DestApk).Length / 1MB, 2)
  Write-Host ""
  Write-Host "=========================================" -ForegroundColor Green
  Write-Host "  APK BUILD SUCCESSFUL!                  " -ForegroundColor Green
  Write-Host "=========================================" -ForegroundColor Green
  Write-Host "[Output] $DestApk  ($sizeMb MB)" -ForegroundColor Cyan
  Write-Host ""
  Write-Host "To install on a connected device:" -ForegroundColor White
  Write-Host "  adb install -r ops-debug.apk" -ForegroundColor Yellow
  Write-Host ""
} else {
  Write-Host "[ERROR] Output APK not found at: $GradleApk" -ForegroundColor Red
  exit 1
}
