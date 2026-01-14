// EmotionEngine.js
// Analyzes multimodal inputs (Face, Voice) to determine User Emotion.
// Phase 1: Heuristic-based (Smiling Probability, etc.)

export const EMOTIONS = {
    HAPPY: 'HAPPY',
    SAD: 'SAD', // Low energy / No smile
    NEUTRAL: 'NEUTRAL',
    SURPRISED: 'SURPRISED', // Wide eyes (if available) or high pitch (simulated)
    ANGRY: 'ANGRY'
};

class EmotionEngine {
    constructor() {
        this.currentEmotion = EMOTIONS.NEUTRAL;
        this.lastUpdate = 0;
    }

    /**
     * Analyze a face object from Expo FaceDetector
     * @param {Object} face 
     */
    analyzeFace(face) {
        if (!face) return EMOTIONS.NEUTRAL;

        const smile = face.smilingProbability || 0;
        const leftEye = face.leftEyeOpenProbability || 0.5;
        const rightEye = face.rightEyeOpenProbability || 0.5;

        // Heuristics
        let detected = EMOTIONS.NEUTRAL;

        if (smile > 0.7) {
            detected = EMOTIONS.HAPPY;
        } else if (smile < 0.1 && (leftEye < 0.3 || rightEye < 0.3)) {
            // Not perfect, but squinting/frowning often correlates with negative or tired
            // Actually, might be "Sleepy". Let's assume Low Smile + Neutral Eyes = Neutral.
            // Let's rely on "Sad" being difficult to detect purely by dots.
            // But we can simulate "Serious/Sad" if smile is VERY low.
            detected = EMOTIONS.NEUTRAL;
        }

        // If we had "wide eyes", could be Surprised.
        // Expo doesn't give "wide eye" metric directly, only open probability.

        this.currentEmotion = detected;
        return detected;
    }

    /**
     * Get a contextual response based on emotion
     * @param {string} name - User's name
     * @param {string} emotion - EMOTIONS value
     */
    getResponse(name, emotion = this.currentEmotion) {
        const n = name || "there";
        switch (emotion) {
            case EMOTIONS.HAPPY:
                return `You look happy today, ${n}! Good to see that smile.`;
            case EMOTIONS.SAD:
                return `Everything okay, ${n}? I'm here if you need me.`;
            case EMOTIONS.ANGRY:
                return `I sense some tension, ${n}. Taking a step back.`;
            case EMOTIONS.SURPRISED:
                return `Whoa! What happened, ${n}?`;
            case EMOTIONS.NEUTRAL:
            default:
                return `Hi ${n}, ready to assist.`;
        }
    }
}

export default new EmotionEngine();
