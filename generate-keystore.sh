#!/bin/bash

# Release Keystore Generation Script
# Run this script to generate a release keystore for your Android app

echo "🔐 Generating Release Keystore for Workforce Management App"
echo "=========================================================="

# Variables
KEYSTORE_NAME="workforce-management-release.keystore"
ALIAS="workforce-management"
VALIDITY=10000  # 25+ years

# Create keystore
keytool -genkeypair -v \
  -storetype PKCS12 \
  -keystore $KEYSTORE_NAME \
  -alias $ALIAS \
  -keyalg RSA \
  -keysize 2048 \
  -validity $VALIDITY \
  -dname "CN=Workforce Management, OU=Development, O=Your Company, L=Your City, ST=Your State, C=GB"

echo ""
echo "✅ Keystore generated successfully!"
echo "📁 File: $KEYSTORE_NAME"
echo "🔑 Alias: $ALIAS"
echo "⏰ Validity: $VALIDITY days"
echo ""
echo "🚨 IMPORTANT: Save your keystore password and alias password securely!"
echo "🚨 You will need these for every app update!"
echo ""
echo "📋 Next Steps:"
echo "1. Copy the keystore to your Android project"
echo "2. Add signing configuration to build.gradle"
echo "3. Build signed APK/AAB for release"
echo ""
echo "🔐 Keystore Location: $(pwd)/$KEYSTORE_NAME"
