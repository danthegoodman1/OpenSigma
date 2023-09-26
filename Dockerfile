FROM oven/bun

WORKDIR /app

COPY ./src .

RUN bun install

ENTRYPOINT ["bun", "index.ts"]
