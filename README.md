To start the project in dev mode, run the following command in your terminal:

```
docker build . -t <tag>

docker run -it -p 8000:8000 -v $PWD:/usr/src/app -v /usr/src/app/node_modules <tag> npm run dev
```
