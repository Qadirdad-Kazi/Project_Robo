// GoToPointEngine.js
// Logic to translate Screen Taps into Navigation Commands

import RobotService from '../services/RobotService';
import VoiceService from '../services/VoiceService';

class GoToPointEngine {
    constructor() {
        this.isNavigating = false;
    }

    /**
     * Navigate to a specific point on the screen
     * @param {number} x - Touch X
     * @param {number} y - Touch Y
     * @param {number} width - Screen Width
     * @param {number} height - Screen Height
     */
    async navigateToPoint(x, y, width, height) {
        if (this.isNavigating) return;
        this.isNavigating = true;

        const centerX = width / 2;
        const relativeX = (x - centerX) / centerX; // -1.0 (Left) to 1.0 (Right)

        // Visual feedback
        console.log(`[GoToPoint] Navigating to relative X: ${relativeX.toFixed(2)}`);
        VoiceService.speak("Heading confirmed.");

        try {
            // 1. Turn to face the point
            if (relativeX < -0.2) {
                // Turn Left
                const turnDuration = Math.abs(relativeX) * 1000; // Scale turn
                console.log(`[GoToPoint] Turning Left for ${turnDuration.toFixed(0)}ms`);
                await RobotService.sendCommand('LEFT');
                await this.delay(turnDuration);
                await RobotService.stop();
            } else if (relativeX > 0.2) {
                // Turn Right
                const turnDuration = Math.abs(relativeX) * 1000;
                console.log(`[GoToPoint] Turning Right for ${turnDuration.toFixed(0)}ms`);
                await RobotService.sendCommand('RIGHT');
                await this.delay(turnDuration);
                await RobotService.stop();
            }

            // 2. Move Forward (Simulated 'Go There')
            console.log("[GoToPoint] Moving Forward...");
            await RobotService.sendCommand('FORWARD');

            // Move for 2 seconds then check status or stop
            // In real logic, this would be "Until obstacle"
            await this.delay(2000);

            await RobotService.stop();
            VoiceService.speak("Destination reached.");

        } catch (err) {
            console.error("[GoToPoint] Error:", err);
        } finally {
            this.isNavigating = false;
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

export default new GoToPointEngine();
