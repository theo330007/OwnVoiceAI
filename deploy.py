"""
Deploy OwnVoiceAI to Raspberry Pi via SSH (paramiko).
Reads SSH credentials from .env.deploy (gitignored).
Usage: python deploy.py
"""
import sys, time, os, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

def load_env(path=".env.deploy"):
    env = {}
    try:
        with open(path) as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    k, v = line.split("=", 1)
                    env[k.strip()] = v.strip().strip('"').strip("'")
    except FileNotFoundError:
        pass
    return env

env = load_env()

HOST     = env.get("PI_HOST",     "raspberryTLC")
USER     = env.get("PI_USER",     "tobidow")
PASSWORD = env.get("PI_PASSWORD", "")
DIR      = env.get("PI_DIR",      "/home/tobidow/OwnVoiceAI")
APP      = env.get("PI_APP",      "ownvoiceai")
PORT     = env.get("PI_PORT",     "3010")

if not PASSWORD:
    print("ERROR: PI_PASSWORD not set in .env.deploy")
    sys.exit(1)

CMD = (
    f"cd {DIR} && git pull && npm install && npm run build && "
    f"(pm2 restart {APP} 2>/dev/null || PORT={PORT} pm2 start npm --name {APP} -- start) && pm2 save"
)

try:
    import paramiko
except ImportError:
    print("ERROR: paramiko not installed. Run: pip install paramiko")
    sys.exit(1)

print(f"Connecting to {USER}@{HOST}...")
client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(HOST, username=USER, password=PASSWORD, timeout=15)
print("Connected. Deploying...\n")

chan = client.get_transport().open_session()
chan.set_combine_stderr(True)
chan.exec_command(CMD)

while True:
    if chan.recv_ready():
        sys.stdout.write(chan.recv(4096).decode(errors="replace"))
        sys.stdout.flush()
    if chan.exit_status_ready():
        while chan.recv_ready():
            sys.stdout.write(chan.recv(4096).decode(errors="replace"))
            sys.stdout.flush()
        break
    time.sleep(0.1)

code = chan.recv_exit_status()
client.close()

if code == 0:
    print(f"\nDeployed! Running at http://{HOST}:{PORT}")
else:
    print(f"\nDeployment failed (exit {code})")
    sys.exit(1)
