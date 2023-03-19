import { EventEmitter } from "events";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { getRandomRoomId } from "../utils";

const ee = new EventEmitter();

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
      }),
    )
    .query(async ({ ctx, input }) => {
      const { matchId } = input;

      const match = await ctx.prisma.match.findUnique({
        where: {
          id: matchId,
        },
      });

      return match;
    }),

  joinMatch: protectedProcedure
    .input(
      z.object({
        playerId: z.string().uuid(),
        matchId: z.string().uuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { playerId, matchId } = input;

      const match = await ctx.prisma.match.findUnique({
        where: {
          id: matchId,
        },
      });

      if (!match) {
        throw new Error("Match not found");
      }

      await ctx.prisma.userMatch.create({
        data: {
          userId: playerId,
          matchId: match.id,
        },
      });
      ee.emit("player-joined", matchId);
      return match.id;
    }),

  getPlayersByMatchId: protectedProcedure
    .input(
      z.object({
        matchId: z.string().uuid(),
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
});
