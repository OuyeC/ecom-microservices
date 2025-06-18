resource "aws_vpc" "this" {
  cidr_block           = "10.0.0.0/16"  # IPv4 network range for vpc
  enable_dns_hostnames = true
}

resource "aws_internet_gateway" "this" {
  vpc_id = aws_vpc.this.id
  tags = {
    Name = "igw-${aws_vpc.this.id}"
  }
}

resource "aws_subnet" "public" {
  for_each = toset(["us-east-2a", "us-east-2b"])  # azs = availability zones

  vpc_id                   = aws_vpc.this.id
  availability_zone        = each.key
  cidr_block               = cidrsubnet("10.0.0.0/16", 8, index(["us-east-2a", "us-east-2b"], each.key))
  map_public_ip_on_launch  = true

  tags = {
    Name = "public-${each.key}"
  }
}

resource "aws_subnet" "private" {
  for_each = toset(["us-east-2a", "us-east-2b"])

  vpc_id                   = aws_vpc.this.id
  availability_zone        = each.key
  cidr_block               = cidrsubnet("10.0.0.0/16", 8, length(["us-east-2a", "us-east-2b"]) + index(["us-east-2a", "us-east-2b"], each.key))
  map_public_ip_on_launch  = false

  tags = {
    Name = "private-${each.key}"
  }
}

resource "aws_nat_gateway" "this" {
  for_each      = aws_subnet.public
  allocation_id = aws_eip.nat[each.key].id
  subnet_id     = each.value.id

  tags = {
    Name = "nat-${each.key}"
  }
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.this.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.this.id
  }

  tags = {
    Name = "rt-public"
  }
}

resource "aws_route_table_association" "public" {
  for_each = aws_subnet.public

  subnet_id      = each.value.id
  route_table_id = aws_route_table.public.id
}

resource "aws_route_table" "private" {
  for_each = aws_subnet.private
  vpc_id   = aws_vpc.this.id

  tags = {
    Name = "rt-private-${each.key}"
  }
}

resource "aws_route" "private" {
  for_each               = aws_route_table.private
  route_table_id         = each.value.id
  destination_cidr_block = "0.0.0.0/0"
  nat_gateway_id         = aws_nat_gateway.this[each.key].id
}

resource "aws_route_table_association" "private" {
  for_each = aws_subnet.private

  subnet_id      = each.value.id
  route_table_id = aws_route_table.private[each.key].id
}

output "vpc_id" {
  description = "ID of the created VPC"
  value       = aws_vpc.this.id
}
resource "aws_eip" "nat" {
  for_each = aws_subnet.public
  domain   = "vpc"                    # use `domain` instead of deprecated `vpc`

  depends_on = [ aws_internet_gateway.this ]
}
output "public_subnets" {
  description = "IDs of the public subnets"
  value       = [for s in aws_subnet.public : s.id]
}

output "private_subnets" {
  description = "IDs of the private subnets"
  value       = [for s in aws_subnet.private : s.id]
}

output "default_security_group_id" {
  description = "Default security group ID for this VPC"
  value       = aws_vpc.this.default_security_group_id
}
