# OPS - Android APK Automated Build Pipeline
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  🚀 OPS Android APK Build Pipeline     " -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir
Set-Location $ProjectRoot

# 1. Locate Java JDK 17/21 (Android Studio JBR or installed JDK)
$JavaCandidates = @(
  "C:\Program Files\Android\Android Studio\jbr",
  "C:\Program Files\Java\jdk-21*",
  "C:\Program Files\Java\jdk-17*",
  "C:\Program Files\Eclipse Adoptium\jdk-21*",
  "C:\Program Files\Eclipse Adoptium\jdk-17*",
  $env:JAVA_HOME
)

$ResolvedJavaHome = $null
foreach ($cand in $JavaCandidates) {
  if ($cand) {
    $matches = Get-ChildItem -Path $cand -ErrorAction SilentlyContinue | Select-Object -ExpandProperty FullName
    foreach ($m in $matches) {
      if (Test-Path "$m\bin\java.exe") {
        $ResolvedJavaHome = $m
        break
      }
    }
    if ($ResolvedJavaHome) { break }
  }
}

if (-not $ResolvedJavaHome) {
  Write-Host "❌ Error: Could not locate a valid Java 17/21 installation." -ForegroundColor Red
  exit 1
}

$env:JAVA_HOME = $ResolvedJavaHome
Write-Host "✓ Using JAVA_HOME: $env:JAVA_HOME" -ForegroundColor Green

# 2. Check Android SDK
$SdkPath = "C:\Users\$env:USERNAME\AppData\Local\Android\Sdk"
if (-not (Test-Path $SdkPath)) {
  if ($env:ANDROID_HOME -and (Test-Path $env:ANDROID_HOME)) {
    $SdkPath = $env:ANDROID_HOME
  }
}

if (Test-Path $SdkPath) {
  $escapedSdk = $SdkPath -replace '\\', '\\'
  "sdk.dir=$escapedSdk" | Out-File -FilePath "$ProjectRoot\android\local.properties" -Encoding utf8
  Write-Host "✓ Configured Android SDK: $SdkPath" -ForegroundColor Green
} else {
  Write-Host "⚠️ Warning: Android SDK directory not found in default path." -ForegroundColor Yellow
}

# 3. Sync Capacitor Native Assets
Write-Host "`n📦 Step 1/3: Syncing Capacitor Android assets..." -ForegroundColor Yellow
npx cap sync android
if ($LASTEXITCODE -ne 0) {
  Write-Host "❌ Capacitor sync failed." -ForegroundColor Red
  exit 1
}
Write-Host "✓ Capacitor sync completed." -ForegroundColor Green

# 4. Build Android Debug APK with Gradle
Write-Host "`n⚙️  Step 2/3: Compiling APK via Gradle..." -ForegroundColor Yellow
Set-Location "$ProjectRoot\android"
.\gradlew.bat :app:assembleDebug
if ($LASTEXITCODE -ne 0) {
  Write-Host "❌ Gradle compilation failed." -ForegroundColor Red
  Set-Location $ProjectRoot
  exit 1
}
Set-Location $ProjectRoot
Write-Host "✓ Gradle build completed successfully." -ForegroundColor Green

# 5. Copy and Output Binary
Write-Host "`n📋 Step 3/3: Packaging and verifying APK..." -ForegroundColor Yellow
$GradleApk = "$ProjectRoot\android\app\build\outputs\apk\debug\app-debug.apk"
$DestApk = "$ProjectRoot\ops-debug.apk"

if (Test-Path $GradleApk) {
  Copy-Item $GradleApk $DestApk -Force
  $item = Get-Item $DestApk
  $sizeMb = [math]::Round($item.Length / 1MB, 2)
  Write-Host "`n=========================================" -ForegroundColor Green
  Write-Host "  🎉 APK BUILD SUCCESSFUL!               " -ForegroundColor Green
  Write-Host "=========================================" -ForegroundColor Green
  Write-Host "📁 Output: $DestApk ($sizeMb MB)" -ForegroundColor Cyan
  Write-Host "📲 To install on connected device:" -ForegroundColor White
  Write-Host "   adb install -r ops-debug.apk`n" -ForegroundColor Yellow
} else {
  Write-Host "❌ Error: Output APK not found at $GradleApk" -ForegroundColor Red
  exit 1
}
