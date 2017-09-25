#!/bin/sh

NAME="SteemitMoreInfo"

FILES="manifest.json chrome.ext.js document_start.js LICENSE README.md smi.png smi16.png smi48.png src/* vendor/*"

mkdir -p dist
rm -f "dist/${NAME}.zip"
zip -r "dist/${NAME}.zip" $FILES  -x "*.DS_Store"
