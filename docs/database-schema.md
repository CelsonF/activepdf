# Database Schema — ActivePDF

## Overview

Three core entities: **professors**, **students**, and **subjects**.

| Relationship              | Cardinality  | Rule                                               |
|---------------------------|--------------|----------------------------------------------------|
| professor → students      | One-to-Many  | A professor teaches N students                     |
| student → professor       | Many-to-One  | A student belongs to at most 1 professor           |
| student ↔ subjects        | Many-to-Many | A student enrolls in N subjects; a subject has N students |

```
professors 1 ──────────── N students N ──────────── M subjects
                                      └── student_subjects (junction)
```

---

## Entity-Relationship Diagram

```
┌──────────────────────────┐
│        professors         │
├──────────────────────────┤
│ id          UUID  PK      │
│ name        TEXT  NN      │
│ email       TEXT  NN  UQ  │
│ subject     TEXT          │  ← main discipline (text, not a FK)
│ bio         TEXT          │
│ created_at  TIMESTAMPTZ   │
│ updated_at  TIMESTAMPTZ   │
└────────────┬─────────────┘
             │ 1
             │
             │ N
┌────────────▼─────────────┐        ┌──────────────────────────┐
│          students         │        │          subjects          │
├──────────────────────────┤        ├──────────────────────────┤
│ id            UUID  PK    │        │ id          UUID  PK      │
│ professor_id  UUID  FK ◄──┘        │ name        TEXT  NN  UQ  │
│ name          TEXT  NN    │        │ description TEXT           │
│ email         TEXT  NN UQ │        │ created_at  TIMESTAMPTZ   │
│ enrollment    TEXT  UQ    │        │ updated_at  TIMESTAMPTZ   │
│ created_at    TIMESTAMPTZ │        └────────────┬─────────────┘
│ updated_at    TIMESTAMPTZ │                     │
└────────────┬─────────────┘                     │
             │ N                                  │ M
             │                                    │
             └──────────┐        ┌────────────────┘
                        ▼        ▼
               ┌──────────────────────────┐
               │      student_subjects     │  ← junction table
               ├──────────────────────────┤
               │ student_id  UUID  PK  FK  │
               │ subject_id  UUID  PK  FK  │
               │ enrolled_at TIMESTAMPTZ   │
               └──────────────────────────┘
```

> `professor_id` is nullable — a student can exist without being assigned to a professor.  
> `student_subjects` uses a composite PK `(student_id, subject_id)` to prevent duplicate enrollments.

---

## Table Definitions

### `professors`

| Column       | Type        | Constraints                   | Description                      |
|--------------|-------------|-------------------------------|----------------------------------|
| `id`         | UUID        | PK, DEFAULT gen_random_uuid() | Unique identifier                |
| `name`       | TEXT        | NOT NULL                      | Full name                        |
| `email`      | TEXT        | NOT NULL, UNIQUE              | Login / contact email            |
| `subject`    | TEXT        |                               | Main discipline (free text)      |
| `bio`        | TEXT        |                               | Short biography                  |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now()       | Record creation timestamp        |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now()       | Last update timestamp            |

```sql
CREATE TABLE professors (
  id         UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT         NOT NULL,
  email      TEXT         NOT NULL UNIQUE,
  subject    TEXT,
  bio        TEXT,
  created_at TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ  NOT NULL DEFAULT now()
);
```

---

### `students`

| Column         | Type        | Constraints                            | Description                    |
|----------------|-------------|----------------------------------------|--------------------------------|
| `id`           | UUID        | PK, DEFAULT gen_random_uuid()          | Unique identifier              |
| `professor_id` | UUID        | FK → professors(id) ON DELETE SET NULL | Assigned professor (nullable)  |
| `name`         | TEXT        | NOT NULL                               | Full name                      |
| `email`        | TEXT        | NOT NULL, UNIQUE                       | Login / contact email          |
| `enrollment`   | TEXT        | UNIQUE                                 | Enrollment / registration code |
| `created_at`   | TIMESTAMPTZ | NOT NULL, DEFAULT now()                | Record creation timestamp      |
| `updated_at`   | TIMESTAMPTZ | NOT NULL, DEFAULT now()                | Last update timestamp          |

```sql
CREATE TABLE students (
  id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  professor_id  UUID         REFERENCES professors(id) ON DELETE SET NULL,
  name          TEXT         NOT NULL,
  email         TEXT         NOT NULL UNIQUE,
  enrollment    TEXT         UNIQUE,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);
```

---

### `subjects`

| Column        | Type        | Constraints                   | Description                   |
|---------------|-------------|-------------------------------|-------------------------------|
| `id`          | UUID        | PK, DEFAULT gen_random_uuid() | Unique identifier             |
| `name`        | TEXT        | NOT NULL, UNIQUE              | Subject name (e.g. "English") |
| `description` | TEXT        |                               | Short description             |
| `created_at`  | TIMESTAMPTZ | NOT NULL, DEFAULT now()       | Record creation timestamp     |
| `updated_at`  | TIMESTAMPTZ | NOT NULL, DEFAULT now()       | Last update timestamp         |

```sql
CREATE TABLE subjects (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT         NOT NULL UNIQUE,
  description TEXT,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);
```

---

### `student_subjects` *(junction)*

| Column        | Type        | Constraints                              | Description               |
|---------------|-------------|------------------------------------------|---------------------------|
| `student_id`  | UUID        | PK (composite), FK → students(id)        | Enrolled student          |
| `subject_id`  | UUID        | PK (composite), FK → subjects(id)        | Enrolled subject          |
| `enrolled_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now()                  | Date of enrollment        |

```sql
CREATE TABLE student_subjects (
  student_id  UUID         NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  subject_id  UUID         NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ  NOT NULL DEFAULT now(),

  PRIMARY KEY (student_id, subject_id)
);
```

> `ON DELETE CASCADE` on both FKs: removing a student or a subject automatically removes the enrollment rows.

---

## Indexes

```sql
-- Students by professor
CREATE INDEX idx_students_professor_id   ON students(professor_id);

-- Junction lookups
CREATE INDEX idx_student_subjects_student ON student_subjects(student_id);
CREATE INDEX idx_student_subjects_subject ON student_subjects(subject_id);

-- Case-insensitive email search
CREATE INDEX idx_professors_email ON professors(LOWER(email));
CREATE INDEX idx_students_email   ON students(LOWER(email));

-- Subject name search
CREATE INDEX idx_subjects_name ON subjects(LOWER(name));
```

---

## Relationships & Delete Behavior

| From          | To              | Type         | On Delete parent          |
|---------------|-----------------|--------------|---------------------------|
| professor     | students        | One-to-Many  | SET NULL on `professor_id` |
| student       | student_subjects| One-to-Many  | CASCADE (remove enrollments) |
| subject       | student_subjects| One-to-Many  | CASCADE (remove enrollments) |

---

## Common Queries

### All subjects of a student
```sql
SELECT sub.*
FROM   subjects sub
JOIN   student_subjects ss ON ss.subject_id = sub.id
WHERE  ss.student_id = :student_id
ORDER  BY sub.name;
```

### All students enrolled in a subject
```sql
SELECT s.*
FROM   students s
JOIN   student_subjects ss ON ss.student_id = s.id
WHERE  ss.subject_id = :subject_id
ORDER  BY s.name;
```

### Students of a professor with their subjects (aggregated)
```sql
SELECT
  s.id,
  s.name,
  s.email,
  ARRAY_AGG(sub.name ORDER BY sub.name) AS subjects
FROM   students s
LEFT   JOIN student_subjects ss ON ss.student_id = s.id
LEFT   JOIN subjects sub        ON sub.id = ss.subject_id
WHERE  s.professor_id = :professor_id
GROUP  BY s.id
ORDER  BY s.name;
```

### Enroll a student in a subject
```sql
INSERT INTO student_subjects (student_id, subject_id)
VALUES (:student_id, :subject_id)
ON CONFLICT DO NOTHING;   -- safe to call twice
```

### Remove a student from a subject
```sql
DELETE FROM student_subjects
WHERE  student_id = :student_id
  AND  subject_id = :subject_id;
```

### Subject with enrollment count
```sql
SELECT
  sub.id,
  sub.name,
  COUNT(ss.student_id) AS student_count
FROM   subjects sub
LEFT   JOIN student_subjects ss ON ss.subject_id = sub.id
GROUP  BY sub.id
ORDER  BY sub.name;
```

### Students without any subject enrolled
```sql
SELECT s.*
FROM   students s
LEFT   JOIN student_subjects ss ON ss.student_id = s.id
WHERE  ss.student_id IS NULL
ORDER  BY s.name;
```

---

## CRUD Operations Summary

### Professors

| Operation | Endpoint                     |
|-----------|------------------------------|
| Create    | `POST /api/professors`       |
| Read all  | `GET /api/professors`        |
| Read one  | `GET /api/professors/:id`    |
| Update    | `PUT /api/professors/:id`    |
| Delete    | `DELETE /api/professors/:id` |

### Students

| Operation          | Endpoint                              |
|--------------------|---------------------------------------|
| Create             | `POST /api/students`                  |
| Read all           | `GET /api/students`                   |
| Read one           | `GET /api/students/:id`               |
| By professor       | `GET /api/professors/:id/students`    |
| Update             | `PUT /api/students/:id`               |
| Assign professor   | `PATCH /api/students/:id/professor`   |
| Unassign professor | `DELETE /api/students/:id/professor`  |
| Delete             | `DELETE /api/students/:id`            |

### Subjects

| Operation | Endpoint                    |
|-----------|-----------------------------|
| Create    | `POST /api/subjects`        |
| Read all  | `GET /api/subjects`         |
| Read one  | `GET /api/subjects/:id`     |
| Update    | `PUT /api/subjects/:id`     |
| Delete    | `DELETE /api/subjects/:id`  |

### Student ↔ Subject Enrollments

| Operation              | Endpoint                                         |
|------------------------|--------------------------------------------------|
| List student's subjects | `GET /api/students/:id/subjects`               |
| List subject's students | `GET /api/subjects/:id/students`               |
| Enroll student         | `POST /api/students/:id/subjects`               |
| Unenroll student       | `DELETE /api/students/:id/subjects/:subject_id` |

---

## Notes

- The `subjects` name column has a `UNIQUE` constraint — "English" can only be created once and is then shared across all enrollments.
- `ON CONFLICT DO NOTHING` on enrollment insert makes the enroll endpoint idempotent.
- `professors.subject` remains a free-text field for a professor's primary discipline. If professors need to be linked to the `subjects` table in the future, a `professor_subjects` junction table can be added following the same pattern.
- `updated_at` should be maintained via a `BEFORE UPDATE` trigger or handled at the application layer.

---

## Next Steps

1. Choose a database (PostgreSQL recommended).
2. Choose ORM/query builder — **Drizzle** or **Prisma** both handle many-to-many well.
3. Implement API routes:
   - `src/app/api/professors/`
   - `src/app/api/students/`
   - `src/app/api/subjects/`
   - `src/app/api/students/[id]/subjects/`
4. Build the CRUD UI screens for each entity.
