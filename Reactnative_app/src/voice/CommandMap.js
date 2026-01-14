// CommandMap.js
// Maps Intents to actionable Robot Service calls

import RobotService from '../services/RobotService';
import VoiceService from '../services/VoiceService';
import { INTENTS } from './IntentParser';

class CommandMap {

    /**
     * Excutes the logic for a given Intent
     * @param {Object} intentResult - The output from IntentParser
     */
    async execute(intentResult) {
        const { type, parameters } = intentResult;

        console.log(`[CommandMap] Executing: ${type}`, parameters);

        switch (type) {
            case INTENTS.HALT:
                await RobotService.stop();
                VoiceService.speak("Stopping now.");
                break;

            case INTENTS.FOLLOW:
                // For now, simulate 'Follow' by moving forward slightly or turning towards owner?
                // Real follow requires vision tracking loop.
                VoiceService.speak("Coming to you.");
                await RobotService.sendCommand('FORWARD');
                // In future: RobotService.setMode('FOLLOW_MODE');
                break;

            case INTENTS.MOVE:
                if (parameters.direction === 'backward') {
                    await RobotService.sendCommand('BACKWARD');
                    VoiceService.speak("Backing up.");
                } else {
                    await RobotService.sendCommand('FORWARD');
                    VoiceService.speak("Moving forward.");
                }
                break;

            case INTENTS.ROTATE_LEFT:
                await RobotService.sendCommand('LEFT');
                VoiceService.speak("Turning left.");
                break;

            case INTENTS.ROTATE_RIGHT:
                await RobotService.sendCommand('RIGHT');
                VoiceService.speak("Turning right.");
                break;

            case INTENTS.STATUS:
                const bat = RobotService.getBatteryLevel(); // Assuming sync or use state
                VoiceService.speak(`Systems operational. Battery at ${bat} percent.`);
                break;

            case INTENTS.GREET:
                VoiceService.speak("Hello there. Ready for commands.");
                break;

            case INTENTS.UNKNOWN:
            default:
                VoiceService.speak("I did not understand that command.");
                console.warn("[CommandMap] Unknown intent:", type);
                break;
        }
    }
}

export default new CommandMap();
