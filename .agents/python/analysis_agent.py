from base_agent import BaseAgent
import hashlib

class AnalysisAgent(BaseAgent):
    def __init__(self):
        super().__init__("analysis-agent")

    def process(self, payload):
        """
        Simple verification task:
        1. Receive detailed text/data
        2. Count words
        3. Generate a hash (proof of processing)
        """
        data = payload.get("data", "")
        mode = payload.get("mode", "default")
        
        self.log(f"Processing in mode: {mode}")

        if not isinstance(data, str):
            data = str(data)

        word_count = len(data.split())
        char_count = len(data)
        content_hash = hashlib.md5(data.encode()).hexdigest()

        return {
            "success": True,
            "analysis": {
                "word_count": word_count,
                "char_count": char_count,
                "hash": content_hash,
                "agent_version": "1.0-python"
            },
            "message": "Python processing successful"
        }

if __name__ == "__main__":
    agent = AnalysisAgent()
    agent.run()
