import os
import uvicorn

if __name__ == "__main__":
    host = os.getenv("HOST", "127.0.0.1")
    port = int(os.getenv("PORT", "8000"))
    # Run from inside backend/ directory: python main.py
    # Or from project root:  uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
    uvicorn.run("app.main:app", host=host, port=port, reload=True)
