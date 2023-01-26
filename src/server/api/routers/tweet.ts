import { z } from "zod";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";
import { getTweetSchema, tweetSchema } from "../../../types/mytypes";
import { TRPCClientError } from "@trpc/client";
import { TRPCError } from "@trpc/server";

export const tweetRouter = createTRPCRouter({
  createTweet: protectedProcedure
    .input(tweetSchema)
    .mutation(async ({ ctx, input }) => {
      const { prisma, session } = ctx;
      const { text } = input;
      const { id: userId } = session.user;

      try {
        const tweet = await prisma.tweet.create({
          data: {
            text,
            author: {
              connect: {
                id: userId,
              },
            },
          },
        });

        return tweet;
      } catch (error: any) {
        console.log(`err on createTweet ${error?.message}`);
      }
    }),
  getTweets: publicProcedure
    .input(getTweetSchema)
    .query(async ({ ctx, input }) => {
      const { prisma } = ctx;
      const { limit, cursor, where } = input;

      const tweets = await prisma.tweet.findMany({
        take: limit + 1,
        where,
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
          likes: {
            where: {
              userId: ctx.session?.user?.id,
            },
            select: {
              userId: true,
            },
          },
          _count: {
            select: {
              likes: true,
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

  like: protectedProcedure
    .input(z.object({ tweetId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { prisma, session } = ctx;
      const { id: userId } = session.user;
      const { tweetId } = input;

      return await prisma.like.create({
        data: {
          tweet: {
            connect: {
              id: tweetId,
            },
          },
          user: {
            connect: {
              id: userId,
            },
          },
        },
      });
    }),
  unlike: protectedProcedure
    .input(z.object({ tweetId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { prisma, session } = ctx;
      const { id: userId } = session.user;
      const { tweetId } = input;

      return await prisma.like.delete({
        where: {
          tweetId_userId: {
            tweetId,
            userId,
          },
        },
      });
    }),
});
