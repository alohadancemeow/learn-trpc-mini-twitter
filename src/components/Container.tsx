import React from "react";

type Props = {
  children: React.ReactNode;
  classNames?: string;
};

const Container = ({ children, classNames }: Props) => {
  return <div className={`m-auto max-w-xl ${classNames}`}>{children}</div>;
};

export default Container;
