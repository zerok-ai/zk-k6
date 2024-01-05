FROM --platform=linux/amd64 node:18-alpine
RUN ["npm","install","nodemon","-g"]
WORKDIR /usr/src/app
COPY . .
RUN npm install
EXPOSE 8000
RUN ["npm","run","build"]
CMD ["npm", "start"]
