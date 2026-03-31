import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api_shared import vtlog, package_name, config
import signal
import sys


app = FastAPI(
    title="PDF Input API",
    description="PDF input processing API",
    version="0.1.0",
    docs_url="/docs",
    redoc_url=None
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"service": package_name, "status": "running"}


@app.get("/health")
async def health():
    return {"status": "ok"}


def exit_handler(sig_num, frame):
    vtlog.info("Stopping application: {0}".format(package_name))
    sys.exit()


if __name__ == "__main__":
    signal.signal(signal.SIGTERM, exit_handler)
    signal.signal(signal.SIGINT, exit_handler)

    port = int(config.get("APP_PORT", "5030"))
    host = config.get("APP_HOST", "0.0.0.0")

    vtlog.info("Starting PDF Input API", port=port, host=host)
    uvicorn.run(app, port=port, host=host, log_level="info")
