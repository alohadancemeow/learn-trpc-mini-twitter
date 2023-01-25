import { signIn, useSession } from "next-auth/react";
import React from "react";
import Container from "./Container";

type Props = {};

const LoggedOutBanner = (props: Props) => {
  const { data: session } = useSession();

    if (session) return null;

  return (
    <div className="fixed bottom-0 w-full bg-primary p-4">
      <Container classNames="bg-transparent flex justify-between">
        <p className="text-white">New to Twitter?</p>
        <div>
          <button
            onClick={() => signIn()}
            className="px-4 py-2 text-white shadow-md"
          >
            Login
          </button>
        </div>
      </Container>
    </div>
  );
};

export default LoggedOutBanner;
