import Pusher from "pusher-js";

import { env } from "~/env.mjs";

export const pusher = new Pusher(env.NEXT_PUBLIC_PUSHER_APP_KEY, {
  cluster: "eu",
});
