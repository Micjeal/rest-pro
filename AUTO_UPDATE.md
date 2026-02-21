# Auto-update instructions for rest-pro

## Option 1: Manual rebuild (Local)
Run this command whenever you push updates to the repo:
```bash
./rebuild.sh
```

Or without the script:
```bash
git pull origin main
docker compose up --build -d
```

## Option 2: GitHub Actions (Automatic on Push)
The `.github/workflows/build.yml` workflow automatically:
- Triggers on every push to `main` branch
- Builds the Docker image
- Caches layers for faster rebuilds
- Tests the build

Push your changes, and the workflow runs automatically in GitHub.

## Option 3: Development Mode with Auto-reload
For local development with file watching:
```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up
```

This watches for changes in:
- `./app/`
- `./components/`
- `./lib/`
- `package.json`

And automatically rebuilds the container.

## Quick Reference
- **Production (3000)**: `docker compose up -d`
- **Development with watch**: `docker compose -f docker-compose.yml -f docker-compose.dev.yml up`
- **Rebuild after push**: `./rebuild.sh`
- **View logs**: `docker logs rest-pro-app -f`
- **Stop**: `docker compose down`
