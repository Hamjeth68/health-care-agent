# Production Deployment

This folder contains the production launch scaffold for the web app on GitHub Pages and the FastAPI backend on AWS EC2 behind CloudFront.

## Security First

- Do not commit AWS keys, PEM files, Terraform state, or `.env` files.
- Treat any root keys that were shared or downloaded as exposed. Rotate/delete them in AWS IAM before launching production.
- Use a least-privilege IAM user for Terraform, or run Terraform from an AWS role/session with temporary credentials.
- Backend Supabase service-role secrets are not passed through Terraform because Terraform state would retain them.

## 1. GitHub Pages Web

Create these repository secrets in GitHub:

- `VITE_API_URL`: the `cloudfront_api_url` Terraform output
- `VITE_SUPABASE_URL`: Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Supabase anon/public key

Then set GitHub Pages source to **GitHub Actions**. The workflow at `.github/workflows/deploy-web.yml` builds `frontend` and deploys `frontend/dist`.

The public web URL is:

```text
https://hamjeth68.github.io/health-care-agent-/
```

Add this URL to Supabase Auth redirect settings:

```text
https://hamjeth68.github.io/health-care-agent-/
https://hamjeth68.github.io/health-care-agent-/*
```

## 2. AWS Backend Infrastructure

From `infra/terraform`, create a private copy of the variables file:

```bash
cp terraform.tfvars.example terraform.tfvars
```

Set:

- `ssh_allowed_cidr` to your public IP with `/32`
- `public_key_path` to an SSH public key path, not a private PEM

Run:

```bash
terraform init
terraform fmt
terraform validate
terraform plan
terraform apply
```

After apply, copy `cloudfront_api_url` into the GitHub `VITE_API_URL` secret.

## 3. Backend Secrets on EC2

SSH to the instance using the Terraform `ssh_command` output and edit:

```bash
sudo nano /opt/health-care-agent/backend/.env
```

Fill:

```text
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
CORS_ALLOW_ORIGINS=https://hamjeth68.github.io
```

Restart the API:

```bash
sudo systemctl restart health-care-agent
sudo systemctl status health-care-agent --no-pager
```

## 4. Smoke Checks

Use the CloudFront URL, not the raw EC2 URL:

```bash
curl https://your-cloudfront-domain.cloudfront.net/health
curl -X POST https://your-cloudfront-domain.cloudfront.net/monitoring/summary \
  -H "Content-Type: application/json" \
  -d '{"systolic_bp":128,"diastolic_bp":82,"heart_rate":78}'
```

Direct EC2 HTTP without the CloudFront origin secret should return `403`.

## Cost Notes

- Default EC2 size is `t3.micro`.
- Use `t3.small` only if your AWS console marks it free-tier eligible for your account.
- CloudFront is used to provide HTTPS for the GitHub Pages web app.
- Bedrock is intentionally not enabled for v1 to avoid token costs.
