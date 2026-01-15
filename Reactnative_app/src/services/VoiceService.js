import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import { Platform, Alert } from 'react-native';
import EventEmitter from 'eventemitter3';

let Voice = null;
try {
    Voice = require('@react-native-voice/voice').default;
} catch (e) {
    console.log("Native Voice module not found (Expo Go detected). Mocking disabled.");
}

class VoiceServiceHandler extends EventEmitter {
    constructor() {
        super();
        this.isNativeAvailable = false;

        // Safety check: ensure Voice is not null before checking availability
        if (Voice) {
            this.checkAvailability();
        } else {
            console.warn("Voice module is null, native voice disabled");
        }

        // Bind methods
        this._onSpeechStart = this._onSpeechStart.bind(this);
        this._onSpeechEnd = this._onSpeechEnd.bind(this);
        this._onSpeechResults = this._onSpeechResults.bind(this);
        this._onSpeechError = this._onSpeechError.bind(this);
        this._onSpeechPartialResults = this._onSpeechPartialResults.bind(this);
    }

    checkAvailability() {
        if (Voice) {
            this.isNativeAvailable = true;
            Voice.onSpeechStart = this._onSpeechStart;
            Voice.onSpeechEnd = this._onSpeechEnd;
            Voice.onSpeechResults = this._onSpeechResults;
            Voice.onSpeechError = this._onSpeechError;
            Voice.onSpeechPartialResults = this._onSpeechPartialResults;
        }
    }

    speak(text) {
        Speech.speak(text, {
            language: 'en',
            pitch: 1.0,
            rate: 1.0,
        });
    }

    async startListening() {
        if (Platform.OS !== 'web') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }

        try {
            if (this.isNativeAvailable) {
                await Voice.start('en-US');
            } else {
                Alert.alert(
                    "Voice Not Available",
                    "Native Voice recognition is not supported in Expo Go. To use voice, you must build a Development Client or use a physical device with a native build.\n\nUse the 'Neural Bridge' in Admin Screen to type commands manually.",
                    [{ text: "OK" }]
                );
            }
        } catch (e) {
            console.error(e);
            this.emit('error', e);
        }
    }

    async stopListening() {
        try {
            if (this.isNativeAvailable) {
                await Voice.stop();
            }
        } catch (e) {
            console.error(e);
        }
    }

    async cancelListening() {
        try {
            if (this.isNativeAvailable) {
                await Voice.cancel();
            }
        } catch (e) {
            console.error(e);
        }
    }

    // --- Private Event Handlers ---

    _onSpeechStart(e) {
        this.emit('start', e);
    }

    _onSpeechEnd(e) {
        this.emit('end', e);
    }

    _onSpeechResults(e) {
        this.emit('final_result', e);
    }

    _onSpeechPartialResults(e) {
        this.emit('partial_result', e);
    }

    _onSpeechError(e) {
        console.log("Voice Error", e);
        this.emit('error', e);
    }
}

export default new VoiceServiceHandler();
