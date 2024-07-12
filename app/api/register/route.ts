import bcrypt from "bcrypt";
import prisma from "../../libs/Prismadb";
import { NextResponse } from "next/server";

function generateRandomNumbers(count: number): number[] {
  const randomNumbers: number[] = [];
  for (let i = 0; i < count; i++) {
    const randomNumber = Math.floor(Math.random() * 100); // Adjust range as needed
    randomNumbers.push(randomNumber);
  }
  return randomNumbers;
}

// Generate 10 random numbers
const randomNumbers = generateRandomNumbers(10);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, name, password } = body;

    if (!email || !name || !password) {
      return new NextResponse("Missing info", { status: 400 });
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        email,
        id: randomNumbers.toString(),
        name,
        hashedPassword,
      },
    });

    return NextResponse.json(user);
  } catch (error: any) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}
