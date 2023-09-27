FROM oven/bun

WORKDIR /app

COPY ./src .
COPY ./package.json .
COPY ./package-lock.json .
COPY ./bun.lockb .

RUN bun install

ENTRYPOINT ["bun", "index.ts"]
