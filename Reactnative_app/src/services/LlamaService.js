// LlamaService.js
// Connects to a local Ollama instance (e.g., Llama 3.2)
// Default Port: 11434

class LlamaService {
    constructor() {
        this.host = 'http://192.168.100.136:11434'; // Default to observed IP, user can change
        this.model = 'llama3.2:3b';
        this.isThinking = false;
    }

    setHost(ip) {
        // Ensure protocol
        if (!ip.startsWith('http')) {
            this.host = `http://${ip}:11434`;
        } else {
            this.host = ip;
        }
        console.log(`[LlamaService] Host set to: ${this.host}`);
    }

    async checkConnection() {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2000);

            const response = await fetch(`${this.host}/api/tags`, {
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            return response.status === 200;
        } catch (e) {
            console.warn("[LlamaService] Connection check failed:", e.message);
            return false;
        }
    }

    /**
     * Send a prompt to Llama and get the response
     * @param {string} prompt 
     * @returns {Promise<string>}
     */
    async query(prompt) {
        if (this.isThinking) return "Busy thinking...";

        this.isThinking = true;
        console.log(`[LlamaService] Sending: "${prompt}" to ${this.model}`);

        try {
            const response = await fetch(`${this.host}/api/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: this.model,
                    prompt: prompt,
                    stream: false, // Non-streaming for simpler handling first
                    options: {
                        temperature: 0.7,
                        num_predict: 100 // Keep replies short for a robot
                    }
                })
            });

            if (!response.ok) {
                throw new Error(`Llama Error: ${response.statusText}`);
            }

            const data = await response.json();
            this.isThinking = false;
            return data.response.trim();

        } catch (error) {
            this.isThinking = false;
            console.error("[LlamaService] Query failed:", error);
            return `Error: ${error.message}`;
        }
    }
}

export default new LlamaService();
