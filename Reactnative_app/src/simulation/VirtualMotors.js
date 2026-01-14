// VirtualMotors.js
// Simulates physical robot motors and physics for development without hardware.

class VirtualMotors {
    constructor() {
        this.reset();
    }

    reset() {
        this.status = 'IDLE'; // IDLE, MOVING, ROTATING
        this.position = { x: 0, y: 0, heading: 0 }; // Grid simulation
        this.velocity = 0; // units/sec
        this.pathHistory = [];
        this.is simulating = true;
    }

    getTelemetry() {
        return {
            status: this.status,
            position: this.position,
            velocity: this.velocity,
            historyCount: this.pathHistory.length
        };
    }

    /**
     * Simulate a motor command
     * @param {string} command - FORWARD, BACKWARD, LEFT, RIGHT, STOP
     * @param {number} durationMs - Optional duration for the move
     */
    async execute(command, durationMs = 1000) {
        // Log start
        // console.log(`[VirtualMotors] EXECUTE: ${command}`);
        this.status = command === 'STOP' ? 'IDLE' : 'MOVING';

        // Record Path Point
        if (command !== 'STOP') {
            this.pathHistory.push({ ...this.position, action: command, timestamp: Date.now() });
        }

        switch (command) {
            case 'FORWARD':
                this.updatePosition(1);
                break;
            case 'BACKWARD':
                this.updatePosition(-1);
                break;
            case 'LEFT':
                this.position.heading = (this.position.heading - 90 + 360) % 360;
                break;
            case 'RIGHT':
                this.position.heading = (this.position.heading + 90) % 360;
                break;
            case 'STOP':
                this.velocity = 0;
                break;
        }

        // Simulate physical delay
        await new Promise(resolve => setTimeout(resolve, command === 'STOP' ? 100 : durationMs));

        // Auto-stop for discrete moves? 
        // For continuous drive, we wouldn't auto-stop. 
        // But the previous RobotService implementation implied discrete steps.
        // Let's assume discrete steps for simplified simulation for now, unless STOP is called.

        return this.getTelemetry();
    }

    updatePosition(step = 1) {
        // Simple grid movement based on heading
        // Heading 0 = North (Y+), 90 = East (X+), 180 = South (Y-), 270 = West (X-)
        const rad = (this.position.heading * Math.PI) / 180;
        // Approximation for 90 deg turns
        if (this.position.heading === 0) this.position.y += step;
        else if (this.position.heading === 90) this.position.x += step;
        else if (this.position.heading === 180) this.position.y -= step;
        else if (this.position.heading === 270) this.position.x -= step;
        else {
            // Complex angles
            this.position.x += Math.sin(rad) * step;
            this.position.y += Math.cos(rad) * step;
        }
    }

    // --- REPLAY FEATURE ---

    async replayPath() {
        console.log(`[VirtualMotors] REPLAYING PATH (${this.pathHistory.length} steps)...`);
        const history = [...this.pathHistory];
        this.reset(); // Clear current state to start over

        for (const step of history) {
            console.log(`[Replay] ${step.action} at (${step.x}, ${step.y})`);
            await this.execute(step.action, 500); // Fast forward
        }
        console.log("[VirtualMotors] Replay Complete");
    }
}

export default new VirtualMotors();
