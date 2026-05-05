import { notFound } from "next/navigation";
import { getModelBySlug, getModelsByCategory } from "@/data/models";
import { ModelProfile } from "@/components/model-profile";

export async function generateStaticParams() {
  return getModelsByCategory("development").map((m) => ({ slug: m.slug }));
}

export default async function DevelopmentModelPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const model = getModelBySlug(slug);
  if (!model || model.category !== "development") notFound();

  return <ModelProfile model={model} />;
}
