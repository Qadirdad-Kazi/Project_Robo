# 🤖 Android-Based Autonomous Mobile Robot (React Native)

**A modular, voice-activated AI robot platform powered by Android and React Native.**

![License](https://img.shields.io/badge/license-MIT-blue.svg) ![Platform](https://img.shields.io/badge/platform-Android-green.svg) ![React Native](https://img.shields.io/badge/framework-React_Native-cyan.svg)

## 📖 Project Overview

This project transforms an Android smartphone into the "brain" of an autonomous mobile robot. Leveraging the phone's powerful sensors, camera, and connectivity, it acts as a central cortex that processes vision, voice, and decision-making logic locally on the device.

The complete system integrates **Face Recognition**, **Natural Language Understanding (NLU)**, **Obstacle Avoidance**, and **Media Playback** into a cohesive, personality-driven AI Assistant.

### ✨ Key Features

*   **🗣️ Advanced Voice Control**: Speak naturally to issue commands ("Follow me", "Play music", "Stop"). robust Intent Parsing handles variations in speech.
*   **👁️ Facial Recognition & Emotion AI**: Identifies owners vs. guests and adapts responses based on user emotion (Happy, Sad, Neutral).
*   **🧠 Decision Engine**: A centralized arbitration system that prioritizes Safety > User Commands > Autonomous Behaviors.
*   **🚗 Navigation & Safety**: Includes obstacle avoidance logic, virtual physics simulation for testing, and visual tracking for "Follow Me" mode.
*   **🎵 Media Integration**: Hands-free playback control for YouTube and music, with "Now Playing" status in the admin panel.
*   **⚡ Power Management**: Adaptive behavior that degrades gracefully (reduces sensor polling, disables heavy AI) to save battery.
*   **📅 Task Scheduling**: Remembers to remind you of tasks ("Remind me to water plants in 30 minutes").
*   **🎛️ Admin Debug Dashboard**: A comprehensive "Mission Control" UI for real-time telemetry (Vision fps, Motor status, Battery load, Sensor data).

---

## 🛠️ Project Requirements

### Hardware
*   **Android Smartphone**:
    *   **OS**: Android 8.0 (Oreo) or higher.
    *   **RAM**: 4GB+ recommended for smooth vision processing.
    *   **Camera**: Functional rear camera.
*   **Robot Chassis (Optional)**:
    *   Microcontroller (ESP32/Arduino) to drive motors.
    *   Motor Driver + DC Motors.
    *   Bluetooth Module (HC-05/06 or ESP32 internal) for phone-to-robot communication.

### Software
*   **Node.js**: v14+ and npm/yarn.
*   **React Native**: 0.70+ (CLI workflow recommended).
*   **Android Studio**: For compiling and installing execution on device.
*   **Expo**: (If using Expo workflow) SDK 48+.

### Core Libraries
*   `react-native-vision-camera`: High-performance camera streaming.
*   `react-native-voice`: Speech-to-Text conversion.
*   `react-native-bluetooth-classic`: Serial communication with robot base.
*   `tensorflow-lite` (Optional): For on-device advanced ML models.

---

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/react-native-robot-brain.git
cd react-native-robot-brain
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
```

### 3. Android Configuration
Ensure your Android device is connected with **USB Debugging** enabled.
1.  Open `android/` folder in Android Studio to sync Gradle.
2.  Add necessary permissions (Camera, Microphone, Bluetooth) in `AndroidManifest.xml` (already included in repo).

### 4. Run the App
```bash
# Start Metro Bundler
npm start

# Install on Android Device
npm run android
```

---

## 🧠 AI Brain Setup (Local Llama 3.2)

The robot uses a local **Llama 3.2** model via **Ollama** for advanced conversational intelligence.

### 1. Install Ollama
Download and install Ollama from [ollama.com](https://ollama.com).

### 2. Download the Model
Run the following command to download the 3B model (optimized for speed/mobile):
```bash
ollama pull llama3.2:3b
```

### 3. Run Ollama with External Access
By default, Ollama only listens to `localhost`. To allow the Android app to connect, you must set the host environment variable:

**macOS/Linux:**
```bash
OLLAMA_HOST=0.0.0.0 ollama serve
```

---

## 📦 Building & Transferring APK (Native Android)

To test on a real device with **Native Voice Recognition**, you must build a standalone APK.

### 1. Prerequisites (Setup Java)
Android builds require **JDK 17**. If you are on macOS:

```bash
# Install JDK 17 via Homebrew
brew install openjdk@17

# Link it to your system
sudo ln -sfn /opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk /Library/Java/JavaVirtualMachines/openjdk-17.jdk
```

### 2. Generate Native Project
If you haven't already, generate the native `android/` directory:
```bash
npx expo prebuild --platform android
```

### 3. Build the APK (Gradle)
Run the build script from the android folder:
```bash
cd android
./gradlew assembleDebug
```
**APK Location:** `android/app/build/outputs/apk/debug/app-debug.apk`

---

## 📲 Transferring APK to Android

Choose one of these methods to move the file from your Mac to your Phone:

### Method A: Direct Install (ADB) - Fastest
Connect your phone via USB with **USB Debugging** enabled.
```bash
# Install ADB if missing
brew install --cask android-platform-tools

# Install APK directly
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

### Method B: Wireless Transfer (Snapdrop)
1. Open **[Snapdrop.net](https://snapdrop.net/)** on both your Mac and Android phone (must be on same Wi-Fi).
2. Click the icon on your Mac and select the `app-debug.apk`.
3. Accept the download on your phone and Install.

### Method C: Local Web Server (Python)
1. In your terminal:
   ```bash
   cd android/app/build/outputs/apk/debug
   python3 -m http.server 8000
   ```
2. On your phone's browser, visit: `YOUR_MAC_IP:8000` (e.g., `192.168.1.5:8000`).
3. Tap the file to download and install.

---

## 🔌 Integration & Hardware Setup

### Bluetooth Motor Controller (Optional)
If connecting to a physical robot base:
1.  Flash your ESP32/Arduino with firmware that accepts serial strings (e.g., `'FORWARD'`, `'STOP'`).
2.  Pair the Android phone with the Bluetooth module.
3.  In `src/services/RobotService.js`, set `USE_BLUETOOTH = true` and update the `DEVICE_NAME`.

### Simulation Mode
Don't have hardware yet? The app defaults to **Simulation Mode**.
*   **Virtual Motors**: The app simulates physics, position, and movement.
*   **Manual Obstacles**: You can "inject" fake obstacles via the Admin Panel to test avoidance logic.

---

## 🕹️ Usage Instructions

### 1. Launching the Brain
*   Open the app. You will see the **User Mode** screen (Face Scan active).
*   **Authorize**: Once your face is recognized (default: 'OWNER_001'), the system unlocks personalized commands.

### 2. Voice Commands
Tap the microphone or enable "Always Listen" (if configured). Try saying:
*   *"Follow me"* — Starts visual tracking.
*   *"Stop" / "Halt"* — Emergency stop.
*   *"Play [Song Name]"* — Opens simple web player or YouTube intent.
*   *"Remind me to [Task] in [X] minutes"* — Schedules a task.
*   *"How are you?"* — Checks status and battery.

### 3. Admin Debug Panel
Navigate to the **Admin** tab to see the system internals:
*   **Cortex Link**: Shows what the Decision Engine is "thinking" (IDLE, FOLLOW, AVOID).
*   **Vision Feed**: Real-time camera stream with face bounding boxes and emotion labels.
*   **Sensor Array**: Live distance data (real or simulated).
*   **Energy Core**: Battery health and power mode.

---

## 📂 Project Structure

Verified module architecture:

```text
src/
├── core/               # Central Intelligence (DecisionEngine.js)
├── voice/              # Speech & NLU (IntentParser.js, CommandMap.js)
├── vision/             # (or camera/) Camera & Face Processing
├── navigation/         # Movement logic (FollowEngine, MoveToPoint)
├── emotional/          # (or ai-behavior/) Sentiment analysis & Personality
├── media/              # Audio playback & YouTube integration
├── sensors/            # Abstracted hardware inputs (Distance, Battery)
├── services/           # Singletons (Bluetooth, Global State)
├── tasks/              # Scheduler & Mission Queue
├── system/             # Power Management & resource allocation
├── screens/            # UI Components (AdminScreen, UserScreen)
└── simulation/         # Virtual hardware for testing
```

---

## 🤝 Contributing

We welcome contributions!
1.  **Fork** the repository.
2.  Create a feature branch (`git checkout -b feature/AmazingAI`).
3.  Commit your changes.
4.  Push to the branch.
5.  Open a **Pull Request**.

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

## 📞 Contact & Support

For bugs, feature requests, or help setting up your robot:
*   **Issues**: Open a ticket on GitHub Issues.
*   **Email**: support@robot-project.com

---
*Built with ❤️ and JavaScript in 2026.*
