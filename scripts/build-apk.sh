#!/usr/bin/env bash
set -e

echo "========================================="
echo "  🚀 OPS Android APK Build Pipeline     "
echo "========================================="

# 1. Sync Capacitor
echo "📦 Step 1/3: Syncing Capacitor Android assets..."
npx cap sync android

# 2. Build via Gradle
echo "⚙️  Step 2/3: Compiling APK via Gradle..."
cd android
./gradlew :app:assembleDebug
cd ..

# 3. Copy APK to root
echo "📋 Step 3/3: Packaging output..."
cp android/app/build/outputs/apk/debug/app-debug.apk ops-debug.apk

echo "========================================="
echo "  🎉 APK BUILD SUCCESSFUL!               "
echo "========================================="
echo "📁 Output: $(pwd)/ops-debug.apk"
echo "📲 To install: adb install -r ops-debug.apk"
