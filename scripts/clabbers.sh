#!/usr/bin/env sh

CURRENT_DICT=csw24.json

if [ -f clabbers.sh ]; then cd ..; fi
cd src/static/words || :

rm clabbers.json
node -e "
const dict = require('./$CURRENT_DICT');
const keys = Object.keys(dict).map(word => word.split('').sort().join(''));
const clabbers = Object.fromEntries(keys.sort().map(key => [key, true]));
fs.writeFileSync('./clabbers.json', JSON.stringify(clabbers, null, '\t'));
"

