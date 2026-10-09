import Image from "next/image";

const ICONS = {
  avaliacao: { src: "/icons/avaliacao.png", width: 227, height: 169 },
  feedback: { src: "/icons/feedback.png", width: 227, height: 166 },
  desenvolvimento: { src: "/icons/desenvolvimento.png", width: 225, height: 169 },
  equipe: { src: "/icons/equipe.png", width: 240, height: 169 },
  organizacao: { src: "/icons/organizacao.png", width: 229, height: 165 },
  inteligencia: { src: "/icons/inteligencia.png", width: 229, height: 166 },
  metas: { src: "/icons/metas.png", width: 233, height: 169 },
  resultados: { src: "/icons/resultados.png", width: 224, height: 169 },
} as const;

export type BrandIconName = keyof typeof ICONS;

export function BrandIcon({
  name,
  className = "h-9 w-auto",
}: {
  name: BrandIconName;
  className?: string;
}) {
  const icon = ICONS[name];
  return <Image src={icon.src} alt="" width={icon.width} height={icon.height} className={className} />;
}
