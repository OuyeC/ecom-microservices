variable "cluster_name" {
    description = "Name of the EKS cluster"
    type        = string
}

variable "private_subnets" {
    description = "List of private subnet IDs for EKS nodes"
    type        = list(string)
}

data "aws_iam_policy_document" "eks_assume_role" {
  statement {
    actions    = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["eks.amazonaws.com"]
    }
  }
}

data "aws_iam_policy_document" "node_assume_role" {
  statement {
    actions    = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["ec2.amazonaws.com"]
    }
  }
}

# IAM role for EKS control plane
resource "aws_iam_role" "eks" {
    name               = "${var.cluster_name}-role"
    assume_role_policy = data.aws_iam_policy_document.eks_assume_role.json
}

resource "aws_iam_role_policy_attachment" "cluster_policy" {
  role       = aws_iam_role.eks.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSClusterPolicy"
}

resource "aws_iam_role_policy_attachment" "service_policy" {
  role       = aws_iam_role.eks.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSServicePolicy"
}

# ESK cluster
resource "aws_eks_cluster" "this" {
    name     = var.cluster_name
    role_arn = aws_iam_role.eks.arn

    vpc_config {
        subnet_ids = var.private_subnets
    }

    depends_on = [
    aws_iam_role_policy_attachment.cluster_policy,
    aws_iam_role_policy_attachment.service_policy
    ]
}

# work nodes
resource "aws_iam_role" "node" {
    name               = "${var.cluster_name}-node-role"
    assume_role_policy = data.aws_iam_policy_document.node_assume_role.json
}

resource "aws_eks_node_group" "this" {
    cluster_name    = aws_eks_cluster.this.name
    node_group_name = "${var.cluster_name}-node-group"
    node_role_arn   = aws_iam_role.node.arn
    subnet_ids      = var.private_subnets

    scaling_config {
        desired_size = 1
        min_size     = 1
        max_size     = 2
    }

    instance_types = ["t3.small"]
}

# Allow nodes to join the cluster
resource "aws_iam_role_policy_attachment" "node_policy" {
  role       = aws_iam_role.node.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSWorkerNodePolicy"
}

# Allow the VPC CNI plugin to manipulate ENIs
resource "aws_iam_role_policy_attachment" "cni_policy" {
  role       = aws_iam_role.node.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKS_CNI_Policy"
}

# Allow pulling images from ECR
resource "aws_iam_role_policy_attachment" "registry_policy" {
  role       = aws_iam_role.node.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
}


output "cluster_endpoint" {
    description = "Endpoint for the EKS cluster"
    value       = aws_eks_cluster.this.endpoint
}

output "cluster_certificate_authority_data" {
    description = "Certificate authority data for the EKS cluster"
    value       = aws_eks_cluster.this.certificate_authority[0].data
}