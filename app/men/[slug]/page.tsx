import { notFound } from "next/navigation";
import { models, getModelBySlug, getModelsByCategory } from "@/data/models";
import { ModelProfile } from "@/components/model-profile";

export async function generateStaticParams() {
  return getModelsByCategory("men").map((m) => ({ slug: m.slug }));
}

export default async function MenModelPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const model = getModelBySlug(slug);
  if (!model || model.category !== "men") notFound();

  return <ModelProfile model={model} />;
}
