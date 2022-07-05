import { Webhook } from "@top-gg/sdk";
import { logVote } from "../utils/logger";
import { PrismaClient } from "@prisma/client";
import { Router } from "express";
const router = Router();
const prisma = new PrismaClient();
const topggWebhook = new Webhook(process.env.TOPGG_PASSWORD);

router.post(
  "/",
  topggWebhook.listener(async (vote) => {
    console.log(vote);
    if (vote.type === "upvote") {
      await Promise.all([
        logVote(vote),
        prisma.user.upsert({
          where: { id: vote.user },
          update: {
            votes: {
              increment: 1,
            },
            lastVotedAt: new Date(Date.now()),
          },
          create: {
            id: vote.user,
            lastConvertedAt: null,
            lastVotedAt: null,
          },
        }),
      ]);
    }
  })
);

export default router;
