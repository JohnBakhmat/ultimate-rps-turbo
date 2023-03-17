import { type NextPage } from "next";
import { useSession } from "next-auth/react";
import Image from "next/image";

const Lobby: NextPage = () => {
  const session = useSession();
  const user = session.data?.user;

  if (!user) {
    return <div>Something went wrong</div>;
  }

  const { name, image, email } = user;

  return (
    <main className="grid min-h-screen w-screen place-items-center bg-black text-white">
      <div className="flex w-10/12 justify-between gap-10">
        <PlayerCard name={name} image={image} email={email} />
        <div className="flex-grow">Controlls</div>
        <PlayerCard />
      </div>
    </main>
  );
};

type CardProps = {
  name?: string | null | undefined;
  email?: string | null | undefined;
  image?: string | null | undefined;
};

const PlayerCard = (props: CardProps) => {
  const image =
    props.image ||
    "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fpwco.com.sg%2Fwp-content%2Fuploads%2F2020%2F05%2FGeneric-Profile-Placeholder-v3.png&f=1&nofb=1&ipt=031193a4d0e6560a0d3e892c881356b0599069ab84b8cf3c406c7b60a71a9e2a&ipo=images";
  const name = props.name || "Super Duper Player";
  return (
    <div className="aspect-square w-[300px] rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 shadow-[0_0_40px_1px_#ec4899]">
      <div className="m-0.5 grid h-full place-items-center gap-4 rounded-xl bg-black p-10">
        <img
          src={image}
          alt="player image"
          className="aspect-square max-w-[100px] rounded-full"
        />
        <h1 className="text-center font-mono text-2xl">{name}</h1>
      </div>
    </div>
  );
};

export default Lobby;
