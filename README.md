# Ceres Imaging Tile Server

TODOS:
- make this work with the file server
- derive helm chart with dev and staging and prod

## Local Kubernetes
1. put some tif files on your local machine (e.g. $HOME/flights)
2. install minikube (e.g. brew install minikube)
3. configure minikube
```bash
minikube start
eval $(minikube docker-env)

# mount flights in minikube: https://minikube.sigs.k8s.io/docs/handbook/persistent_volumes/
# Use a separate tab, it needs to run continuously.
minikube mount ~/flights:/tmp/hostpath_pv

## optional: do this if you get any "out of disk space" errors
# minikube config set disk-size 20000
```
4. start local cluster
```bash
# useful options: --no-prune=false --cache-artifacts=false
skaffold dev --profile=dev
minikube ip
kubectl get services

# Then navigate to the minikube IP and the port shown for the tiler service
```
5. troubleshooting
```bash
# if you get a "could not find tiller" error
kubectl create -f image-tiler/rbac-config.yaml
helm init --service-account tiller --upgrade --wait
# helm init --service-account tiller --history-max 200 --upgrade
helm version # to verify that tiller is found
```

## How to make it work locally:

1. Configure variables: `cp .env.example .env`

2. Start Works (or Osiris) PostgreSQL container (Tiler uses that DB)

3. Setup and run container: `docker-compose up`

4. Use it!

### Testing

`doco run --rm tiler npm run test`
