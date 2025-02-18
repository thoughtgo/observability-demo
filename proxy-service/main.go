package main

import (
	"flag"
	"fmt"
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"
	"strings"
)

var backendURL string
var route string
var listenPort string

func init() {
	flag.StringVar(&backendURL, "backend", "http://localhost:8082", "Backend service URL")
	flag.StringVar(&route, "route", "/orders", "Route to proxy to backend")
	flag.StringVar(&listenPort, "port", "8081", "Port to listen on")
	flag.Parse()
}

func main() {
	mux := http.NewServeMux()

	backend, err := url.Parse(backendURL)
	if err != nil {
		log.Fatalf("Invalid backend URL: %v", err)
	}
	proxy := newReverseProxy(backend)

	mux.Handle(route, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		logRequest(r, nil)
		proxy.ServeHTTP(w, r)
	}))

	log.Printf("Starting server on :%s | Backend: %s | Route: %s", listenPort, backendURL, route)
	log.Fatal(http.ListenAndServe(":"+listenPort, mux))
}

func newReverseProxy(target *url.URL) *httputil.ReverseProxy {
	proxy := httputil.NewSingleHostReverseProxy(target)

	proxy.Director = func(req *http.Request) {
		req.URL.Scheme = target.Scheme
		req.URL.Host = target.Host
		req.URL.Path = strings.TrimPrefix(req.URL.Path, route)
		req.Host = target.Host
	}

	proxy.ErrorHandler = func(w http.ResponseWriter, r *http.Request, err error) {
		logRequest(r, err)
		http.Error(w, "Proxy error", http.StatusBadGateway)
	}

	return proxy
}

func logRequest(r *http.Request, err error) {
	traceparent := r.Header.Get("Traceparent")
	var traceID string

	if traceparent != "" {
		parts := strings.Split(traceparent, "-")
		if len(parts) >= 2 {
			traceID = parts[1] // Extracted TraceID
		}
	}

	logMsg := fmt.Sprintf("Method=%s, Path=%s, RemoteAddr=%s",
		r.Method, r.URL.Path, r.RemoteAddr)

	if traceID != "" {
		logMsg += fmt.Sprintf(" | TraceID=%s", traceID)
	}

	if err != nil {
		logMsg = fmt.Sprintf("Proxy error: %v | %s", err, logMsg)
	} else {
		logMsg = fmt.Sprintf("Proxying request | %s", logMsg)
	}

	log.Println(logMsg)
}
