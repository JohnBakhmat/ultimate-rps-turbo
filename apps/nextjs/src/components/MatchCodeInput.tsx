import { useState } from "react";

export const MatchCodeInput = ({
  isLocked,
  publicId,
  setPublicId,
}: {
  isLocked: boolean;
  publicId: string;
  setPublicId: (publicId: string) => void;
}) => {
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const handleClick = () => {
    if (isLocked) {
      void navigator.clipboard.writeText(publicId);
      setIsCopied(true);

      setTimeout(() => {
        setIsCopied(false);
      }, 1000);
    }
  };

  return (
    <div
      className={`relative grid
      place-items-center rounded-md  p-1 text-2xl font-bold 
      ${
        isCopied
          ? "bg-green-500 shadow-[0_0_40px_1px_#22C55E]"
          : "bg-gradient-to-br from-pink-500 to-purple-600 shadow-[0_0_40px_1px_#ec4899]"
      }
       text-white 
       transition-colors duration-100
          ease-in-out`}
      onClick={() => void handleClick()}
    >
      <input
        disabled={isLocked}
        className={`absolute inset-1 overflow-hidden rounded-md bg-black px-1 text-center 
          text-2xl font-bold uppercase text-white
          shadow-[0_0_40px_1px_#ec4899] outline-none
          transition-colors duration-100
          ease-in-out 
          disabled:cursor-pointer disabled:hover:bg-white disabled:hover:text-black
          
          `}
        type="text"
        maxLength={6}
        autoCapitalize="characters"
        value={publicId}
        onChange={(e) => setPublicId(e.target.value)}
      />
    </div>
  );
};
