# E-commerce Microservices Platform

**By OC**

A cloud-native, full-stack e-commerce application demonstrating modern microservices design, AWS infrastructure, Kubernetes orchestration, and automated CI/CD.

---

## Overview

This project implements a complete e-commerce backend with six microservices:

- **Auth**: User registration, login
- **Catalog**: Product browsing and management
- **Cart**: User-specific shopping cart operations
- **Order**: Order creation and status tracking
- **Payment**: Payment initiation and status updates
- **Notification**: Transactional notifications

Each service is:

- Written in **Node.js** with **Express**
- Containerized via **Docker**
- Persisted in **Amazon RDS (MySQL)**
- Exposed as a **RESTful JSON API**

All services run on **Amazon EKS** and are provisioned using **Terraform**, with CI/CD automation provided by **GitHub Actions**.

---


##  Tech Stack

- **Languages:** JavaScript (Node.js), SQL
- **Frameworks:** Express.js
- **Containers & Orchestration:** Docker, Kubernetes (EKS), Helm
- **Cloud & IaC:** AWS (EKS, RDS, ECR, Route 53, ACM), Terraform
- **CI/CD:** GitHub Actions
- **Observability:** CloudWatch

---

## Architecture

- **API Gateway**: AWS Load Balancer Controller mapping paths (`/auth`, `/catalog`, etc.)
- **Secrets Management**: AWS IAM Roles for Service Accounts (IRSA) & Kubernetes Secrets
- **CI/CD**: Terraform validation, Docker builds, ECR pushes, and `kubectl apply` via GitHub Actions
- **Observability**: Kubernetes Metrics Server, HPAs, CloudWatch Container Insights, Fluent Bit

---

## Quickstart

### Infrastructure Provisioning

```bash
cd infrastructure
terraform init
terraform apply -auto-approve
```

This creates:

- VPC with public/private subnets and NAT Gateways
- EKS cluster
- RDS MySQL instance
- ECR repositories for each service

### Database Migrations

Apply SQL scripts to create tables:

```bash
export DB_HOST=$(terraform output -raw endpoint)
export DB_PORT=$(terraform output -raw port)
export DB_USER=<db_user>
export DB_PASS=<db_pass>

mysql -h $DB_HOST -P $DB_PORT -u $DB_USER -p$DB_PASS ecom < db/migrations/001_create_users_table.sql
# ... repeat for products, cart_items, orders, payments, notifications
```

### Build & Push Services

For each service (example: auth):

```bash
cd services/auth
npm install
docker build -t auth-service:latest .
docker tag auth-service:latest $ECR_URI/auth-service:latest
docker push $ECR_URI/auth-service:latest
```

### Deploy to Kubernetes

```bash
kubectl apply -f k8s/
```

Verify:

```bash
kubectl get pods,svc,ingress
curl https://api.<your-domain>.com/auth/health
```

---

## CI/CD

**GitHub Actions** workflow (`.github/workflows/ci.yml`) automates:

1. `terraform fmt` & `terraform validate`
2. Docker image build & push to ECR
3. `kubectl apply` deployments & services

Configure AWS credentials and ECR registry in GitHub Secrets.

---


