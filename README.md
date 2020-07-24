# Image Tiler
*(Forked from [ceresimaging/image-tiler](https://github.com/ceresimaging/image-tiler))*

## What is it?
Containerized tile microservice for large GeoTiffs.

## Install dependencies
- See `build/test/smoke/install-icin-dependencies.sh` for details on installing **helm** and **skaffold**. Because improc uses helm 2.x, we must use skaffold 1.8.0.
- [minikube](https://kubernetes.io/docs/tasks/tools/install-minikube/)
- [docker (optional)](https://docs.docker.com/get-docker/)

## Setup local kubernetes
1. put some tif files on your local machine (e.g. $HOME/flights), update index.html `tiffFiles` variable.
2. configure minikube:
```bash
minikube start
# use minikube's docker
eval $(minikube docker-env)

# Use a separate tab, it needs to run continuously.
minikube mount ~/flights:/tmp/hostpath_pv
```

## Start local cluster
```bash
# possibly useful options: --no-prune=false --cache-artifacts=false
skaffold dev --profile=local # equivalent to: skaffold dev
minikube ip
kubectl get services
```
Then navigate to the minikube IP and the port shown for the tiler service.

## Troubleshooting
If you get a "could not find tiller" error
```bash
kubectl create -f image-tiler/rbac-config.yaml
helm init --service-account tiller --upgrade --wait
helm version # to verify that tiller is found
```
Do this if you get any "out of disk space" errors
```bash
minikube config set disk-size 20000
```

### TODO's section
- TODO: make this work with the file server
- TODO: update unit tests?
- TODO: verify that it works with GeoTiffs other than black and white Jenoptik

***
## If you want a faster developer experience:
You can mount a flights folder to `~/flights` and then run the following commands. This is borrowed from `ceres-imaging/image-tiler`.
### How to make it work locally:

1. Configure variables: `cp .env.example .env`

2. Start Works (or Osiris) PostgreSQL container (Tiler uses that DB)

3. Setup and run container: `docker-compose up`

4. Use it!
