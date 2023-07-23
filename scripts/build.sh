#!/bin/bash

# Add Node.js and npm to PATH
export PATH="/home/ubuntu/.nvm/versions/node/v18.17.0/bin:$PATH"

# 권한 부여
sudo chown -R $USER:$GROUP /home/ubuntu/action

# 애플리케이션 디렉토리로 이동
cd /home/ubuntu/action

# 애플리케이션 빌드
sudo npm run build