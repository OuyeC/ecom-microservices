# ecom-microservices

This project is an experiment in building a cloud‑native e‑commerce application composed of multiple microservices. 
Each service will run in its own container and communicate through an API gateway. 
Terraform is used to provision the AWS infrastructure required to host the platform.

## Microservices
Authentication - manage user sign-up and log in
Catalog - store product info
Cart - track items that user intends to buy
Order - process orders from the cart
Payment - handle payment transactions
Notification - send emails regarding order status

## Infrastructure with Terraform
Terraform files are under infrastructure/. In the root folder, main.tf defines AWS provider, S3 backend for state storage, and simple example VPC with EC2 instance. To deply:

```bash
terraform init
terraform apply
```

