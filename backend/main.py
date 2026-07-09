from fastapi import FastAPI  # type: ignore[reportMissingImports]

app = FastAPI()

@app.get("/")
def root():
    return{"status": "ok"}