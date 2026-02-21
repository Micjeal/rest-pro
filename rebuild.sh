#!/bin/bash

# Pull latest changes from repo
git pull origin main

# Rebuild the Docker image
docker compose -f docker-compose.yml down
docker compose -f docker-compose.yml up --build -d

# Show status
docker ps --filter "name=rest-pro-app"
docker logs rest-pro-app --tail 20
