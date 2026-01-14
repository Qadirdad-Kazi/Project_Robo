// DistanceSensor.js
// Simulates a Hardware Distance Sensor (e.g. HC-SR04 Ultrasonic)

import EventEmitter from 'eventemitter3';

class DistanceSensor extends EventEmitter {
    constructor() {
        super();
        this.currentDistance = 200; // Start with 200cm (Clear)
        this.minRange = 2;   // cm
        this.maxRange = 400; // cm

        // Simulation Loop
        this.simInterval = null;
    }

    startSimulation() {
        if (this.simInterval) return;
        console.log("[DistanceSensor] Simulation Started");
        this.simInterval = setInterval(() => {
            // Random jitter to mimic noise
            const jitter = Math.floor(Math.random() * 5) - 2;
            let newDist = this.currentDistance + jitter;

            // Constrain
            if (newDist < this.minRange) newDist = this.minRange;
            if (newDist > this.maxRange) newDist = this.maxRange;

            this.currentDistance = newDist;
            this.emit('distance', this.currentDistance);
        }, 500); // 2Hz updates
    }

    stopSimulation() {
        if (this.simInterval) {
            clearInterval(this.simInterval);
            this.simInterval = null;
        }
    }

    // Manual Override for UI Testing
    setDistance(cm) {
        this.currentDistance = cm;
        this.emit('distance', this.currentDistance);
    }

    getDistance() {
        return this.currentDistance;
    }
}

export default new DistanceSensor();
