#!/bin/bash

# Start Ollama in the background
ollama serve &
echo "Starting Ollama..."

# # Wait until Ollama is ready
# until curl -s http://localhost:11434 > /dev/null; do
#   echo "Waiting for Ollama..."
#   sleep 1
# done

echo "Ollama is ready."

# Optionally pull a model (e.g., llama3)
ollama pull gemma3

# Start FastAPI (Uvicorn)
echo "Starting FastAPI..."
exec fastapi run "./ollama-test.py"