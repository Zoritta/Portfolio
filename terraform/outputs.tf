output "alb_dns_name" {
  description = "Public entry point for the API - http://<this>"
  value       = aws_lb.main.dns_name
}

output "ecr_repository_url" {
  description = "Push the API image here (see terraform/README.md) before or after apply"
  value       = aws_ecr_repository.api.repository_url
}

output "rds_endpoint" {
  description = "RDS host:port — the full DATABASE_URL (with credentials) lives only in Secrets Manager, not here"
  value       = aws_db_instance.main.endpoint
}

output "ecs_cluster_name" {
  value = aws_ecs_cluster.main.name
}

output "ecs_service_name" {
  value = aws_ecs_service.api.name
}
