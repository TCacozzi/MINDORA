import { PrismaClient } from "../src/generated/prisma";
import bcrypt from "bcryptjs";
import { bigFiveDimensions } from "./data/bigFiveIpip50";
import { feedback360Dimensions } from "./data/feedback360";

const prisma = new PrismaClient();

const DEMO_PASSWORD = "mindora123";

async function seedQuestionnaire(
  key: string,
  name: string,
  type: "BIG_FIVE" | "FEEDBACK_360",
  scaleType: "AGREEMENT_5" | "FREQUENCY_5",
  dimensions: typeof bigFiveDimensions,
  allowNotObserved: boolean
) {
  const questionnaire = await prisma.questionnaire.upsert({
    where: { key },
    update: {},
    create: { key, name, type, scaleType },
  });

  for (const dim of dimensions) {
    const dimension = await prisma.dimension.upsert({
      where: { questionnaireId_key: { questionnaireId: questionnaire.id, key: dim.key } },
      update: { name: dim.name, description: dim.description, order: dim.order },
      create: {
        questionnaireId: questionnaire.id,
        key: dim.key,
        name: dim.name,
        description: dim.description,
        order: dim.order,
      },
    });

    for (const [index, q] of dim.questions.entries()) {
      const existing = await prisma.question.findFirst({
        where: { questionnaireId: questionnaire.id, dimensionId: dimension.id, text: q.text },
      });
      if (existing) {
        await prisma.question.update({
          where: { id: existing.id },
          data: { order: index, reverseScored: q.reverseScored, allowNotObserved },
        });
      } else {
        await prisma.question.create({
          data: {
            questionnaireId: questionnaire.id,
            dimensionId: dimension.id,
            text: q.text,
            order: index,
            reverseScored: q.reverseScored,
            allowNotObserved,
          },
        });
      }
    }
  }

  return questionnaire;
}

async function main() {
  console.log("Seeding questionnaires...");
  await seedQuestionnaire(
    "ipip50-bigfive-ptbr-v1",
    "Avaliação de Personalidade (Big Five — IPIP-50, adaptação pt-BR)",
    "BIG_FIVE",
    "AGREEMENT_5",
    bigFiveDimensions,
    false
  );

  await seedQuestionnaire(
    "feedback360-ptbr-v1",
    "Feedback 360° — Comportamentos Observáveis",
    "FEEDBACK_360",
    "FREQUENCY_5",
    feedback360Dimensions,
    true
  );

  console.log("Seeding demo organization and users...");
  const org = await prisma.organization.upsert({
    where: { id: "org-demo" },
    update: {},
    create: { id: "org-demo", name: "Empresa Demo" },
  });

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@demo.mindora" },
    update: {},
    create: {
      organizationId: org.id,
      name: "Ana Administradora",
      email: "admin@demo.mindora",
      passwordHash,
      role: "ADMIN",
    },
  });

  const gestor = await prisma.user.upsert({
    where: { email: "gestor@demo.mindora" },
    update: {},
    create: {
      organizationId: org.id,
      name: "Gustavo Gestor",
      email: "gestor@demo.mindora",
      passwordHash,
      role: "GESTOR",
    },
  });

  const profissionais = [
    { name: "João Profissional", email: "joao@demo.mindora" },
    { name: "Maria Profissional", email: "maria@demo.mindora" },
    { name: "Pedro Profissional", email: "pedro@demo.mindora" },
  ];

  for (const p of profissionais) {
    await prisma.user.upsert({
      where: { email: p.email },
      update: { managerId: gestor.id },
      create: {
        organizationId: org.id,
        name: p.name,
        email: p.email,
        passwordHash,
        role: "PROFISSIONAL",
        managerId: gestor.id,
      },
    });
  }

  console.log("Seed concluído.");
  console.log(`Usuários demo (senha: ${DEMO_PASSWORD}):`);
  console.log("  admin@demo.mindora (ADMIN)");
  console.log("  gestor@demo.mindora (GESTOR)");
  console.log("  joao@demo.mindora / maria@demo.mindora / pedro@demo.mindora (PROFISSIONAL)");
  console.log(`Org id: ${org.id}, admin id: ${admin.id}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
