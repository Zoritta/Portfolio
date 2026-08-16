# Bringing the AWS stack up (and back down)

This stack is deliberately **not** always-on — it's an infra showcase you spin up to demo, then
tear down. Every `terraform destroy` deletes the database too, so "bringing it back up" is the
full sequence below, not just `terraform apply`.

## Prerequisites (one-time)

- AWS CLI configured (`aws configure`) with credentials for the `terraform-portfolio` IAM user.
- Terraform installed, `terraform init` already run in this directory.
- `terraform.tfvars` exists (copy from `terraform.tfvars.example`) with a real `openai_api_key`.
  Never commit this file, never paste its contents anywhere.

## Bringing it up

1. **Provision the infrastructure.**
   ```
   terraform plan -out=tfplan
   terraform apply "tfplan"
   ```
   Review the plan before applying. Note the outputs afterward, especially `alb_dns_name` and
   `ecr_repository_url` — you'll need both below. RDS is the slow part (3-7 minutes); the ALB
   takes 1-3 minutes in parallel with it.

2. **Push the API image to ECR.** Run this from a POSIX shell (Git Bash), not PowerShell — piping
   the login password through PowerShell's pipeline can corrupt it before `docker login` sees it.
   ```
   aws ecr get-login-password --region eu-north-1 | docker login --username AWS --password-stdin <ecr_repository_url, without the /portfolio-api suffix>
   docker build -f ../apps/api/Dockerfile -t <ecr_repository_url>:latest ..
   docker push <ecr_repository_url>:latest
   ```

3. **Force ECS to pick up the image** (the service was created before any image existed, so it'll
   be stuck retrying until this runs):
   ```
   aws ecs update-service --cluster portfolio-cluster --service portfolio-api-service --force-new-deployment --region eu-north-1
   ```
   Wait ~1-2 minutes, then confirm: `aws ecs describe-services --cluster portfolio-cluster --services portfolio-api-service --region eu-north-1 --query 'services[0].runningCount'`

4. **Run migrations/seed/embeddings against RDS.** RDS only accepts connections from ECS's
   security group, not your laptop — so this needs a temporary opening:
   - Add a temporary `aws_security_group_rule` to `security_groups.tf` (see git history around
     2026-08-16 for the exact pattern — an ingress rule on the RDS security group, port 5432,
     `cidr_blocks = ["<your current public IP>/32"]`, clearly commented as temporary).
   - `terraform apply` to create it.
   - Pull the connection string from Secrets Manager without ever displaying it, and temporarily
     point `apps/api/.env` at it:
     ```
     aws secretsmanager get-secret-value --secret-id portfolio/DATABASE_URL --region eu-north-1 --query SecretString --output text > /tmp/rds_url.txt
     ```
     then build a temporary `.env` with `DATABASE_URL`/`DIRECT_URL` set to that value (both the
     same — no pooler on RDS) plus your real `OPENAI_API_KEY`, swapping your real local `.env`
     aside first (`mv .env .env.local.bak`).
   - From `apps/api`: `npx prisma migrate deploy`, then `npx prisma db seed`, then
     `npm run embed:generate`.
   - Restore your local `.env` (`mv .env.local.bak .env`).
   - **Remove the temporary security group rule** from `security_groups.tf` and `terraform apply`
     again — don't leave it in place.

5. **Verify.**
   ```
   curl http://<alb_dns_name>/projects
   ```
   Should return real JSON, not a 500.

6. **(Optional) Point the live frontend at it for a full demo.** In Vercel → Environment
   Variables, temporarily set `API_URL` and `NEXT_PUBLIC_API_URL` to `http://<alb_dns_name>`
   (note: `http://`, no ACM cert/HTTPS listener exists without a domain), redeploy. **Remember to
   change it back to the Render URL and redeploy again afterward** — Render is the actual
   always-on home for the live site, AWS is only up for as long as you're demoing.

## Bringing it down

```
terraform destroy
```

Confirm nothing billed is left behind:
```
aws rds describe-db-instances --region eu-north-1 --query 'DBInstances[*].DBInstanceIdentifier'
aws ecs list-clusters --region eu-north-1
aws elbv2 describe-load-balancers --region eu-north-1 --query 'LoadBalancers[*].LoadBalancerName'
```
All three should return empty.

**The Internet Gateway routinely takes 5-8 minutes to destroy** even after everything else is
gone — this is a real AWS behavior (ALB-managed network interfaces can take longer to release
than the ALB resource itself reports as deleted), not a sign anything is wrong. Let it run.

## If OpenAI rejects the key

If `embed:generate` fails with `invalid_api_key`, don't assume it's a bug in this process first —
test the literal key value directly against OpenAI before touching any code:
```
curl -o /dev/null -w "%{http_code}" https://api.openai.com/v1/models -H "Authorization: Bearer <key>"
```
`401` means the key itself is dead (revoked, or OpenAI's own leak-detection disabled it) — check
[platform.openai.com/api-keys](https://platform.openai.com/api-keys), generate a fresh one if
needed, and update it in all three places it lives: local `apps/api/.env`, `apps/api/.env.production`
(Neon), and `terraform.tfvars` (AWS) — each independently, none of them share a value automatically.
