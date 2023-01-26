import React, { useState } from "react";
import { api as trpc } from "../utils/api";

import { tweetSchema } from "../types/mytypes";

type Props = {};

const CreateTweet = (props: Props) => {
  const [text, setText] = useState("");
  const [error, setError] = useState("");

  const utils = trpc.useContext();

  const { mutateAsync } = trpc.tweet.createTweet.useMutation({
    onSuccess: () => {
      setText("");
      utils.tweet.getTweets.invalidate();
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      tweetSchema.parse({ text });
    } catch (error: any) {
      console.log("handleSubmit", error);
      setError(error?.message);
    }

    mutateAsync({ text });
  };

  return (
    <>
      {error && JSON.stringify(error)}
      <form
        onSubmit={handleSubmit}
        className="mb-4 mt-5 flex w-full flex-col rounded-md border-2 p-4"
      >
        <textarea
          className="w-full p-4 shadow"
          value={text}
          placeholder="What's happening?"
          onChange={(e) => setText(e.target.value)}
        />

        <div className="mt-4 flex justify-end">
          <button
            className="rounded-md bg-primary px-4 py-2 text-white"
            type="submit"
          >
            Tweet
          </button>
        </div>
      </form>
    </>
  );
};

export default CreateTweet;
