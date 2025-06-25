# ecom-microservices

This project is an experiment in building a cloud‑native e‑commerce application composed of multiple microservices. 
Each service will run in its own container and communicate through an API gateway. 
Terraform is used to provision the AWS infrastructure required to host the platform.

## Microservices
Authentication - manage user sign-up and log in (Port 3000)
Catalog - store product info (Port 3001)
Cart - track items that user intends to buy (Port 3002)
Order - process orders from the cart (Port 3003)
Payment - handle payment transactions (Port 3004)
Notification - send emails regarding order status (Port 3005)

## Infrastructure with Terraform
Terraform files are under infrastructure/. In the root folder, main.tf defines AWS provider, S3 backend for state storage, and simple example VPC with EC2 instance. To deply:

```bash
terraform init
terraform apply
```

## run service locally
each service is self contained. You can run with Node:

```bash
cd services/<service-name>
npm install
npm start
```

or in Docker container using Dockerfile:

```bash
docker build -t <name> .
docker run -p <local-port>:<container-port> <name>
```