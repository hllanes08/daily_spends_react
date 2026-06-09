FROM ubuntu:24.04 AS build

RUN apt-get update && apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG VITE_API_HOST
ENV VITE_API_HOST=$VITE_API_HOST

RUN npm run build

FROM ubuntu:24.04

RUN apt-get update && apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean && rm -rf /var/lib/apt/lists/* && \
    npm install -g serve

WORKDIR /app

COPY --from=build /app/dist ./dist

EXPOSE 8000

CMD ["serve", "-s", "dist", "-l", "8000"]
