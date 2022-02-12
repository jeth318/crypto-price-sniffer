#!/usr/bin/env bash
BRANCH_NAME=$1;

if [[ $BRANCH_NAME == "master" || $BRANCH_NAME == "main" ]]; then
        cd /home/pi/Apps/crypto-price-sniffer/production
elif [[ $BRANCH_NAME == "staging" ]]; then
        cd /home/pi/Apps/crypto-price-sniffer/staging
else
        exit 0;
fi

echo "Stashing lock files "
git stash

echo "Dropping stash"
git stash drop

echo "Pulling from ${BRANCH_NAME}"
git pull origin ${BRANCH_NAME}
echo "Pulled successfully"


echo "Installing dependencies"
npm ci
echo "Project dependencies was installed"

echo "Rebooting cps (crypto-price-sniffer) application"

if [[ $BRANCH_NAME == "master" || $BRANCH_NAME == "main" ]]; then
        echo "pm2 restart cps-prod"
elif [[ $BRANCH_NAME == "staging" ]]; then
        echo "pm2 restart cps-staging"
else
        exit 0;
fi
echo "Reboot OK"
echo "Deployment complete, and it was a success!"

exit 0