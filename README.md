# Project Robo 🤖

Welcome to **Project Robo**, a comprehensive robotics system that combines a powerful Python-based hardware controller with a sleek React Native mobile interface.

## 📂 Project Structure

This monorepo is divided into two main components:

### 1. 📱 React Native App (`/React Native`)
The mobile command center for the robot.
- **Features**: 
  - Voice Command Interface ("Move forward", "Dance", etc.)
  - Real-time Robot Logs & Debugging Console
  - Virtual Robot Simulator (for testing without hardware)
  - Biometric Security (FaceID/TouchID) for Admin access
- **Tech Stack**: React Native, Expo, styling with standard stylesheets.

### 2. 🧠 Raspberry Pi Controller (`/Rusbarry pi`)
The brain of the physical robot.
- **Features**:
  - Motor Control & Navigation Logic
  - AI Vision Processing
  - Sensor Integration
  - Voice Recognition (Native implementation)
- **Tech Stack**: Python, OpenCV (assumed for vision), GPIO libraries.

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** & **npm** (for the App)
- **Python 3.8+** (for the Pi)
- **Git**

### Interface Setup (Mobile App)
Navigate to the mobile app directory:
```bash
cd "React Native"
npm install
npx expo start
```
*Scan the QR code with the Expo Go app to control the robot.*

### Hardware Setup (Raspberry Pi)
Navigate to the hardware directory:
```bash
cd "Rusbarry pi"
pip install -r requirements.txt
python main.py
```

---

## 🤝 Integration
The React Native app communicates with the Raspberry Pi (currently simulated) via network requests. Ensure both devices are on the same Wi-Fi network for actual hardware control.

## 📄 License
[Add License Information Here]
