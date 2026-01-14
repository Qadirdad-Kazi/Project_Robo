// CommandMap.js
// Maps Intents to actionable Robot Service calls

import RobotService from '../services/RobotService';
import VoiceService from '../services/VoiceService';
import { INTENTS } from './IntentParser';
import FollowOwnerEngine from '../navigation/FollowOwnerEngine';
import DecisionEngine, { MODES } from '../core/DecisionEngine';

class CommandMap {

    async execute(intentResult) {
        const { type, parameters } = intentResult;

        console.log(`[CommandMap] Executing: ${type}`, parameters);

        switch (type) {
            case INTENTS.HALT:
                DecisionEngine.setMode(MODES.IDLE); // Reset Brain
                FollowOwnerEngine.stop();
                await RobotService.stop();
                VoiceService.speak("Stopping.");
                break;

            case INTENTS.FOLLOW:
                FollowOwnerEngine.start(); // Engine sets Mode to FOLLOW
                break;

            case INTENTS.MOVE:
                DecisionEngine.setMode(MODES.MANUAL); // Take over
                FollowOwnerEngine.stop();

                if (parameters.direction === 'backward') {
                    await RobotService.sendCommand('BACKWARD');
                    VoiceService.speak("Backing up.");
                } else {
                    await RobotService.sendCommand('FORWARD');
                    VoiceService.speak("Moving forward.");
                }
                break;

            case INTENTS.ROTATE_LEFT:
                DecisionEngine.setMode(MODES.MANUAL);
                FollowOwnerEngine.stop();
                await RobotService.sendCommand('LEFT');
                VoiceService.speak("Turning left.");
                break;

            case INTENTS.ROTATE_RIGHT:
                DecisionEngine.setMode(MODES.MANUAL);
                FollowOwnerEngine.stop();
                await RobotService.sendCommand('RIGHT');
                VoiceService.speak("Turning right.");
                break;

            case INTENTS.STATUS:
                // Just info, doesn't change mode
                const status = RobotService.getStatus();
                VoiceService.speak(`Systems operational. Battery at ${status.batteryLevel} percent.`);
                break;

            case INTENTS.GREET:
                VoiceService.speak("Hello there. Systems online.");
                break;

            case INTENTS.UNKNOWN:
            default:
                VoiceService.speak("Command not recognized.");
                console.warn("[CommandMap] Unknown intent:", type);
                break;
        }
    }
}

export default new CommandMap();
