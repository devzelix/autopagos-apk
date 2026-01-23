# Add project specific ProGuard rules here.
# You can control the set of applied configuration files using the
# proguardFiles setting in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# If your project uses WebView with JS, uncomment the following
# and specify the fully qualified class name to the JavaScript interface
# class:
#-keepclassmembers class fqcn.of.javascript.interface.for.webview {
#   public *;
#}

# Uncomment this to preserve the line number information for
# debugging stack traces.
#-keepattributes SourceFile,LineNumberTable

# If you keep the line number information, uncomment this to
# hide the original source file name.
#-renamesourcefileattribute SourceFile

# Optimizaciones generales
-optimizationpasses 5
-dontusemixedcaseclassnames
-dontskipnonpubliclibraryclasses
-verbose

# Mantener clases de Capacitor
-keep class com.getcapacitor.** { *; }
-keep class com.capacitorjs.** { *; }

# Mantener clases de WebView
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Optimizar código
-optimizations !code/simplification/arithmetic,!code/simplification/cast,!field/*,!class/merging/*

# Remover logging
-assumenosideeffects class android.util.Log {
    public static *** d(...);
    public static *** v(...);
    public static *** i(...);
}
