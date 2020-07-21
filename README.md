# Ceres Imaging Tile Server

[![CircleCI](https://circleci.com/gh/ceresimaging/image-tiler.svg?style=svg)](https://circleci.com/gh/ceresimaging/image-tiler)

## How to make it work locally:

1. Configure variables: `cp .env.example .env`

2. Start Works (or Osiris) PostgreSQL container (Tiler uses that DB)

3. Setup and run container: `docker-compose up`

4. Use it!

### Testing

`doco run --rm tiler npm run test`

### Docker and Kubernetes

```
# build locally using this, so the minikube docker daemon is used
minikube config set disk-size 8000
minikube start
eval $(minikube docker-env)
docker build -t image_tiler .
kubectl apply -f kube
minikube ip
kubectl get services

# Then navigate to the minikube IP and the port shown for the tiler service

```