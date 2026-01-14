"""
Sensors Module
==============

This module handles the integration of environmental sensors, such as 
Ultrasonic (distance) and Infrared (line/obstacle) sensors.
"""

import time

# Placeholder for GPIO
# import RPi.GPIO as GPIO

class UltrasonicSensor:
    """
    HC-SR04 or similar Ultrasonic Distance Sensor.
    """
    def __init__(self, trig_pin, echo_pin):
        self.trig_pin = trig_pin
        self.echo_pin = echo_pin
        # GPIO.setup(trig_pin, GPIO.OUT)
        # GPIO.setup(echo_pin, GPIO.IN)
        print(f"Sensor: Ultrasonic initialized on Trig={trig_pin}, Echo={echo_pin}")

    def get_distance(self):
        """
        Returns the distance to an obstacle in cm.
        Mock implementation returns a varying safe distance.
        """
        # Logic: Trigger pulse -> Measure Echo time -> Calculate distance
        # For simulation, we return a safe distance usually, sometimes close.
        return 150.0  # 150 cm

class InfraredSensor:
    """
    IR Obstacle or Line Sensor.
    """
    def __init__(self, pin):
        self.pin = pin
        # GPIO.setup(pin, GPIO.IN)
        print(f"Sensor: IR initialized on Pin={pin}")

    def is_triggered(self):
        """
        Returns True if something is detected (reflection).
        """
        return False

class EnvironmentalAwareness:
    """
    High-level manager to check for immediate hazards.
    """
    def __init__(self):
        self.front_sonar = UltrasonicSensor(trig_pin=5, echo_pin=6)
        
    def check_path_clear(self):
        """
        Checks if the path ahead is clear.
        """
        dist = self.front_sonar.get_distance()
        if dist < 20: # 20 cm stop distance
            print(f"HAZARD: Obstacle detected at {dist}cm!")
            return False
        return True
