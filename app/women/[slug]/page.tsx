import { notFound } from "next/navigation";
import { models, getModelBySlug, getModelsByCategory } from "@/data/models";
import { ModelProfile } from "@/components/model-profile";

export async function generateStaticParams() {
  return getModelsByCategory("women").map((m) => ({ slug: m.slug }));
}

export default async function WomenModelPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const model = getModelBySlug(slug);
  if (!model || model.category !== "women") notFound();

  return <ModelProfile model={model} />;
}
