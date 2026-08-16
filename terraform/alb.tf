resource "aws_lb" "main" {
  name               = "${var.project_name}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = aws_subnet.public[*].id

  tags = { Name = "${var.project_name}-alb" }
}

# target_type = "ip" is required for Fargate's awsvpc networking mode — tasks don't have a stable
# EC2 instance to target the way the "instance" target type expects.
resource "aws_lb_target_group" "api" {
  name        = "${var.project_name}-api-tg"
  port        = var.container_port
  protocol    = "HTTP"
  vpc_id      = aws_vpc.main.id
  target_type = "ip"

  # No dedicated /health route exists yet, so this reuses the existing GET /projects endpoint —
  # lightweight, already returns 200 when the app and its DB connection are both healthy.
  health_check {
    path                = "/projects"
    healthy_threshold   = 2
    unhealthy_threshold = 3
    timeout             = 5
    interval            = 30
    matcher             = "200"
  }

  tags = { Name = "${var.project_name}-api-tg" }
}

# HTTP only for now — a real HTTPS listener needs an ACM certificate, which needs a domain you
# own to validate against. Port 443 is already open on the ALB's security group (see
# security_groups.tf) so adding one later is a small addition, not a redo.
resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.main.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.api.arn
  }
}
