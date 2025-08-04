#!/usr/bin/env bash

npx http-server src/web -p 8080 &
USE_WEB=false WEB_PORT=8080 WEB_URL=http://localhost:8080 npx ts-node --project tsconfig.debug.json src/ps/games/debug.ts &
npx http-server scripts/debug-games/live -p 8081 -o page.html
