FROM node:20-alpine
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG NODE_ENV=production
ENV NODE_ENV=$NODE_ENV

RUN if [ "$NODE_ENV" = "production" ]; then npm run build; fi

EXPOSE 5173

CMD if [ "$NODE_ENV" = "production" ]; then \
      npm run preview -- --host --port 5173; \
    else \
      npm run dev -- --host --port 5173; \
    fi
