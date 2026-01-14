import IntentParser from '../voice/IntentParser';
import CommandMap from '../voice/CommandMap';
import RobotService from '../services/RobotService';

export const handleVoiceCommand = async (text) => {
    try {
        console.log("[VoiceController] Processing:", text);

        // 1. Parse Intent
        const intentResult = IntentParser.parse(text);

        // 2. Notify Robot Service (for UI/Admin Logs)
        // We inject the original text for debugging.
        // The AdminScreen listens for 'VOICE_CONTROL' events.
        RobotService.emit('VOICE_CONTROL', {
            raw: text,
            intent: intentResult.type,
            confidence: intentResult.confidence,
            parameters: intentResult.parameters
        });

        // 3. Execute Action
        if (intentResult.confidence > 0.5) {
            await CommandMap.execute(intentResult);
        } else {
            // If confidence is low but not zero, maybe just log it.
            // If it's explicitly UNKNOWN, CommandMap handles "I don't understand".
            if (intentResult.type === 'UNKNOWN') {
                await CommandMap.execute(intentResult);
            }
        }

        return {
            ...intentResult,
            executed: true
        };
    } catch (error) {
        console.error("[VoiceController] Error:", error);
        return { error: error.message };
    }
};

export default {
    handleVoiceCommand
};
