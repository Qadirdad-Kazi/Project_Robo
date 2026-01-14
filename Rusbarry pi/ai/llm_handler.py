"""
AI Module - Local LLM Handler
=============================

This module manages the integration with a local Large Language Model (LLM),
such as Ollama, to provide intelligence to the robot.

It handles:
1.  Initialization of the connection to the LLM service.
2.  Processing user inputs (natural language) into actionable robot commands.
3.  Generating conversational responses.

Integration Note:
    - Inputs come from the `interface` module (voice/text).
    - Structured commands (actions) are sent to the `control` module.
"""

try:
    import requests
except ImportError:
    requests = None
import json

class LocalLLMHandler:
    """
    Interface for interacting with a locally running LLM (e.g., via Ollama API).
    """
    def __init__(self, model_name="llama3", api_url="http://localhost:11434/api/generate"):
        """
        Initialize the LLM handler.
        
        Args:
            model_name (str): The name of the model to use (default: "llama3").
            api_url (str): The endpoint for the local LLM API.
        """
        self.model_name = model_name
        self.api_url = api_url
        print(f"AI Module Initialized: Connected to {api_url} using model '{model_name}'")

    def query_llm(self, prompt, context=None):
        """
        Sends a raw prompt to the LLM and retrieves the text response.
        
        Args:
            prompt (str): The input text to process.
            context (list, optional): Conversation history/context for stateful interactions.
            
        Returns:
            str: The generated response from the LLM.
        """
        # Payload structure for Ollama API
        payload = {
            "model": self.model_name,
            "prompt": prompt,
            "stream": False 
        }
        
        # If context is provided, you might append it to prompt or use API specifics
        # For simplicity, we strictly send the prompt here.
        
        try:
            print(f"AI: Querying LLM with '{prompt}'...")
            response = requests.post(self.api_url, json=payload)
            response.raise_for_status()
            
            data = response.json()
            return data.get("response", "")
            
        except requests.exceptions.RequestException as e:
            print(f"AI Error: Failed to connect to LLM. Is Ollama running? Error: {e}")
            return "Error: I cannot reach my brain right now."

    def interpret_command(self, user_input):
        """
        Process a user command and determine the intent for the robot.
        
        This function uses prompt engineering to force the LLM to output 
        structured commands that the 'control' module can understand.
        
        Args:
            user_input (str): Natural language input (e.g., "Go forward a bit").
            
        Returns:
            dict: A dictionary containing 'action' and 'parameter', or 'response'.
                  Example: {'action': 'move_forward', 'speed': 0.8}
        """
        system_prompt = (
            "You are a robot assistant. Translate the following user command into a JSON response. "
            "Available actions: move_forward, move_backward, turn_left, turn_right, stop, say, play_music, open_youtube, come_here. "
            "Format: {\"action\": \"<action_name>\", \"value\": <optional_value>}. "
            "If it's just chat, use action 'say'. "
            f"User Command: {user_input}"
        )
        
        llm_response = self.query_llm(system_prompt)
        
        # Simple parsing logic to extract JSON from potential conversational wrapper
        # In a real scenario, you'd use a more robust parser or structured output mode.
        try:
            # Attempt to find JSON-like structure
            start = llm_response.find('{')
            end = llm_response.rfind('}') + 1
            if start != -1 and end != -1:
                json_str = llm_response[start:end]
                return json.loads(json_str)
            else:
                # Fallback if no strict JSON found
                return {"action": "say", "value": llm_response}
        except json.JSONDecodeError:
            return {"action": "say", "value": llm_response}

if __name__ == "__main__":
    # Test the AI module independently
    ai = LocalLLMHandler(model_name="llama3.2:3b")
    
    # Mocking a user command
    test_input = "Move forward quickly"
    result = ai.interpret_command(test_input)
    print(f"Interpreted Command: {result}")
