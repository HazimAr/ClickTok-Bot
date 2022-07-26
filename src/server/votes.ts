import { Webhook } from "@top-gg/sdk";
import { logVote } from "../utils/logger";
import { Router } from "express";
import { log, prisma } from "../bot";
const router = Router();
const topggWebhook = new Webhook(process.env.TOPGG_PASSWORD);

router.post(
  "/",
  topggWebhook.listener(async (vote) => {
    if (vote.type === "upvote") {
      try {
        log.info("vote: ", vote);
        await logVote(vote);
        try {
          await prisma.$disconnect();
          await prisma.$connect();
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
              votes: 1,
              lastConvertedAt: null,
              lastVotedAt: new Date(Date.now()),
            },
          });
        } catch (e) {
          log.error("voteUpdate: ", e, "\n", vote);
        }
      } catch (e) {
        log.error("vote: ", e, "\n", vote);
      }
    }
  })
);

export default router;
