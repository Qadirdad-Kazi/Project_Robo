import unittest
from unittest.mock import patch, MagicMock
import sys
import os
import json

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import ai.llm_handler

# Manually inject requests mock if it's missing (import failed)
if ai.llm_handler.requests is None:
    ai.llm_handler.requests = MagicMock()
    # Define a real exception class for the mock to use
    class MockRequestException(Exception): pass
    ai.llm_handler.requests.exceptions.RequestException = MockRequestException

from ai.llm_handler import LocalLLMHandler

class TestAIModule(unittest.TestCase):
    def setUp(self):
        self.ai = LocalLLMHandler(model_name="test-model")
        # Reset side effects and return values for the global mock
        ai.llm_handler.requests.post.side_effect = None
        ai.llm_handler.requests.post.return_value = MagicMock()
        ai.llm_handler.requests.post.return_value.status_code = 200
        ai.llm_handler.requests.post.return_value.json.return_value = {"response": "Mock Response"}

    def test_query_llm_success(self):
        mock_post = ai.llm_handler.requests.post
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {"response": "Hello world"}
        mock_post.return_value = mock_response

        response = self.ai.query_llm("Say hello")
        self.assertEqual(response, "Hello world")

    def test_query_llm_failure(self):
        mock_post = ai.llm_handler.requests.post
        # Raise the specific mocked exception class
        mock_post.side_effect = ai.llm_handler.requests.exceptions.RequestException("Connection refused")
        
        response = self.ai.query_llm("Say hello")
        self.assertIn("Error", response)
        
        # Cleanup
        mock_post.side_effect = None

    @patch('ai.llm_handler.LocalLLMHandler.query_llm')
    def test_interpret_command_json(self, mock_query):
        # This test mocks the method, so it doesn't care about requests
        mock_query.return_value = '{"action": "move_forward", "value": "fast"}'
        
        result = self.ai.interpret_command("Move forward fast")
        self.assertEqual(result['action'], 'move_forward')
        self.assertEqual(result['value'], 'fast')

    @patch('ai.llm_handler.LocalLLMHandler.query_llm')
    def test_interpret_command_fallback(self, mock_query):
        mock_query.return_value = "I did not understand that."
        
        result = self.ai.interpret_command("Gibberish")
        self.assertEqual(result['action'], 'say')
        self.assertEqual(result['value'], "I did not understand that.")

if __name__ == '__main__':
    unittest.main()
