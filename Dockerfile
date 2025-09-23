# Build frontend dist.
FROM node:18-alpine AS frontend
WORKDIR /frontend-build

COPY . .

WORKDIR /frontend-build/frontend/web

RUN corepack enable && pnpm i --frozen-lockfile

RUN pnpm build

# Build backend exec file.
FROM golang:1.23-alpine AS backend
WORKDIR /backend-build

COPY . .
COPY --from=frontend /frontend-build/frontend/web/dist /backend-build/server/route/frontend/dist

RUN CGO_ENABLED=0 go build -o monotreme ./bin/monotreme/main.go

# Make workspace with above generated files.
FROM alpine:latest AS monolithic
WORKDIR /usr/local/monotreme

RUN apk add --no-cache tzdata
ENV TZ="UTC"

COPY --from=backend /backend-build/monotreme /usr/local/monotreme/

# Create directory structure and copy swagger spec
RUN mkdir -p /usr/local/monotreme/proto/gen
COPY --from=backend /backend-build/proto/gen/apidocs.swagger.yaml /usr/local/monotreme/proto/gen/apidocs.swagger.yaml

EXPOSE 5231

# Directory to store the data, which can be referenced as the mounting point.
RUN mkdir -p /var/opt/monotreme
VOLUME /var/opt/monotreme

ENV MONOTREME_MODE="prod"
ENV MONOTREME_PORT="5231"

ENTRYPOINT ["./monotreme"]
