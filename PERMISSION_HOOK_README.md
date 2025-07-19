# Permission Notification Hook for Claude Code

This hook system provides audio notifications when Claude Code requests permissions or user approval.

## Files Created

1. **`permission-notification-hook.sh`** - The main hook script
2. **`claude-settings.json`** - Local project configuration 
3. **`~/.config/claude-code/settings.json`** - Global user configuration

## Features

- **Sound Notifications**: Plays system sounds when permission requests are detected
- **Text-to-Speech**: Speaks "Permission request detected. Claude is asking for approval."
- **Desktop Notifications**: Shows macOS/Linux desktop notifications
- **Smart Detection**: Uses keyword matching to identify permission requests
- **Cross-Platform**: Works on macOS and Linux

## Setup Instructions

### Option 1: Project-Level Setup
```bash
# Copy the settings file to your Claude Code configuration
cp claude-settings.json ~/.config/claude-code/settings.json

# Or set the CLAUDE_SETTINGS environment variable
export CLAUDE_SETTINGS="$PWD/claude-settings.json"
```

### Option 2: Manual Configuration
Add this to your Claude Code settings file:
```json
{
  "hooks": {
    "user-prompt-submit-hook": "/path/to/permission-notification-hook.sh"
  }
}
```

## Configuration Options

Edit the hook script to customize:

- **`ENABLE_SOUND`**: Enable/disable sound notifications
- **`ENABLE_TTS`**: Enable/disable text-to-speech
- **`SOUND_TYPE`**: Choose "system", "custom", or "beep"
- **`VOICE`**: Set TTS voice (macOS only)

## How It Works

1. The hook monitors all input to Claude Code
2. When keywords like "permission", "allow", "grant" are detected
3. Or when phrases like "would you like to", "may I" are found
4. It triggers audio/visual notifications
5. The original input is passed through unchanged

## Testing

Test the hook manually:
```bash
echo "Claude is asking for permission to access files" | ./permission-notification-hook.sh
```

## Troubleshooting

- **No sound**: Check that your system has `afplay` (macOS) or `paplay`/`aplay` (Linux)
- **No TTS**: Ensure `say` (macOS) or `espeak`/`festival` (Linux) is installed
- **Hook not running**: Verify the hook path in settings.json is correct
- **Permissions**: Make sure the script is executable (`chmod +x`)

## Keywords Detected

The hook detects these permission-related keywords:
- permission, allow, deny, grant, authorize
- access, enable, disable, consent
- approve, reject, confirm
- Phrases: "would you like to", "do you want to", "shall i", "may i", "can i"

## Log File

Permission requests are logged to `~/.claude-permission-log` for debugging.