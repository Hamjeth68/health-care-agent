variable "aws_region" {
  description = "AWS region for the backend EC2 instance."
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Name prefix for AWS resources."
  type        = string
  default     = "health-care-agent"
}

variable "environment" {
  description = "Deployment environment label."
  type        = string
  default     = "prod"
}

variable "instance_type" {
  description = "EC2 type. Keep t3.micro for initial free-tier-aware launch."
  type        = string
  default     = "t3.micro"
}

variable "root_volume_size_gb" {
  description = "Root EBS volume size. Keep at or below free-tier limits where applicable."
  type        = number
  default     = 30
}

variable "ssh_allowed_cidr" {
  description = "CIDR allowed to SSH to the instance, e.g. your public IP as x.x.x.x/32."
  type        = string
}

variable "public_key_path" {
  description = "Path to the SSH public key to register for EC2 access. Do not use or commit private .pem files."
  type        = string
}

variable "repo_url" {
  description = "Git repository URL cloned onto EC2."
  type        = string
  default     = "https://github.com/Hamjeth68/health-care-agent-.git"
}

variable "repo_branch" {
  description = "Git branch deployed onto EC2."
  type        = string
  default     = "main"
}

variable "frontend_origin" {
  description = "Allowed CORS origin for the GitHub Pages frontend."
  type        = string
  default     = "https://hamjeth68.github.io"
}

variable "aws_profile" {
  description = "Optional AWS CLI profile name to use for credentials. If empty, default credential chain is used."
  type        = string
  default     = ""
}

variable "assume_role_arn" {
  description = "Optional IAM role ARN to assume for Terraform operations."
  type        = string
  default     = ""
}

