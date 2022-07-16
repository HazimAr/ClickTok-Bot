import { Webhook } from "@top-gg/sdk";
import { logVote } from "../utils/logger";
import { Router } from "express";
import { prisma } from "../bot";
const router = Router();
const topggWebhook = new Webhook(process.env.TOPGG_PASSWORD);

router.post(
  "/",
  topggWebhook.listener(async (vote) => {
    if (vote.type === "upvote") {
      try {
        await prisma.user.upsert({
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
        });
        logVote(vote);
      } catch {}
    }
  })
);

export default router;
