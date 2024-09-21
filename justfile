set dotenv-required
set dotenv-load := true

export NODE_ENV := "production"

build:
  @echo "VITE_BASE_URL is: '${VITE_BASE_URL}'"
  @echo "Building..."
  pnpm run build


# Deploy to production
deploy: build
  @echo "Deploying..."
  rsync .output/public/ -r $SSH_HOST:~/public_html/matrix/
  @echo "Done!"
