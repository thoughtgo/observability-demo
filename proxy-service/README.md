# Proxy Service

This is a lightweight HTTP reverse proxy written in Go. It forwards requests to a backend service and logs request details, including `Traceparent` headers for observability.

## Features
- Simple reverse proxy implementation
- Configurable backend service URL, route, and listening port
- Logging of incoming requests with `Traceparent` headers
- Error handling for proxy failures

## Configuration
The proxy service supports the following command-line flags:

| Flag       | Description                  | Default Value           |
|------------|------------------------------|-------------------------|
| `-backend` | Backend service URL          | `http://localhost:8082` |
| `-route`   | Route to proxy to backend    | `/orders`               |
| `-port`    | Port to listen on            | `8081`                  |

## Running the Proxy Service
### Using Go
Run the service locally with default values:
```sh
 go run main.go
```
Or specify custom parameters:
```sh
 go run main.go -backend="http://example.com" -route="/api" -port="9090"
```

### Using Docker
A pre-built Docker image is available on Docker Hub:

**Docker Hub:** [sergeij/go-proxy:0.0.1](https://hub.docker.com/r/sergeij/go-proxy)

Pull and run the image:
```sh
docker pull sergeij/go-proxy:0.0.1
docker run -p 8081:8081 sergeij/go-proxy:0.0.1 -backend="http://example.com" -route="/api"
```

## Logging
The proxy logs details of each request, including method, path, remote address, and trace ID (if available).

Example log output:
```
Starting server on :8081 | Backend: http://localhost:8082 | Route: /orders
Proxying request | Method=GET, Path=/orders, RemoteAddr=192.168.1.10:52314 | TraceID=abcd1234efgh5678
```

## Error Handling
If the backend service is unreachable or returns an error, the proxy logs the failure and returns a `502 Bad Gateway` response.

Example error log:
```
Proxy error: dial tcp 127.0.0.1:8082: connect: connection refused | Method=GET, Path=/orders, RemoteAddr=192.168.1.10:52314
```
