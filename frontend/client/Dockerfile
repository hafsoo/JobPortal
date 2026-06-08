# STAGE 1: BUILD STAGE (React/Vite build)
# =========================

# Node.js lightweight image use ho rahi hai build ke liye

FROM node:20-alpine AS builder
# Container ke andar working directory set kar rahe hain
WORKDIR /app
# package.json aur package-lock.json copy kar rahe hain
# taake dependencies install ho saken
COPY package*.json ./
# Node dependencies install kar rahe hain
RUN npm install
# Poora project code container mein copy kar rahe hain
COPY . .

# =========================
# ENV / BUILD ARG (VITE environment variable)
# =========================

# Build time pe API URL pass karne ke liye argument 
ARG VITE_API_URL=/api
# Is argument ko environment variable bana rahe hain
ENV VITE_API_URL=$VITE_API_URL
# React/Vite production build generate ho raha hai
# Output: dist/ folder
RUN npm run build


# =========================
# STAGE 2: PRODUCTION STAGE (Nginx server)
# =========================
# Lightweight Nginx image use ho rahi hai static files serve karne ke liye
FROM nginx:alpine
# Builder stage se built files copy kar rahe hain
# /app/dist (React build output) → Nginx web root folder
COPY --from=builder /app/dist /usr/share/nginx/html
# Custom nginx configuration file copy kar rahe hain
# Is se routing + API proxy rules apply hote hain
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Port 80 expose kar rahe hain (HTTP default port)
EXPOSE 80

# Nginx server ko foreground mein run karna
# (container ko alive rakhta hai)
CMD ["nginx", "-g", "daemon off;"]