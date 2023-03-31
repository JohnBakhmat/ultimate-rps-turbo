import { useEffect, useState, type FC } from "react";

type Props = {
  isStarting: boolean;
  duration: number;
  onCountdownEnded: () => void;
};

export const LobbyCountdown: FC<Props> = ({
  isStarting,
  duration,
  onCountdownEnded,
}) => {
  const [counter, setCounter] = useState(duration);

  useEffect(() => {
    if (!isStarting) return () => {};

    let timer: NodeJS.Timeout;
    if (counter > 0) {
      timer = setTimeout(() => setCounter((p) => p - 1), 1000);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [counter, isStarting]);

  useEffect(() => {
    if (counter === 0) {
      onCountdownEnded();
    }
  }, [counter, onCountdownEnded]);

  return (
    <div
      className={`font-mono text-9xl font-bold ${
        isStarting ? "text-white" : "text-transparent"
      }`}
    >
      {counter}
    </div>
  );
};
