# Self-hosting Slash with Docker

Slash is designed for self-hosting through Docker. No Docker expertise is required to launch your own instance. Just basic understanding of command line and networking.

## Requirements

The only requirement is a server with Docker installed.

## Docker Run

To deploy Slash using docker run, just one command is needed:

```bash
docker run -d --name slash --publish 5231:5231 --volume ~/.slash/:/var/opt/slash yourselfhosted/slash:latest
```

This will start Slash in the background and expose it on port `5231`. Data is stored in `~/.slash/`. You can customize the port and data directory.

## Upgrade

To upgrade Slash to latest version, stop and remove the old container first:

```bash
docker stop slash && docker rm slash
```

It's recommended but optional to backup database:

```bash
cp -r ~/.slash/slash_prod.db ~/.slash/slash_prod.db.bak
```

Then pull the latest image:

```bash
docker pull yourselfhosted/slash:latest
```

Finally, restart Slash by following the steps in [Docker Run](#docker-run).
