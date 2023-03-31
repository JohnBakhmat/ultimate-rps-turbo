import { useEffect, useState } from "react";
import { type NextPage } from "next";
import { useSession } from "next-auth/react";

import { api } from "~/utils/api";
import { pusher } from "~/utils/pusher";
import { MatchCodeInput } from "~/components/MatchCodeInput";
import { PlayerCard } from "~/components/PlayerCard";

const Lobby: NextPage = () => {
  const [matchId, setMatchId] = useState<string>("");
  const [publicId, setPublicId] = useState<string>("");
  const [oponentReady, setOponentReady] = useState(false);
  const [imReady, setImReady] = useState(false);
  const session = useSession();
  const user = session.data?.user;

  const { data: matchIdFromPublicId, refetch: refetchMatchId } =
    api.game.getMatchIdByPublicId.useQuery({ publicId });

  const createMatch = api.game.createMatch.useMutation();
  const joinMatch = api.game.joinMatch.useMutation();
  const players = api.game.getPlayersByMatchId.useQuery({ matchId });
  const readyUp = api.game.readyUp.useQuery(
    {
      matchId,
      playerId: user?.id!,
    },
    {
      enabled: false,
    },
  );

  const notReady = api.game.notReady.useQuery(
    {
      matchId,
      playerId: user?.id!,
    },
    {
      enabled: false,
    },
  );

  useEffect(() => {
    if (createMatch.isSuccess) {
      setMatchId(createMatch.data.matchId);
      setPublicId(createMatch.data.publicId);
    }
  }, [createMatch.isSuccess, createMatch.data]);

  useEffect(() => {
    if (matchId.length > 0 && user?.id) {
      joinMatch.mutate({ matchId, playerId: user.id });

      const channel = pusher.subscribe(`match-${matchId}`);
      channel.bind("player-join", onPlayerJoin);
      channel.bind("player-ready", onPlayerReady);
      channel.bind("player-not-ready", onPlayerNotReady);
    }
  }, [matchId]);

  useEffect(() => {
    if (imReady && oponentReady) {
      handleMatchStart();
    }
  }, [imReady, oponentReady]);

  if (!user) {
    return <div>Something went wrong</div>;
  }
  const { name, image, email, id } = user;

  const handleCreateMatch = () => {
    createMatch.mutate({ hostId: id });
  };

  const handleMatchStart = () => {
    alert("Match is starting");
  };

  const handleJoinMatch = () => {
    refetchMatchId().catch((err: Error) => {
      console.error(err);
    });

    if (matchIdFromPublicId?.matchId) {
      setMatchId(matchIdFromPublicId.matchId);
    }
  };

  const handleReady = async () => {
    const tempReady = imReady;

    setImReady(!imReady);

    if (tempReady) {
      await notReady.refetch();
    } else {
      await readyUp.refetch();
    }
  };

  //Pusher
  const onPlayerJoin = () => {
    players.refetch().catch((err: Error) => {
      console.error(err);
    });
  };

  const onPlayerReady = (data: { playerId: string }) => {
    if (data.playerId !== user.id) setOponentReady(true);
  };
  const onPlayerNotReady = (data: { playerId: string }) => {
    if (data.playerId !== user.id) setOponentReady(false);
  };
  //_____

  if (createMatch.isError) {
    return (
      <div>
        Couldn't create match, {JSON.stringify(createMatch.error, null, 2)}
      </div>
    );
  }
  const oponents = players.data?.filter((i) => i.id !== user.id);

  return (
    <main className="grid min-h-screen w-screen place-items-center bg-black text-white">
      <div className="flex w-8/12 flex-col items-center justify-between gap-2 lg:w-8/12 lg:flex-row lg:gap-24">
        <PlayerCard name={name} image={image} email={email} isReady={imReady} />
        <div className="flex-grow">
          <div className="grid h-full grid-cols-3 grid-rows-4 gap-5">
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

            <MatchCodeInput
              isLocked={matchId.length > 0}
              publicId={publicId}
              setPublicId={setPublicId}
            />

            <button
              className="col-span-3 rounded-xl bg-gradient-to-br from-pink-500
               to-purple-600 py-2 px-4 text-2xl font-bold text-white
                shadow-[0_0_40px_1px_#ec4899]
                disabled:opacity-50
                "
              disabled={matchId.length > 0}
              onClick={handleJoinMatch}
            >
              Join Match
            </button>

            <button
              className="col-span-3 row-start-4 rounded-xl bg-gradient-to-br
               from-pink-500 to-purple-600 py-2 px-4 text-2xl font-bold
                text-white
                shadow-[0_0_40px_1px_#ec4899] disabled:opacity-50
                "
              disabled={!oponents || oponents.length <= 0}
              onClick={() => void handleReady()}
            >
              Ready
            </button>
          </div>
        </div>

        {!oponents?.length ? (
          <PlayerCard isReady={oponentReady} />
        ) : (
          oponents.map((o) => (
            <PlayerCard
              name={o.name}
              image={o.image}
              key={o.id}
              isReady={oponentReady}
            />
          ))
        )}
      </div>
    </main>
  );
};

export default Lobby;
