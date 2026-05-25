terraform {
  required_version = ">= 1.6.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.6"
    }
  }
}

provider "aws" {
  region = var.aws_region

  # If set, uses that AWS shared config/credentials profile.
  # Empty string => let Terraform use the default credential chain.
  profile = var.aws_profile != "" ? var.aws_profile : null

  # Optional role assumption for workstation/CI deployments.
  # Empty string => no assume_role.
  dynamic "assume_role" {
    for_each = var.assume_role_arn != "" ? [var.assume_role_arn] : []
    content {
      role_arn = assume_role.value
    }
  }
}

