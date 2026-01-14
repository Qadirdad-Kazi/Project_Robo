// CommandMap.js
// Maps Intents to actionable Robot Service calls

import RobotService from '../services/RobotService';
import VoiceService from '../services/VoiceService';
import { INTENTS } from './IntentParser';
import FollowOwnerEngine from '../navigation/FollowOwnerEngine';
import DecisionEngine, { MODES } from '../core/DecisionEngine';
import MediaController from '../media/MediaController';

class CommandMap {

    async execute(intentResult) {
        const { type, parameters } = intentResult;

        console.log(`[CommandMap] Executing: ${type}`, parameters);

        switch (type) {
            case INTENTS.HALT:
                DecisionEngine.setMode(MODES.IDLE);
                FollowOwnerEngine.stop();
                MediaController.pause(); // Silence media
                await RobotService.stop();
                VoiceService.speak("Stopping.");
                break;

            case INTENTS.PLAY_MUSIC:
                // Start Music
                const query = parameters.query || "Music";
                MediaController.play(query);
                break;

            case INTENTS.MEDIA_CONTROL:
                if (parameters.action === 'pause') MediaController.pause();
                else if (parameters.action === 'stop') MediaController.stop();
                else if (parameters.action === 'next') MediaController.next();
                break;

            case INTENTS.FOLLOW:
                FollowOwnerEngine.start();
                break;

            // ... (rest same)

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
