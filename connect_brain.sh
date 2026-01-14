#!/bin/bash
echo "🧠 Starting Ollama Brain for External Access..."
echo "This allows your phone to connect to Llama 3.2 on this laptop."
echo "Press Ctrl+C to stop."
echo ""

# Set Host to 0.0.0.0 to listen on all interfaces
export OLLAMA_HOST=0.0.0.0

# Start serve
ollama serve
