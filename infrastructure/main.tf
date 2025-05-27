# this fire configure terraform, set up AWS credentials, provision EC2 instance
# that the file will be running on, and define the inputs (aws_region, ami_id) and outputs


terraform{ # terraform-wide setting block
    required_providers { # which providers terraform must instal
        aws = {
            source = "hashicorp/aws"    # tell where to download plugin
            version = "~> 5.0" # any 5.x version
        }
    }
    backend "s3" {
        bucket = "my-tf-state"  # s3 bucket name
        key = "project/terraform.tfstate" # path/key within the bucket to store the state of terraform infra
        region = "us-west-2"
    }
}

provider "aws"{ # setting for AWS provider 
    region = var.aws_region # use the variable aws_region as region
}

# EC2 is AWS service virtual server/machine to install app and run the code
# when run terraform apply, it will spin up this "web" instance, with size t3.micro
# tag it with name "web-server"

resource "aws_instance" "web" { # define EC2 instance resource name web
    ami = var.ami_id # AMI ID from the ami_id variable, which is the ID of amazon machine image
    instance_type = "t3.micro"  # EC2 instance size
    tags = {    # key/value tag for the instance
        Name = "web-server"
    }
}

# declare VPC and subnets
resource "aws_vpc" "main" {         # define VPC resource naming "main"
    cidr_block = "10.0.0.0/16"      # IP range
    tags = { Name = "main-vpc"}
}

resource "aws_subnet" "public" {
    vpc_id = aws_vpc.main.id        # attach to the VPC
    cidr_block = "10.0.1.0/24"      # range
    map_public_ip_on_launch = true  # automatically assign public IP to instance
    tags = {Name = "public-subnet"}
}

resource "aws_subnet" "private" {
    vpc_id = aws_vpc.main.id 
    cidr_block = "10.0.2.0/24"
    tags = {Name = "private-subnet"}
}

# internet gateway and public route
resource "aws_internet_Gateway" "igw" {
    vpc_id = aws_vpc.main.id 
    tags = {Name = "main-igw"}
}

resource "aws_route_table" "public" {
    vpc_id = aws_vpc.main.id

    route {         # add a default route
        cidr_block = "0.0.0.0/0"        # for all IPv4 traffic
        gateway_id = aws_internet_gateway.igw.id # sending it through the IGW
    }
    tags = {Name = "public-rt"}
}

resource "aws_route_table_association" "public_assoc" {
    subnet_id = aws_subnet.public.id
    route_table_id = aws_route_table.public.id 
}



variable "aws_regions" {    # name the variable 
    type = string   # type is string
    default = "us-west-2"    
}

variable "ami_id" {     # no default here
    type = string
}

# after running terraform apply, it will output the ip address of this web instance
output "web_public_ip" {    # output value 
    value = aws_instance.web.public_ip  # expose the public Ip of the web instance
}