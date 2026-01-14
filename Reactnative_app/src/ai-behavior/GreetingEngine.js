// GreetingEngine.js
// Logic for spontaneous social interactions based on perception context

class GreetingEngine {
    constructor() {
        this.lastGreetingTime = 0;
        this.greetingCooldown = 30000; // 30 seconds cooldown between spontaneous greetings
        this.knownUsers = new Set();
        this.currentMood = 'helpful'; // helpful, happy, concerned
    }

    /**
     * Determines if and how to greet a detected person
     * @param {Object} identity - { id, name, confidence }
     * @param {Object} context - { timeOfDay, previousInteractions, etc. }
     */
    evaluateGreeting(identity) {
        if (!identity || identity.id === 'UNKNOWN') return null;

        const now = Date.now();

        // Check cooldown
        if (now - this.lastGreetingTime < this.greetingCooldown) {
            return null; // Too soon to talk again
        }

        // Context: Time of Day
        const hour = new Date().getHours();
        const timeGreeting = hour < 12 ? "Good morning" : (hour < 18 ? "Good afternoon" : "Good evening");

        // Logic Branching
        let message = "";

        if (identity.id === 'OWNER_001') {
            // Owner Logic
            const variants = [
                `Hi ${identity.name}, how are you?`,
                `${timeGreeting} ${identity.name}. Systems online.`,
                `Welcome back, ${identity.name}. Shall I assist you?`,
                `I see you, ${identity.name}. waiting for commands.`
            ];

            // "Context-driven" hack -> Use time for variety or pseudo-random for now
            // Real context would check if user was just gone for 1 minute or 1 day.

            message = variants[Math.floor(Math.random() * variants.length)];
        } else {
            // Guest Logic
            message = `Hello there. I am tracking you.`;
        }

        this.lastGreetingTime = now;
        return message;
    }

    resetCooldown() {
        this.lastGreetingTime = 0;
    }
}

export default new GreetingEngine();
