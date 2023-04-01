import Image from "next/image";

import { type User } from "@acme/db";

export const Player = ({ data, isReady }: { data: User; isReady: boolean }) => {
  return (
    <div className="m-2 flex flex-col items-center gap-3 rounded-md border-2 border-pink-500 bg-black p-5 text-white first:flex-col-reverse first:border-orange-400">
      <h1 className="text-2xl">{data.name}</h1>
      <Image
        src={
          data.image ||
          "https://www.icachef.co.za/wp-content/uploads/2019/01/ICA_Profile-Place-Holder.png"
        }
        className={`rounded-full ${
          isReady ? "border-4 border-dotted border-green-400" : ""
        }`}
        width={100}
        height={100}
        alt={data.name || "Player Image"}
      />
      {isReady && <h1 className="text-green-400">Ready!</h1>}
    </div>
  );
};
