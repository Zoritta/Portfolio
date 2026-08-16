variable "aws_region" {
  description = "AWS region — eu-north-1 (Stockholm) is closest to the target job market"
  type        = string
  default     = "eu-north-1"
}

variable "project_name" {
  description = "Prefix applied to every resource name/tag"
  type        = string
  default     = "portfolio"
}

variable "db_name" {
  type    = string
  default = "portfolio"
}

variable "db_username" {
  type    = string
  default = "portfolio_admin"
}

variable "openai_api_key" {
  description = "Set via terraform.tfvars (gitignored) — never a default, never pasted into chat"
  type        = string
  sensitive   = true
}

variable "web_origin" {
  description = "CORS-allowed origin for the API — the live Vercel frontend"
  type        = string
  default     = "https://portfolio-web-iota-self.vercel.app"
}

variable "container_port" {
  type    = number
  default = 3001
}

variable "container_image_tag" {
  description = "Tag to deploy from ECR — push this tag before/after apply, see README"
  type        = string
  default     = "latest"
}

variable "db_instance_class" {
  type    = string
  default = "db.t4g.micro"
}

variable "container_cpu" {
  description = "Fargate task CPU units (256 = smallest/cheapest)"
  type        = number
  default     = 256
}

variable "container_memory" {
  description = "Fargate task memory in MB (512 = smallest/cheapest at this CPU size)"
  type        = number
  default     = 512
}
