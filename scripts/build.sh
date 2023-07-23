#!/bin/bash

# Add Node.js and npm to PATH
export PATH="/home/ubuntu/.nvm/versions/node/v18.17.0/bin:$PATH"

# 애플리케이션 디렉토리로 이동
cd /home/ubuntu/action

# 애플리케이션 빌드
npm run build
