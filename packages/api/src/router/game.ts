import { EventEmitter } from "events";
import { z } from "zod";

import { type Match } from "@acme/db";

import { pusherServerClient } from "../pusher";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { getRandomRoomId } from "../utils";

export const gameRouter = createTRPCRouter({
  createMatch: publicProcedure
    .input(
      z.object({
        hostId: z.string(),
      }),
    )
    .output(
      z.object({
        matchId: z.string(),
        publicId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { hostId } = input;

      const publicIdsInUse = (
        await ctx.prisma.match.findMany({
          select: {
            publicId: true,
          },
          where: {
            isEnded: false,
          },
        })
      ).map((i) => i.publicId);

      const publicId = getRandomRoomId(publicIdsInUse);
      const match = await ctx.prisma.match.create({
        data: {
          hostId,
          publicId,
        },
      });

      await ctx.prisma.userMatch.create({
        data: {
          userId: hostId,
          matchId: match.id,
          isHost: true,
        },
      });

      return { matchId: match.id, publicId };
    }),

  getMatch: protectedProcedure
    .input(
      z.object({
        matchId: z.string(),
        playerId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { matchId } = input;

      const joinedTables = await ctx.prisma.userMatch.findMany({
        where: {
          matchId: matchId,
        },
        include: {
          user: true,
          match: true,
        },
      });

      const match = joinedTables[0]?.match;
      const opponent = joinedTables.find(
        (i) => i.userId !== input.playerId,
      )?.user;
      const myData = joinedTables.find(
        (i) => i.userId === input.playerId,
      )?.user;

      if (!match || !opponent || !myData) {
        throw new Error("Match not found");
      }

      return {
        match,
        opponent,
        myData,
      };
    }),

  getMatchIdByPublicId: protectedProcedure
    .input(z.object({ publicId: z.string() }))
    .output(z.object({ matchId: z.string() }))
    .query(async ({ ctx, input }) => {
      const match = await ctx.prisma.match.findUnique({
        where: {
          publicId: input.publicId,
        },
      });

      if (!match) {
        throw new Error("Match not found");
      }

      return { matchId: match.id };
    }),

  joinMatch: protectedProcedure
    .input(
      z.object({
        playerId: z.string(),
        matchId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { playerId, matchId } = input;

      if (playerId.length === 0 || matchId.length === 0) {
        return null;
      }

      const match = await ctx.prisma.match.findFirst({
        where: {
          id: matchId,
        },
      });

      handleMatchErrors(match);

      const hasAlreadyJoined = await ctx.prisma.userMatch.findFirst({
        where: {
          userId: playerId,
          matchId,
        },
      });

      if (!hasAlreadyJoined) {
        await ctx.prisma.userMatch.create({
          data: {
            userId: playerId,
            matchId: matchId,
          },
        });
      }

      await playerJoin(matchId, input.playerId);
      await setPlayerNotReady(matchId, input.playerId);

      return match;
    }),

  getPlayersByMatchId: protectedProcedure
    .input(
      z.object({
        matchId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { matchId } = input;

      const userMatchArr = await ctx.prisma.userMatch.findMany({
        where: {
          matchId,
        },
      });

      return await Promise.all(
        userMatchArr.map(async (userMatch) => {
          const playerData = await ctx.prisma.user.findUnique({
            where: {
              id: userMatch.userId,
            },
          });
          if (!playerData) {
            throw new Error("Player not found");
          }
          return playerData;
        }),
      );
    }),

  readyUp: protectedProcedure
    .input(
      z.object({
        playerId: z.string(),
        matchId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      await pusherServerClient.trigger(
        `lobby-${input.matchId}`,
        "player-ready",
        {
          playerId: input.playerId,
        },
      );
    }),

  notReady: protectedProcedure
    .input(
      z.object({
        playerId: z.string(),
        matchId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      await setPlayerNotReady(input.matchId, input.playerId);
    }),
});

const setPlayerNotReady = async (matchId: string, playerId: string) => {
  await pusherServerClient.trigger(`lobby-${matchId}`, "player-not-ready", {
    playerId,
  });
};

const playerJoin = async (matchId: string, playerId: string) => {
  await pusherServerClient.trigger(`lobby-${matchId}`, "player-join", {
    playerId,
  });
};

const handleMatchErrors = (match: Match | null) => {
  if (!match) {
    throw new Error("Match not found");
  }

  if (match.isEnded) {
    throw new Error("Match has ended");
  }

  if (match.isStarted) {
    throw new Error("Match has started");
  }
};
