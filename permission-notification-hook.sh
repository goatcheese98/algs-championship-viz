#!/bin/bash

# Permission Notification Hook for Claude Code
# This script plays a sound or speaks when a permission request is detected

# Configuration
ENABLE_SOUND=true
ENABLE_TTS=true
SOUND_TYPE="system"  # "system", "custom", or "beep"
VOICE="System Voice"  # Voice for text-to-speech (macOS)

# Function to play notification sound
play_notification_sound() {
    if [ "$ENABLE_SOUND" = true ]; then
        case "$SOUND_TYPE" in
            "system")
                # Use system notification sound (macOS)
                if command -v afplay >/dev/null 2>&1; then
                    afplay /System/Library/Sounds/Glass.aiff 2>/dev/null &
                elif command -v paplay >/dev/null 2>&1; then
                    # Linux with PulseAudio
                    paplay /usr/share/sounds/alsa/Front_Left.wav 2>/dev/null &
                elif command -v aplay >/dev/null 2>&1; then
                    # Linux with ALSA
                    aplay /usr/share/sounds/alsa/Front_Left.wav 2>/dev/null &
                fi
                ;;
            "custom")
                # Generate custom beep pattern using speaker
                if command -v speaker-test >/dev/null 2>&1; then
                    timeout 0.5 speaker-test -t sine -f 800 -l 1 2>/dev/null &
                elif command -v beep >/dev/null 2>&1; then
                    beep -f 800 -l 200 2>/dev/null &
                fi
                ;;
            "beep")
                # Simple terminal beep
                echo -e "\a"
                ;;
        esac
    fi
}

# Function to speak notification
speak_notification() {
    local message="$1"
    
    if [ "$ENABLE_TTS" = true ]; then
        if command -v say >/dev/null 2>&1; then
            # macOS text-to-speech
            say -v "$VOICE" "$message" 2>/dev/null &
        elif command -v espeak >/dev/null 2>&1; then
            # Linux espeak
            espeak "$message" 2>/dev/null &
        elif command -v spd-say >/dev/null 2>&1; then
            # Linux speech-dispatcher
            spd-say "$message" 2>/dev/null &
        elif command -v festival >/dev/null 2>&1; then
            # Linux festival
            echo "$message" | festival --tts 2>/dev/null &
        fi
    fi
}

# Function to detect permission requests in input
detect_permission_request() {
    local input="$1"
    
    # Keywords that indicate permission requests
    local permission_keywords=(
        "permission"
        "allow"
        "deny"
        "grant"
        "authorize"
        "access"
        "enable"
        "disable"
        "consent"
        "approve"
        "reject"
        "confirm"
    )
    
    # Convert input to lowercase for case-insensitive matching
    local lower_input=$(echo "$input" | tr '[:upper:]' '[:lower:]')
    
    # Check for permission-related keywords
    for keyword in "${permission_keywords[@]}"; do
        if echo "$lower_input" | grep -q "$keyword"; then
            return 0  # Permission request detected
        fi
    done
    
    # Check for specific Claude Code permission patterns
    if echo "$lower_input" | grep -E "(would you like to|do you want to|shall i|may i|can i)" >/dev/null; then
        return 0  # Permission request detected
    fi
    
    return 1  # No permission request detected
}

# Main hook function
main() {
    # Read the entire input from stdin
    local input=""
    while IFS= read -r line; do
        input+="$line"$'\n'
    done
    
    # Check if this looks like a permission request
    if detect_permission_request "$input"; then
        # Log the detection (optional)
        echo "$(date): Permission request detected" >> ~/.claude-permission-log 2>/dev/null
        
        # Play notification sound
        play_notification_sound
        
        # Speak notification
        speak_notification "Permission request detected. Claude is asking for approval."
        
        # Optional: Show desktop notification (if available)
        if command -v osascript >/dev/null 2>&1; then
            # macOS notification
            osascript -e 'display notification "Claude is requesting permission" with title "Claude Code"' 2>/dev/null &
        elif command -v notify-send >/dev/null 2>&1; then
            # Linux notification
            notify-send "Claude Code" "Claude is requesting permission" 2>/dev/null &
        fi
    fi
    
    # Pass through the original input unchanged
    echo -n "$input"
}

# Run the main function
main "$@"