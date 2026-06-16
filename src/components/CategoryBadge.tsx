import { Category } from "@/types";

const CATEGORY_STYLES: Record<Category, string> = {
  Food: "bg-orange-50 text-orange-600",
  Rent: "bg-violet-50 text-violet-600",
  Bills: "bg-blue-50 text-blue-600",
  Grocery: "bg-emerald-50 text-emerald-600",
  Transport: "bg-amber-50 text-amber-600",
  Other: "bg-slate-100 text-slate-600",
};

export default function CategoryBadge({ category }: { category: Category }) {
  return (
    <span
      className={`text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap ${CATEGORY_STYLES[category]}`}
    >
      {category}
    </span>
  );
}
