# Observability Demo with Grafana Scenes, Beyla eBPF, and Grafana Alloy

This repository demonstrates a Kubernetes observability stack that integrates Grafana Alloy with Beyla eBPF, Prometheus, Tempo, and Loki, along with a lightweight proxy service. At its core is a custom Grafana Scenes-based observability app, delivering interactive, real-time dashboards for enhanced visibility.

## Repository Structure

```
├── deployments/
│   ├── prometheus.yaml
│   ├── alloy.yaml
│   ├── grafana.yaml
│   ├── tempo.yaml
│   ├── loki.yaml
│   ├── web-service.yaml
│   ├── orders-service.yaml
│
├── proxy-service/
│   ├── Dockerfile
│   ├── main.go
│   ├── README.md
│
├── scenes-app/
│   ├── src/
│   ├── provisioning/
│   ├── plugin.json
│   ├── constants.ts
│   ├── README.md
│
├── README.md
```

## Installation Steps

### 1. Install Kubernetes (Minikube)

```sh
sudo apt update
sudo apt install ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt update
sudo apt install docker-ce docker-ce-cli containerd.io

curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube
rm minikube-linux-amd64
minikube version
minikube start --force --listen-address='0.0.0.0'
```

### 2. Install Helm

```sh
curl -fsSL -o get_helm.sh https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3
chmod 700 get_helm.sh
./get_helm.sh
rm get_helm.sh 
helm version
```

### 3. Deploy Monitoring Stack

```sh
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
helm install prometheus prometheus-community/prometheus --version 27.11.0 --namespace observability --create-namespace -f deployments/prometheus.yaml

helm repo add grafana https://grafana.github.io/helm-charts
helm repo update
helm install tempo grafana/tempo --version 1.18.3 --namespace observability -f deployments/tempo.yaml
helm install loki grafana/loki --version 6.29.0 --namespace observability -f deployments/loki.yaml
helm install alloy grafana/alloy --version 1.0.2 --namespace observability -f deployments/alloy.yaml
helm install grafana grafana/grafana --version 8.13.1 --namespace observability -f deployments/grafana.yaml
```

### 4. Deploy Web and Orders Services

```sh
kubectl apply -f deployments/web-service.yaml
kubectl apply -f deployments/orders-service.yaml
```

### 5. Deploy and Configure Grafana Scenes App

Grafana Scenes is a powerful frontend framework for creating dynamic, interactive dashboards inside Grafana. This demo includes a custom-built Grafana Scenes plugin to visualize observability data.

#### Building the Scenes App

1. Navigate to the `scenes-app` directory:

   ```sh
   cd scenes-app
   ```

2. Update the version in `package.json`:

   ```sh
   vim package.json
   "version": "1.0.1",
   ```

3. Install dependencies and build the app:

   ```sh
   npm install
   npm run build
   ```

#### Installing the Plugin in Grafana

1. Create a ZIP archive for the plugin:

   ```sh
   zip -r scenes-app-1.0.1.zip dist 
   ```

2. Create a new GitHub release and upload the ZIP artifact.

3. Update the plugin version in the Grafana Helm chart:
 
   ```sh
   vim deployments/grafana.yaml
   plugins:
     - https://<github_path_to_artifact>/scene-app-1.0.1.zip;demo-observability-app
   ```

4. Upgrade the Grafana deployment:

   ```sh
   helm upgrade grafana grafana/grafana --version 8.8.6 --namespace observability -f deployments/grafana.yaml    
   ```

5. Enable the Observability plugin in Grafana UI under Administration -> Plugins and data -> Plugins. Use `kubectl port-forward` to access Grafana outside the cluster:

   ```sh
   kubectl port-forward --namespace observability svc/grafana 3000:80 & 
   ```

### Running Grafana Scenes Locally

For local development and testing of the Grafana Scenes app:

1. Navigate to the `scenes-app` directory:

   ```sh
   cd scenes-app
   ```

2. Review `provisioning/datasources/default.yaml` and update datasource URLs if needed. Use `kubectl port-forward` to access services outside the cluster.

3. Key files and directories for modifications:

   ```
   ├── src/
   │   ├── plugin.json
   │   ├── constants.ts
   │   ├── components/App/App.tsx
   │   ├── pages/
   ```

4. Start the app using Docker Compose:

   ```sh
   docker-compose up -d
   ```

5. Run the development server:

   ```sh
   npm run dev
   ```

6. Access Grafana at `http://localhost:3000`

This setup enables fast iteration and testing of the Grafana Scenes app before deploying it to Kubernetes.

### 6. Simulate Data Traffic

To generate sample observability data:

```sh
kubectl --context demo -n web port-forward service/web 3001:80 &
while true; do curl http://localhost:3001/orders; sleep 0.1; done
```

This sends a continuous stream of requests to the `orders` service, allowing you to observe traces and metrics in Grafana.

---

Now you're all set to explore the power of Grafana Scenes, Beyla eBPF, and Grafana Alloy in Kubernetes! 🚀

![hippo](observability.gif)

