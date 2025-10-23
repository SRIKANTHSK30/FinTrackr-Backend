# 1️⃣ Use Node.js LTS
FROM node:20

# 2️⃣ Set working directory
WORKDIR /app

# 3️⃣ Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# 4️⃣ Copy tsconfig and source files
COPY tsconfig.json ./
COPY src ./src

# 5️⃣ Build TypeScript
RUN npm run build

# 6️⃣ Expose port
EXPOSE 5000

# 7️⃣ Start the server
CMD ["npm", "run", "start"]
