"""
AI Initialization Module
========================

This module provides functions to set up the AI environment and initialize the
Local LLM handler. It checks for necessary prerequisites (like server availability)
before returning a ready-to-use AI instance.
"""

import os
import sys

try:
    import requests
except ImportError:
    requests = None

from .llm_handler import LocalLLMHandler

def check_ollama_status(api_url="http://localhost:11434"):
    """
    Checks if the local Ollama server is running.
    
    Returns:
        bool: True if server is reachable, False otherwise.
    """
    if requests is None:
        print("AI Init: Requests library not installed. Cannot check server status.")
        return False

    try:
        # Simple GET request to check availability (Ollama usually returns 404 on root or explicit message)
        response = requests.get(api_url, timeout=2)
        if response.status_code == 200:
            return True
    except requests.exceptions.RequestException:
        pass
    return False

def initialize_ai_environment(model_name="llama3.2:3b"):
    """
    Sets up the AI environment and initializes the LLM handler.
    
    1. Checks if the Ollama server is reachable.
    2. Verifies the connection to the specific model.
    3. Returns the configured LocalLLMHandler instance.
    
    Args:
        model_name (str): The name of the LLM model to use.
        
    Returns:
        LocalLLMHandler: An initialized instance ready for processing commands.
        None: If initialization fails.
    """
    print("--- AI Environment Setup ---")
    
    # Check Server
    if not check_ollama_status():
        print("ERROR: Ollama server not detected at localhost (or requests lib missing).")
        print("Please ensure 'ollama serve' is running in a separate terminal.")
        return None
        
    print(" - Server Status: OK")
    
    # Initialize Handler
    try:
        ai_handler = LocalLLMHandler(model_name=model_name)
        # Optional: dry run query to ensure model is loaded
        # print(" - Warming up model...")
        # ai_handler.query_llm("hello") 
        print(f" - Connection established to model: {model_name}")
        return ai_handler
        
    except Exception as e:
        print(f"ERROR: Failed to initialize AI Handler: {e}")
        return None

def handle_voice_input_mock():
    """
    Placeholder for Voice-to-Text logic.
    In a real implementation, this would use 'speech_recognition' or similar libraries.
    
    Returns:
        str: Transcribed text command.
    """
    # Mocking voice input for now
    print("[Voice Module] Listening... (Simulation: returning 'Activate Forward Thrusters')")
    return "Activate Forward Thrusters"

if __name__ == "__main__":
    # Test the initialization flow
    ai_instance = initialize_ai_environment()
    if ai_instance:
        print("AI System is Ready.")
        
        # Simulate an input loop
        command = handle_voice_input_mock()
        response = ai_instance.interpret_command(command)
        print(f"Processed Command: {response}")
