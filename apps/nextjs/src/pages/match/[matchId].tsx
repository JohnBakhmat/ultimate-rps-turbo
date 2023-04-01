import { useEffect, useState, type FC } from "react";
import {
  type GetServerSideProps,
  type InferGetServerSidePropsType,
  type NextPage,
} from "next";
import Image from "next/image";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";

import { pusherServerClient } from "@acme/api/src/pusher";
import { getServerSession, type Session } from "@acme/auth";
import { prisma, type Match, type User } from "@acme/db";

import { api } from "~/utils/api";
import { pusher } from "~/utils/pusher";
import { Player } from "~/components/match/Player";
import { getWinner, signs, type Result, type SignType } from "~/gamelogic";

type Props = InferGetServerSidePropsType<typeof getServerSideProps>;

export const getServerSideProps: GetServerSideProps<{
  match: Match;
  players: User[];
}> = async (ctx) => {
  const matchId = ctx.query?.matchId;

  const session = await getServerSession(ctx);

  if (!matchId || Array.isArray(matchId)) {
    return {
      notFound: true,
    };
  }

  const join = await prisma.userMatch.findMany({
    where: {
      matchId: matchId,
    },
    include: {
      user: true,
      match: true,
    },
  });

  if (join.length == 0 || !join[0]) {
    return {
      notFound: true,
    };
  }

  const match = join[0].match;
  const players = join.map((j) => j.user);

  return {
    props: {
      match,
      players,
      session,
    },
  };
};

type PlayerReadyEvent = {
  playerId: string;
  sign: SignType;
};

const MatchResults: {
  [key: string]: string;
} = {
  win: "You won, congrats!!!!",
  lose: "You lost, rip bozo",
  draw: "Draw! Maybe don't share the same braincell next time",
};

const MatchResultColors: {
  [key: string]: string;
} = {
  lose: "text-orange-500 text-5xl",
  win: "text-pink-500 text-5xl",
  draw: "text-white text-3xl",
};

const MatchPage: NextPage<Props> = (props) => {
  const [myWinCount, setMyWinCount] = useState(0);
  const [oponentWinCount, setOponentWinCount] = useState(0);
  const [isModalOpen, setModalOpen] = useState(true);
  const [imReady, setImReady] = useState(false);
  const [pickedSign, setPickedSign] = useState<SignType | "">("");
  const [oponentSign, setOponentSign] = useState<SignType | "">("");
  const [oponentReady, setOponentReady] = useState(false);
  const [roundEnd, setRoundEnd] = useState(false);
  const [roundResult, setRoundResult] = useState("blah");

  const [usedSigns, setUsedSigns] = useState<SignType[]>([]);
  const channel = pusher.subscribe(`match-${props.match.id}`);
  const session = useSession();
  const user = session.data?.user;
  const router = useRouter();

  const onNewRound = () => {
    setImReady(false);
    setOponentReady(false);
    setPickedSign("");
    setOponentSign("");
    setRoundResult("");
    setRoundEnd(false);

    setTimeout(() => {
      setModalOpen(true);
    }, 1000);
  };

  useEffect(() => {
    channel.bind("player-ready", (data: PlayerReadyEvent) => {
      if (data.playerId != user?.id) {
        setOponentReady(true);
        setOponentSign(data.sign);
      }
    });

    channel.bind("new-round", () => {
      onNewRound();
    });
  }, []);

  useEffect(() => {
    if (oponentSign.length && pickedSign.length) {
      setRoundEnd(true);

      const roundResult = getWinner(
        pickedSign as SignType,
        oponentSign as SignType,
      );

      switch (roundResult) {
        case "lose":
          setOponentWinCount((p) => p + 1);
          break;
        case "win":
          setMyWinCount((p) => p + 1);
          break;
      }

      setRoundResult(roundResult);
    }
  }, [oponentSign, pickedSign]);

  if (!user) {
    return <div>No session!</div>;
  }

  const oponent = props.players.find((p) => p.id !== user.id);
  const me = props.players.find((p) => p.id === user.id);

  if (!me || !oponent) {
    return <div>Something went wrong</div>;
  }

  const blur = isModalOpen ? "blur-sm" : "";
  const newMatch = api.match.onNewMatch.useMutation();
  const onPick = api.match.onPick.useMutation();
  const handlePick = async (sign: SignType) => {
    setModalOpen(false);
    setPickedSign(sign);
    setImReady(true);
    onPick.mutate({
      playerId: user.id,
      sign: sign,
      matchId: props.match.id,
    });

    setUsedSigns((prev) => {
      const newValue = [...prev, sign];

      if (newValue.length > 3) {
        newValue.shift();
      }

      return newValue;
    });
  };

  const handleReset = () => {
    newMatch.mutate({
      matchId: props.match.id,
    });
  };

  const handleLeave = () => {
    router.back();
  };

  const resultText = MatchResults[roundResult] || "";

  const resultColor = MatchResultColors[roundResult] || "";

  return (
    <div className="bg-black text-white">
      <div
        className={`relative flex h-screen w-full flex-col items-center justify-between ${blur}`}
      >
        <Player data={oponent} isReady={oponentReady} />
        <h1 className="text-5xl text-orange-500">{oponentWinCount}</h1>
        {roundEnd && (
          <>
            <h1 className={` italic ${resultColor}`}>{resultText}</h1>

            <div className="flex flex-row items-center justify-center gap-20">
              <SignButton sign={pickedSign as SignType} />
              <h1 className="text-3xl">VS</h1>
              <SignButton sign={oponentSign as SignType} />
            </div>

            <div className="flex flex-row gap-5">
              <button
                onClick={handleReset}
                className="rounded-xl 
               bg-gradient-to-br from-pink-500 to-purple-600 py-2 px-4 text-2xl
                font-bold
                text-white shadow-[0_0_40px_1px_#ec4899] disabled:opacity-50"
              >
                Next round
              </button>
              <button
                onClick={handleLeave}
                className=" 
               rounded-xl bg-black py-2 px-4 text-2xl
                font-bold
                text-white shadow-[0_0_40px_1px_#ec4899] disabled:opacity-50"
              >
                Return to lobby
              </button>
            </div>
          </>
        )}
        <h1 className="text-5xl text-pink-500">{myWinCount}</h1>
        <Player data={me} isReady={imReady} />
      </div>
      <Modal isOpen={isModalOpen}>
        <>
          {signs.map((s, i) => (
            <div key={`${s} ${i}`}>
              <SignButton
                sign={s}
                onClick={(c) => void handlePick(c)}
                isUsed={usedSigns.indexOf(s) !== -1}
              />
            </div>
          ))}
        </>
      </Modal>
    </div>
  );
};

type ModalProps = { isOpen: boolean; children: React.ReactElement };

const Modal: FC<ModalProps> = ({ isOpen, children }) => {
  if (!isOpen) return <div />;

  return (
    <div className="fixed inset-0 z-20 grid place-items-center text-white">
      <div className="grid grid-cols-6 grid-rows-4 place-items-center gap-14">
        {children}
        <div className="col-span-4 col-start-2 row-span-2 row-start-2 text-6xl italic">
          Pick a sign!
        </div>
      </div>
    </div>
  );
};

export default MatchPage;

const SignButton: FC<{
  sign: SignType;
  onClick?: (sign: SignType) => void;
  isUsed?: boolean;
}> = ({ sign, onClick, isUsed }) => {
  return (
    <div className="text-center text-2xl capitalize">
      <button
        disabled={isUsed}
        onClick={() => onClick && onClick(sign)}
        className="after:dotted relative after:absolute after:-inset-1 after:rounded-full hover:after:border-blue-500 enabled:cursor-pointer  enabled:hover:after:animate-spin disabled:opacity-50"
      >
        <Image
          alt={sign.toString()}
          width={100}
          height={100}
          className="rounded-full"
          src={`/signs/${sign.toLowerCase()}.png`}
        />
      </button>
      <h1>{sign.toLowerCase()}</h1>
    </div>
  );
};
