# ms-test - CI/CD Pipeline Test Microservice

A simple test microservice to validate the KubeStock CI pipeline with AWS ECR using GitHub OIDC authentication. Deployment is managed via ArgoCD and GitOps.

## 📋 Overview

This is a minimal Node.js application designed to test the complete CI workflow including:
- Code quality checks
- Unit testing
- Security vulnerability scanning (Trivy)
- Docker image building
- Integration testing
- Push to Amazon ECR using OIDC authentication

**Note**: All stages use echo commands for demonstration purposes. This is a test repository to validate the pipeline configuration.

**CD (Deployment)**: Handled by ArgoCD using GitOps principles. GitHub Actions only builds and pushes images to ECR.

## 🏗️ Architecture

- **Language**: Node.js 18
- **Container**: Docker (Alpine-based for minimal size)
- **Registry**: Amazon ECR (ap-south-1)
- **Authentication**: AWS OIDC (No static credentials needed)
- **CI**: GitHub Actions
- **CD**: ArgoCD + GitOps

## 🔄 CI/CD Pipeline

### Workflow 1: PR Checks (`pr-checks.yml`)
**Triggers**: On Pull Request to `main`

1. **Code Quality Check** - Linting and style validation
2. **Unit Tests** - Run test suite with coverage
3. **Security Scan** - Trivy filesystem vulnerability scan
4. **Build** - Docker image build with Trivy container scan
5. **Integration Tests** - End-to-end testing

### Workflow 2: Build and Push (`build-push.yml`)
**Triggers**: On Push to `main`

1. **Authenticate** - AWS OIDC authentication
2. **Login to ECR** - Authenticate Docker to ECR
3. **Build** - Build Docker image with multiple tags
4. **Security Scan** - Real Trivy container vulnerability scan
5. **Push to ECR** - Push image with 4 tags:
   - Full SHA: `<sha>` (e.g., `abc123def456...`)
   - Short SHA: `<short-sha>` (e.g., `abc123d`)
   - Timestamp: `YYYYMMDD-HHMMSS` (e.g., `20251125-143022`)
   - Latest: `latest`

### Deployment (GitOps)
ArgoCD watches the ECR repository and/or Kubernetes manifests repository:
- Detects new image tags in ECR
- Syncs Kubernetes manifests
- Deploys to target cluster automatically

## 🔐 AWS OIDC Configuration

The pipeline uses OpenID Connect (OIDC) to authenticate with AWS without storing credentials:

- **IAM Role**: `KubeStock-github-actions-ecr-role`
- **Role ARN**: `arn:aws:iam::478468757808:role/KubeStock-github-actions-ecr-role`
- **ECR Repository**: `478468757808.dkr.ecr.ap-south-1.amazonaws.com/ms-test`
- **Region**: `ap-south-1`

### Required GitHub Environment

Create a GitHub environment named `production` with the following configuration:
- Environment protection rules (optional): Require approval for main branch
- The OIDC trust relationship in AWS IAM expects: `repo:KubeStock-DevOps-project/ms-test:environment:production`

## 📦 Application Details

### Endpoints:
- `GET /` - Returns service info and timestamp
- `GET /health` - Health check endpoint

### Response Example:
```json
{
  "message": "Hello from ms-test microservice!",
  "version": "1.0.0",
  "timestamp": "2025-11-25T10:30:00.000Z"
}
```

## 🛠️ Local Development

### Prerequisites:
- Node.js 18+
- Docker

### Run Locally:
```bash
# Install dependencies (none required for this minimal app)
npm install

# Start the service
npm start

# Test the service
curl http://localhost:3000
curl http://localhost:3000/health
```

### Build Docker Image:
```bash
# Build
docker build -t ms-test:local .

# Run
docker run -p 3000:3000 ms-test:local

# Test
curl http://localhost:3000/health
```

## 🧪 Testing the CI Pipeline

### Test PR Workflow:
```bash
git checkout -b test-pipeline
# Make some changes
git add .
git commit -m "test: validate CI pipeline"
git push origin test-pipeline
# Create PR on GitHub
```

Expected behavior:
- ✅ Runs `pr-checks.yml` workflow
- ✅ All 5 jobs should run (lint, test, security-scan, build, integration-test)
- ✅ All should show simulated success messages

### Test Main Branch Workflow:
```bash
# Merge PR to main or push directly
git checkout main
git push origin main
```

Expected behavior:
- ✅ Runs `build-push.yml` workflow
- ✅ Authenticates to AWS ECR via OIDC (no credentials needed!)
- ✅ Builds Docker image from Dockerfile
- ✅ Runs real Trivy security scan on the image
- ✅ Pushes 4 tags to ECR:
  - `478468757808.dkr.ecr.ap-south-1.amazonaws.com/ms-test:<full-sha>`
  - `478468757808.dkr.ecr.ap-south-1.amazonaws.com/ms-test:<short-sha>`
  - `478468757808.dkr.ecr.ap-south-1.amazonaws.com/ms-test:<timestamp>`
  - `478468757808.dkr.ecr.ap-south-1.amazonaws.com/ms-test:latest`
- 🔄 ArgoCD detects new image and deploys (separate from GitHub Actions)

## 📊 Workflow Status

Monitor workflow runs:
```
https://github.com/KubeStock-DevOps-project/ms-test/actions
```

## 🔧 Terraform Resources

This microservice is managed by Terraform:
- ECR Repository: Created via `aws_ecr_repository.microservices["ms-test"]`
- IAM Role: `KubeStock-github-actions-ecr-role`
- Lifecycle Policy: Keeps last 5 images

## 📝 Notes

- **PR workflow**: All checks are simulated (echo) for demonstration
- **Main workflow**: Real Docker build, real Trivy scan, real ECR push
- The Dockerfile is fully functional and builds a working ~45MB container
- OIDC authentication eliminates the need for AWS credentials in GitHub secrets
- **Multi-tag strategy**:
  - Full SHA for precise version tracking
  - Short SHA for human-readable references
  - Timestamp for chronological ordering
  - Latest for convenience
- **CD/Deployment is NOT handled by GitHub Actions** - ArgoCD manages deployments via GitOps
- Separate workflows for PR checks vs main branch builds (cleaner separation of concerns)

## 🤝 Contributing

This is a test repository. To test changes:
1. Create a feature branch
2. Make changes
3. Create PR to see all checks run
4. Merge to main to trigger ECR push

## 📄 License

MIT
