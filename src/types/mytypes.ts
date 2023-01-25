import { object, string } from "zod";

export const tweetSchema = object({
  text: string({ required_error: "Tweet text is required" }).min(10).max(280),
});
