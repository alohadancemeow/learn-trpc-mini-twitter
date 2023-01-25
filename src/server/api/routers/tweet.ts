import { z } from "zod";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";
import { tweetSchema } from "../../../types/mytypes";

export const tweetRouter = createTRPCRouter({
  createTweet: protectedProcedure
    .input(tweetSchema)
    .mutation(async ({ ctx, input }) => {
      const { prisma, session } = ctx;
      const { text } = input;
      const { id: userId } = session.user;

      return await prisma.tweet.create({
        data: {
          text,
          author: {
            connect: {
              id: userId,
            },
          },
        },
      });
    }),
  getTweets: publicProcedure
    .input(
      z.object({
        cursor: z.string().nullish(),
        limit: z.number().min(1).max(100).default(10),
      })
    )
    .query(async ({ ctx, input }) => {
      const { prisma } = ctx;
      const { limit, cursor } = input;

      const tweets = await prisma.tweet.findMany({
        take: limit + 1,
        orderBy: {
          createdAt: "desc",
        },
        cursor: cursor ? { id: cursor } : undefined,
        include: {
          author: {
            select: {
              id: true,
              image: true,
              name: true,
            },
          },
        },
      });

      let nextCursor: typeof cursor | undefined = undefined;

      if (tweets.length > limit) {
        const nextItem = tweets.pop() as (typeof tweets)[number];
        nextCursor = nextItem.id;
      }

      return { tweets, nextCursor };
    }),
});
