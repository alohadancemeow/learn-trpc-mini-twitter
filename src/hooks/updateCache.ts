import { InfiniteData } from "@tanstack/react-query";
import { RouterOutputs } from "../utils/api";
import { UpdateCacheTpye } from "../types/mytypes";

export const updateCache = ({
  client,
  action,
  data,
  input,
  variables,
}: UpdateCacheTpye) => {
  client.setQueryData(
    [
      ["tweet", "getTweets"],
      {
        input,
        type: "infinite",
      },
    ],
    (oldData) => {
      const newData = oldData as InfiniteData<
        RouterOutputs["tweet"]["getTweets"]
      >;

      const value = action === "like" ? 1 : -1;

      const newTweets = newData.pages.map((page) => {
        return {
          tweets: page.tweets.map((tweet) => {
            if (tweet.id === variables.tweetId) {
              return {
                ...tweet,
                likes: action === "like" ? [data.userId] : [],
                _count: {
                  likes: tweet._count.likes + value,
                },
              };
            }

            return tweet;
          }),
        };
      });

      return { ...newData, pages: newTweets };
    }
  );
};
