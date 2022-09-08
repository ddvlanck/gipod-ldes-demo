FROM node:18

COPY / /app
WORKDIR /app

RUN npm install
RUN npm run build

CMD ["node", "bin/cli-runner.js"]