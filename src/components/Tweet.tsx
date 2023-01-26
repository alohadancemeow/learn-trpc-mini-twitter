import Image from "next/image";
import Link from "next/link";
import { AiFillHeart } from "react-icons/ai";

import { api as trpc } from "../utils/api";
import { updateCache } from "../hooks/updateCache";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import updateLocal from "dayjs/plugin/updateLocale";
import { TweetRequest } from "../types/mytypes";

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
    <div className="mb-4 border border-gray-500 rounded-md">
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

export default Tweet;
