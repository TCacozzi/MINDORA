-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'GESTOR', 'PROFISSIONAL');

-- CreateEnum
CREATE TYPE "QuestionnaireType" AS ENUM ('BIG_FIVE', 'FEEDBACK_360');

-- CreateEnum
CREATE TYPE "ResponseScaleType" AS ENUM ('AGREEMENT_5', 'FREQUENCY_5');

-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED');

-- CreateEnum
CREATE TYPE "FeedbackCycleStatus" AS ENUM ('DRAFT', 'OPEN', 'CLOSED');

-- CreateEnum
CREATE TYPE "InvitationStatus" AS ENUM ('PENDING', 'COMPLETED', 'DECLINED');

-- CreateEnum
CREATE TYPE "EvaluatorRelationship" AS ENUM ('SELF', 'MANAGER', 'PEER', 'DIRECT_REPORT', 'OTHER');

-- CreateEnum
CREATE TYPE "PdiStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ActionStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED');

-- CreateTable
CREATE TABLE "organizations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'PROFISSIONAL',
    "managerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "questionnaires" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "QuestionnaireType" NOT NULL,
    "scaleType" "ResponseScaleType" NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "locale" TEXT NOT NULL DEFAULT 'pt-BR',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "questionnaires_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dimensions" (
    "id" TEXT NOT NULL,
    "questionnaireId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "dimensions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "questions" (
    "id" TEXT NOT NULL,
    "questionnaireId" TEXT NOT NULL,
    "dimensionId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "reverseScored" BOOLEAN NOT NULL DEFAULT false,
    "allowNotObserved" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "response_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "questionnaireId" TEXT NOT NULL,
    "status" "SessionStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "response_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "answers" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "value" INTEGER,
    "notObserved" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "answers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scoring_results" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "engineVersion" TEXT NOT NULL DEFAULT '1.0.0',
    "computedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "scoring_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dimension_scores" (
    "id" TEXT NOT NULL,
    "scoringResultId" TEXT NOT NULL,
    "dimensionId" TEXT NOT NULL,
    "rawMean" DOUBLE PRECISION NOT NULL,
    "itemCount" INTEGER NOT NULL,

    CONSTRAINT "dimension_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feedback_cycles" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "subjectUserId" TEXT NOT NULL,
    "questionnaireId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "status" "FeedbackCycleStatus" NOT NULL DEFAULT 'DRAFT',
    "minEvaluators" INTEGER NOT NULL DEFAULT 3,
    "openedAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "feedback_cycles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feedback_invitations" (
    "id" TEXT NOT NULL,
    "cycleId" TEXT NOT NULL,
    "evaluatorUserId" TEXT NOT NULL,
    "relationship" "EvaluatorRelationship" NOT NULL,
    "status" "InvitationStatus" NOT NULL DEFAULT 'PENDING',
    "responseSessionId" TEXT,
    "invitedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respondedAt" TIMESTAMP(3),

    CONSTRAINT "feedback_invitations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pdis" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "status" "PdiStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pdis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "objectives" (
    "id" TEXT NOT NULL,
    "pdiId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "targetDate" TIMESTAMP(3),
    "status" "ActionStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "objectives_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "actions" (
    "id" TEXT NOT NULL,
    "objectiveId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "ownerUserId" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3),
    "status" "ActionStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "evidenceNote" TEXT,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "actions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_organizationId_idx" ON "users"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "questionnaires_key_key" ON "questionnaires"("key");

-- CreateIndex
CREATE UNIQUE INDEX "dimensions_questionnaireId_key_key" ON "dimensions"("questionnaireId", "key");

-- CreateIndex
CREATE INDEX "questions_questionnaireId_idx" ON "questions"("questionnaireId");

-- CreateIndex
CREATE INDEX "response_sessions_userId_idx" ON "response_sessions"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "answers_sessionId_questionId_key" ON "answers"("sessionId", "questionId");

-- CreateIndex
CREATE UNIQUE INDEX "scoring_results_sessionId_key" ON "scoring_results"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "dimension_scores_scoringResultId_dimensionId_key" ON "dimension_scores"("scoringResultId", "dimensionId");

-- CreateIndex
CREATE INDEX "feedback_cycles_subjectUserId_idx" ON "feedback_cycles"("subjectUserId");

-- CreateIndex
CREATE UNIQUE INDEX "feedback_invitations_responseSessionId_key" ON "feedback_invitations"("responseSessionId");

-- CreateIndex
CREATE UNIQUE INDEX "feedback_invitations_cycleId_evaluatorUserId_key" ON "feedback_invitations"("cycleId", "evaluatorUserId");

-- CreateIndex
CREATE INDEX "pdis_userId_idx" ON "pdis"("userId");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dimensions" ADD CONSTRAINT "dimensions_questionnaireId_fkey" FOREIGN KEY ("questionnaireId") REFERENCES "questionnaires"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_questionnaireId_fkey" FOREIGN KEY ("questionnaireId") REFERENCES "questionnaires"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_dimensionId_fkey" FOREIGN KEY ("dimensionId") REFERENCES "dimensions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "response_sessions" ADD CONSTRAINT "response_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "response_sessions" ADD CONSTRAINT "response_sessions_questionnaireId_fkey" FOREIGN KEY ("questionnaireId") REFERENCES "questionnaires"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "answers" ADD CONSTRAINT "answers_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "response_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "answers" ADD CONSTRAINT "answers_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scoring_results" ADD CONSTRAINT "scoring_results_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "response_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dimension_scores" ADD CONSTRAINT "dimension_scores_scoringResultId_fkey" FOREIGN KEY ("scoringResultId") REFERENCES "scoring_results"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dimension_scores" ADD CONSTRAINT "dimension_scores_dimensionId_fkey" FOREIGN KEY ("dimensionId") REFERENCES "dimensions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback_cycles" ADD CONSTRAINT "feedback_cycles_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback_cycles" ADD CONSTRAINT "feedback_cycles_subjectUserId_fkey" FOREIGN KEY ("subjectUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback_cycles" ADD CONSTRAINT "feedback_cycles_questionnaireId_fkey" FOREIGN KEY ("questionnaireId") REFERENCES "questionnaires"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback_invitations" ADD CONSTRAINT "feedback_invitations_cycleId_fkey" FOREIGN KEY ("cycleId") REFERENCES "feedback_cycles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback_invitations" ADD CONSTRAINT "feedback_invitations_evaluatorUserId_fkey" FOREIGN KEY ("evaluatorUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback_invitations" ADD CONSTRAINT "feedback_invitations_responseSessionId_fkey" FOREIGN KEY ("responseSessionId") REFERENCES "response_sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pdis" ADD CONSTRAINT "pdis_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "objectives" ADD CONSTRAINT "objectives_pdiId_fkey" FOREIGN KEY ("pdiId") REFERENCES "pdis"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "actions" ADD CONSTRAINT "actions_objectiveId_fkey" FOREIGN KEY ("objectiveId") REFERENCES "objectives"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "actions" ADD CONSTRAINT "actions_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
