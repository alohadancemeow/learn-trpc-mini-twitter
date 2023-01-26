import React, { useEffect } from "react";
import CreateTweet from "./CreateTweet";
import { RouterInputs, api as trpc } from "../utils/api";
import { useQueryClient } from "@tanstack/react-query";
import Tweet from "./Tweet";
import { useSroollPosition } from "../hooks/useScrollPosition";

type Props = {
  where?: RouterInputs["tweet"]["getTweets"]["where"];
};

const Timeline = ({ where = {} }: Props) => {
  const client = useQueryClient();

  const scrollPosition = useSroollPosition();

  const { data, hasNextPage, fetchNextPage, isFetching } =
    trpc.tweet.getTweets.useInfiniteQuery(
      { limit: 10, where },
      { getNextPageParam: (lastPage) => lastPage.nextCursor }
    );

  const tweets = data?.pages.flatMap((page) => page.tweets) ?? [];

  /** Checking if the scroll position is greater than 90
   * and if there is a next page
   * and if it is not fetching.
   * If all of those are true, it will fetch the next page.
   */

  useEffect(() => {
    if (scrollPosition > 90 && hasNextPage && !isFetching) {
      fetchNextPage();
    }
  }, [scrollPosition, hasNextPage, isFetching, fetchNextPage]);

  return (
    <div>
      <CreateTweet />
      <div className="">
        {tweets.map((tweet) => {
          return (
            <Tweet
              key={tweet.id}
              tweet={tweet}
              client={client}
              input={{ where, limit: 10 }}
            />
          );
        })}

        {!hasNextPage && <p>No more items to load</p>}
      </div>
    </div>
  );
};

export default Timeline;
