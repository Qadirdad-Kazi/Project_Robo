"""
Main Robot Application
======================

This is the central entry point for the Robot.
It integrates all modules:
- Control (Motors, Sensors, Navigation)
- AI (LLM, Vision)
- Interface (Display, Voice, Camera)
- Utilities (Media)

The main loop listens for input, processes it via AI, and executes actions.
"""

import time
import threading
import sys
import queue

# Import Modules
from control.motor_driver import RobotMover
from control.sensors import EnvironmentalAwareness
from control.navigation import Navigator
from ai.initialization import initialize_ai_environment
from ai.vision import VisionSystem
from interface.display import LCDController
from interface.voice import VoiceRecognizer
from interface.camera import Camera
from utilities.media import MediaController

class RobotApp:
    def __init__(self):
        print(">>> SYSTEM STARTUP <<<")
        
        # 1. Hardware Initialization
        self.lcd = LCDController()
        self.lcd.show_status("BOOTING", "Please Wait...")
        
        self.camera = Camera()
        self.mover = RobotMover()
        self.sensors = EnvironmentalAwareness()
        self.navigator = Navigator(self.mover, self.sensors)
        self.media = MediaController()
        
        # 2. AI Initialization
        self.ai = initialize_ai_environment(model_name="llama3.2:3b")
        self.vision = VisionSystem()
        self.voice = VoiceRecognizer()
        
        # 3. State Management
        self.running = True
        self.command_queue = queue.Queue()
        
        if self.ai:
            self.lcd.show_visual_feedback("smile")
            time.sleep(1)
            self.lcd.show_status("READY", "Listening...")
        else:
            self.lcd.show_visual_feedback("alert")
            self.lcd.show_status("ERROR", "AI Offline")

    def vision_loop(self):
        """Background thread for checking visual inputs."""
        while self.running:
            frame = self.camera.get_frame()
            if frame:
                name = self.vision.scan_for_people(frame)
                if name:
                    # If we see someone new, maybe greet them?
                    # For now, just log it to avoid spamming the AI
                    # print(f"Seen: {name}")
                    pass
            time.sleep(1)

    def process_action(self, intent):
        """Executes the structured command from the AI."""
        action = intent.get("action")
        value = intent.get("value")
        
        print(f"Action: {action}, Value: {value}")
        
        if action == "say":
            self.lcd.show_ai_response(value)
            # Future: Text-to-Speech here
            
        elif action == "move_forward":
            self.lcd.show_status("MOVING", "Forward")
            if self.sensors.check_path_clear():
                self.mover.move_forward()
                time.sleep(2) # Move for 2 seconds
                self.mover.stop()
            else:
                self.lcd.show_visual_feedback("alert")
                self.lcd.show_text("OBSTACLE", "Cannot Move")
                
        elif action == "turn_left":
            self.mover.turn_left()
            time.sleep(1)
            self.mover.stop()
            
        elif action == "turn_right":
            self.mover.turn_right()
            time.sleep(1)
            self.mover.stop()
            
        elif action == "stop":
            self.mover.stop()
            self.lcd.show_status("STOPPED", "")
            
        elif action == "play_music" or action == "open_youtube":
            self.lcd.show_status("MEDIA", "Playing...")
            if value:
                self.media.play_youtube(value)
            else:
                self.media.play_youtube("robot music")
                
        elif action == "come_here":
            self.lcd.show_status("NAVIGATING", "To You")
            # Navigate to 'home' or specific coords
            self.navigator.go_to(10, 10) 
            
        else:
            print("Unknown Action")
            
        self.lcd.show_status("READY", "")

    def run(self):
        """Main event loop."""
        
        # Start vision in background
        vision_thread = threading.Thread(target=self.vision_loop, daemon=True)
        vision_thread.start()
        
        print(">>> ROBOT IS LISTENING <<<")
        try:
            while self.running:
                # 1. Listen for voice
                cmd_text = self.voice.listen()
                
                if cmd_text:
                    self.lcd.show_status("THINKING", "Processing...")
                    
                    # 2. Ask AI
                    if self.ai:
                        intent = self.ai.interpret_command(cmd_text)
                        
                        # 3. Execute
                        self.process_action(intent)
                    else:
                        print("AI Offline, cannot process.")
                        
                # Small delay to prevent CPU hogging if listen returns None immediately
                time.sleep(0.1)
                
        except KeyboardInterrupt:
            print("\n>>> SHUTTING DOWN <<<")
            self.running = False
            self.mover.stop()
            self.lcd.clear()

if __name__ == "__main__":
    app = RobotApp()
    app.run()
