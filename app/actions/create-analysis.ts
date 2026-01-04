"use server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function createAnalysis(formData: FormData) {
  const address = formData.get("address") as string;
  if (!address) return;

  const analysis = await prisma.analysis.create({
    data: { address, city: "Pending", purchasePrice: 0 }
  });
  redirect(`/analysis/${analysis.id}`);
}