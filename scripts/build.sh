#!/bin/bash

# Usage: ./scripts/build.sh

set -e

cd "$(dirname "$0")/../"

echo "Start building backend..."

go build -o ./build/corgi ./main.go

echo "Backend built!"
