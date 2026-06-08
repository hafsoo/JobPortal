# Base image: Node.js 20 lightweight Alpine Linux version
FROM node:20-alpine
# Working directory set kar rahe hain container ke andar
WORKDIR /app
# package.json aur package-lock.json copy kar rahe hain
# (dependencies install karne ke liye zaroori hota hai)
COPY package*.json ./
# Project ki dependencies install kar rahe hain
RUN npm install
# Baqi poora project code container ke andar copy kar rahe hain
COPY . .
# uploads folder create kar rahe hain (file/image uploads ke liye)
RUN mkdir -p uploads

# Application kis port par run hogi (documentation purpose)
EXPOSE 5000
# Container start hone par yeh command run hogi
# Node server start karega
CMD ["node", "server.js"]