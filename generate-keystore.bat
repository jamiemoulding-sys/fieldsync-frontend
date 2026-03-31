@echo off
echo 🔐 Generating Release Keystore for Workforce Management App
echo ==========================================================

REM Variables
set KEYSTORE_NAME=workforce-management-release.keystore
set ALIAS=workforce-management
set VALIDITY=10000

REM Create keystore
keytool -genkeypair -v ^
  -storetype PKCS12 ^
  -keystore %KEYSTORE_NAME% ^
  -alias %ALIAS% ^
  -keyalg RSA ^
  -keysize 2048 ^
  -validity %VALIDITY% ^
  -dname "CN=Workforce Management, OU=Development, O=Your Company, L=Your City, ST=Your State, C=GB"

echo.
echo ✅ Keystore generated successfully!
echo 📁 File: %KEYSTORE_NAME%
echo 🔑 Alias: %ALIAS%
echo ⏰ Validity: %VALIDITY% days
echo.
echo 🚨 IMPORTANT: Save your keystore password and alias password securely!
echo 🚨 You will need these for every app update!
echo.
echo 📋 Next Steps:
echo 1. Copy the keystore to your Android project
echo 2. Add signing configuration to build.gradle
echo 3. Build signed APK/AAB for release
echo.
echo 🔐 Keystore Location: %cd%\%KEYSTORE_NAME%
pause
