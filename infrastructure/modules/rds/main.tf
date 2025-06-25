# variables
variable "db_name" {
  description = "Initial database "
  type        = string
}

variable "db_username" {
  description = "Master username for the database"
  type        = string
}

variable "db_password" {
  description = "Master password for the database"
  type        = string
  sensitive   = true
}

variable "subnet_ids" {
  description = "List of private subnet IDs for RDS"
  type        = list(string)
}

variable "vpc_security_group_id" {
  description = "Security group ID allowing access to RDS"
  type        = string
}

# resource
resource "aws_db_subnet_group" "this" {
  name       = "rds-subnet-group"
  subnet_ids = var.subnet_ids

  tags = {
    Name = "rds-subnet-group"
  }
}

# RDS Instance
resource "aws_db_instance" "this" {
  identifier              = "ecom-db"
  engine                  = "mysql"
  engine_version          = "8.0"
  instance_class          = "db.t3.micro"
  allocated_storage       = 20              # in GB
  name                    = var.db_name
  username                = var.db_username
  password                = var.db_password
  db_subnet_group_name    = aws_db_subnet_group.this.name
  vpc_security_group_ids  = [var.vpc_security_group_id]
  publicly_accessible     = false
  skip_final_snapshot     = true            # for dev/testing 
  backup_retention_period = 7               # days

  tags = {
    Name = "ecom-db"
  }
}

# Outputs
output "endpoint" {
  description = "RDS endpoint to connect your app"
  value       = aws_db_instance.this.endpoint
}

output "port" {
  description = "RDS port (usually 3306 for MySQL)"
  value       = aws_db_instance.this.port
}
