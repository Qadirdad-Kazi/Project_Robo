"""
Motor Control Module
====================

This module handles the low-level interface with the motor drivers.
It provides a high-level API to move the robot (forward, backward, turn),
abstracting the hardware details from the AI and logic layers.

Integration Note:
    - This module is intended to be imported by the main logic loop or the AI event handler.
    - Example: `from control.motor_driver import RobotMover`
"""

import time

# Placeholder for GPIO library (e.g., RPi.GPIO or gpiozero)
# import RPi.GPIO as GPIO

class MotorDriver:
    """
    Handles the direct signal control for a single motor or a pair of motors on one side.
    """
    def __init__(self, pin_fwd, pin_bwd, pwm_pin=None):
        """
        Initialize the motor driver pins.
        
        Args:
            pin_fwd (int): GPIO pin for forward logic.
            pin_bwd (int): GPIO pin for backward logic.
            pwm_pin (int, optional): GPIO pin for speed control (PWM).
        """
        self.pin_fwd = pin_fwd
        self.pin_bwd = pin_bwd
        self.pwm_pin = pwm_pin
        self.current_speed = 0
        
        # Hardware Initialization (Mock)
        # GPIO.setup(self.pin_fwd, GPIO.OUT)
        # GPIO.setup(self.pin_bwd, GPIO.OUT)
        # if self.pwm_pin:
        #     GPIO.setup(self.pwm_pin, GPIO.OUT)
        
        print(f"Initialized Motor (Fwd: {pin_fwd}, Bwd: {pin_bwd})")

    def set_speed(self, speed):
        """
        Sets the speed and direction of the motor.
        
        Args:
            speed (float): Value between -1.0 (full reverse) and 1.0 (full forward).
        """
        self.current_speed = speed
        
        if speed > 0:
            # Logic for moving forward
            # GPIO.output(self.pin_fwd, GPIO.HIGH)
            # GPIO.output(self.pin_bwd, GPIO.LOW)
            pass
        elif speed < 0:
            # Logic for moving backward
            # GPIO.output(self.pin_fwd, GPIO.LOW)
            # GPIO.output(self.pin_bwd, GPIO.HIGH)
            pass
        else:
            # Stop
            # GPIO.output(self.pin_fwd, GPIO.LOW)
            # GPIO.output(self.pin_bwd, GPIO.LOW)
            pass
            
        print(f"Motor set to speed: {speed}")


class RobotMover:
    """
    High-level controller for the robot's movement.
    Integrates Left and Right motor groups to perform coordinated movements.
    """
    def __init__(self):
        # Configuration - Update these pins based on actual wiring
        LEFT_MOTOR_FWD_PIN = 17
        LEFT_MOTOR_BWD_PIN = 18
        RIGHT_MOTOR_FWD_PIN = 22
        RIGHT_MOTOR_BWD_PIN = 23
        
        self.left_motor = MotorDriver(LEFT_MOTOR_FWD_PIN, LEFT_MOTOR_BWD_PIN)
        self.right_motor = MotorDriver(RIGHT_MOTOR_FWD_PIN, RIGHT_MOTOR_BWD_PIN)

    def __del__(self):
        """Safety cleanup to ensure motors stop on object destruction."""
        try:
            self.stop()
        except:
            pass
        
    def move_forward(self, speed=1.0):
        """
        Moves the robot forward.
        
        Integration:
            - Called by AI decision logic when path is clear.
            - Called by Teleop interface when 'Up' is pressed.
        """
        print("MOVING FORWARD")
        self.left_motor.set_speed(speed)
        self.right_motor.set_speed(speed)

    def move_backward(self, speed=1.0):
        """
        Moves the robot backward.
        
        Integration:
            - Used for backing out of collisions or obstacles.
        """
        print("MOVING BACKWARD")
        self.left_motor.set_speed(-speed)
        self.right_motor.set_speed(-speed)

    def turn_left(self, speed=0.8):
        """
        Performs a spot turn to the left.
        
        Integration:
            - AI uses this to orient towards a target detected on the left.
        """
        print("TURNING LEFT")
        self.left_motor.set_speed(-speed)  # Left motor back
        self.right_motor.set_speed(speed)  # Right motor forward

    def turn_right(self, speed=0.8):
        """
        Performs a spot turn to the right.
        
        Integration:
            - AI uses this to orient towards a target detected on the right.
        """
        print("TURNING RIGHT")
        self.left_motor.set_speed(speed)   # Left motor forward
        self.right_motor.set_speed(-speed) # Right motor back

    def stop(self):
        """
        Halts all movement immediately.
        
        Integration:
            - Critical for E-Stop functionality.
            - Called when AI detects an imminent collision.
        """
        print("STOPPING")
        self.left_motor.set_speed(0)
        self.right_motor.set_speed(0)

if __name__ == "__main__":
    # Test sequence
    bot = RobotMover()
    bot.move_forward()
    time.sleep(1)
    bot.turn_left()
    time.sleep(1)
    bot.stop()
