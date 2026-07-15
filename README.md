# ExamLens

Migrations for the 4 tables.
 - SQL

Admin question bank page + bulk-insert route.
 - app/api/admin/mcq/questions/route.ts
 - app/api/admin/mcq/questions/[id]/route.ts
 - app/admin/mcq/questions/page.tsx

Admin exam builder page + grouping route.
 - app/api/admin/mcq/exams/route.ts
 - app/api/admin/mcq/exams/[id]/route.ts
 - app/admin/mcq/exams/page.tsx

Student exam list page + Student attempt page + scoring route (get this fully working and tested before touching approval).
 - app/api/student/mcq/exams/route.ts
 - app/api/student/mcq/[examId]/start/route.ts
 - app/api/student/mcq/[examId]/questions/route.ts
 - app/api/student/mcq/[examId]/submit/route.ts
 - app/student/mcq/page.tsx
 - app/student/mcq/[examId]/page.tsx

Admin results/approval page.
 - app/api/admin/mcq/results/route.ts
 - app/api/admin/mcq/results/[id]/approve/route.ts
 - app/api/admin/mcq/results/approve-bulk/route.ts
 - app/api/admin/mcq/results/[id]/route.ts
 - app/admin/mcq/results/page.tsx
 - app/admin/mcq/results/[id]/page.tsx

Student result view gated on approved status.
 - app/api/student/mcq/[examId]/result/route.ts
 - app/student/mcq/[examId]/result/page.tsx


