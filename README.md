# Project Robo 🤖

Welcome to **Project Robo**, a comprehensive robotics system that combines a powerful Python-based hardware controller with a sleek React Native mobile interface.

## 📂 Project Structure

> **⚠️ IMPORTANT**: This repository contains two separate, independent projects for different hardware platforms. They are **MUTUALLY EXCLUSIVE** and **CANNOT** work together. Please choose the implementation that matches your hardware.

This monorepo is divided into two main components:

### 1. 📱 [React Native App](./Reactnative_app/README.md)
The mobile command center for the robot.
- **Features**: 
  - Voice Command Interface ("Move forward", "Dance", etc.)
  - Real-time Robot Logs & Debugging Console
  - Virtual Robot Simulator (for testing without hardware)
  - Biometric Security (FaceID/TouchID) for Admin access
- **Tech Stack**: React Native, Expo, styling with standard stylesheets.
- **[View Full App Documentation](./Reactnative_app/README.md)**

### 2. 🧠 [Raspberry Pi Controller](./Rusbarry%20pi/README.md)
The brain of the physical robot.
- **Features**:
  - Motor Control & Navigation Logic
  - AI Vision Processing
  - Sensor Integration
  - Voice Recognition (Native implementation)
- **Tech Stack**: Python, OpenCV (assumed for vision), GPIO libraries.
- **[View Full Hardware Documentation](./Rusbarry%20pi/README.md)**

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** & **npm** (for the App)
- **Python 3.8+** (for the Pi)
- **Git**

### Interface Setup (Mobile App)
Navigate to the mobile app directory:
```bash
cd Reactnative_app
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

## 🤝 Compatibility
As noted above, these two systems are standalone. The React Native App is designed to run on an Android phone as a complete robot brain (using the phone's sensors), while the Raspberry Pi project is a traditional Linux-based robot controller. They do not communicate with each other.

## 📄 License
[Add License Information Here]
