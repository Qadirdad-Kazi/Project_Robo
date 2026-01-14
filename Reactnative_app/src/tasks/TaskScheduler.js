// TaskScheduler.js
// Handles scheduling and execution of future robotic tasks.

import AsyncStorage from '@react-native-async-storage/async-storage';
import VoiceService from '../services/VoiceService';

class TaskScheduler {
    constructor() {
        this.tasks = [];
        this.listeners = [];
        this.interval = null;

        // Load on start
        this.loadTasks();

        // Start Loop
        this.interval = setInterval(this.checkTasks.bind(this), 30000); // Check every 30s
    }

    addListener(callback) {
        this.listeners.push(callback);
        callback(this.tasks); // Initial sync
        return () => {
            this.listeners = this.listeners.filter(cb => cb !== callback);
        };
    }

    notifyListeners() {
        this.listeners.forEach(cb => cb([...this.tasks]));
    }

    async loadTasks() {
        try {
            const stored = await AsyncStorage.getItem('ROBOT_SCHEDULE');
            if (stored) {
                this.tasks = JSON.parse(stored);
                // Filter out old tasks?
                // Keep for history? Let's just keep future for now.
                this.tasks = this.tasks.filter(t => t.time > Date.now());
                this.notifyListeners();
            }
        } catch (e) {
            console.error("Failed to load schedule", e);
        }
    }

    async saveTasks() {
        try {
            await AsyncStorage.setItem('ROBOT_SCHEDULE', JSON.stringify(this.tasks));
            this.notifyListeners();
        } catch (e) {
            console.error("Failed to save schedule", e);
        }
    }

    /**
     * Schedule a new task
     * @param {string} description - "Water plants"
     * @param {number} timestamp - Time to execute
     * @param {string} type - 'REMINDER', 'ACTION'
     */
    async scheduleTask(description, timestamp, type = 'REMINDER') {
        const newTask = {
            id: Date.now().toString(),
            description,
            time: timestamp,
            type,
            status: 'PENDING'
        };

        this.tasks.push(newTask);
        this.tasks.sort((a, b) => a.time - b.time);

        await this.saveTasks();

        console.log(`[Scheduler] Scheduled "${description}" for ${new Date(timestamp).toLocaleString()}`);
        return newTask;
    }

    checkTasks() {
        const now = Date.now();
        const pending = this.tasks.filter(t => t.status === 'PENDING');

        pending.forEach(task => {
            if (task.time <= now) {
                this.executeTask(task);
            }
        });
    }

    executeTask(task) {
        console.log(`[Scheduler] EXECUTING: ${task.description}`);

        // Mark done
        task.status = 'COMPLETED';

        // Action
        if (task.type === 'REMINDER') {
            VoiceService.speak(`Reminder: ${task.description}`);
        } else if (task.type === 'ACTION') {
            // E.g. "Start Cleaning" -> Trigger cleaning logic?
            VoiceService.speak(`Starting scheduled task: ${task.description}`);
            // Would call RobotService here if integrated with Cleaning
        }

        this.saveTasks();
    }
}

export default new TaskScheduler();
