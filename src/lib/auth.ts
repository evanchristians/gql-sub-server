import { sign } from "jsonwebtoken";
import { TOKEN_SECRET, REFRESH_TOKEN_SECRET } from "../constants";
import { User } from "../models/User";

export const auth = (user: User) => {
  const token = sign({ userId: user.id }, TOKEN_SECRET, { expiresIn: "2h" });
  const refreshToken = sign(
    { userId: user.id, count: user.count },
    REFRESH_TOKEN_SECRET,
    {
      expiresIn: "7d",
    }
  );

  return {
    token,
    refreshToken,
  };
};
