import bcrypt from "bcryptjs";
import prisma from "../../../../lib/prisma";
import { createToken } from "../../../../lib/auth";

export async function POST(req) {
  const data = await req.json();
  const { username, password } = data || {};

  const user = await prisma.user.findUnique({ where: { username } });

  if (!user)
    return Response.json({ msg: "User not found" }, { status: 404 });

  const match = await bcrypt.compare(password, user.password);
  if (!match)
    return Response.json({ msg: "Invalid credentials" }, { status: 401 });

  const token = createToken({ username: user.username });

  return Response.json({ msg: "Login successful", token, username: user.username });
}
