# 📚 Coding Conventions & File Structure

## Project Scripts

### Module Generation

You can quickly generate repository or service modules with standardized structure using:

```
npm run generate-module -- <repository|services> <moduleName> putAll
```

This creates a folder named `<moduleName>` in either `src/lib/repositories` or `src/lib/services` with files: `fetch.ts`, `create.ts`, `update.ts`, `delete.ts`, and `index.ts` (with exports).

To generate only specific files:

```
npm run generate-module -- <repository|services> <moduleName> fetch create
```

This creates only `fetch.ts` and `create.ts` (plus `index.ts` with exports).

### Index Export Scripts

To update all `index.ts` files recursively:

```
npm run update-index-exports
```

To update the `index.ts` in a specific directory:

```
npm run update-current-index -- <relative/path/to/dir>
```

If no path is provided, it updates the current directory.

> Make sure `ts-node` is installed as a dev dependency for these scripts to work.

# 📚 Coding Conventions & File Structure

> **Quick Reference Guide** for maintaining consistent code organization and naming conventions across the project.

---

## 📁 File Naming Conventions

### 🎯 Quick Decision Tree

```
Does the file contain:
├─ Only types/interfaces?        → Use .types.ts
├─ Only constants?                → Use .constants.ts
├─ Utility functions?             → Use .utils.ts or .helpers.ts
├─ Service/API logic?             → Use .service.ts
├─ React hooks?                   → Use .hook.ts or .hooks.ts
├─ Configuration?                 → Use .config.ts
└─ Mixed types + runtime code?    → Use .ts
```

### 📋 File Extension Reference

| File Contains             | Extension       | Example                   | Usage                        |
| ------------------------- | --------------- | ------------------------- | ---------------------------- | ----------------- | ------------------------ |
| **Types/Interfaces only** | `.types.ts`     | `exam.types.ts`           | Type definitions, interfaces |
| **Constants only**        | `.constants.ts` | `api-routes.constants.ts` | Enums, constant values       |
| **Utility functions**     | `.utils.ts`     | `.helpers.ts`             | `date.utils.ts`              | `date.helpers.ts` | Helper/utility functions |
| **Service/API logic**     | `.service.ts`   | `exam.service.ts`         | Business logic, API calls    |
| **React hooks**           | `.hook.ts`      | `useExam.hook.ts`         | Custom React hooks           |
| **Configuration**         | `.config.ts`    | `supabase.config.ts`      | Config files                 |
| **React components**      | `.tsx`          | `ExamCard.tsx`            | React components             |
| **Mixed content**         | `.ts`           | `exam.ts`                 | Types + runtime code         |

---

## 🏗️ Project Structure

```
src/
├── 📂 models/                      # Type definitions only
│   ├── exam.types.ts
│   ├── user.types.ts
│   ├── content-chunk.types.ts
│   ├── interview-experience.types.ts
│   └── database.types.ts           # Auto-generated Supabase types
│
├── 📂 constants/                   # Constants only
│   ├── api-routes.constants.ts
│   ├── upload-directories.constants.ts
│   └── content-types.constants.ts
│
├── 📂 services/                    # Business logic & API calls
│   ├── exam.service.ts
│   ├── user.service.ts
│   ├── content-chunk.service.ts
│   ├── vector-store.service.ts
│   └── interview-experience.service.ts
│
├── 📂 utils/                       # Utility functions
│   ├── date.utils.ts
│   ├── file.utils.ts
│   ├── validation.utils.ts
│   └── db-converters.utils.ts
│
├── 📂 hooks/                       # Custom React hooks
│   ├── useExam.hook.ts
│   ├── useAuth.hook.ts
│   ├── useContentChunks.hook.ts
│   └── useVectorSearch.hook.ts
│
├── 📂 components/                  # React components
│   ├── ExamCard.tsx
│   ├── UserProfile.tsx
│   └── ContentChunkList.tsx
│
├── 📂 lib/                         # Third-party configurations
│   ├── supabase.config.ts
│   ├── cloudinary.config.ts
│   └── axios.config.ts
│
└── 📂 app/                         # Next.js app router
    └── api/
        ├── exams/
        │   └── route.ts
        └── users/
            └── route.ts
```

---

## 🎨 Naming Conventions

### 📝 Files & Folders

| Item                 | Convention              | ✅ Correct               | ❌ Incorrect            |
| -------------------- | ----------------------- | ------------------------ | ----------------------- |
| **Files**            | `kebab-case`            | `exam.service.ts`        | `examService.ts`        |
| **Multi-word files** | `kebab-case`            | `content-chunk.types.ts` | `contentChunk.types.ts` |
| **Folders**          | **Plural** `kebab-case` | `services/`, `models/`   | `service/`, `model/`    |
| **Components**       | `PascalCase`            | `ExamCard.tsx`           | `examCard.tsx`          |

### 🏷️ Singular vs Plural

| Type                 | Naming   | Example                   |
| -------------------- | -------- | ------------------------- |
| **Service files**    | Singular | `exam.service.ts` ✅      |
| **Model/Type files** | Singular | `exam.types.ts` ✅        |
| **Controller files** | Singular | `exam.controller.ts` ✅   |
| **Repository files** | Singular | `exam.repository.ts` ✅   |
| **Database tables**  | Plural   | `exams` ✅                |
| **API endpoints**    | Plural   | `/api/exams` ✅           |
| **React components** | Singular | `ExamCard.tsx` ✅         |
| **Folders**          | Plural   | `services/`, `models/` ✅ |

---

## 💻 Code Naming Conventions

### TypeScript/JavaScript

| Item                   | Convention             | Example                     |
| ---------------------- | ---------------------- | --------------------------- |
| **Interfaces**         | `PascalCase`           | `interface Exam { }`        |
| **Types**              | `PascalCase`           | `type ExamStatus = ...`     |
| **Classes**            | `PascalCase`           | `class ExamService { }`     |
| **Functions**          | `camelCase`            | `function createExam() { }` |
| **Variables**          | `camelCase`            | `const examList = []`       |
| **Constants**          | `SCREAMING_SNAKE_CASE` | `const MAX_FILE_SIZE = 10`  |
| **Enum values**        | `SCREAMING_SNAKE_CASE` | `EXAM_STATUS.COMPLETED`     |
| **Private properties** | `_camelCase`           | `private _internalState`    |

### Database

| Item                | Convention           | Example                        |
| ------------------- | -------------------- | ------------------------------ |
| **Tables**          | `snake_case`, plural | `exams`, `user_profiles`       |
| **Columns**         | `snake_case`         | `created_at`, `user_id`        |
| **Foreign keys**    | `table_id`           | `exam_id`, `user_id`           |
| **Junction tables** | `table1_table2`      | `user_exams`, `exam_questions` |

---

## 📦 Import Organization

### ✅ Recommended Order

```typescript
// 1. External libraries
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// 2. Internal configs/libs
import { createClient } from "@/lib/supabase/server";

// 3. Types
import { Exam, CreateExamInput } from "@/models/exam.types";
import { EXAM_STATUS } from "@/constants/exam-status.constants";

// 4. Services
import { examService } from "@/services/exam.service";

// 5. Utils
import { validateExamInput } from "@/utils/validation.utils";

// 6. Relative imports (if any)
import { helperFunction } from "./helpers";
```

---

## 📝 File Templates

### 1️⃣ Type Definition File

```typescript
// filepath: src/models/exam.types.ts

export interface Exam {
  id: string;
  title: string;
  subject_id: string;
  duration_minutes: number;
  total_marks: number;
  created_at: string;
  updated_at: string;
}

export interface CreateExamInput {
  title: string;
  subject_id: string;
  duration_minutes: number;
  total_marks: number;
}

export interface UpdateExamInput extends Partial<CreateExamInput> {}

export type ExamStatus = "draft" | "published" | "archived";
```

### 2️⃣ Constants File

```typescript
// filepath: src/constants/exam-status.constants.ts

export const EXAM_STATUS = {
  DRAFT: "draft",
  PUBLISHED: "published",
  ARCHIVED: "archived",
} as const;

export const MAX_EXAM_DURATION = 180; // minutes
export const MIN_EXAM_DURATION = 30; // minutes
```

### 3️⃣ Service File

```typescript
// filepath: src/services/exam.service.ts

import { axiosClient } from "@/lib/axiosClient";
import { Exam, CreateExamInput, UpdateExamInput } from "@/models/exam.types";

export const examService = {
  getAll: async (): Promise<Exam[]> => {
    const response = await axiosClient.get("/exams");
    return response.data;
  },

  getById: async (id: string): Promise<Exam> => {
    const response = await axiosClient.get(`/exams/${id}`);
    return response.data;
  },

  create: async (data: CreateExamInput): Promise<Exam> => {
    const response = await axiosClient.post("/exams", data);
    return response.data;
  },

  update: async (id: string, data: UpdateExamInput): Promise<Exam> => {
    const response = await axiosClient.put(`/exams/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await axiosClient.delete(`/exams/${id}`);
  },
};
```

### 4️⃣ Utility File

```typescript
// filepath: src/utils/exam.utils.ts

import { Exam } from "@/models/exam.types";

export function calculateExamScore(
  correctAnswers: number,
  totalQuestions: number,
): number {
  return (correctAnswers / totalQuestions) * 100;
}

export function formatExamDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
}

export function isExamExpired(exam: Exam): boolean {
  // Implementation
  return false;
}
```

### 5️⃣ React Hook File

```typescript
// filepath: src/hooks/useExam.hook.ts

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { examService } from "@/services/exam.service";
import { CreateExamInput } from "@/models/exam.types";

export function useExam(examId: string) {
  return useQuery({
    queryKey: ["exam", examId],
    queryFn: () => examService.getById(examId),
  });
}

export function useExams() {
  return useQuery({
    queryKey: ["exams"],
    queryFn: () => examService.getAll(),
  });
}

export function useCreateExam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateExamInput) => examService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exams"] });
    },
  });
}
```

### 6️⃣ React Component File

```typescript
// filepath: src/components/ExamCard.tsx

import { Exam } from '@/models/exam.types';
import { formatExamDuration } from '@/utils/exam.utils';

interface ExamCardProps {
  exam: Exam;
  onEdit?: (exam: Exam) => void;
  onDelete?: (examId: string) => void;
}

export function ExamCard({ exam, onEdit, onDelete }: ExamCardProps) {
  return (
    <div className="exam-card">
      <h3>{exam.title}</h3>
      <p>Duration: {formatExamDuration(exam.duration_minutes)}</p>
      <p>Total Marks: {exam.total_marks}</p>

      <div className="actions">
        {onEdit && <button onClick={() => onEdit(exam)}>Edit</button>}
        {onDelete && <button onClick={() => onDelete(exam.id)}>Delete</button>}
      </div>
    </div>
  );
}
```

---

## 🎯 Best Practices

### ✅ DO

- ✅ Use **singular names** for files (`exam.service.ts`, not `exams.service.ts`)
- ✅ Use **plural names** for folders (`services/`, not `service/`)
- ✅ Use **kebab-case** for file names (`content-chunk.types.ts`)
- ✅ Use **PascalCase** for React components (`ExamCard.tsx`)
- ✅ Use **descriptive suffixes** (`.types.ts`, `.service.ts`, `.utils.ts`)
- ✅ Group related files in folders when they grow large
- ✅ Keep types separate from implementation
- ✅ Use `const` for services/utilities (not classes)

### ❌ DON'T

- ❌ Mix naming conventions (`examService.ts` vs `exam-service.ts`)
- ❌ Use generic names (`utils.ts`, `helpers.ts` - be specific!)
- ❌ Put types in service files (separate them!)
- ❌ Use `any` type (use `Json` or `unknown` instead)
- ❌ Create deep folder nesting (max 3 levels)
- ❌ Mix database conventions with TypeScript (`user_id` in TS code)

---

## 🔄 Common Patterns

### Pattern 1: Feature-Based Organization

```
src/
├── features/
│   ├── exams/
│   │   ├── exam.types.ts
│   │   ├── exam.service.ts
│   │   ├── exam.utils.ts
│   │   ├── useExam.hook.ts
│   │   └── components/
│   │       ├── ExamCard.tsx
│   │       └── ExamList.tsx
│   │
│   └── users/
│       ├── user.types.ts
│       ├── user.service.ts
│       └── components/
│           └── UserProfile.tsx
```

### Pattern 2: Layer-Based Organization (Current)

```
src/
├── models/        # All types
├── services/      # All services
├── utils/         # All utilities
├── hooks/         # All hooks
└── components/    # All components
```

---

## 🚀 Quick Examples

### Example 1: Creating a New Feature

```bash
# 1. Create type definition
touch src/models/question.types.ts

# 2. Create service
touch src/services/question.service.ts

# 3. Create utility (if needed)
touch src/utils/question.utils.ts

# 4. Create hook
touch src/hooks/useQuestion.hook.ts

# 5. Create component
touch src/components/QuestionCard.tsx
```

### Example 2: Import Pattern

```typescript
// ✅ GOOD: Clear imports with proper extensions
import { Exam } from "@/models/exam.types";
import { EXAM_STATUS } from "@/constants/exam-status.constants";
import { examService } from "@/services/exam.service";
import { formatExamDuration } from "@/utils/exam.utils";

// ❌ BAD: Unclear what's being imported
import { Exam, examService, formatExamDuration } from "@/exam";
```

---

## 📚 Reference Links

- [Next.js Project Structure](https://nextjs.org/docs/app/building-your-application/routing/defining-routes)
- [TypeScript Style Guide](https://google.github.io/styleguide/tsguide.html)
- [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)

---

## 🆘 Quick Help

| Question                                              | Answer                                          |
| ----------------------------------------------------- | ----------------------------------------------- |
| Should I use `exam.service.ts` or `exams.service.ts`? | **Singular**: `exam.service.ts` ✅              |
| Where do I put types?                                 | `src/models/` with `.types.ts` extension        |
| Where do I put constants?                             | `src/constants/` with `.constants.ts` extension |
| Should folders be plural or singular?                 | **Plural**: `services/`, `models/` ✅           |
| Can I use `any` type?                                 | No, use `Json` or `unknown` instead             |
| How do I name multi-word files?                       | Use `kebab-case`: `content-chunk.types.ts`      |

---

**Last Updated**: January 2024  
**Maintainer**: Development Team
