#!/bin/bash
# if node_modules does not exist then run an npm install
if [ ! -d "./node_modules" ]; then
  npm install
fi

npm run start
