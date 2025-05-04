import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET as string);

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload;
  } catch (error) {
    throw new Error("Invalid token");
  }
}

export function getUser(req: Request) {
  const userHeader = req.headers.get("x-user");
  if (!userHeader) return null;

  try {
    return JSON.parse(userHeader);
  } catch (error) {
    return null;
  }
}
