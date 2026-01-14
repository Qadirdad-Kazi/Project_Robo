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
    PLAY_MUSIC: 'PLAY_MUSIC',
    MEDIA_CONTROL: 'MEDIA_CONTROL',
    UNKNOWN: 'UNKNOWN'
};

class IntentParser {

    /**
     * Parse raw text into an Intent
     * @param {string} text 
     * @returns {Object} { type, confidence, params, original }
     */
    parse(text) {
        if (!text) return this.createResult(INTENTS.UNKNOWN, 0.0);
        const lower = text.toLowerCase().trim();

        // 1. Music (Search & Play) - Check first to catch "Play" before generic moves
        // "Play something on youtube", "Play Despacito"
        if (lower.startsWith('play') && (lower.includes('youtube') || lower.includes('song') || lower.length > 5)) {
            // Assume it's media if it's "Play ..." and not just a movement command
            // Extract Query
            let query = lower
                .replace('play', '')
                .replace('on youtube', '')
                .replace('music', '')
                .replace('song', '')
                .trim();

            if (query.length === 0) query = "music";

            return this.createResult(INTENTS.PLAY_MUSIC, 0.9, { query });
        }

        // 2. Media Controls
        if (lower.includes('pause') || (lower.includes('stop') && lower.includes('music'))) {
            return this.createResult(INTENTS.MEDIA_CONTROL, 0.95, { action: 'pause' });
        }
        if (lower.match(/next track|skip song|next song/)) {
            return this.createResult(INTENTS.MEDIA_CONTROL, 0.95, { action: 'next' });
        }

        // 3. Halt / Stop (High Priority)
        // If "Stop Music" was caught above, this won't trigger. 
        if (lower.match(/stop|halt|freeze|wait|hold/)) {
            return this.createResult(INTENTS.HALT, 1.0);
        }

        // 4. Follow Me
        if (lower.match(/come here|come to me|follow me|to me|here boy/)) {
            return this.createResult(INTENTS.FOLLOW, 0.95);
        }

        // 5. Rotation
        if (lower.includes('turn left') || lower.includes('rotate left')) {
            return this.createResult(INTENTS.ROTATE_LEFT, 0.9);
        }
        if (lower.includes('turn right') || lower.includes('rotate right')) {
            return this.createResult(INTENTS.ROTATE_RIGHT, 0.9);
        }

        // 6. Movement (Forward/Back/Go)
        if (lower.match(/go there|move forward|walk|advance/)) {
            return this.createResult(INTENTS.MOVE, 0.85, { direction: 'forward' });
        }
        if (lower.match(/go back|retreat|reverse|backup/)) {
            return this.createResult(INTENTS.MOVE, 0.85, { direction: 'backward' });
        }

        // 7. Status
        if (lower.match(/status|battery|health|report/)) {
            return this.createResult(INTENTS.STATUS, 0.9);
        }

        // 8. Greeting/Social
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
