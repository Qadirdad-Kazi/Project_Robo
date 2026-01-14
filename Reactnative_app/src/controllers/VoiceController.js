import RobotService from './RobotService';
import { parseCommand } from '../utils/CommandParser';

export const handleVoiceCommand = async (text) => {
    // 1. Log Raw Input
    // In a real app we might send this to analytics

    // 2. Parse Logic
    const result = parseCommand(text);

    // 3. Execute
    if (result.type === 'SUCCESS') {
        try {
            await RobotService.sendCommand(result.intent, {
                ...result,
                origin: 'VOICE',
                raw: text
            });
            return {
                ...result,
                executed: true
            };
        } catch (e) {
            return {
                ...result,
                executed: false,
                error: e.message
            };
        }
    }

    return {
        ...result,
        executed: false
    };
};
