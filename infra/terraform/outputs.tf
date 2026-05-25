output "backend_public_ip" {
  description = "Elastic IP attached to the backend EC2 instance."
  value       = aws_eip.backend.public_ip
}

output "backend_public_dns" {
  description = "Public DNS attached to the backend Elastic IP."
  value       = aws_eip.backend.public_dns
}

output "api_url" {
  description = "HTTPS API URL to use as the frontend VITE_API_URL GitHub secret."
  value       = aws_apigatewayv2_api.api.api_endpoint
}

output "ssh_command" {
  description = "SSH command template for backend maintenance."
  value       = "ssh ubuntu@${aws_eip.backend.public_dns}"
}

output "origin_secret" {
  description = "CloudFront-to-origin shared header secret. Sensitive; stored in Terraform state."
  value       = random_password.origin_secret.result
  sensitive   = true
}
