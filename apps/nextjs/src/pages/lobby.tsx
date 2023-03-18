import { useEffect, useState } from "react";
import { type NextPage } from "next";
import { useSession } from "next-auth/react";

import { api } from "~/utils/api";

const Lobby: NextPage = () => {
  const [matchId, setMatchId] = useState<string>("");
  const [publicId, setPublicId] = useState<string>("");

  const session = useSession();
  const createMatch = api.game.createMatch.useMutation();

  const user = session.data?.user;
  useEffect(() => {
    if (createMatch.isSuccess) {
      setMatchId(createMatch.data.matchId);
      setPublicId(createMatch.data.publicId);
    }
  }, [createMatch.isSuccess, createMatch.data]);

  if (!user) {
    return <div>Something went wrong</div>;
  }
  const { name, image, email, id } = user;

  const handleCreateMatch = () => {
    createMatch.mutate({ hostId: id });
  };

  if (createMatch.isError) {
    return (
      <div>
        Couldn't create match,{JSON.stringify(createMatch.error, null, 2)}
      </div>
    );
  }

  return (
    <main className="grid min-h-screen w-screen place-items-center bg-black text-white">
      <div className="flex w-10/12 justify-between gap-10">
        <PlayerCard name={name} image={image} email={email} />
        <div className="flex-grow">
          <div className="grid grid-cols-3 gap-5">
            <button
              className="col-span-2 rounded-xl bg-gradient-to-br from-pink-500
               to-purple-600 py-2 px-4 text-2xl font-bold text-white
                shadow-[0_0_40px_1px_#ec4899]
                disabled:opacity-50
                "
              disabled={matchId.length > 0}
              onClick={handleCreateMatch}
            >
              CreateMatch
            </button>
            {/* <div>Match created: {matchId && publicId}</div> */}
            <MatchCodeInput isLocked={matchId.length > 0} publicId={publicId} />
          </div>
        </div>
        <PlayerCard />
      </div>
    </main>
  );
};

const MatchCodeInput = ({
  isLocked,
  publicId,
}: {
  isLocked: boolean;
  publicId: string;
}) => {
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [value, setValue] = useState<string>(publicId);

  const handleClick = () => {
    if (isLocked) {
      void navigator.clipboard.writeText(publicId);
      setIsCopied(true);

      setTimeout(() => {
        setIsCopied(false);
      }, 1000);
    }
  };

  return (
    <div
      className={`relative grid
    place-items-center rounded-md  p-1 text-2xl font-bold 
    ${
      isCopied
        ? "bg-green-500 shadow-[0_0_40px_1px_#22C55E]"
        : "bg-gradient-to-br from-pink-500 to-purple-600 shadow-[0_0_40px_1px_#ec4899]"
    }
     text-white 
     transition-colors duration-100
        ease-in-out`}
      onClick={() => void handleClick()}
    >
      <input
        disabled={isLocked}
        className={`absolute inset-1 overflow-hidden rounded-md bg-black px-1 text-center 
        text-2xl font-bold uppercase text-white
        shadow-[0_0_40px_1px_#ec4899] outline-none
        transition-colors duration-100
        ease-in-out 
        disabled:cursor-pointer disabled:hover:bg-white disabled:hover:text-black
        
        `}
        type="text"
        maxLength={6}
        autoCapitalize="characters"
        value={publicId || value}
        onChange={(e) => setValue(e.target.value)}
      />
    </div>
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
