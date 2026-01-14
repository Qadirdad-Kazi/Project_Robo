import Voice from '@react-native-voice/voice';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

class VoiceServiceHandler {
    constructor() {
        this.isNativeAvailable = false;
        this.checkAvailability();

        // Bind methods
        this._onSpeechStart = this._onSpeechStart.bind(this);
        this._onSpeechEnd = this._onSpeechEnd.bind(this);
        this._onSpeechResults = this._onSpeechResults.bind(this);
        this._onSpeechError = this._onSpeechError.bind(this);
        this._onSpeechPartialResults = this._onSpeechPartialResults.bind(this);

        this.listeners = {
            onResults: null,
            onPartialResults: null,
            onError: null,
            onStart: null,
            onEnd: null
        };
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

    setListeners({ onResults, onPartialResults, onError, onStart, onEnd }) {
        this.listeners = { onResults, onPartialResults, onError, onStart, onEnd };
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
            if (this.listeners.onError) this.listeners.onError(e);
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
        if (this.listeners.onStart) this.listeners.onStart(e);
    }

    _onSpeechEnd(e) {
        if (this.listeners.onEnd) this.listeners.onEnd(e);
    }

    _onSpeechResults(e) {
        if (this.listeners.onResults) this.listeners.onResults(e.value);
    }

    _onSpeechPartialResults(e) {
        if (this.listeners.onPartialResults) this.listeners.onPartialResults(e.value);
    }

    _onSpeechError(e) {
        // In simulator/Expo Go, "7/No match" or "5/Client side error" are common if native module missing
        console.log("Voice Error", e);
        if (e.error?.code === '5' || e.error?.code === '7') {
            // Fallback if it fails mid-flight
            this._mockListeningSequence();
            return;
        }
        if (this.listeners.onError) this.listeners.onError(e);
    }

    // --- MOCK LOGIC ---
    _mockListeningSequence() {
        if (this.listeners.onStart) this.listeners.onStart();

        const phrases = [
            "Move forward please",
            "Turn around",
            "Check battery status",
            "Dance for me",
            "Stop right there"
        ];
        const targetPhrase = phrases[Math.floor(Math.random() * phrases.length)];
        const words = targetPhrase.split(' ');

        let currentWordIndex = 0;

        // Simulate partial results typing out
        const interval = setInterval(() => {
            if (currentWordIndex < words.length) {
                const partial = words.slice(0, currentWordIndex + 1).join(' ');
                if (this.listeners.onPartialResults) {
                    this.listeners.onPartialResults([partial]);
                }
                currentWordIndex++;
            } else {
                clearInterval(interval);
                if (this.listeners.onResults) {
                    this.listeners.onResults([targetPhrase]);
                }
                if (this.listeners.onEnd) this.listeners.onEnd();
            }
        }, 500);
    }
}

export default new VoiceServiceHandler();
