import unittest
import sys
import os

# Add the root directory to sys.path so we can import from control, ai, etc.
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from control.motor_driver import RobotMover

class TestControlModule(unittest.TestCase):
    def setUp(self):
        self.bot = RobotMover()

    def test_move_forward(self):
        self.bot.move_forward(speed=0.5)
        self.assertEqual(self.bot.left_motor.current_speed, 0.5)
        self.assertEqual(self.bot.right_motor.current_speed, 0.5)

    def test_move_backward(self):
        self.bot.move_backward(speed=0.5)
        self.assertEqual(self.bot.left_motor.current_speed, -0.5)
        self.assertEqual(self.bot.right_motor.current_speed, -0.5)

    def test_turn_left(self):
        self.bot.turn_left(speed=0.5)
        # Left motor should be negative (back), Right motor should be positive (forward)
        self.assertEqual(self.bot.left_motor.current_speed, -0.5)
        self.assertEqual(self.bot.right_motor.current_speed, 0.5)

    def test_turn_right(self):
        self.bot.turn_right(speed=0.5)
        # Left motor should be positive (forward), Right motor should be negative (back)
        self.assertEqual(self.bot.left_motor.current_speed, 0.5)
        self.assertEqual(self.bot.right_motor.current_speed, -0.5)

    def test_stop(self):
        self.bot.move_forward(1.0)
        self.bot.stop()
        self.assertEqual(self.bot.left_motor.current_speed, 0)
        self.assertEqual(self.bot.right_motor.current_speed, 0)

if __name__ == '__main__':
    unittest.main()
