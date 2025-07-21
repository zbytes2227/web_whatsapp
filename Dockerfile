# Use official Node 18 image, which has all Chromium dependencies needed by Puppeteer/Whatsapp-web.js
FROM node:18-bullseye

# Install Chromium browser dependencies for Puppeteer
 RUN apt-get update && apt-get install -y \
    libnss3 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdrm2 \
    libgbm1 \
    libgtk-3-0 \
    libasound2 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libxss1 \
    libxtst6 \
    libappindicator3-1 \
    libgconf-2-4 \
    libxshmfence1 \
    libglib2.0-0 \
    ca-certificates \
    fonts-liberation \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libu2f-udev \
    libvulkan1 \
    xdg-utils


# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json first (for better build cache)
COPY package.json package-lock.json ./

# Install node modules
RUN npm ci

# Copy rest of your application code
COPY . .

# Expose RAILWAY/Render required port
EXPOSE 3000

# Start your app (app.js or server.js—rename if needed)
CMD ["node", "app.js"]
