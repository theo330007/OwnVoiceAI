# --- Deploy OwnVoiceAI to Raspberry Pi ---
# Usage: .\deploy.ps1
#
# First-time setup on Pi:
#   sudo apt install -y nodejs npm
#   sudo npm install -g pm2
#   pm2 startup  # follow instructions
#   cd /var/www/OwnVoiceAI && git clone https://github.com/theo330007/OwnVoiceAI.git .
#   cp .env.local.example .env.local  # fill in your keys
#   npm install

$REMOTE_USER = "tobidow"
$REMOTE_HOST = "raspberryTLC"
$REMOTE_DIR = "/home/tobidow/OwnVoiceAI"
$APP_NAME = "ownvoiceai"
$PORT = 3010

Write-Host "Deploying OwnVoiceAI to $REMOTE_HOST..." -ForegroundColor Cyan

ssh -t "$REMOTE_USER@$REMOTE_HOST" "cd $REMOTE_DIR && git pull && npm install && npm run build && (pm2 restart $APP_NAME 2>/dev/null || PORT=$PORT pm2 start npm --name $APP_NAME -- start) && pm2 save"

if ($LASTEXITCODE -eq 0) {
    Write-Host "Deployed! Running at http://${REMOTE_HOST}:${PORT}" -ForegroundColor Green
} else {
    Write-Host "Deployment failed." -ForegroundColor Red
}
