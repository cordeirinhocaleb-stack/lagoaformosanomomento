import sys
import json
import traceback

class BaseAgent:
    def __init__(self, name):
        self.name = name

    def log(self, message):
        """Log a message to stderr so it doesn't interfere with JSON stdout"""
        print(f"[LOG] [{self.name}] {message}", file=sys.stderr)

    def process(self, payload):
        """Override this method to implement agent logic"""
        raise NotImplementedError("Subclasses must implement process()")

    def run(self):
        """Main entry point: reads JSON from stdin, processes, prints JSON to stdout"""
        try:
            # Read all input from stdin
            input_data = sys.stdin.read()
            if not input_data:
                raise ValueError("No input data received")

            payload = json.loads(input_data)
            self.log(f"Received payload: {str(payload)[:50]}...")

            # Execute logic
            result = self.process(payload)

            # Output result as JSON
            print(json.dumps(result))

        except Exception as e:
            error_msg = f"Error in {self.name}: {str(e)}\n{traceback.format_exc()}"
            self.log(error_msg)
            # Fails gracefully by printing a JSON error
            print(json.dumps({
                "success": False,
                "error": str(e),
                "details": traceback.format_exc()
            }))
            sys.exit(1)

if __name__ == "__main__":
    # Basic test if run directly
    print(json.dumps({"status": "BaseAgent ready"}))
