export const AI_OUTPUT_SCHEMAS = {
  interviewSessionOverview: {
    type: "object",
    properties: {
      summary: {
        type: "string",
        description:
          "150-200 word summary of college senior's interview experience for specific college/company placement",
      },
      key_points: {
        type: "array",
        items: { type: "string" },
        description:
          "5-7 key highlights from the college placement interview process",
      },
      topics: {
        type: "array",
        items: { type: "string" },
        description:
          "Technical + behavioral topics from college placement interviews",
      },
      difficulty_level: {
        type: "string",
        enum: ["beginner", "intermediate", "advanced"],
        description: "College placement difficulty for freshers/campus hires",
      },
      recommended_for: {
        type: "array",
        items: { type: "string" },
        description:
          "College branches/students who should watch (e.g. 'CSE freshers', 'VTU 8th sem')",
      },
    },
    required: [
      "summary",
      "key_points",
      "topics",
      "difficulty_level",
      "recommended_for",
    ],
    examples: [
      {
        summary:
          "Sahyadri College of Engg & Mgmt senior's SDE-1 interview experience at CompanyX campus placement. 3 rounds: Online Test (DSA), Technical (arrays/strings/projects), HR. Cleared all rounds. Perfect guide for VTU CSE freshers preparing for mass recruiters.",
        key_points: [
          "Online Test: 2 easy DSA + 1 SQL (45 mins)",
          "Technical: Resume projects deep dive",
          "No system design for freshers",
          "HR: family background + willingness to relocate",
          "Cleared in first attempt",
          "Mass recruiter pattern",
        ],
        topics: ["DSA Basics", "Resume Projects", "HR Basics"],
        difficulty_level: "beginner",
        recommended_for: [
          "VTU CSE freshers",
          "Sahyadri 8th sem",
          "mass recruiters",
        ],
      },
    ],
  },

  interviewSessionSegments: {
    type: "object",
    properties: {
      segments: {
        type: "array",
        items: {
          type: "object",
          properties: {
            segment_number: { type: "number" },
            title: {
              type: "string",
              description:
                "College interview phase (Online Test, Technical, HR)",
            },
            description: {
              type: "string",
              description:
                "50-100 words on what happened in this college placement round",
            },
            start_time: { type: "number" },
            end_time: { type: "number" },
            key_concepts: {
              type: "array",
              items: { type: "string" },
              description:
                "Topics/skills tested in this college interview round",
            },
          },
          required: [
            "segment_number",
            "title",
            "description",
            "start_time",
            "end_time",
            "key_concepts",
          ],
        },
      },
    },
    required: ["segments"],
    examples: [
      {
        segments: [
          {
            segment_number: 1,
            title: "Online Test Round",
            description:
              "Sahyadri senior describes VTU campus placement online test: 2 easy DSA problems (array reversal, string palindrome) + 1 SQL query + 10 MCQs on OOP. 45 mins total.",
            start_time: 0,
            end_time: 120,
            key_concepts: ["arrays", "strings", "SQL basics", "OOP MCQs"],
          },
        ],
      },
    ],
  },

  interviewSessionFlashcards: {
    type: "object",
    properties: {
      flashcards: {
        type: "array",
        items: {
          type: "object",
          properties: {
            question: {
              type: "string",
              description: "College placement interview question",
            },
            answer: {
              type: "string",
              description: "Senior's exact answer + what worked",
            },
            difficulty: { type: "string", enum: ["easy", "medium", "hard"] },
            category: {
              type: "string",
              enum: [
                "technical",
                "behavioral",
                "preparation",
                "tips",
                "college_specific",
              ],
            },
            timestamp: { type: ["number", "null"] },
          },
          required: [
            "question",
            "answer",
            "difficulty",
            "category",
            "timestamp",
          ],
        },
      },
    },
    required: ["flashcards"],
    examples: [
      {
        flashcards: [
          {
            question:
              "Explain your final year project (asked in Technical round)",
            answer:
              "Explained Sahyadri final year project architecture + challenges faced. Interviewer asked 2 follow-ups on database design. Kept it structured: problem → solution → results.",
            difficulty: "easy",
            category: "technical",
            timestamp: 240,
          },
        ],
      },
    ],
  },

  interviewSessionTips: {
    type: "object",
    properties: {
      tips: {
        type: "array",
        items: {
          type: "object",
          properties: {
            tip_text: {
              type: "string",
              description: "Actionable tip for college placement success",
            },
            category: {
              type: "string",
              enum: [
                "preparation",
                "communication",
                "technical",
                "mindset",
                "college_placement",
              ],
            },
            importance: {
              type: "string",
              enum: ["critical", "important", "helpful"],
            },
            context: {
              type: "string",
              description: "Why this worked for Sahyadri senior",
            },
            timestamp: { type: ["number", "null"] },
          },
          required: ["tip_text", "category", "importance", "timestamp"],
        },
      },
    },
    required: ["tips"],
    examples: [
      {
        tips: [
          {
            tip_text:
              "Prepare 3 projects from resume with architecture diagrams ready.",
            category: "preparation",
            importance: "critical",
            context:
              "Sahyadri seniors consistently asked about final year + 2 mini projects.",
            timestamp: 260,
          },
        ],
      },
    ],
  },

  companyNames: {
    type: "array",
    items: {
      type: "string",
      description: "Standardized company name like 'Google', 'Microsoft'",
    },
    description: "Array of extracted company names from user query",
    examples: [["Google", "Amazon", "Microsoft"]],
  },

  chunkSummary: {
    type: "object",
    properties: {
      summary: {
        type: "string",
        description:
          "2–3 sentence summary of the text chunk focusing on key topics, entities and potential questions it can answer for RAG.",
      },
    },
    required: ["summary"],
    additionalProperties: false,
    examples: [
      {
        summary:
          "Explains Sahyadri College placement rounds, covering online tests, technical interviews and HR discussions, and highlights common DSA and project-based questions.",
      },
    ],
  },
} as const;
