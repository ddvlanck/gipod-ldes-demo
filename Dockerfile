FROM node:18

COPY / /app
WORKDIR /app

RUN npm install
RUN npm run build

CMD ["/bin/sh", "bin/cli-runner.sh"]