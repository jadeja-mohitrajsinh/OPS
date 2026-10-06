#!/usr/bin/env bash
set -e

script_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
project_root="$(cd -- "$script_dir/.." && pwd)"
cd "$project_root"

# Avoid a shared user-level Gradle lock when another Android build is running.
export GRADLE_USER_HOME="$project_root/.gradle-build"

echo "========================================="
echo "  🚀 OPS Android APK Build Pipeline     "
echo "========================================="

# 1. Sync Capacitor
echo "📦 Step 1/3: Syncing Capacitor Android assets..."
npx cap sync android

# 2. Build via Gradle
echo "⚙️  Step 2/3: Compiling APK via Gradle..."
cd android
./gradlew :app:assembleDebug --no-daemon
cd ..

# 3. Copy APK to root
echo "📋 Step 3/3: Packaging output..."
cp android/app/build/outputs/apk/debug/app-debug.apk ops-debug.apk

echo "========================================="
echo "  🎉 APK BUILD SUCCESSFUL!               "
echo "========================================="
echo "📁 Output: $(pwd)/ops-debug.apk"
echo "📲 To install: adb install -r ops-debug.apk"
