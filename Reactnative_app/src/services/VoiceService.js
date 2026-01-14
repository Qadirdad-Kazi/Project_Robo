// import Voice from '@react-native-voice/voice'; // Can't static import in Expo Go without config plugin/dev client
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import EventEmitter from 'eventemitter3';

let Voice = null;
try {
    Voice = require('@react-native-voice/voice').default;
} catch (e) {
    console.log("Native Voice module not found (Expo Go detected). Using mock.");
}

class VoiceServiceHandler extends EventEmitter {
    constructor() {
        super();
        this.isNativeAvailable = false;
        this.checkAvailability();

        // Bind methods
        this._onSpeechStart = this._onSpeechStart.bind(this);
        this._onSpeechEnd = this._onSpeechEnd.bind(this);
        this._onSpeechResults = this._onSpeechResults.bind(this);
        this._onSpeechError = this._onSpeechError.bind(this);
        this._onSpeechPartialResults = this._onSpeechPartialResults.bind(this);
    }

    checkAvailability() {
        // Check if Voice module is linked (native)
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
                try {
                    await Voice.start('en-US');
                    return;
                } catch (e) {
                    console.warn("Native Voice failed (likely Expo Go), falling back to simulation.", e);
                }
            }

            // Fallback Simulation
            this._mockListeningSequence();

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
        // In simulator/Expo Go, "7/No match" or "5/Client side error" are common if native module missing
        console.log("Voice Error", e);
        if (e.error?.code === '5' || e.error?.code === '7') {
            // Fallback if it fails mid-flight
            this._mockListeningSequence();
            return;
        }
        this.emit('error', e);
    }

    // --- MOCK LOGIC ---
    _mockListeningSequence() {
        this.emit('start');

        const phrases = [
            "Move forward please",
            "Turn around",
            "Check battery status",
            "Dance for me",
            "Stop right there",
            "Enable AI Mode",
            "What is HTML"
        ];
        const targetPhrase = phrases[Math.floor(Math.random() * phrases.length)];
        const words = targetPhrase.split(' ');

        let currentWordIndex = 0;

        // Artificial delay to simulate human speaking time
        setTimeout(() => {
            const interval = setInterval(() => {
                if (currentWordIndex < words.length) {
                    const partial = words.slice(0, currentWordIndex + 1).join(' ');
                    this.emit('partial_result', { value: [partial] });
                    currentWordIndex++;
                } else {
                    clearInterval(interval);
                    this.emit('final_result', { value: [targetPhrase] });
                    this.emit('end');
                }
            }, 600);
        }, 1500); // 1.5s initial "listening" silence
    }
}

export default new VoiceServiceHandler();
