# Three security groups, layered so only the ALB is reachable from the internet:
#   internet -> [alb sg: 80/443] -> ALB -> [ecs sg: container_port from alb sg only] -> Fargate
#   Fargate -> [rds sg: 5432 from ecs sg only] -> RDS
#
# Defined with no inline ingress/egress blocks, and cross-referencing rules added afterward as
# separate aws_security_group_rule resources — inline blocks can't reference each other's SG ids
# without a circular dependency, since e.g. the ALB's egress rule and the ECS's ingress rule both
# need to point at the *other* group.

resource "aws_security_group" "alb" {
  name        = "${var.project_name}-alb-sg"
  description = "ALB - accepts HTTP/HTTPS from the internet"
  vpc_id      = aws_vpc.main.id

  tags = { Name = "${var.project_name}-alb-sg" }
}

resource "aws_security_group" "ecs" {
  name        = "${var.project_name}-ecs-sg"
  description = "ECS Fargate tasks - accepts app traffic only from the ALB"
  vpc_id      = aws_vpc.main.id

  tags = { Name = "${var.project_name}-ecs-sg" }
}

resource "aws_security_group" "rds" {
  name        = "${var.project_name}-rds-sg"
  description = "RDS - accepts Postgres only from ECS tasks"
  vpc_id      = aws_vpc.main.id

  tags = { Name = "${var.project_name}-rds-sg" }
}

# --- ALB: the one intentionally-open door ---

resource "aws_security_group_rule" "alb_ingress_http" {
  type              = "ingress"
  security_group_id = aws_security_group.alb.id
  from_port         = 80
  to_port           = 80
  protocol          = "tcp"
  cidr_blocks       = ["0.0.0.0/0"]
  description       = "HTTP from the internet"
}

resource "aws_security_group_rule" "alb_ingress_https" {
  type              = "ingress"
  security_group_id = aws_security_group.alb.id
  from_port         = 443
  to_port           = 443
  protocol          = "tcp"
  cidr_blocks       = ["0.0.0.0/0"]
  description       = "HTTPS from the internet - no listener yet (needs an ACM cert + domain), opened ahead of time to avoid a security group change later"
}

resource "aws_security_group_rule" "alb_egress_to_ecs" {
  type                     = "egress"
  security_group_id        = aws_security_group.alb.id
  from_port                = var.container_port
  to_port                  = var.container_port
  protocol                 = "tcp"
  source_security_group_id = aws_security_group.ecs.id
  description              = "Forward to ECS tasks only"
}

# --- ECS: only reachable from the ALB, never directly from the internet ---

resource "aws_security_group_rule" "ecs_ingress_from_alb" {
  type                     = "ingress"
  security_group_id        = aws_security_group.ecs.id
  from_port                = var.container_port
  to_port                  = var.container_port
  protocol                 = "tcp"
  source_security_group_id = aws_security_group.alb.id
  description              = "App traffic from the ALB only"
}

# Broad outbound egress is genuinely required here (ECR image pull, OpenAI API, Secrets Manager,
# RDS) — this is the "specific technical requirement" that's satisfied by giving the task a public
# IP instead of a NAT Gateway, not by opening this security group's inbound side, which stays
# locked to the ALB above regardless of what the task's outbound access looks like.
resource "aws_security_group_rule" "ecs_egress_all" {
  type              = "egress"
  security_group_id = aws_security_group.ecs.id
  from_port         = 0
  to_port           = 0
  protocol          = "-1"
  cidr_blocks       = ["0.0.0.0/0"]
  description       = "Outbound to ECR / OpenAI / Secrets Manager / RDS"
}

# --- RDS: only reachable from ECS tasks. No explicit egress rule: AWS's account-default
# "allow all outbound" rule is left untouched, which is fine since the requirement here was
# about inbound access, and RDS doesn't need restricted egress for this project. ---

resource "aws_security_group_rule" "rds_ingress_from_ecs" {
  type                     = "ingress"
  security_group_id        = aws_security_group.rds.id
  from_port                = 5432
  to_port                  = 5432
  protocol                 = "tcp"
  source_security_group_id = aws_security_group.ecs.id
  description              = "Postgres from ECS tasks only"
}
