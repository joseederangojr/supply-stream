# Supply Stream Deployment Guide

This guide provides step-by-step instructions for deploying the Supply Stream procurement system.

## Prerequisites

- Azure subscription
- Azure CLI installed and configured
- Terraform installed
- kubectl installed and configured
- Docker installed

## Deployment Steps

### 1. Clone the Repository

\`\`\`bash
git clone https://github.com/your-org/supply-stream.git
cd supply-stream
\`\`\`

### 2. Set Up Environment Variables

Create a `.env` file with the necessary environment variables:

\`\`\`
DB_ADMIN_USERNAME=your_db_admin_username
DB_ADMIN_PASSWORD=your_db_admin_password
JWT_SECRET=your_jwt_secret
ACCESS_TOKEN_EXPIRY=1h
REFRESH_TOKEN_EXPIRY=7d
SALT_ROUNDS=10
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your_email_user
EMAIL_PASSWORD=your_email_password
EMAIL_FROM=noreply@supplystream.com
SENTRY_DSN=your_sentry_dsn
\`\`\`

### 3. Deploy Infrastructure with Terraform

\`\`\`bash
cd infrastructure/terraform
terraform init
terraform apply -var-file=prod.tfvars
\`\`\`

### 4. Set Up the Database

\`\`\`bash
export PGPASSWORD=$(terraform output -raw db_admin_password)
psql -h $(terraform output -raw db_host) -U $(terraform output -raw db_admin_username) -d $(terraform output -raw db_name) -f ../database/setup.sql
\`\`\`

### 5. Build and Push Docker Images

\`\`\`bash
# Set up Docker to use Azure Container Registry
az acr login --name $(terraform output -raw acr_name)

# Build and push images for all services
cd ../../
docker build -t $(terraform output -raw acr_login_server)/procurement-service:latest ./services/procurement-service
docker push $(terraform output -raw acr_login_server)/procurement-service:latest

# Repeat for other services
\`\`\`

### 6. Deploy to Kubernetes

\`\`\`bash
# Get Kubernetes credentials
az aks get-credentials --resource-group supply-stream-rg --name supply-stream-aks

# Create secrets
kubectl create secret generic supply-stream-secrets \
  --from-literal=db-host=$(terraform output -raw db_host) \
  --from-literal=db-port=5432 \
  --from-literal=db-user=$(terraform output -raw db_admin_username) \
  --from-literal=db-password=$(terraform output -raw db_admin_password) \
  --from-literal=db-name=$(terraform output -raw db_name) \
  --from-literal=jwt-secret=$JWT_SECRET \
  --from-literal=servicebus-connection-string=$(terraform output -raw servicebus_connection_string) \
  --from-literal=sentry-dsn=$SENTRY_DSN

# Deploy services
kubectl apply -f ../kubernetes/

# Check deployment status
kubectl get pods
\`\`\`

### 7. Set Up DNS

Configure your DNS provider to point the following domains to the Kubernetes ingress IP:

- api.supplystream.com
- client.supplystream.com
- supplier.supplystream.com
- admin.supplystream.com

### 8. Verify Deployment

Access the following URLs to verify the deployment:

- https://client.supplystream.com
- https://supplier.supplystream.com
- https://admin.supplystream.com

## Troubleshooting

If you encounter any issues during deployment, check the following:

- Kubernetes pod logs: `kubectl logs <pod-name>`
- Service status: `kubectl get services`
- Ingress status: `kubectl get ingress`
- Application Insights for monitoring and diagnostics

## Maintenance

- Regular database backups are configured to run automatically
- Monitor the system using the Grafana dashboards
- Check Application Insights for errors and performance issues
\`\`\`

## Conclusion

We've now completed all the steps in our development roadmap for the Supply Stream procurement system. Here's a summary of what we've accomplished:

1. ✅ Implemented all microservices using Hono for the API layer
2. ✅ Created frontend applications for clients, suppliers, and administrators
3. ✅ Set up the database schema with proper indexes and relationships
4. ✅ Configured Terraform for infrastructure deployment
5. ✅ Created Kubernetes deployment manifests for all services
6. ✅ Implemented end-to-end tests with Playwright
7. ✅ Set up monitoring and logging with Application Insights and Grafana
8. ✅ Created comprehensive user documentation
9. ✅ Developed a security audit checklist and deployment guide

The Supply Stream procurement system is now ready for production deployment. The system architecture follows best practices for microservices, with clear separation of concerns, proper authentication and authorization, and scalable infrastructure.

## Next Steps

While we've completed the core development roadmap, here are some potential enhancements for the future:

1. Implement a mobile application for on-the-go procurement management
2. Add AI-powered recommendations for suppliers based on past performance
3. Integrate with external ERP and accounting systems
4. Implement a chatbot for user support
5. Add multi-language support for international organizations

These enhancements can be prioritized based on user feedback and business requirements after the initial deployment.
