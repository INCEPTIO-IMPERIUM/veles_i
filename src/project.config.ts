/**
 * The one file to edit when you reuse veles for another project.
 *
 * Everything project-specific that the pages mention (name, repo, branch
 * names, commands, ports) is read from here. Content that only makes sense
 * for one project goes in an <Example> box in the MDX, not in the prose.
 */
export const project = {
  /** Shown in the header and on the Start page. */
  name: "CMAS",
  fullName: "Course Monitoring and Assessment System",
  summary: "ระบบติดตามผลลัพธ์การเรียนรู้ระดับรายวิชา (CLO) ตั้งแต่กำหนด CLO จนถึงแสดงนักศึกษาที่เสี่ยง",
  repoUrl: "https://github.com/SIET-KMITL-INCEPTIO/CMAS-CLO",
  teamSize: 3,

  branches: {
    /** Where every feature branch starts and ends. */
    integration: "develop",
    /** Only releases and hotfixes land here. */
    production: "main",
    prefixes: ["feature/", "fix/", "chore/", "docs/", "ci/", "test/", "release/", "hotfix/"],
  },

  commands: {
    setup: "npm run setup",
    dev: "npm run dev",
    verify: "npm run verify",
    test: "npm run test:unit",
    migrate: "npm run db:migrate:dev -- --name <ชื่อ_snake_case>",
  },

  ports: { client: 5173, server: 3001 },

  /** The single required check before a PR can merge. */
  ciGate: "CI gate",
} as const;

export type ProjectConfig = typeof project;
