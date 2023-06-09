import PusherServer from "pusher";

export const pusherServerClient = new PusherServer({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_APP_KEY!,
  secret: process.env.PUSHER_APP_SECRET!,
  useTLS: process.env.NEXT_PUBLIC_PUSHER_SERVER_TLS === "true",
  cluster: process.env.NEXT_PUBLIC_PUSHER_SERVER_CLUSTER!,
});
