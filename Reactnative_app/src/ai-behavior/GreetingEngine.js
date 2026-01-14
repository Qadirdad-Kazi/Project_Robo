// GreetingEngine.js
// Logic for spontaneous social interactions based on perception context

import EmotionEngine from './EmotionEngine';

class GreetingEngine {
    constructor() {
        this.lastGreetingTime = 0;
        this.greetingCooldown = 30000; // 30s cooldown
        this.knownUsers = new Set();
    }

    /**
     * Determines if and how to greet a detected person
     * @param {Object} identity - { id, name, confidence }
     * @param {Object} face - Raw face object from detection (optional)
     */
    evaluateGreeting(identity, face) {
        if (!identity || identity.id === 'UNKNOWN') return null;

        const now = Date.now();

        // Check cooldown
        if (now - this.lastGreetingTime < this.greetingCooldown) {
            return null; // Too soon to talk again
        }

        this.lastGreetingTime = now;

        // Context: Time of Day
        const hour = new Date().getHours();
        const timeGreeting = hour < 12 ? "Good morning" : (hour < 18 ? "Good afternoon" : "Good evening");

        // 1. EMOTION AWARE GREETING
        if (face && identity.id === 'OWNER_001') {
            // Analyze emotion
            const emotion = EmotionEngine.analyzeFace(face);
            const reaction = EmotionEngine.getResponse(identity.name, emotion);

            // If reaction is just "Neutral", maybe fallback to TimeOfDay to vary it.
            // But for now, let's use the Emotion Engine result mainly.
            if (reaction.includes("ready to assist")) {
                // Mix it up
                return `${timeGreeting}, ${identity.name}. Ready to assist.`;
            }
            return reaction;
        }

        // 2. FALLBACK / GUEST
        if (identity.id === 'OWNER_001') {
            return `${timeGreeting} ${identity.name}. Systems online.`;
        } else {
            return `Hello there.`;
        }
    }

    resetCooldown() {
        this.lastGreetingTime = 0;
    }
}

export default new GreetingEngine();
