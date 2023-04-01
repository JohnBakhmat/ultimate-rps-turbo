import { z } from "zod";

import { pusherServerClient } from "../pusher";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const matchRouter = createTRPCRouter({
  onPick: protectedProcedure
    .input(
      z.object({
        matchId: z.string(),
        playerId: z.string(),
        sign: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { playerId, sign, matchId } = input;

      await pusherServerClient.trigger(`match-${matchId}`, "player-ready", {
        playerId,
        sign,
      });
    }),
  onNewMatch: protectedProcedure
    .input(
      z.object({
        matchId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await pusherServerClient.trigger(
        `match-${input.matchId}`,
        "new-round",
        {},
      );
    }),
});
