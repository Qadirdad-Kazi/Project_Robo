import { Accelerometer, Gyroscope } from 'expo-sensors';
import EventEmitter from 'eventemitter3';
import PowerManager from '../system/PowerManager';

class MotionSensorService extends EventEmitter {
    constructor() {
        super();
        this.data = {
            accel: { x: 0, y: 0, z: 0 },
            gyro: { x: 0, y: 0, z: 0 }
        };
        this.subscriptions = [];
        this.init();
    }

    init() {
        Accelerometer.setUpdateInterval(200);
        Gyroscope.setUpdateInterval(200);

        this.start();

        // Optimize based on power
        PowerManager.addListener((state) => {
            const interval = PowerManager.getSensorInterval('MOTION');
            Accelerometer.setUpdateInterval(interval);
            Gyroscope.setUpdateInterval(interval);
        });
    }

    start() {
        this.subscriptions.push(
            Accelerometer.addListener(data => {
                this.data.accel = data;
                this.emit('update', this.data);
            })
        );

        this.subscriptions.push(
            Gyroscope.addListener(data => {
                this.data.gyro = data;
                this.emit('update', this.data);
            })
        );
    }

    stop() {
        this.subscriptions.forEach(sub => sub && sub.remove());
        this.subscriptions = [];
    }

    getData() {
        return this.data;
    }
}

export default new MotionSensorService();
