import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Category } from "@/lib/types";

interface CategoryBadgeProps {
  category: Category;
  showCount?: boolean;
}

export function CategoryBadge({
  category,
  showCount = false,
}: CategoryBadgeProps) {
  return (
    <Link href={`/category/${category.slug}`}>
      <Badge
        variant="outline"
        className="hover:bg-accent transition-colors cursor-pointer"
        style={{ borderColor: category.color }}
      >
        {category.name}
        {showCount && (
          <span className="ml-1 text-muted-foreground">
            ({category.tools_count})
          </span>
        )}
      </Badge>
    </Link>
  );
}

