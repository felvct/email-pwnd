#!/bin/bash
# if node_modules does not exist then install the dependencies
if [ ! -d "./node_modules" ]; then
  npm install
fi

npm run start
