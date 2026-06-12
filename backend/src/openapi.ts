export const openApiSpec = {
  openapi: "3.1.0",
  info: {
    title: "ActivePDF API",
    version: "1.0.0",
    description:
      "API REST do ActivePDF — plataforma para professores de inglês criarem exercícios interativos em PDF para seus alunos.",
  },
  servers: [{ url: "http://localhost:4000", description: "Desenvolvimento local" }],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Token JWT retornado pelo login. Enviado no header `Authorization: Bearer <token>`.",
      },
    },
    schemas: {
      Error: {
        type: "object",
        properties: { error: { type: "string" } },
        required: ["error"],
      },
      Ok: {
        type: "object",
        properties: { ok: { type: "boolean", example: true } },
        required: ["ok"],
      },
      Student: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          email: { type: "string", format: "email" },
          enrollment: { type: "string", nullable: true },
          professorId: { type: "string", nullable: true },
          isAutodidact: { type: "boolean" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      Subject: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          description: { type: "string", nullable: true },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      SavedDocument: {
        type: "object",
        properties: {
          id: { type: "string" },
          studentId: { type: "string" },
          title: { type: "string" },
          pdfName: { type: "string" },
          pdfData: { type: "string", description: "PDF em Base64" },
          fieldsJson: { type: "string", description: "Campos do editor serializados em JSON" },
          answersJson: { type: "string", description: "Respostas serializadas em JSON" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      Exercise: {
        type: "object",
        properties: {
          id: { type: "string" },
          title: { type: "string" },
          pdfName: { type: "string" },
          pdfData: { type: "string", description: "PDF em Base64" },
          fieldsJson: { type: "string", description: "Campos interativos serializados em JSON" },
          answersJson: { type: "string", nullable: true, description: "Respostas do aluno em JSON" },
          status: { type: "string", enum: ["assigned", "in_progress", "completed"] },
          professorId: { type: "string" },
          studentId: { type: "string", nullable: true },
          lessonId: { type: "string", nullable: true },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      Lesson: {
        type: "object",
        properties: {
          id: { type: "string" },
          scheduledAt: { type: "string", format: "date-time" },
          meetLink: { type: "string", nullable: true },
          content: { type: "string", nullable: true },
          homework: { type: "string", nullable: true },
          notes: { type: "string", nullable: true },
          status: { type: "string", enum: ["SCHEDULED", "COMPLETED", "CANCELLED"] },
          professorId: { type: "string" },
          studentId: { type: "string" },
          subjectId: { type: "string", nullable: true },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      VocabularyEntry: {
        type: "object",
        properties: {
          id: { type: "string" },
          lessonId: { type: "string" },
          studentId: { type: "string" },
          word: { type: "string" },
          definition: { type: "string", nullable: true },
          example: { type: "string", nullable: true },
          note: { type: "string", nullable: true },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      UserStats: {
        type: "object",
        description: "Dados de gamificação do aluno",
        properties: {
          xp: { type: "integer", example: 3940 },
          level: { type: "integer", minimum: 1, maximum: 7, example: 3 },
          levelBadge: { type: "string", example: "B1", description: "Rótulo do nível (A1, A2, B1, B2, C1, C2, Master)" },
          levelName: { type: "string", example: "Intermediário" },
          xpForNextLevel: { type: "integer", example: 3500, description: "XP total necessário para o próximo nível" },
          xpProgress: { type: "integer", minimum: 0, maximum: 100, example: 79, description: "Percentual de progresso no nível atual" },
          streak: { type: "integer", example: 12, description: "Dias consecutivos de atividade" },
        },
      },
      Achievement: {
        type: "object",
        properties: {
          key: { type: "string", example: "streak_7" },
          unlockedAt: { type: "string", format: "date-time" },
        },
      },
      LeaderboardEntry: {
        type: "object",
        properties: {
          rank: { type: "integer" },
          studentId: { type: "string" },
          name: { type: "string" },
          xp: { type: "integer" },
          level: { type: "integer" },
          streak: { type: "integer" },
        },
      },
      WeekActivity: {
        type: "object",
        description: "Atividade dos últimos 7 dias",
        properties: {
          days: {
            type: "array",
            items: {
              type: "object",
              properties: {
                date: { type: "string", format: "date", example: "2026-06-09" },
                label: { type: "string", example: "Seg" },
                xpGained: { type: "integer" },
                exercisesDone: { type: "integer" },
              },
            },
          },
          weekXp: { type: "integer", description: "XP total ganho na semana" },
          weekExercises: { type: "integer", description: "Exercícios concluídos na semana" },
          goalPercent: { type: "integer", minimum: 0, maximum: 100, description: "Percentual da meta semanal atingida" },
        },
      },
    },
  },
  security: [{ bearerAuth: [] }],
  paths: {
    "/health": {
      get: {
        tags: ["Sistema"],
        summary: "Health check",
        security: [],
        responses: {
          "200": {
            description: "Servidor online",
            content: { "application/json": { schema: { type: "object", properties: { ok: { type: "boolean" } } } } },
          },
        },
      },
    },

    // ─── Auth ─────────────────────────────────────────────────────────────────
    "/api/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Cadastrar professor ou aluno",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "email", "password", "role"],
                properties: {
                  name: { type: "string", example: "Sarah Connor" },
                  email: { type: "string", format: "email", example: "sarah@activepdf.app" },
                  password: { type: "string", minLength: 6, example: "teacher123" },
                  role: { type: "string", enum: ["teacher", "student"] },
                  teacherEmail: {
                    type: "string",
                    format: "email",
                    description: "Obrigatório apenas quando role=student. E-mail do professor responsável.",
                  },
                  isAutodidact: {
                    type: "boolean",
                    description:
                      "Apenas para role=student. Aluno autodidata (estuda sem professor) — ganha acesso ao editor de campos. Só um professor pode reverter para aluno regular.",
                  },
                },
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Usuário criado e autenticado",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    token: { type: "string" },
                    role: { type: "string", enum: ["teacher", "student"] },
                    name: { type: "string" },
                  },
                },
              },
            },
          },
          "400": { description: "Campos obrigatórios ausentes", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "404": { description: "Professor não encontrado (ao cadastrar aluno)", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "409": { description: "E-mail já cadastrado", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
    },

    "/api/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Autenticar usuário",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string", format: "email", example: "sarah@activepdf.app" },
                  password: { type: "string", example: "teacher123" },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Login bem-sucedido",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    token: { type: "string" },
                    role: { type: "string", enum: ["teacher", "student"] },
                    name: { type: "string" },
                  },
                },
              },
            },
          },
          "400": { description: "Campos obrigatórios ausentes", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "401": { description: "Credenciais inválidas", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
    },

    // ─── Students ─────────────────────────────────────────────────────────────
    "/api/students": {
      get: {
        tags: ["Alunos"],
        summary: "Listar alunos do professor",
        description: "Retorna todos os alunos vinculados ao professor autenticado.",
        responses: {
          "200": {
            description: "Lista de alunos",
            content: {
              "application/json": {
                schema: { type: "array", items: { $ref: "#/components/schemas/Student" } },
              },
            },
          },
          "401": { description: "Não autorizado", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
      post: {
        tags: ["Alunos"],
        summary: "Criar aluno",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "email", "password"],
                properties: {
                  name: { type: "string", example: "João Silva" },
                  email: { type: "string", format: "email", example: "joao@activepdf.app" },
                  password: { type: "string", example: "student123" },
                  level: { type: "string", example: "Intermediário" },
                  objective: { type: "string", example: "Conversação para negócios" },
                  bookRef: { type: "string", example: "English File Intermediate B1" },
                  notes: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Aluno criado",
            content: { "application/json": { schema: { type: "object", properties: { id: { type: "string" } } } } },
          },
          "400": { description: "Campos obrigatórios ausentes", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "401": { description: "Não autorizado", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "409": { description: "E-mail já em uso", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
    },

    "/api/students/{id}": {
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      get: {
        tags: ["Alunos"],
        summary: "Buscar aluno por ID",
        description: "Retorna dados completos do aluno incluindo plano de aprendizado, matérias e aulas.",
        responses: {
          "200": { description: "Dados do aluno", content: { "application/json": { schema: { $ref: "#/components/schemas/Student" } } } },
          "401": { description: "Não autorizado", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "404": { description: "Aluno não encontrado", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
      patch: {
        tags: ["Alunos"],
        summary: "Atualizar aluno",
        description:
          "Apenas o professor responsável. Inclui a conversão de perfil autodidata ↔ aluno regular via `isAutodidact`.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  email: { type: "string", format: "email" },
                  enrollment: { type: "string", nullable: true },
                  isAutodidact: { type: "boolean", description: "Perfil autodidata (true) ou aluno regular (false)" },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Aluno atualizado", content: { "application/json": { schema: { type: "object", properties: { id: { type: "string" } } } } } },
          "401": { description: "Não autorizado", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "404": { description: "Aluno não encontrado", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "409": { description: "E-mail já em uso", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
      delete: {
        tags: ["Alunos"],
        summary: "Excluir aluno",
        responses: {
          "200": { description: "Aluno excluído", content: { "application/json": { schema: { $ref: "#/components/schemas/Ok" } } } },
          "401": { description: "Não autorizado", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "404": { description: "Aluno não encontrado", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
    },

    // ─── Subjects ─────────────────────────────────────────────────────────────
    "/api/subjects": {
      get: {
        tags: ["Matérias"],
        summary: "Listar matérias",
        responses: {
          "200": {
            description: "Lista de matérias com contagem de alunos",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    allOf: [
                      { $ref: "#/components/schemas/Subject" },
                      { type: "object", properties: { _count: { type: "object", properties: { students: { type: "integer" } } } } },
                    ],
                  },
                },
              },
            },
          },
          "401": { description: "Não autorizado", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
      post: {
        tags: ["Matérias"],
        summary: "Criar matéria",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name"],
                properties: {
                  name: { type: "string", example: "Gramática" },
                  description: { type: "string", example: "Foco em tempos verbais e estruturas complexas" },
                },
              },
            },
          },
        },
        responses: {
          "201": { description: "Matéria criada", content: { "application/json": { schema: { $ref: "#/components/schemas/Subject" } } } },
          "400": { description: "Nome é obrigatório", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "401": { description: "Não autorizado", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "409": { description: "Nome já existente", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
    },

    "/api/subjects/{id}": {
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      get: {
        tags: ["Matérias"],
        summary: "Buscar matéria por ID",
        responses: {
          "200": { description: "Dados da matéria", content: { "application/json": { schema: { $ref: "#/components/schemas/Subject" } } } },
          "401": { description: "Não autorizado", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "404": { description: "Matéria não encontrada", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
      patch: {
        tags: ["Matérias"],
        summary: "Atualizar matéria",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  description: { type: "string", nullable: true },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Matéria atualizada", content: { "application/json": { schema: { $ref: "#/components/schemas/Subject" } } } },
          "400": { description: "Nome inválido", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "401": { description: "Não autorizado", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "404": { description: "Matéria não encontrada", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "409": { description: "Nome já em uso", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
      delete: {
        tags: ["Matérias"],
        summary: "Excluir matéria",
        responses: {
          "200": { description: "Matéria excluída", content: { "application/json": { schema: { $ref: "#/components/schemas/Ok" } } } },
          "401": { description: "Não autorizado", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "404": { description: "Matéria não encontrada", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
    },

    // ─── Exercises ────────────────────────────────────────────────────────────
    "/api/documents": {
      get: {
        tags: ["Documentos"],
        summary: "Listar documentos salvos",
        description:
          "Documentos da conta gratuita (aluno). Retorna metadados sem o PDF; suporta paginação via `take`/`skip`.",
        responses: {
          "200": {
            description: "Lista de documentos (sem pdfData)",
            content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/SavedDocument" } } } },
          },
          "401": { description: "Não autenticado", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
      post: {
        tags: ["Documentos"],
        summary: "Salvar documento",
        description:
          "Cria um documento do editor para a conta do aluno. O plano gratuito tem limite de documentos (ver /api/documents/usage); ao atingir, responde 409.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["title", "pdfName", "pdfData"],
                properties: {
                  title: { type: "string", example: "Prova de Frações — 7º ano" },
                  pdfName: { type: "string", example: "prova_fracoes.pdf" },
                  pdfData: { type: "string", description: "PDF codificado em Base64" },
                  fieldsJson: { type: "array", items: { type: "object" }, description: "Campos do editor" },
                },
              },
            },
          },
        },
        responses: {
          "201": { description: "Documento criado", content: { "application/json": { schema: { $ref: "#/components/schemas/SavedDocument" } } } },
          "400": { description: "Campos obrigatórios ausentes", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "401": { description: "Não autenticado", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "409": { description: "Limite do plano gratuito atingido", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
    },

    "/api/documents/usage": {
      get: {
        tags: ["Documentos"],
        summary: "Uso × limite do plano",
        description: "Quantos documentos a conta já salvou e o limite do plano (`null` = ilimitado).",
        responses: {
          "200": {
            description: "Uso atual",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    used: { type: "integer", example: 2 },
                    limit: { type: "integer", nullable: true, example: 3 },
                  },
                },
              },
            },
          },
          "401": { description: "Não autenticado", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
    },

    "/api/documents/{id}": {
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      get: {
        tags: ["Documentos"],
        summary: "Buscar documento por ID",
        description: "Aluno acessa apenas os próprios documentos.",
        responses: {
          "200": { description: "Documento completo (com pdfData)", content: { "application/json": { schema: { $ref: "#/components/schemas/SavedDocument" } } } },
          "401": { description: "Não autenticado", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "404": { description: "Documento não encontrado", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
      patch: {
        tags: ["Documentos"],
        summary: "Atualizar título, campos ou respostas",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  fieldsJson: { type: "array", items: { type: "object" } },
                  answersJson: { type: "string", description: "JSON serializado { [fieldId]: valor }" },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Documento atualizado", content: { "application/json": { schema: { $ref: "#/components/schemas/SavedDocument" } } } },
          "401": { description: "Não autenticado", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "404": { description: "Documento não encontrado", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
      delete: {
        tags: ["Documentos"],
        summary: "Excluir documento",
        responses: {
          "200": { description: "Documento excluído", content: { "application/json": { schema: { $ref: "#/components/schemas/Ok" } } } },
          "401": { description: "Não autenticado", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "404": { description: "Documento não encontrado", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
    },

    "/api/exercises": {
      get: {
        tags: ["Exercícios"],
        summary: "Listar exercícios",
        description:
          "Professor vê seus próprios exercícios (filtrável por `studentId`). Aluno vê apenas os exercícios atribuídos a ele.",
        parameters: [
          { name: "studentId", in: "query", required: false, schema: { type: "string" } },
        ],
        responses: {
          "200": {
            description: "Lista de exercícios",
            content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Exercise" } } } },
          },
          "401": { description: "Não autenticado", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
      post: {
        tags: ["Exercícios"],
        summary: "Criar exercício",
        description:
          "Professor cria um exercício e pode atribuí-lo a um aluno (`studentId`). Aluno (autodidata) envia o próprio PDF: o exercício é criado vinculado a ele mesmo, sem professor — `studentId` e `lessonId` do body são ignorados.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["title", "pdfName", "pdfData"],
                properties: {
                  title: { type: "string", example: "Gramática — Verbos Modais, Unidade 5" },
                  pdfName: { type: "string", example: "unit5_modal_verbs.pdf" },
                  pdfData: { type: "string", description: "PDF codificado em Base64" },
                  fieldsJson: { type: "array", items: { type: "object" }, description: "Campos interativos do PDF" },
                  studentId: { type: "string", nullable: true },
                  lessonId: { type: "string", nullable: true },
                },
              },
            },
          },
        },
        responses: {
          "201": { description: "Exercício criado", content: { "application/json": { schema: { type: "object", properties: { id: { type: "string" } } } } } },
          "400": { description: "Campos obrigatórios ausentes", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "401": { description: "Não autorizado", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "404": { description: "Aluno não encontrado", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
    },

    "/api/exercises/{id}": {
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      get: {
        tags: ["Exercícios"],
        summary: "Buscar exercício por ID",
        description: "Professor acessa apenas seus exercícios. Aluno acessa apenas exercícios atribuídos a ele.",
        responses: {
          "200": { description: "Dados do exercício", content: { "application/json": { schema: { $ref: "#/components/schemas/Exercise" } } } },
          "401": { description: "Não autenticado", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "403": { description: "Acesso negado", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "404": { description: "Exercício não encontrado", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
      patch: {
        tags: ["Exercícios"],
        summary: "Atualizar respostas / status (aluno)",
        description: "Apenas alunos podem atualizar as respostas e o status de um exercício atribuído a eles.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  answersJson: { type: "string", description: "Respostas serializadas em JSON" },
                  status: { type: "string", enum: ["assigned", "in_progress", "completed"] },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Exercício atualizado",
            content: { "application/json": { schema: { type: "object", properties: { ok: { type: "boolean" }, status: { type: "string" } } } } },
          },
          "400": { description: "Status inválido", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "401": { description: "Não autenticado", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "403": { description: "Acesso negado", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "404": { description: "Exercício não encontrado", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
      delete: {
        tags: ["Exercícios"],
        summary: "Excluir exercício (professor)",
        responses: {
          "200": { description: "Exercício excluído", content: { "application/json": { schema: { $ref: "#/components/schemas/Ok" } } } },
          "401": { description: "Não autorizado", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "403": { description: "Acesso negado", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "404": { description: "Exercício não encontrado", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
    },

    // ─── Lessons ──────────────────────────────────────────────────────────────
    "/api/lessons": {
      get: {
        tags: ["Aulas"],
        summary: "Listar aulas do professor",
        parameters: [
          { name: "status", in: "query", required: false, schema: { type: "string", enum: ["SCHEDULED", "COMPLETED"] } },
          { name: "studentId", in: "query", required: false, schema: { type: "string" } },
        ],
        responses: {
          "200": {
            description: "Lista de aulas",
            content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Lesson" } } } },
          },
          "401": { description: "Não autorizado", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
      post: {
        tags: ["Aulas"],
        summary: "Agendar aula",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["studentId", "scheduledAt"],
                properties: {
                  studentId: { type: "string" },
                  scheduledAt: { type: "string", format: "date-time", example: "2026-06-10T14:00:00.000Z" },
                  meetLink: { type: "string", format: "uri", nullable: true },
                  content: { type: "string", nullable: true },
                  homework: { type: "string", nullable: true },
                  notes: { type: "string", nullable: true },
                },
              },
            },
          },
        },
        responses: {
          "201": { description: "Aula agendada", content: { "application/json": { schema: { type: "object", properties: { id: { type: "string" } } } } } },
          "400": { description: "Aluno e data são obrigatórios", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "401": { description: "Não autorizado", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "404": { description: "Aluno não encontrado", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
    },

    "/api/lessons/{id}": {
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      get: {
        tags: ["Aulas"],
        summary: "Buscar aula por ID",
        responses: {
          "200": { description: "Dados da aula", content: { "application/json": { schema: { $ref: "#/components/schemas/Lesson" } } } },
          "401": { description: "Não autorizado", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "404": { description: "Aula não encontrada", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
      patch: {
        tags: ["Aulas"],
        summary: "Atualizar aula",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  scheduledAt: { type: "string", format: "date-time" },
                  meetLink: { type: "string", format: "uri", nullable: true },
                  content: { type: "string", nullable: true },
                  homework: { type: "string", nullable: true },
                  notes: { type: "string", nullable: true },
                  status: { type: "string", enum: ["SCHEDULED", "COMPLETED"] },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Aula atualizada", content: { "application/json": { schema: { $ref: "#/components/schemas/Lesson" } } } },
          "401": { description: "Não autorizado", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "404": { description: "Aula não encontrada", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
      delete: {
        tags: ["Aulas"],
        summary: "Excluir aula",
        responses: {
          "200": { description: "Aula excluída", content: { "application/json": { schema: { $ref: "#/components/schemas/Ok" } } } },
          "401": { description: "Não autorizado", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "404": { description: "Aula não encontrada", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
    },

    // ─── Dashboard ────────────────────────────────────────────────────────────
    "/api/dashboard/teacher": {
      get: {
        tags: ["Dashboard"],
        summary: "Resumo do professor",
        description:
          "Retorna em uma única requisição: dados do professor, lista de alunos com plano de aprendizado, próximas 5 aulas agendadas e últimos 10 exercícios.",
        responses: {
          "200": {
            description: "Resumo do professor",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    professor: { type: "object", description: "Dados do professor com alunos e próximas aulas" },
                    exercises: { type: "array", items: { $ref: "#/components/schemas/Exercise" } },
                    subjectsCount: { type: "integer", description: "Total de matérias cadastradas" },
                  },
                },
              },
            },
          },
          "401": { description: "Não autorizado", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "404": { description: "Professor não encontrado", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
    },

    "/api/dashboard/student": {
      get: {
        tags: ["Dashboard"],
        summary: "Resumo do aluno",
        description:
          "Retorna em uma única requisição: dados do aluno, professor, plano de aprendizado, matérias, últimas 6 aulas e todos os exercícios.",
        responses: {
          "200": {
            description: "Resumo do aluno",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    student: { type: "object", description: "Dados completos do aluno" },
                    exercises: { type: "array", items: { $ref: "#/components/schemas/Exercise" } },
                  },
                },
              },
            },
          },
          "401": { description: "Não autorizado", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "404": { description: "Aluno não encontrado", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
    },

    // ─── Gamificação ──────────────────────────────────────────────────────────
    "/api/gamification/me": {
      get: {
        tags: ["Gamificação"],
        summary: "Stats do aluno autenticado",
        description: "Retorna XP, nível, streak e rank do aluno logado.",
        responses: {
          "200": {
            description: "Stats do aluno",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/UserStats" },
                    {
                      type: "object",
                      properties: {
                        rank: { type: "integer", nullable: true, description: "Posição no ranking entre alunos do mesmo professor" },
                      },
                    },
                  ],
                },
              },
            },
          },
          "401": { description: "Não autenticado", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "404": { description: "Aluno não encontrado", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
    },

    "/api/gamification/week": {
      get: {
        tags: ["Gamificação"],
        summary: "Atividade semanal do aluno",
        description: "Retorna a atividade dos últimos 7 dias: XP por dia, exercícios e percentual da meta.",
        responses: {
          "200": {
            description: "Atividade da semana",
            content: { "application/json": { schema: { $ref: "#/components/schemas/WeekActivity" } } },
          },
          "401": { description: "Não autenticado", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
    },

    "/api/gamification/leaderboard": {
      get: {
        tags: ["Gamificação"],
        summary: "Ranking dos alunos",
        description: "Lista os alunos do mesmo professor ordenados por XP decrescente. Limitado a 10 posições.",
        responses: {
          "200": {
            description: "Ranking",
            content: {
              "application/json": {
                schema: { type: "array", items: { $ref: "#/components/schemas/LeaderboardEntry" } },
              },
            },
          },
          "401": { description: "Não autenticado", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
    },

    "/api/gamification/achievements": {
      get: {
        tags: ["Gamificação"],
        summary: "Conquistas desbloqueadas",
        description: "Retorna a lista de conquistas já desbloqueadas pelo aluno logado.",
        responses: {
          "200": {
            description: "Conquistas",
            content: {
              "application/json": {
                schema: { type: "array", items: { $ref: "#/components/schemas/Achievement" } },
              },
            },
          },
          "401": { description: "Não autenticado", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
    },

    // ─── Matrículas ───────────────────────────────────────────────────────────
    "/api/students/{id}/subjects": {
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      get: {
        tags: ["Alunos"],
        summary: "Listar matérias do aluno",
        responses: {
          "200": {
            description: "Matérias do aluno",
            content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Subject" } } } },
          },
          "401": { description: "Não autorizado", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "404": { description: "Aluno não encontrado", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
      post: {
        tags: ["Alunos"],
        summary: "Matricular aluno em matéria",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["subjectId"],
                properties: { subjectId: { type: "string" } },
              },
            },
          },
        },
        responses: {
          "201": { description: "Matriculado", content: { "application/json": { schema: { $ref: "#/components/schemas/Ok" } } } },
          "400": { description: "subjectId obrigatório", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "401": { description: "Não autorizado", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "404": { description: "Aluno ou matéria não encontrado", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
    },

    "/api/students/{id}/subjects/{subjectId}": {
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
        { name: "subjectId", in: "path", required: true, schema: { type: "string" } },
      ],
      delete: {
        tags: ["Alunos"],
        summary: "Desmatricular aluno de matéria",
        responses: {
          "200": { description: "Desmatriculado", content: { "application/json": { schema: { $ref: "#/components/schemas/Ok" } } } },
          "401": { description: "Não autorizado", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "404": { description: "Matrícula não encontrada", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
    },

    // ─── Plano de aprendizado ─────────────────────────────────────────────────
    "/api/students/{id}/learning-plan": {
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      get: {
        tags: ["Alunos"],
        summary: "Buscar plano de aprendizado",
        responses: {
          "200": {
            description: "Plano de aprendizado",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    level: { type: "string" },
                    objective: { type: "string" },
                    bookRef: { type: "string", nullable: true },
                    notes: { type: "string", nullable: true },
                    updatedAt: { type: "string", format: "date-time" },
                  },
                },
              },
            },
          },
          "401": { description: "Não autorizado", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "404": { description: "Plano não encontrado", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
      patch: {
        tags: ["Alunos"],
        summary: "Atualizar plano de aprendizado",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  level: { type: "string" },
                  objective: { type: "string" },
                  bookRef: { type: "string", nullable: true },
                  notes: { type: "string", nullable: true },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Plano atualizado", content: { "application/json": { schema: { $ref: "#/components/schemas/Ok" } } } },
          "401": { description: "Não autorizado", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "404": { description: "Plano não encontrado", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
    },

    // ─── Vocabulário ──────────────────────────────────────────────────────────
    "/api/lessons/{id}/vocabulary": {
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      get: {
        tags: ["Aulas"],
        summary: "Listar vocabulário da aula",
        responses: {
          "200": {
            description: "Entradas de vocabulário",
            content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/VocabularyEntry" } } } },
          },
          "401": { description: "Não autorizado", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "404": { description: "Aula não encontrada", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
      post: {
        tags: ["Aulas"],
        summary: "Adicionar entrada de vocabulário",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["word"],
                properties: {
                  word: { type: "string", example: "albeit" },
                  definition: { type: "string", example: "even though" },
                  example: { type: "string", example: "It was a good result, albeit unexpected." },
                  note: { type: "string", example: "Formal. Common in written English." },
                },
              },
            },
          },
        },
        responses: {
          "201": { description: "Entrada criada", content: { "application/json": { schema: { $ref: "#/components/schemas/VocabularyEntry" } } } },
          "400": { description: "Palavra obrigatória", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "401": { description: "Não autorizado", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "404": { description: "Aula não encontrada", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
    },

    "/api/lessons/{id}/vocabulary/{entryId}": {
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
        { name: "entryId", in: "path", required: true, schema: { type: "string" } },
      ],
      delete: {
        tags: ["Aulas"],
        summary: "Remover entrada de vocabulário",
        responses: {
          "200": { description: "Entrada removida", content: { "application/json": { schema: { $ref: "#/components/schemas/Ok" } } } },
          "401": { description: "Não autorizado", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "404": { description: "Entrada não encontrada", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
    },

    // ─── Correções ────────────────────────────────────────────────────────────
    "/api/corrections": {
      get: {
        tags: ["Correções"],
        summary: "Fila de exercícios para corrigir",
        description: "Retorna exercícios com status `assigned` ou `in_progress` dos alunos do professor autenticado.",
        responses: {
          "200": {
            description: "Fila de correção",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    allOf: [
                      { $ref: "#/components/schemas/Exercise" },
                      {
                        type: "object",
                        properties: {
                          student: {
                            type: "object",
                            properties: {
                              id: { type: "string" },
                              name: { type: "string" },
                            },
                          },
                        },
                      },
                    ],
                  },
                },
              },
            },
          },
          "401": { description: "Não autorizado", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
    },
  },
};
