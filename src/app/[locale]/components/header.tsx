import { FC } from "react";

interface HeaderProps {
  title: string;
}

const header: FC<HeaderProps> = ({ title }) => {
  return (
    <header>
      <h1>{title}</h1>
    </header>
  );
};

export default header;
