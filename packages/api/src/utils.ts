const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const LENGTH = 6;
export const getRandomRoomId = (inUse: string[]): string => {
  const id = new Array(LENGTH)
    .fill(0)
    .map(() => characters.charAt(Math.floor(Math.random() * characters.length)))
    .join("");

  if (inUse.includes(id)) {
    return getRandomRoomId(inUse);
  }

  return id;
};
