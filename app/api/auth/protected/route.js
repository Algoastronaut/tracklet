import { verifyToken } from "../../../../lib/auth";

export async function GET(req) {
  const authHeader = req.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer "))
    return Response.json({ msg: "No token provided" }, { status: 403 });

  const token = authHeader.split(" ")[1];
  const decoded = verifyToken(token);

  if (!decoded)
    return Response.json({ msg: "Invalid or expired token" }, { status: 401 });

  return Response.json({ msg: `Welcome ${decoded.username}` });
}
