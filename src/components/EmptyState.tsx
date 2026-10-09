import type { ComponentType, SVGProps } from "react";
import { BrandIcon, type BrandIconName } from "@/components/BrandIcon";

export function EmptyState({
  icon: Icon,
  brandIcon,
  title,
  description,
  action,
}: {
  icon?: ComponentType<SVGProps<SVGSVGElement>>;
  brandIcon?: BrandIconName;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center">
      {brandIcon ? (
        <BrandIcon name={brandIcon} className="h-16 w-auto" />
      ) : Icon ? (
        <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-mindora-lilac-light to-mindora-lilac">
          <Icon className="h-8 w-8 text-mindora-purple-dark" />
        </span>
      ) : null}
      <h3 className="mt-4 text-sm font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
