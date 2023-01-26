import React, { useState, useEffect } from "react";
import CreateTweet from "./CreateTweet";
import { RouterInputs, RouterOutputs, api as trpc } from "../utils/api";
import Image from "next/image";
import Link from "next/link";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import updateLocal from "dayjs/plugin/updateLocale";

import { AiFillHeart } from "react-icons/ai";
import {
  InfiniteData,
  QueryClient,
  useQueryClient,
} from "@tanstack/react-query";

// Format date
dayjs.extend(relativeTime);
dayjs.extend(updateLocal);

dayjs.updateLocale("en", {
  relativeTime: {
    future: "in %s",
    past: "%s",
    s: "1m",
    m: "1m",
    mm: "%dm",
    h: "1h",
    hh: "%dh",
    d: "1d",
    dd: "%dd",
    M: "1M",
    MM: "%dM",
    y: "1y",
    yy: "%dy",
  },
});

// Custom hook: useScroll
const useSroollPosition = () => {
  const [scrollPosition, setScrollPosition] = useState(0);

  const handleScroll = () => {
    const height =
      document.documentElement.scrollHeight -
      document.documentElement.clientHeight;

    const winScroll =
      document.body.scrollTop || document.documentElement.scrollTop;

    const scrolled = (winScroll / height) * 100;

    setScrollPosition(scrolled);
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return scrollPosition;
};

// UpdateCache
type UpdateCacheTpye = {
  client: QueryClient;
  variables: { tweetId: string };
  data: { userId: string };
  action: "like" | "unlike";
  input: RouterInputs["tweet"]["getTweets"];
};
const updateCache = ({
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

// Tweet component
type TweetRequest = {
  tweet: RouterOutputs["tweet"]["getTweets"]["tweets"][number];
  client: QueryClient;
  input: RouterInputs["tweet"]["getTweets"];
};
const Tweet = ({ tweet, client, input }: TweetRequest) => {
  // Call like-unlike mutations
  const { mutateAsync: likeMutation } = trpc.tweet.like.useMutation({
    onSuccess(data, variables) {
      updateCache({ client, data, variables, action: "like", input });
    },
  });
  const { mutateAsync: unlikeMutation } = trpc.tweet.unlike.useMutation({
    onSuccess(data, variables) {
      updateCache({ client, data, variables, action: "unlike", input });
    },
  });

  const hasLiked = tweet.likes.length > 0;

  // Handle like actions
  const handleLike = () => {
    if (hasLiked) {
      unlikeMutation({
        tweetId: tweet.id,
      });
      return;
    }

    likeMutation({ tweetId: tweet.id });
  };

  return (
    <div className="mb-4 border-b-2 border-gray-500">
      <div className="flex p-2">
        {tweet.author.image && (
          <Image
            src={tweet.author.image}
            // src={
            //   "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80"
            // }
            alt={`${tweet.author.name} profile picture`}
            width={48}
            height={48}
            className="rounded-full"
          />
        )}

        <div className="ml-2">
          <div className="flex items-center">
            <p className="font-bold">
              <Link href={`/${tweet.author.name}`}>{tweet.author.name}</Link>
            </p>
            <p className="pl-1 text-xs text-gray-500">
              - {dayjs(tweet.createdAt).fromNow()}
            </p>
          </div>

          <div>{tweet.text}</div>
        </div>
      </div>

      <div className="mt-4 flex items-center p-2">
        <AiFillHeart
          color={hasLiked ? "red" : "gray"}
          size="1.5rem"
          onClick={handleLike}
        />

        <span className="text-sm text-gray-500">{tweet._count.likes}</span>
      </div>
    </div>
  );
};

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

  useEffect(() => {
    if (scrollPosition > 90 && hasNextPage && !isFetching) {
      fetchNextPage();
    }
  }, [scrollPosition, hasNextPage, isFetching, fetchNextPage]);

  return (
    <div>
      <CreateTweet />
      <div className="border-l-2 border-r-2 border-gray-500">
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
