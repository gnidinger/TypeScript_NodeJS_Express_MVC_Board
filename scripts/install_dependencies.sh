#!/bin/bash

# Node.js 설치
curl -sL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 애플리케이션 디렉토리로 이동
cd /home/ubuntu/action

# npm dependencies 설치
npm install
