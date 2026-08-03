-- CreateIndex
CREATE UNIQUE INDEX "Experience_company_role_key" ON "Experience"("company", "role");

-- CreateIndex
CREATE UNIQUE INDEX "Project_title_key" ON "Project"("title");
