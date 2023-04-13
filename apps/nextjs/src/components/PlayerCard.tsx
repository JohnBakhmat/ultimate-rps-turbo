import Image from "next/image";

export type Props = {
  name?: string | null | undefined;
  email?: string | null | undefined;
  image?: string | null | undefined;
  isReady: boolean;
};

export const PlayerCard = (props: Props) => {
  const image =
    props.image ||
    "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fpwco.com.sg%2Fwp-content%2Fuploads%2F2020%2F05%2FGeneric-Profile-Placeholder-v3.png&f=1&nofb=1&ipt=031193a4d0e6560a0d3e892c881356b0599069ab84b8cf3c406c7b60a71a9e2a&ipo=images";
  const name = props.name || "Super Duper Player";
  const ready = props.isReady;
  return (
    <div className="aspect-square relative h-full w-full max-w-[250px] lg:max-w-[300px] rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 p-0.5 shadow-[0_0_40px_1px_#ec4899]">
      <div className="grid absolute inset-1 place-items-center gap-2 lg:gap-4 rounded-xl bg-black p-5 lg:p-10">
        <h1
          className={
            "font-sans text-3xl " + (ready ? "text-white" : "text-transparent")
          }
        >
          Ready!
        </h1>

        <Image
          src={image}
          alt="player image"
          width={100}
          height={100}
          className={`aspect-square rounded-full w-1/3 lg:w-2/4 ${
            ready ? "player-ready" : ""
          }`}
        />
        <h1 className="text-center font-mono text-xl lg:text-2xl">{name}</h1>
      </div>
    </div>
  );
};
