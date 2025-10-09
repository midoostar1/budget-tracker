#!/bin/bash
#
# Build Development Client for Budget Tracker
# This builds an APK with all native modules enabled
#

set -e

echo "🔨 Building Budget Tracker Development Client"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Set Java 17
export JAVA_HOME="/Users/midoostar1/Library/Java/JavaVirtualMachines/corretto-17.0.5/Contents/Home"
export PATH="$JAVA_HOME/bin:$PATH"

echo "✅ Java Configuration:"
java -version
echo ""

# Update gradle.properties if not already set
if ! grep -q "org.gradle.java.home" android/gradle.properties 2>/dev/null; then
    echo "" >> android/gradle.properties
    echo "# Force Gradle to use Java 17" >> android/gradle.properties
    echo "org.gradle.java.home=$JAVA_HOME" >> android/gradle.properties
    echo "✅ Updated gradle.properties with Java 17"
else
    echo "✅ gradle.properties already configured"
fi

echo ""
echo "🔨 Starting Android build..."
echo "   This will take 5-10 minutes on first build"
echo ""
echo "   What this builds:"
echo "   • Google Sign-In (native OAuth)"
echo "   • Camera for receipt scanning"
echo "   • Push notifications"
echo "   • All native features"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Build
npx expo run:android --variant debug

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🎉 Build Complete!"
echo ""
echo "   The APK has been installed on your emulator."
echo "   The app should launch automatically."
echo ""
echo "   Test these features:"
echo "   • Tap 'Sign in with Google' (real OAuth!)"
echo "   • Add transactions (saves to production DB)"
echo "   • Scan receipts (camera works!)"
echo "   • Test all features"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
