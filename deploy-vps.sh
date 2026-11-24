#!/bin/bash
# Uso: ./deploy-vps.sh  -> envia o código pro GitHub e atualiza o site na VPS
set -e
git add -A && (git diff --cached --quiet || git commit -qm "${1:-Atualização}")
git push -q origin master
ssh -i ~/.ssh/vps_sinais deploy@82.27.17.122 /opt/anderson-slots/deploy.sh
