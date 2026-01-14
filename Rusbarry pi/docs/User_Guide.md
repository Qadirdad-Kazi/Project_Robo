# Robot User Guide

Welcome to your AI Robot! This guide will help you understand how to interact with, customize, and troubleshoot your robot.

## Getting Started

### 1. Power On
- Switch on the main power toggle located on the robot's chassis.
- The LCD screen should light up and display "BOOTING".

### 2. Initialization
- The robot performs a self-check of motors, camera, and sensors.
- **Success**: Screen shows a "Smile" face and prompts "Ready".
- **Failure**: Screen shows "ALERT" and a status code (see Troubleshooting).

### 3. Basic Interactions
- **Voice Commands**: Speak clearly to the robot. "Move forward", "Stop", or "Who am I?".
- **Visuals**: The robot will look at you. If it recognizes you, it might say your name.

## Features

### Movement
The robot uses high-torque motors to drive. It monitors its surroundings for obstacles. 
*Note: The robot will automatically stop if an object is within 20cm.*

### AI Personality
The robot uses a local LLM to converse. You can ask it general questions, or give it commands.
- "Tell me a joke"
- "Turn left"

### Face Recognition
The robot learns faces stored in the `data/faces` directory. Add your photo there to be recognized!

## Customization

### Changing the Wake Word
Currently, the robot listens to all input. To customize trigger phrases, edit `ai/initialization.py`.

### Tuning Motor Speed
Open `control/motor_driver.py` and adjust the default speed values in `RobotMover`.

## Troubleshooting

| Issue | Possible Cause | Solution |
|-------|----------------|----------|
| Robot won't move | Battery low or Emergency Stop | Check battery, ensure path is clear. |
| AI not responding | Ollama server down | Run `ollama serve` on the host. |
| Camera error | Connection loose | Check camera ribbon cable. |
| "Module not found" | Missing dependencies | Run `pip install -r requirements.txt`. |

## Maintenance
- **Cleaning**: Wipe sensors with a clean, dry cloth.
- **Battery**: Charge when motor speed noticeably drops.
