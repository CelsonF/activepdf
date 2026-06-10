# ActivePDF — Product Workflow

## The Problem This Software Solves

### Real-world scenario

A private English teacher manages individual students. For each one, she:

1. Creates a **Google Drive folder** named after the student
2. Inside the folder, maintains a **Google Doc** containing:
   - The student's English level and learning objective
   - A reference to the book in use *(Interchange Fifth Edition — Cambridge)*
   - A vocabulary and expressions log
   - A calendar table: `date | content covered | homework | notes`
3. Conducts classes via **Microsoft Teams or Google Meet** (video call)
4. Sends **listening practice audios via WhatsApp**
5. Shares **PDF pages from the book** manually

### The pain

| Problem | Why it hurts |
|---|---|
| Scattered across 4+ tools | Teacher and student lose context switching between Drive, WhatsApp, Teams, and email |
| No structured vocabulary log | Words and expressions live in a freeform doc — hard to review or search |
| Calendar is a manual table | Teacher updates it by hand every class; no history, no reminders |
| Audios via WhatsApp | Listening materials disappear in chat history; no organization by lesson |
| PDFs shared as static files | Students can't fill or annotate them; teacher gets back a photo or a new file |
| Each student is an isolated folder | No cross-student view for the teacher; can't see who is behind on homework |

---

## The Vision — ActivePDF as the Central Hub

ActivePDF replaces the fragmented tool stack with one place where the teacher plans, delivers, and tracks; and students access, fill, and submit — all centered on **PDF documents**.

```
Before:  Drive + WhatsApp + Teams + Google Docs  (4 tools, no connection)

After:   ActivePDF  ──  one platform
              │
              ├── Learning plan per student (level + objective + book)
              ├── Lesson calendar (date, content, homework, notes)
              ├── Vocabulary log (words, expressions, examples)
              ├── PDF materials (book pages, exercises — fillable)
              ├── Audio materials (listening practice, per lesson)
              └── Meet link per lesson (Teams / Google Meet)
```

---

## Workflow Mapping

### Teacher's current flow → ActivePDF feature

| Current action | Tool used | ActivePDF replacement |
|---|---|---|
| Create a folder per student | Google Drive | Create a **student profile** (professor → students) |
| Write the learning plan | Google Docs | **Learning plan** record (level, objective, book reference) |
| Fill the calendar table | Google Docs table | **Lesson** record (date, content, homework, notes) |
| Log vocabulary / expressions | Google Docs | **Vocabulary entry** per lesson |
| Share PDF pages / exercises | Email / Drive | Upload PDF → add **fillable fields** → share with student |
| Send listening audio | WhatsApp | Attach **audio material** to a lesson |
| Video call link | Teams / Meet | **Meet link** stored on the lesson record |

### Student's current flow → ActivePDF feature

| Current action | ActivePDF replacement |
|---|---|
| Receive folder link | Log in → see own dashboard |
| Open the Google Doc to review notes | Open lesson history — notes, vocabulary, calendar |
| Receive exercise PDF | Open assigned PDF → fill fields directly in the browser |
| Submit filled PDF (photo / new file) | Click **Export** → PDF sent back with answers embedded |
| Listen to WhatsApp audio | Play audio attached to the lesson |

---

## Extended Database Schema

The existing schema (`professors`, `students`, `subjects`, `student_subjects`) is the foundation.
Four new tables are needed to support the full workflow.

### Full Entity Map

```
professors 1 ──── N students N ──── M subjects
                      │
                      ├── 1 learning_plan
                      │
                      └── N lessons
                               │
                               ├── N vocabulary_entries
                               ├── N lesson_documents  (PDFs)
                               └── N audio_materials   (listening)
```

---

### `learning_plans`

One plan per student. Captures the learning context the teacher defines at the start.

| Column           | Type        | Constraints                               | Description                                      |
|------------------|-------------|-------------------------------------------|--------------------------------------------------|
| `id`             | UUID        | PK                                        | Unique identifier                                |
| `student_id`     | UUID        | FK → students(id) ON DELETE CASCADE, UQ   | One plan per student                             |
| `professor_id`   | UUID        | FK → professors(id) ON DELETE SET NULL    | Who created the plan                             |
| `level`          | TEXT        | NOT NULL                                  | e.g. "Beginner", "B1", "Upper-Intermediate"      |
| `objective`      | TEXT        | NOT NULL                                  | e.g. "Travel conversation", "Job interviews"     |
| `book_ref`       | TEXT        |                                           | e.g. "Interchange 5th Ed. — Unit 4"              |
| `notes`          | TEXT        |                                           | Free observations about the student              |
| `created_at`     | TIMESTAMPTZ | NOT NULL, DEFAULT now()                   |                                                  |
| `updated_at`     | TIMESTAMPTZ | NOT NULL, DEFAULT now()                   |                                                  |

```sql
CREATE TABLE learning_plans (
  id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id   UUID         NOT NULL UNIQUE REFERENCES students(id) ON DELETE CASCADE,
  professor_id UUID         REFERENCES professors(id) ON DELETE SET NULL,
  level        TEXT         NOT NULL,
  objective    TEXT         NOT NULL,
  book_ref     TEXT,
  notes        TEXT,
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ  NOT NULL DEFAULT now()
);
```

---

### `lessons`

Each row is one class session — the replacement for the calendar table in the Google Doc.

| Column           | Type        | Constraints                             | Description                                    |
|------------------|-------------|-----------------------------------------|------------------------------------------------|
| `id`             | UUID        | PK                                      | Unique identifier                              |
| `student_id`     | UUID        | FK → students(id) ON DELETE CASCADE     | Who the lesson is for                          |
| `professor_id`   | UUID        | FK → professors(id) ON DELETE SET NULL  | Who teaches it                                 |
| `subject_id`     | UUID        | FK → subjects(id) ON DELETE SET NULL    | Which subject (e.g. "English")                 |
| `scheduled_at`   | TIMESTAMPTZ | NOT NULL                                | Date and time of the class                     |
| `meet_link`      | TEXT        |                                         | Teams / Google Meet URL                        |
| `content`        | TEXT        |                                         | What was (or will be) covered                  |
| `homework`       | TEXT        |                                         | Homework assigned                              |
| `notes`          | TEXT        |                                         | Teacher's private notes after the class        |
| `status`         | TEXT        | NOT NULL, DEFAULT 'scheduled'           | `scheduled` · `completed` · `cancelled`        |
| `created_at`     | TIMESTAMPTZ | NOT NULL, DEFAULT now()                 |                                                |
| `updated_at`     | TIMESTAMPTZ | NOT NULL, DEFAULT now()                 |                                                |

```sql
CREATE TYPE lesson_status AS ENUM ('scheduled', 'completed', 'cancelled');

CREATE TABLE lessons (
  id           UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id   UUID          NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  professor_id UUID          REFERENCES professors(id) ON DELETE SET NULL,
  subject_id   UUID          REFERENCES subjects(id) ON DELETE SET NULL,
  scheduled_at TIMESTAMPTZ   NOT NULL,
  meet_link    TEXT,
  content      TEXT,
  homework     TEXT,
  notes        TEXT,
  status       lesson_status NOT NULL DEFAULT 'scheduled',
  created_at   TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ   NOT NULL DEFAULT now()
);
```

---

### `vocabulary_entries`

Words, expressions, or grammar notes captured during or after a lesson.

| Column        | Type        | Constraints                            | Description                              |
|---------------|-------------|----------------------------------------|------------------------------------------|
| `id`          | UUID        | PK                                     | Unique identifier                        |
| `lesson_id`   | UUID        | FK → lessons(id) ON DELETE CASCADE     | Lesson where the entry was noted         |
| `student_id`  | UUID        | FK → students(id) ON DELETE CASCADE    | Denormalized for fast student queries    |
| `word`        | TEXT        | NOT NULL                               | Word or expression                       |
| `definition`  | TEXT        |                                        | Meaning in context                       |
| `example`     | TEXT        |                                        | Example sentence                         |
| `note`        | TEXT        |                                        | Pronunciation tip, grammar rule, etc.    |
| `created_at`  | TIMESTAMPTZ | NOT NULL, DEFAULT now()                |                                          |

```sql
CREATE TABLE vocabulary_entries (
  id         UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id  UUID         NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  student_id UUID         NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  word       TEXT         NOT NULL,
  definition TEXT,
  example    TEXT,
  note       TEXT,
  created_at TIMESTAMPTZ  NOT NULL DEFAULT now()
);
```

---

### `lesson_documents`

PDF files attached to a lesson — book pages, exercises, filled forms.

| Column      | Type        | Constraints                           | Description                                          |
|-------------|-------------|---------------------------------------|------------------------------------------------------|
| `id`        | UUID        | PK                                    | Unique identifier                                    |
| `lesson_id` | UUID        | FK → lessons(id) ON DELETE CASCADE    | Lesson this document belongs to                      |
| `name`      | TEXT        | NOT NULL                              | File name displayed to the student                   |
| `file_url`  | TEXT        | NOT NULL                              | Storage URL (S3, Drive, etc.)                        |
| `type`      | TEXT        | NOT NULL, DEFAULT 'material'          | `material` · `exercise` · `filled` (student's work)  |
| `uploaded_by` | UUID      | FK → professors or students (app-level) | Who uploaded the file                              |
| `created_at`| TIMESTAMPTZ | NOT NULL, DEFAULT now()               |                                                      |

```sql
CREATE TYPE document_type AS ENUM ('material', 'exercise', 'filled');

CREATE TABLE lesson_documents (
  id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id   UUID          NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  name        TEXT          NOT NULL,
  file_url    TEXT          NOT NULL,
  type        document_type NOT NULL DEFAULT 'material',
  uploaded_by UUID,
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT now()
);
```

---

### `audio_materials`

Listening practice files sent per lesson — replaces the WhatsApp audio flow.

| Column           | Type        | Constraints                           | Description                              |
|------------------|-------------|---------------------------------------|------------------------------------------|
| `id`             | UUID        | PK                                    | Unique identifier                        |
| `lesson_id`      | UUID        | FK → lessons(id) ON DELETE CASCADE    | Lesson this audio belongs to             |
| `title`          | TEXT        | NOT NULL                              | e.g. "Listening Ex. 3 – Unit 5"          |
| `file_url`       | TEXT        | NOT NULL                              | Storage URL                              |
| `duration_secs`  | INTEGER     |                                       | Audio length in seconds                  |
| `transcript`     | TEXT        |                                       | Optional text transcript                 |
| `created_at`     | TIMESTAMPTZ | NOT NULL, DEFAULT now()               |                                          |

```sql
CREATE TABLE audio_materials (
  id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id     UUID         NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  title         TEXT         NOT NULL,
  file_url      TEXT         NOT NULL,
  duration_secs INTEGER,
  transcript    TEXT,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);
```

---

## Complete Schema Overview

```
professors
    │
    ├──< students >──< student_subjects >──< subjects
    │       │
    │       ├── learning_plans (1:1)
    │       │
    │       └──< lessons
    │                 │
    │                 ├──< vocabulary_entries
    │                 ├──< lesson_documents
    │                 └──< audio_materials
    │
    └──< lessons (professor_id FK)
```

---

## User Journeys

### Teacher sets up a new student

```
1. Create student profile (name, email, enrollment)
2. Assign student to herself (professor_id)
3. Enroll student in subjects → student_subjects (e.g. "English")
4. Create learning_plan → level: "B1", objective: "Job interviews",
                           book_ref: "Interchange 5th Ed."
```

### Teacher plans a lesson

```
1. Create lesson record → student_id, scheduled_at, meet_link
2. Fill in: content planned, homework
3. Attach lesson_documents → upload PDF pages from Interchange
4. Optionally add audio_materials → listening track for the session
```

### Class happens (Teams / Google Meet)

```
1. Student opens the lesson in ActivePDF → sees meet_link → joins call
2. Teacher shares PDF exercise via lesson_documents
3. Student opens PDF in ActivePDF editor → fills in fields → exports filled PDF
4. Exported PDF is saved back as lesson_document type = 'filled'
5. After class: teacher adds vocabulary_entries (words noted during the class)
6. Teacher updates lesson status → 'completed', adds private notes
```

### Student reviews after class

```
1. Opens lesson history → sees date, content covered, homework
2. Reviews vocabulary_entries → words, definitions, examples from that lesson
3. Opens audio_materials → replays listening exercise
4. Checks homework on the next lesson record
```

---

## Feature Priority

### MVP (already started or straightforward)

| Feature | Status |
|---|---|
| PDF editor with fillable fields | ✅ Built |
| Professor / Student roles (login) | ✅ Built |
| `professors` CRUD | 🔲 To build |
| `students` CRUD | 🔲 To build |
| `subjects` CRUD + enrollment | 🔲 To build |
| `learning_plans` CRUD | 🔲 To build |
| `lessons` CRUD (calendar view) | 🔲 To build |
| `vocabulary_entries` CRUD | 🔲 To build |

### Next (requires file storage)

| Feature | Notes |
|---|---|
| `lesson_documents` upload + view | Needs S3 / Supabase Storage or similar |
| Student fills PDF and saves back | Extend current export flow |
| `audio_materials` upload + player | Needs audio storage + `<audio>` player |

### Future

| Feature | Notes |
|---|---|
| Meet link auto-join reminder | Notification system |
| Audio transcript (OCR → text) | Extend existing Tesseract.js OCR |
| Homework status tracking | Add `homework_status` field to lessons |
| Progress dashboard for teacher | Aggregated views across all students |

---

## API Routes Needed

```
/api/professors
/api/professors/:id/students

/api/students
/api/students/:id/subjects          ← enroll / unenroll
/api/students/:id/learning-plan
/api/students/:id/lessons           ← student's calendar

/api/subjects

/api/lessons
/api/lessons/:id/vocabulary
/api/lessons/:id/documents
/api/lessons/:id/audio
```

---

## Notes

- The **Interchange Fifth Edition** book reference lives in `learning_plans.book_ref` as free text — no need to model the book's structure in the database at this stage.
- **Audio files** sent today via WhatsApp become first-class content attached to a lesson. The student has a permanent, organized history instead of buried chat messages.
- **PDF fill + export** is already the core differentiator of ActivePDF — the lesson_documents flow makes it part of the teaching cycle, not a one-off tool.
- All delete behaviors cascade downward: deleting a lesson removes its vocabulary, documents, and audios automatically.
