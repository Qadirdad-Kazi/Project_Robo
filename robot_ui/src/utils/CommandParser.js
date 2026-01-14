// CommandParser.js
// AI Brain v1: Logic-based Intent Recognizer

const INTENT_DEFINITIONS = [
    {
        id: 'MOVE_FORWARD',
        patterns: [
            /go forward/i,
            /move forward/i,
            /ahead/i,
            /advance/i,
            /straight/i
        ],
        keywords: ['forward', 'ahead'],
        defaults: { speed: 'medium', distance: 'standard' }
    },
    {
        id: 'MOVE_BACKWARD',
        patterns: [
            /go back/i,
            /move back/i,
            /reverse/i,
            /retreat/i,
            /backup/i
        ],
        keywords: ['back', 'reverse'],
        defaults: { speed: 'medium' }
    },
    {
        id: 'TURN_LEFT',
        patterns: [/turn left/i, /go left/i, /rotate left/i, /spin left/i],
        keywords: ['left'],
        defaults: { angle: 90 }
    },
    {
        id: 'TURN_RIGHT',
        patterns: [/turn right/i, /go right/i, /rotate right/i, /spin right/i],
        keywords: ['right'],
        defaults: { angle: 90 }
    },
    {
        id: 'STOP',
        patterns: [/stop/i, /halt/i, /freeze/i, /hold/i, /wait/i],
        keywords: ['stop', 'wait'],
        defaults: { urgency: 'high' }
    },
    {
        id: 'COME_HERE',
        patterns: [/come here/i, /come to me/i, /over here/i],
        keywords: ['come'],
        defaults: { target: 'user', speed: 'medium' }
    },
    {
        id: 'ENTERTAIN_MUSIC',
        patterns: [/play music/i, /sing/i, /play a song/i, /entertainment/i],
        keywords: ['music', 'song', 'spotify'],
        defaults: { genre: 'random' }
    },
    {
        id: 'ENTERTAIN_DANCE',
        patterns: [/dance/i, /do a dance/i, /moves/i, /boogie/i],
        keywords: ['dance'],
        defaults: { style: 'freestyle' }
    },
    {
        id: 'QUERY_STATUS',
        patterns: [/status/i, /report/i, /battery/i, /health/i, /how are you/i],
        keywords: ['status', 'battery'],
        defaults: { detailLevel: 'summary' }
    },
    {
        id: 'QUERY_IDENTITY_BOT',
        patterns: [/who are you/i, /what are you/i, /identify yourself/i],
        keywords: ['who', 'identify'],
        defaults: {}
    },
    {
        id: 'QUERY_IDENTITY_USER',
        patterns: [/who am i/i, /do you know me/i],
        keywords: [],
        defaults: {}
    }
];

// Parameter Extraction Logic
const extractParameters = (text) => {
    const params = {};
    const lower = text.toLowerCase();

    // Speed Extraction
    if (lower.includes('fast') || lower.includes('quickly') || lower.includes('run')) {
        params.speed = 'fast';
    } else if (lower.includes('slow') || lower.includes('crawl')) {
        params.speed = 'slow';
    }

    // Urgency
    if (lower.includes('now') || lower.includes('immediately') || lower.includes('emergency')) {
        params.urgency = 'critical';
    }

    return params;
};

// Main Parser
export const parseCommand = (inputRaw) => {
    if (!inputRaw || typeof inputRaw !== 'string') {
        return {
            intent: 'UNKNOWN',
            confidence: 0,
            parameters: {},
            response: "I didn't hear anything."
        };
    }

    const text = inputRaw.trim();
    let bestMatch = null;
    let highestScore = 0;

    // Scoring Loop
    for (const def of INTENT_DEFINITIONS) {
        let score = 0;

        // 1. Regex Match (Strongest)
        if (def.patterns.some(p => p.test(text))) {
            score = 0.95; // High confidence for exact phrase patches
        }
        // 2. Keyword Match (Weaker)
        else {
            const keywordMatches = def.keywords.filter(k => text.toLowerCase().includes(k));
            if (keywordMatches.length > 0) {
                // Base score 0.4, +0.1 for each extra keyword, capped at 0.8
                score = 0.4 + (keywordMatches.length * 0.1);
                if (score > 0.8) score = 0.8;
            }
        }

        if (score > highestScore) {
            highestScore = score;
            bestMatch = def;
        }
    }

    // Threshold check
    if (!bestMatch || highestScore < 0.4) {
        return {
            intent: 'UNKNOWN',
            confidence: parseInt((highestScore * 100).toFixed(0)) / 100, // Normalize
            parameters: {},
            response: "I didn't understand that command"
        };
    }

    // Merge defaults with extracted parameters
    const extractedParams = extractParameters(text);
    const finalParams = { ...bestMatch.defaults, ...extractedParams };

    return {
        intent: bestMatch.id,
        confidence: parseFloat(highestScore.toFixed(2)),
        parameters: finalParams,
        // Helper to generate a friendly string response if needed immediately
        response: generateResponse(bestMatch.id, finalParams),
        original: text
    };
};

const generateResponse = (intent, params) => {
    switch (intent) {
        case 'MOVE_FORWARD': return `Moving forward at ${params.speed} speed.`;
        case 'MOVE_BACKWARD': return "Backing up. beep. beep.";
        case 'TURN_LEFT': return "Turning left.";
        case 'TURN_RIGHT': return "Turning right.";
        case 'STOP': return "Stopping immediately.";
        case 'COME_HERE': return "Yes Qadir, coming to you.";
        case 'ENTERTAIN_MUSIC': return "Playing music.";
        case 'ENTERTAIN_DANCE': return "Let's party!";
        case 'QUERY_STATUS': return "Systems nominal. Battery at 85%.";
        case 'QUERY_IDENTITY_BOT': return "I am your Robot Assistant, AI Brain v1.";
        case 'QUERY_IDENTITY_USER': return "You are the Administrator.";
        default: return "Command accepted.";
    }
};
