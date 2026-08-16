resource "aws_ecr_repository" "api" {
  name                 = "${var.project_name}-api"
  image_tag_mutability = "MUTABLE"

  # Lets `terraform destroy` remove the repo even if images are still sitting in it — expected,
  # since this stack is torn down and rebuilt per demo rather than kept as a permanent registry.
  force_delete = true

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = { Name = "${var.project_name}-api" }
}
