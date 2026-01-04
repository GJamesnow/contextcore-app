"use server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function createAnalysis(formData: FormData) {
  const address = formData.get("address") as string;
  if (!address) return;

  // Create initial record; price 0 triggers simulation later
  const analysis = await prisma.analysis.create({
    data: { address: address, city: "Searching...", purchasePrice: 0 }
  });
  redirect(`/analysis/${analysis.id}`);
}