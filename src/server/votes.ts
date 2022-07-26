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
      log.info("vote: ", vote);
      try {
        await logVote(vote);
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
        } catch (e) {
          log.error("vote: ", e, "\n", vote);
        }
      } catch (e) {
        log.error("vote: ", e, "\n", vote);
      }
    }
  })
);

export default router;
