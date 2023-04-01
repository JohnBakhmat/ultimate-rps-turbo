import { authRouter } from "./router/auth";
import { gameRouter } from "./router/game";
import { matchRouter } from "./router/match";
import { postRouter } from "./router/post";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  post: postRouter,
  auth: authRouter,
  game: gameRouter,
  match: matchRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
