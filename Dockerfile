# Build frontend dist.
FROM node:18.12.1-alpine3.16 AS frontend
WORKDIR /frontend-build

COPY ./frontend/web/package.json ./frontend/web/pnpm-lock.yaml ./

RUN corepack enable && pnpm i --frozen-lockfile

COPY ./frontend/web/ .

RUN pnpm build

# Build backend exec file.
FROM golang:1.19.3-alpine3.16 AS backend
WORKDIR /backend-build

COPY . .
COPY --from=frontend /frontend-build/dist ./server/dist

RUN CGO_ENABLED=0 go build -o slash ./cmd/slash/main.go

# Make workspace with above generated files.
FROM alpine:3.16 AS monolithic
WORKDIR /usr/local/slash

RUN apk add --no-cache tzdata
ENV TZ="UTC"

COPY --from=backend /backend-build/slash /usr/local/slash/

EXPOSE 5231

# Directory to store the data, which can be referenced as the mounting point.
RUN mkdir -p /var/opt/slash
VOLUME /var/opt/slash

ENV SLASH_MODE="prod"
ENV SLASH_PORT="5231"

ENTRYPOINT ["./slash"]
