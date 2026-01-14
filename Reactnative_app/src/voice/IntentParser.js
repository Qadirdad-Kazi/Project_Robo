// IntentParser.js
// Parses raw NLU text into structured Intents

export const INTENTS = {
    FOLLOW: 'FOLLOW_OWNER',
    MOVE: 'MOVE_TO_POINT',
    HALT: 'HALT',
    ROTATE_LEFT: 'ROTATE_LEFT',
    ROTATE_RIGHT: 'ROTATE_RIGHT',
    STATUS: 'REPORT_STATUS',
    GREET: 'GREETING',
    UNKNOWN: 'UNKNOWN'
};

class IntentParser {

    /**
     * Parse raw text into an Intent
     * @param {string} text 
     * @returns {Object} { type, confidence, params, original }
     */
    parse(text) {
        const lower = text.toLowerCase().trim();

        // 1. Halt / Stop (High Priority)
        if (lower.match(/stop|halt|freeze|wait|hold/)) {
            return this.createResult(INTENTS.HALT, 1.0);
        }

        // 2. Follow Me
        if (lower.match(/come here|come to me|follow me|to me|here boy/)) {
            return this.createResult(INTENTS.FOLLOW, 0.95);
        }

        // 3. Rotation
        if (lower.includes('turn left') || lower.includes('rotate left')) {
            return this.createResult(INTENTS.ROTATE_LEFT, 0.9);
        }
        if (lower.includes('turn right') || lower.includes('rotate right')) {
            return this.createResult(INTENTS.ROTATE_RIGHT, 0.9);
        }

        // 4. Movement (Forward/Back/Go)
        if (lower.match(/go there|move forward|walk|advance/)) {
            return this.createResult(INTENTS.MOVE, 0.85, { direction: 'forward' });
        }
        if (lower.match(/go back|retreat|reverse|backup/)) {
            return this.createResult(INTENTS.MOVE, 0.85, { direction: 'backward' });
        }

        // 5. Status
        if (lower.match(/status|battery|health|report/)) {
            return this.createResult(INTENTS.STATUS, 0.9);
        }

        // 6. Greeting/Social
        if (lower.match(/hello|hi |hey |good morning/)) {
            return this.createResult(INTENTS.GREET, 0.8);
        }

        return this.createResult(INTENTS.UNKNOWN, 0.0);
    }

    createResult(type, confidence, params = {}) {
        return {
            type,
            confidence,
            parameters: params,
            timestamp: Date.now()
        };
    }
}

export default new IntentParser();
