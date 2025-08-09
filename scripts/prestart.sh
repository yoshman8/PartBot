#!/usr/bin/env sh

set -a && source .env && set +a
if [[ "$USE_WEB" = 'true' ]]
then
  echo 'Running web setup in the background...'
  npm run webpack &
  npm run tailwind &
else
  echo 'Skipping web setup...'
fi
