"use server";

import prisma from "@/lib/prisma";
import {
  CreateTransactionSchema,
  CreateTransactionSchemaType,
} from "@/schema/transaction";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export async function CreateTransaction(form: CreateTransactionSchemaType) {
  const parsedBody = CreateTransactionSchema.safeParse(form);
  if (!parsedBody.success) {
    throw new Error(parsedBody.error.message);
  }

  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  const { amount, category, date, description, type } = parsedBody.data;

  const normalizedDate = date;

  const categoryRow = await prisma.category.findFirst({
    where: {
      userId: user.id,
      name: category,
    },
  });

  if (!categoryRow) {
    throw new Error("category not found");
  }

  await prisma.$transaction([
    prisma.transaction.create({
      data: {
        userId: user.id,
        amount,
        date: normalizedDate,
        description: description || "",
        type,
        category: categoryRow.name,
        categoryIcon: categoryRow.icon,
      },
    }),

    prisma.monthHistory.upsert({
      where: {
        day_month_year_userId: {
          userId: user.id,
          day: normalizedDate.getUTCDate(),
          month: normalizedDate.getUTCMonth(),
          year: normalizedDate.getUTCFullYear(),
        },
      },
      create: {
        userId: user.id,
        day: normalizedDate.getUTCDate(),
        month: normalizedDate.getUTCMonth(),
        year: normalizedDate.getUTCFullYear(),
        expense: type === "rashod" ? amount : 0,
        income: type === "prihod" ? amount : 0,
      },
      update: {
        expense: {
          increment: type === "rashod" ? amount : 0,
        },
        income: {
          increment: type === "prihod" ? amount : 0,
        },
      },
    }),

    prisma.yearHistory.upsert({
      where: {
        month_year_userId: {
          userId: user.id,
          month: normalizedDate.getUTCMonth(),
          year: normalizedDate.getUTCFullYear(),
        },
      },
      create: {
        userId: user.id,
        month: normalizedDate.getUTCMonth(),
        year: normalizedDate.getUTCFullYear(),
        expense: type === "rashod" ? amount : 0,
        income: type === "prihod" ? amount : 0,
      },
      update: {
        expense: {
          increment: type === "rashod" ? amount : 0,
        },
        income: {
          increment: type === "prihod" ? amount : 0,
        },
      },
    }),
  ]);
}
