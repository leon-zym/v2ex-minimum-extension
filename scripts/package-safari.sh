#!/bin/bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
PROJECT_NAME="V2EX Minimum Extension"
OUTPUT_DIR="$ROOT_DIR/.output/safari-xcode-project"
BUNDLE_ID="com.V2EX-Minimum-Extension"

rm -rf "$OUTPUT_DIR"

# Step 1: Build Safari extension
pnpm wxt build --browser safari

# Step 2: Convert to Xcode project
xcrun safari-web-extension-packager \
  --project-location "$OUTPUT_DIR" \
  --app-name "$PROJECT_NAME" \
  --bundle-identifier "$BUNDLE_ID" \
  --macos-only \
  --no-open \
  --no-prompt \
  --force \
  --copy-resources \
  "$ROOT_DIR/.output/safari-mv2"

# Step 3: Inject sandbox entitlements (required for Safari to recognize the extension)
APP_ENTITLEMENTS="$OUTPUT_DIR/app.entitlements"
EXT_ENTITLEMENTS="$OUTPUT_DIR/extension.entitlements"

cat > "$APP_ENTITLEMENTS" <<'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>com.apple.security.app-sandbox</key>
    <true/>
</dict>
</plist>
EOF

cat > "$EXT_ENTITLEMENTS" <<'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>com.apple.security.app-sandbox</key>
    <true/>
    <key>com.apple.security.network.client</key>
    <true/>
</dict>
</plist>
EOF

# Step 4: Build with xcodebuild
xcodebuild \
  -project "$OUTPUT_DIR/$PROJECT_NAME/$PROJECT_NAME.xcodeproj" \
  -scheme "$PROJECT_NAME" \
  -configuration Release \
  CODE_SIGN_IDENTITY=- \
  CODE_SIGNING_REQUIRED=NO \
  CODE_SIGNING_ALLOWED=NO \
  -derivedDataPath "$OUTPUT_DIR/DerivedData" \
  build

# Step 5: Re-sign with ad-hoc and entitlements
APP_PATH="$OUTPUT_DIR/DerivedData/Build/Products/Release/$PROJECT_NAME.app"
APPEX_PATH="$APP_PATH/Contents/PlugIns/$PROJECT_NAME Extension.appex"
codesign --force --sign - --entitlements "$EXT_ENTITLEMENTS" "$APPEX_PATH"
codesign --force --sign - --entitlements "$APP_ENTITLEMENTS" "$APP_PATH"
