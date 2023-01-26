import React, { useState } from "react";
import { api as trpc } from "../utils/api";

import { tweetSchema } from "../types/mytypes";
import { signOut, useSession } from "next-auth/react";

type Props = {};

const CreateTweet = (props: Props) => {
  const [text, setText] = useState("");
  // const [error, setError] = useState("");

  const utils = trpc.useContext();
  const { data: session } = useSession();
  // console.log("session", session);

  const { mutateAsync } = trpc.tweet.createTweet.useMutation({
    onSuccess: () => {
      setText("");
      utils.tweet.getTweets.invalidate();
    },
    // onError: (error)=> alert(error.message)
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      tweetSchema.parse({ text });
    } catch (error: any) {
      console.log("handleSubmit", error);
      // setError(error?.message);
    }

    mutateAsync({ text });
  };

  

  return (
    <div className="my-5">
      {/* {error && JSON.stringify(error)} */}
      {session && session.user && (
        <div className="flex justify-between">
          <p>{`Hello 👋 ${session.user?.name}`}</p>
          <button
            onClick={() => signOut()}
            className="rounded-md border-2 border-solid border-sky-500 px-4 py-1 hover:border-red-600"
          >
            Log out
          </button>
        </div>
      )}
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
            className={`${
              text.length === 0 && " bg-sky-600"
            }  rounded-full  bg-sky-500 px-5 py-2 text-white `}
            type="submit"
            disabled={text.length === 0 ? true : false}
          >
            Tweet
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateTweet;
