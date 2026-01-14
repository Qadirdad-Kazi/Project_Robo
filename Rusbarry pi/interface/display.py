"""
Interface Module - LCD Display Manager
======================================

This module manages the visual output to the robot's mini LCD screen.
It provides high-level methods to display system status, AI responses,
and visual feedback for user interactions.

Integration Note:
    - Called by `ai` module to show responses.
    - Called by `control` module to show moving status (e.g., arrows).
    - Can be expanded to use I2C/SPI drivers (e.g., standard 16x2 or OLED).
"""

import time

# Placeholder for actual LCD library (e.g., RPLCD, Adafruit_SSD1306)
# from RPLCD.i2c import CharLCD

class LCDController:
    """
    Controller for the robot's visual display.
    Mocks the hardware interaction for a generic character or graphical display.
    """
    def __init__(self, i2c_addr=0x27):
        """
        Initialize the display connection.
        
        Args:
            i2c_addr (hex): I2C address of the display (default generic address).
        """
        self.address = i2c_addr
        # Mock connection logic
        # self.lcd = CharLCD('PCF8574', address=i2c_addr)
        print(f"Interface: LCD Initialized at address {hex(i2c_addr)}")
        self.clear()

    def clear(self):
        """Clears the display content."""
        print("[LCD] <Cleared Screen>")
        # self.lcd.clear()

    def show_text(self, line1="", line2=""):
        """
        Displays two lines of text on the screen.
        
        Args:
            line1 (str): Text for the top row (max 16 chars).
            line2 (str): Text for the second row (max 16 chars).
        """
        # Truncate for simulation realism (standard 16x2 LCD)
        l1 = line1[:16]
        l2 = line2[:16]
        
        print(f"\n--- [LCD DISPLAY] ---\n| {l1:<16} |\n| {l2:<16} |\n---------------------")
        # self.lcd.write_string(l1 + '\r\n' + l2)

    def show_status(self, state, details=""):
        """
        Displays a standardized system status message.
        
        Args:
            state (str): The main state (e.g., "MOVING", "THINKING").
            details (str): Additional context (e.g., "Forward", "Processing").
        """
        self.show_text(f"STATUS: {state}", details)

    def show_ai_response(self, response_text):
        """
        Scrolls or displays a longer AI response.
        
        Args:
            response_text (str): The full string response from the AI.
        """
        print(f"[LCD] Streaming AI Response: {response_text}")
        
        # Simple pagination logic for long text
        chunk_size = 16
        for i in range(0, len(response_text), chunk_size):
            line = response_text[i:i+chunk_size]
            self.show_text("AI says:", line)
            # Reduced sleep time for better responsiveness, or use non-blocking approach in main loop
            time.sleep(0.5)

    def show_visual_feedback(self, feedback_type):
        """
        Displays iconic or preset visual feedback.
        
        Args:
            feedback_type (str): 'smile', 'alert', 'sleep'.
        """
        if feedback_type == 'smile':
            # Escaping the backslash for the smile ASCII art
            self.show_text("    ^   ^    ", "    \\___/    ")
        elif feedback_type == 'alert':
            self.show_text("  !! ALERT !! ", "  Check System")
        elif feedback_type == 'sleep':
            self.show_text("    z Z z     ", "   Sleeping   ")
        else:
            self.show_text("Unknown", "Feedback")

if __name__ == "__main__":
    # Test sequence
    lcd = LCDController()
    lcd.show_status("BOOTING", "Please Wait...")
    time.sleep(1)
    lcd.show_visual_feedback("smile")
    time.sleep(1)
    lcd.show_ai_response("Hello, human! I am ready.")
