# Image Tiler
*(Forked from [ceresimaging/image-tiler](https://github.com/ceresimaging/image-tiler))*

## What is it?
Containerized tile server for large GeoTiffs.

## Setup local kubernetes
1. put some tif files on your local machine (e.g. $HOME/flights)
2. install skaffold (v1.12.1), helm (v3.2.4), docker (19.03.8), minikube (v1.12.1)
3. configure minikube:
```bash
minikube start
eval $(minikube docker-env)

# Use a separate tab, it needs to run continuously.
minikube mount ~/flights:/tmp/hostpath_pv
```

## Start local cluster
```bash
# useful options: --no-prune=false --cache-artifacts=false
skaffold dev --profile=dev
minikube ip
kubectl get services
```
Then navigate to the minikube IP and the port shown for the tiler service.

## Troubleshooting
If you get a "could not find tiller" error
```bash
kubectl create -f image-tiler/rbac-config.yaml
helm init --service-account tiller --upgrade --wait
# helm init --service-account tiller --history-max 200 --upgrade
helm version # to verify that tiller is found
```
Do this if you get any "out of disk space" errors
```bash
minikube config set disk-size 20000
```

### TODO section
- TODO: improve documentation
- TODO: migrate to helm3 and latest skaffold?
- TODO: make this work with the file server

***
## If you want a faster developer experience:
You can mount a flights folder to `~/flights` and then run the following commands. This is taken from the `ceres-imaging/image-tiler`.
### How to make it work locally:

1. Configure variables: `cp .env.example .env`

2. Start Works (or Osiris) PostgreSQL container (Tiler uses that DB)

3. Setup and run container: `docker-compose up`

4. Use it!

#### Testing

`doco run --rm tiler npm run test`
