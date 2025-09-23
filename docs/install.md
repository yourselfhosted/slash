# Self-hosting Slash with Docker

Slash is designed for self-hosting through Docker. No Docker expertise is required to launch your own instance. Just basic understanding of command line and networking.

## Requirements

The only requirement is a server with Docker installed.

## Docker Run

To deploy Slash using docker run, just one command is needed:

```bash
docker run -d --name slash --publish 5231:5231 --volume ~/.slash/:/var/opt/slash bshort/monotreme:latest
```

This will start Slash in the background and expose it on port `5231`. Data is stored in `~/.slash/`. You can customize the port and data directory.

### Upgrade

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
docker pull bshort/monotreme:latest
```

Finally, restart Slash by following the steps in [Docker Run](#docker-run).

## Docker Compose Run

Assume that docker compose is deployed in the `/opt/slash` directory.

```bash
mkdir -p /opt/slash && cd /opt/slash
curl -#LO https://github.com/bshort/slash/raw/main/docker-compose.yml
docker compose up -d
```

This will start Slash in the background and expose it on port `5231`. Data is stored in Docker Volume `slash_slash`. You can customize the port and backup your volume.

## Use PostgreSQL as Database

Slash supports the following database types:

- SQLite (default)
- PostgreSQL

### Using PostgreSQL

To switch to PostgreSQL, you can use the following steps:

- **--driver** _postgres_ : This argument specifies that Slash should use the `postgres` driver instead of the default `sqlite`.

- **--dsn** _postgresql://postgres:PASSWORD@localhost:5432/slash_ : Provides the connection details for your PostgreSQL server.

You can start Slash with Docker using the following command:

```shell
docker run -d --name slash --publish 5231:5231 --volume ~/.slash/:/var/opt/slash bshort/monotreme:latest --driver postgres --dsn 'postgresql://postgres:PASSWORD@localhost:5432/slash'
```

Additionally, you can set these configurations via environment variables:

```shell
SLASH_DRIVER=postgres
SLASH_DSN=postgresql://root:password@localhost:5432/slash
```

Note that if the PostgreSQL server is not configured to support SSL connections you will need to add `?sslmode=disable` to the DSN.
