import bcrypt from "bcryptjs";
import prisma from "../../../../lib/prisma";

export async function POST(req) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return Response.json({ msg: "Username and password required" }, { status: 400 });
    }

    // Check if user already exists
    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing) {
      return Response.json({ msg: "User already exists" }, { status: 400 });
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    // Save to DB
    await prisma.user.create({
      data: { username, password: hashed },
    });

    return Response.json({ msg: "User registered successfully" }, { status: 201 });
  } catch (err) {
    console.error("Signup error:", err);
    return Response.json({ msg: "Internal server error" }, { status: 500 });
  }
}
