import { QueryClient } from "@tanstack/react-query";
import { object, string, z } from "zod";
import { RouterInputs, RouterOutputs } from "../utils/api";

export const tweetSchema = object({
  text: string({ required_error: "Tweet text is required" }).max(280),
});

export const getTweetSchema = object({
  where: z
    .object({
      author: z
        .object({
          name: z.string().optional(),
        })
        .optional(),
    })
    .optional(),
  cursor: z.string().nullish(),
  limit: z.number().min(1).max(100).default(10),
});

// UpdateCache
export type UpdateCacheTpye = {
  client: QueryClient;
  variables: { tweetId: string };
  data: { userId: string };
  action: "like" | "unlike";
  input: RouterInputs["tweet"]["getTweets"];
};

export type TweetRequest = {
  tweet: RouterOutputs["tweet"]["getTweets"]["tweets"][number];
  client: QueryClient;
  input: RouterInputs["tweet"]["getTweets"];
};
