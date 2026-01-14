import unittest
from unittest.mock import patch
import sys
import os
import io

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from interface.display import LCDController

class TestInterfaceModule(unittest.TestCase):
    def setUp(self):
        self.lcd = LCDController()

    @patch('sys.stdout', new_callable=io.StringIO)
    def test_show_text(self, mock_stdout):
        self.lcd.show_text("Hello", "World")
        output = mock_stdout.getvalue()
        self.assertIn("Hello", output)
        self.assertIn("World", output)

    @patch('sys.stdout', new_callable=io.StringIO)
    def test_show_status(self, mock_stdout):
        self.lcd.show_status("TESTING", "123")
        output = mock_stdout.getvalue()
        self.assertIn("STATUS: TESTING", output)
        
    def test_visual_feedback_smile(self):
        with patch('sys.stdout', new_callable=io.StringIO) as mock_stdout:
            self.lcd.show_visual_feedback("smile")
            self.assertIn("^   ^", mock_stdout.getvalue())

if __name__ == '__main__':
    unittest.main()
