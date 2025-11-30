import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const user = await currentUser();

    if (!user) {
      // u API ruti ne radimo redirect, samo vratimo 401
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // user ovde SIGURNO postoji, zato koristimo user.id, ne user?.id
    let userSettings = await prisma.userSettings.findUnique({
      where: {
        userId: user.id,
      },
    });

    if (!userSettings) {
      userSettings = await prisma.userSettings.create({
        data: {
          userId: user.id,
          currency: "RSD",
        },
      });
    }

    revalidatePath("/");

    return NextResponse.json(userSettings);
  } catch (error) {
    console.error("GET /api/user-settings error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
