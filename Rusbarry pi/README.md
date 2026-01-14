# Robot Project

Welcome to the Robot project. This repository is organized into specific modules to handle different aspects of the robot's functionality, from low-level control to high-level AI processing.

## Project Structure

The codebase is divided into the following directories:

### `control/`
**Purpose**: Handles the physical interaction and movement of the robot. This module abstracts hardware details (GPIO) into high-level commands for the AI and Interface layers.

**Key Capabilities**:
- **Motor Drivers** (`motor_driver.py`):
  - Provides `RobotMover` class for coordinated movement.
  - Functions: `move_forward`, `move_backward`, `turn_left`, `turn_right`, `stop`.
  - Configurable motor speeds and PIN assignments.
- **Sensor Integration** (`sensors.py`):
  - `UltrasonicSensor`: Measures distance for obstacle avoidance.
  - `InfraredSensor`: Detects lines or close proximity objects.
  - `EnvironmentalAwareness`: High-level safety check (e.g., `check_path_clear`).
- **Navigation** (`navigation.py`):
  - `GridMap`: 2D environment mapping.
  - `PathPlanner`: A* algorithm for finding routes.
  - `Navigator`: Coordinates movement to specific target coordinates.
- Movement logic and control algorithms

**Interactions**:
- **AI Module**: Calls `RobotMover` methods to execute decision-based paths.
- **Interface Module**: Can manually override specific motor functions (e.g., teleoperation).

### `ai/`
**Purpose**: The brain of the robot, utilizing a Local LLM to process natural language and make intelligent decisions.

**Key Capabilities**:
- **Local LLM Integration** (`llm_handler.py`):
  - Connects to local inference servers (e.g., Ollama).
  - `interpret_command(input)`: Translates natural language into structured JSON commands.
  - Generates conversational responses for user interaction.
- **Environment Setup** (`initialization.py`):
  - Validates server availability (Ollama check).
  - Initializes the AI environment and handlers securely.
- **Computer Vision** (`vision.py`):
  - `FaceRecognizer`: Uses ML to identify known individuals.
  - `VisionSystem`: Scans camera frames to detect and greet users.
- High-level processing logic

**Interactions**:
- **Interface Module**: Receives raw text/voice input to send to the AI.
- **Control Module**: Receives structured action commands (e.g., `{"action": "move_forward"}`) from the AI to execute physical movements.

### `interface/`
**Purpose**: Manages the direct interaction between the user and the robot through visual and physical interfaces.

**Key Capabilities**:
- **LCD Display Manager** (`display.py`):
  - Controls the mini LCD screen (16x2 or compatible).
  - internal methods: `show_text`, `show_status`, `show_ai_response`, `show_visual_feedback`.
  - Provides visual cues (e.g., 'smile', 'alert') to indicate robot emotional/system state.
- **Camera Manager** (`camera.py`):
  - Wraps OpenCV to capture video frames.
  - Safe initialization mechanism (handles missing OpenCV gracefully).
- **Voice Recognition** (`voice.py`):
  - Converts spoken commands to text (Google/Sphinx).
  - Listens for specific wake words or commands.
- User input handling

**Interactions**:
- **AI Module**: Pushes text responses to the LCD via `show_ai_response`.
- **Control Module**: Updates the screen with real-time status (e.g., "MOVING FORWARD") using `show_status`.

### `utilities/`
**Purpose**: Shared resources used across different modules.
- **Media Controller** (`media.py`):
    - Plays audio/video content (YouTube Integration).
    - Interfaces with system browser or media libraries.
- Helper functions
- Common libraries
- General-purpose utilities

### `docs/`
**Purpose**: Documentation and integration guides.
- Module explanations
- Integration instructions (see `.txt` files within this folder)

## Integration Notes

For detailed instructions on how to connect these modules and integrate specific components, please refer to the documents in `docs/`:
- **[User Guide](docs/User_Guide.md)**: Instructions on how to use and interact with the robot.
- **[Setup Guide](docs/Setup_Guide.md)**: Detailed installation, wiring, and configuration steps.
- **Integration Notes**: See other text files in `docs/`.

Each module is designed to be modular, but inter-dependencies are documented there to ensure smooth operation.
