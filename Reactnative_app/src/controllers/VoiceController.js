import IntentParser from '../voice/IntentParser';
import CommandMap from '../voice/CommandMap';
import RobotService from '../services/RobotService';
import LlamaService from '../services/LlamaService';
import VoiceService from '../services/VoiceService';

export const handleVoiceCommand = async (text) => {
    try {
        console.log("[VoiceController] Processing:", text);

        // 1. Parse Intent
        const intentResult = IntentParser.parse(text);

        // 2. Notify Robot Service (for UI/Admin Logs)
        // We inject the original text for debugging.
        // The AdminScreen listens for 'VOICE_CONTROL' events.
        // 2. Notify Robot Service (for UI/Admin Logs)
        // We inject the original text for debugging.
        // The AdminScreen listens for 'VOICE_CONTROL' events.
        RobotService.notifyListeners({
            type: 'VOICE_CONTROL',
            raw: text,
            intent: intentResult.type,
            confidence: intentResult.confidence,
            parameters: intentResult.parameters
        });

        // 3. Execute Action
        if (intentResult.confidence > 0.6) {
            // High confidence standard command (Movement, Media, etc.)
            await CommandMap.execute(intentResult);
        } else {
            // UNKNOWN or Low Confidence -> Fallback to AI Brain (Llama 3.2)
            console.log("[VoiceController] Standard command unknown. Asking AI Brain...");

            // Feedback to user
            VoiceService.speak("Thinking");

            try {
                // Query Llama
                const aiResponse = await LlamaService.query(text);

                // Speak Result
                VoiceService.speak(aiResponse);

                // Log to Admin
                RobotService.notifyListeners({
                    type: 'VOICE_CONTROL', // Re-emit with AI response info
                    raw: text,
                    intent: 'GENERATIVE_AI',
                    confidence: 1.0,
                    parameters: { answer: aiResponse }
                });

            } catch (e) {
                console.warn("AI Brain failed", e);
                VoiceService.speak("I am having trouble connecting to my brain.");
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
