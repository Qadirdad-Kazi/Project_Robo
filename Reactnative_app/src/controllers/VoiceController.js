import IntentParser from '../voice/IntentParser';
import CommandMap from '../voice/CommandMap';
import RobotService from '../services/RobotService';
import LlamaService from '../services/LlamaService';
import VoiceService from '../services/VoiceService';

let CURRENT_MODE = 'ROBOT'; // 'ROBOT' | 'AI'

export const handleVoiceCommand = async (text) => {
    try {
        console.log(`[VoiceController] Processing: "${text}" in mode: ${CURRENT_MODE}`);

        // 1. Parse Intent
        const intentResult = IntentParser.parse(text);

        // Notify Service
        RobotService.notifyListeners({
            type: 'VOICE_CONTROL',
            raw: text,
            intent: intentResult.type,
            confidence: intentResult.confidence,
            parameters: intentResult.parameters
        });

        // 2. CHECK FOR CRITICAL COMMANDS (Always Active)
        // Mode Switching
        if (intentResult.type === 'MODE_SWITCH') {
            CURRENT_MODE = intentResult.parameters.mode;
            VoiceService.speak(CURRENT_MODE === 'AI' ? "AI Mode Enabled." : "Robot Mode Enabled.");
            return { ...intentResult, executed: true };
        }

        // Volume Control (Global)
        if (intentResult.type === 'VOLUME_CONTROL') {
            // Mock volume control for now
            VoiceService.speak(`Volume ${intentResult.parameters.action}`);
            return { ...intentResult, executed: true };
        }

        // Halt (Safety)
        if (intentResult.type === 'HALT') {
            await CommandMap.execute(intentResult);
            return { ...intentResult, executed: true };
        }

        // 3. MODE SPECIFIC LOGIC
        if (CURRENT_MODE === 'AI') {
            // --- AI MODE ---
            // In AI Mode, we treat everything as a prompt unless it was a switch/halt command caught above.
            await handleAIQuery(text);

        } else {
            // --- ROBOT MODE (Default) ---

            // Check for explicit "Ask AI" intent even in Robot Mode
            if (intentResult.type === 'AI_QUERY') {
                await handleAIQuery(intentResult.parameters.query);
                return;
            }

            if (intentResult.confidence > 0.6) {
                // Execute Robot Command
                await CommandMap.execute(intentResult);
            } else {
                // Unknown Command in Robot Mode -> Error
                VoiceService.speak("Command not recognized.");
            }
        }

        return { ...intentResult, executed: true };
    } catch (error) {
        console.error("[VoiceController] Error:", error);
        return { error: error.message };
    }
};

// Helper for AI
const handleAIQuery = async (prompt) => {
    VoiceService.speak("Thinking");
    try {
        const aiResponse = await LlamaService.query(prompt);
        VoiceService.speak(aiResponse);

        // Log AI Response
        RobotService.notifyListeners({
            type: 'VOICE_CONTROL',
            raw: prompt,
            intent: 'GENERATIVE_AI',
            confidence: 1.0,
            parameters: { answer: aiResponse }
        });
    } catch (e) {
        VoiceService.speak("Brain Offline.");
    }
};

export default {
    handleVoiceCommand
};
