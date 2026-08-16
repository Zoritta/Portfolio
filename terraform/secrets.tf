locals {
  database_url = "postgresql://${var.db_username}:${random_password.db.result}@${aws_db_instance.main.address}:5432/${var.db_name}?sslmode=require"
}

# recovery_window_in_days = 0 skips AWS's default 30-day "soft delete" hold on secret names —
# appropriate here since this stack is destroyed and recreated per demo, and without it a second
# `terraform apply` right after a `destroy` would fail trying to create a secret name still stuck
# in recovery.

resource "aws_secretsmanager_secret" "database_url" {
  name                    = "${var.project_name}/DATABASE_URL"
  recovery_window_in_days = 0

  tags = { Name = "${var.project_name}-database-url" }
}

resource "aws_secretsmanager_secret_version" "database_url" {
  secret_id     = aws_secretsmanager_secret.database_url.id
  secret_string = local.database_url
}

resource "aws_secretsmanager_secret" "openai_api_key" {
  name                    = "${var.project_name}/OPENAI_API_KEY"
  recovery_window_in_days = 0

  tags = { Name = "${var.project_name}-openai-api-key" }
}

resource "aws_secretsmanager_secret_version" "openai_api_key" {
  secret_id     = aws_secretsmanager_secret.openai_api_key.id
  secret_string = var.openai_api_key
}
