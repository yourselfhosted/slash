# Slash

<img align="right" src="./resources/logo.png" height="64px" alt="logo">

**Slash** is a bookmarking and short link service that allows you to save and share links easily. It lets you store and categorize links, generate short URLs for easy sharing, search and filter your saved links, and access them from any device.

Try it out on <a href="https://slash.stevenlgtm.com">Live Demo</a>.

## Features

- Create customizable `/s/` short links for any URL.
- Share short links privately or with others.
- View analytics on short link traffic and sources.
- Open source self-hosted solution.

## Deploy with Docker in seconds

> This project is under active development.

```bash
docker run -d --name slash -p 5231:5231 -v ~/.slash/:/var/opt/slash stevenlgtm/slash:latest
```
