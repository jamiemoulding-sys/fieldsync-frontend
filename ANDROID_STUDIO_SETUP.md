# Android Studio Setup Instructions

## 🚀 Quick Start Guide

### 📁 Files to Copy:
1. **React Build:** Copy entire `build/` folder to `android/app/src/main/assets/`
2. **Keystore:** Copy `workforce-management-release.keystore` to `android/app/`
3. **Properties:** Copy `keystore.properties` to `android/app/`

### 🔧 Android Studio Steps:

#### 1. Create New Project
- File → New → New Project
- Empty Activity
- Package name: `com.yourcompany.workforce`
- Minimum SDK: API 24

#### 2. Copy Files
```
android/app/src/main/assets/build/     (from your React build)
android/app/workforce-management-release.keystore
android/app/keystore.properties
```

#### 3. Replace Files
- Replace `activity_main.xml` with provided layout
- Replace `MainActivity.java` with provided code
- Update `AndroidManifest.xml` with permissions
- Update `app/build.gradle` with signing config

#### 4. Build & Test
- Build → Build Bundle(s) → Build APK(s)
- Test on emulator or device
- Verify React app loads in WebView

#### 5. Sign & Upload
- Build → Generate Signed Bundle/AAB
- Use release keystore
- Upload to Google Play Console

### 🎯 Important Notes:
- **Internet permission** required for API calls
- **WebView settings** enable JavaScript
- **File path** uses `file:///android_asset/`
- **Signing config** uses your keystore

### 📱 Google Play Store Ready:
- ✅ WebView app wrapper
- ✅ React app embedded
- ✅ Proper signing configured
- ✅ Permissions set correctly

### 🔧 Troubleshooting:
- **Blank screen:** Check file paths in assets
- **JavaScript errors:** Ensure WebView settings
- **Network issues:** Verify internet permissions
- **Signing errors:** Check keystore file location
