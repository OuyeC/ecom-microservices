terraform {
  required_version = ">= 1.1.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 4.0"
    }
  }

  backend "s3" {
    bucket  = "oc-my-tf-state"
    key     = "terraform.tfstate"
    region  = "us-east-2"
    encrypt = true
  }
}

provider "aws" {
  region = "us-east-2"
}

# set up vpc
module "vpc" {
  source  = "./modules/vpc"
}

# set up eks
module "eks" {
  source  = "./modules/eks"
  cluster_name    = "my-eks-cluster"           # ← pick whatever name you want
  private_subnets = module.vpc.private_subnets # ← fed from the VPC module’s output
}

# set up rds
module "rds" {
  source  = "./modules/rds"
}

# standalone EC2 VM
resource "aws_instance" "bastion" {
  ami           = "ami-00254ea58ee94fc5b" #amazon-eks-node-al2023-x86_64-neuron-1.32-v20250403 from AWS
  instance_type = "t3.micro"
  subnet_id     = "subnet-0f727db2c7c82b240"
  tags = { Name = "bastion" }
}
