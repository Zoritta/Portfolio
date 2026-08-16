# special = false avoids characters (@, /, :, #, etc.) that would need URL-encoding once this
# password is interpolated directly into a postgresql:// connection string in secrets.tf.
resource "random_password" "db" {
  length  = 24
  special = false
}

resource "aws_db_subnet_group" "main" {
  name       = "${var.project_name}-db-subnet-group"
  subnet_ids = aws_subnet.public[*].id

  tags = { Name = "${var.project_name}-db-subnet-group" }
}

resource "aws_db_instance" "main" {
  identifier     = "${var.project_name}-db"
  engine         = "postgres"
  engine_version = "16"
  instance_class = var.db_instance_class

  allocated_storage = 20
  storage_type      = "gp3"

  db_name  = var.db_name
  username = var.db_username
  password = random_password.db.result

  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]

  # Sits in a "public" subnet (no NAT Gateway in this design), but is not actually open to the
  # internet — the security group above only allows inbound from the ECS security group. See
  # security_groups.tf.
  publicly_accessible = true

  multi_az            = false
  skip_final_snapshot = true # this stack is meant to be destroyed and recreated per demo
  deletion_protection = false
  apply_immediately   = true

  tags = { Name = "${var.project_name}-db" }
}
