import { useEffect, useState } from "react";
import { type NextPage } from "next";
import { useSession } from "next-auth/react";

import { api } from "~/utils/api";
import { MatchCodeInput } from "~/components/MatchCodeInput";
import { PlayerCard } from "~/components/PlayerCard";

const Lobby: NextPage = () => {
  const [matchId, setMatchId] = useState<string>("");
  const [publicId, setPublicId] = useState<string>("");

  const session = useSession();
  const user = session.data?.user;

  const { data: matchIdFromPublicId, refetch: refetchMatchId } =
    api.game.getMatchIdByPublicId.useQuery({ publicId });

  const createMatch = api.game.createMatch.useMutation();
  const joinMatch = api.game.joinMatch.useMutation();

  useEffect(() => {
    if (createMatch.isSuccess) {
      setMatchId(createMatch.data.matchId);
      setPublicId(createMatch.data.publicId);
    }
  }, [createMatch.isSuccess, createMatch.data]);

  useEffect(() => {
    if (matchId.length > 0 && user?.id) {
      joinMatch.mutate({ matchId, playerId: user.id });
    }
  }, [matchId]);

  if (!user) {
    return <div>Something went wrong</div>;
  }
  const { name, image, email, id } = user;

  const handleCreateMatch = () => {
    createMatch.mutate({ hostId: id });
  };

  const handleJoinMatch = () => {
    refetchMatchId().catch((err) => {
      console.error(err);
    });

    if (matchIdFromPublicId?.matchId) {
      setMatchId(matchIdFromPublicId.matchId);
    }
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
      Error: {JSON.stringify(joinMatch.error, null, 2)}
      Success: {JSON.stringify(joinMatch.isSuccess, null, 2)}
      Data: {JSON.stringify(joinMatch.data, null, 2)}
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
          </div>
        </div>
        <PlayerCard />
      </div>
    </main>
  );
};

export default Lobby;
