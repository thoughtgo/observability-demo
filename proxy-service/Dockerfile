FROM golang:1.23.6
WORKDIR /app
COPY . ./
RUN go build -o /proxy
CMD ["/proxy"]
