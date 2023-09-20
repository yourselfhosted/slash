# Build protobuf.
FROM golang:1.21-alpine AS protobuf
WORKDIR /protobuf-generate

COPY . .

RUN GO111MODULE=on GOBIN=/usr/local/bin go install github.com/bufbuild/buf/cmd/buf@v1.26.1

WORKDIR /protobuf-generate/proto

RUN buf generate

# Build frontend dist.
FROM node:18-alpine AS frontend
WORKDIR /frontend-build

COPY ./frontend .

COPY --from=protobuf /protobuf-generate/frontend/web/src/types/proto ./web/src/types/proto

WORKDIR /frontend-build/web

RUN corepack enable && pnpm i --frozen-lockfile

RUN pnpm build

# Build backend exec file.
FROM golang:1.21-alpine AS backend
WORKDIR /backend-build

COPY . .
COPY --from=frontend /frontend-build/web/dist ./server/dist

RUN CGO_ENABLED=0 go build -o slash ./cmd/slash/main.go

# Make workspace with above generated files.
FROM alpine:latest AS monolithic
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
