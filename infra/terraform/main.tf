locals {
  name        = "${var.project_name}-${var.environment}"
  ssh_is_ipv6 = strcontains(var.ssh_allowed_cidr, ":")

  tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "terraform"
  }
}

data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"]

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

resource "random_password" "origin_secret" {
  length  = 40
  special = false
}

resource "aws_key_pair" "deployer" {
  key_name   = "${local.name}-deployer"
  public_key = file(var.public_key_path)
  tags       = local.tags
}

resource "aws_security_group" "backend" {
  name        = "${local.name}-backend"
  description = "Backend ingress for SSH and CloudFront HTTP origin"

  ingress {
    description      = "SSH from operator IP"
    from_port        = 22
    to_port          = 22
    protocol         = "tcp"
    cidr_blocks      = local.ssh_is_ipv6 ? [] : [var.ssh_allowed_cidr]
    ipv6_cidr_blocks = local.ssh_is_ipv6 ? [var.ssh_allowed_cidr] : []
  }

  ingress {
    description = "HTTP origin for CloudFront"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    description      = "Outbound internet access"
    from_port        = 0
    to_port          = 0
    protocol         = "-1"
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }

  tags = local.tags
}

resource "aws_instance" "backend" {
  ami                         = data.aws_ami.ubuntu.id
  instance_type               = var.instance_type
  key_name                    = aws_key_pair.deployer.key_name
  vpc_security_group_ids      = [aws_security_group.backend.id]
  user_data_replace_on_change = true

  root_block_device {
    volume_size = var.root_volume_size_gb
    volume_type = "gp3"
  }

  user_data = templatefile("${path.module}/templates/cloud-init.yml.tftpl", {
    repo_url          = var.repo_url
    repo_branch       = var.repo_branch
    frontend_origin   = var.frontend_origin
    origin_secret     = random_password.origin_secret.result
    project_directory = "/opt/${var.project_name}"
  })

  tags = merge(local.tags, {
    Name = "${local.name}-backend"
  })
}

resource "aws_eip" "backend" {
  instance = aws_instance.backend.id
  domain   = "vpc"
  tags     = local.tags
}

resource "aws_apigatewayv2_api" "api" {
  name          = "${local.name}-http-api"
  protocol_type = "HTTP"

  cors_configuration {
    allow_credentials = true
    allow_headers     = ["authorization", "content-type"]
    allow_methods     = ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    allow_origins     = [var.frontend_origin]
    max_age           = 3600
  }

  tags = local.tags
}

resource "aws_apigatewayv2_integration" "root" {
  api_id                 = aws_apigatewayv2_api.api.id
  integration_type       = "HTTP_PROXY"
  integration_method     = "ANY"
  integration_uri        = "http://${aws_eip.backend.public_dns}"
  payload_format_version = "1.0"
  timeout_milliseconds   = 30000

  request_parameters = {
    "append:header.X-Origin-Secret" = random_password.origin_secret.result
  }
}

resource "aws_apigatewayv2_integration" "proxy" {
  api_id                 = aws_apigatewayv2_api.api.id
  integration_type       = "HTTP_PROXY"
  integration_method     = "ANY"
  integration_uri        = "http://${aws_eip.backend.public_dns}/{proxy}"
  payload_format_version = "1.0"
  timeout_milliseconds   = 30000

  request_parameters = {
    "append:header.X-Origin-Secret" = random_password.origin_secret.result
  }
}

resource "aws_apigatewayv2_route" "root" {
  api_id    = aws_apigatewayv2_api.api.id
  route_key = "ANY /"
  target    = "integrations/${aws_apigatewayv2_integration.root.id}"
}

resource "aws_apigatewayv2_route" "proxy" {
  api_id    = aws_apigatewayv2_api.api.id
  route_key = "ANY /{proxy+}"
  target    = "integrations/${aws_apigatewayv2_integration.proxy.id}"
}

resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.api.id
  name        = "$default"
  auto_deploy = true

  tags = local.tags
}
