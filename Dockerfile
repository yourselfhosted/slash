# Build frontend dist.
FROM node:18.12.1-alpine3.16 AS frontend
WORKDIR /frontend-build

COPY ./web/ .

RUN yarn && yarn build

# Build backend exec file.
FROM golang:1.19.3-alpine3.16 AS backend
WORKDIR /backend-build

RUN apk update && apk add --no-cache gcc musl-dev

COPY . .
COPY --from=frontend /frontend-build/dist ./server/dist

RUN go build -o shortify ./main.go

# Make workspace with above generated files.
FROM alpine:3.16 AS monolithic
WORKDIR /usr/local/shortify

COPY --from=backend /backend-build/shortify /usr/local/shortify/

# Directory to store the data, which can be referenced as the mounting point.
RUN mkdir -p /var/opt/shortify

ENTRYPOINT ["./shortify", "--mode", "prod", "--port", "5231"]
