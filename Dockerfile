FROM --platform=linux/amd64 node:18
RUN ["apt-get","update"]
RUN ["apt-get","install","-y","vim"]
RUN ["npm","install","nodemon","-g"]
WORKDIR /usr/src/app
COPY . .
RUN npm install
EXPOSE 8000
CMD ["npm", "start"]
