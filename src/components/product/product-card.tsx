import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Package } from "lucide-react";

interface ProductCardProps {
  product: {
    id: string;
    title: string;
    slug: string;
    price: number;
    cover_image: string | null;
    rating_score?: number | null;
    rating_count: number;
    profiles?: {
      display_name: string | null;
    } | null;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const creatorName = product.profiles?.display_name || "创作者";

  return (
    <Link href={`/product/${product.slug}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1 h-full">
        <div className="aspect-square relative bg-muted">
          {product.cover_image ? (
            <Image
              src={product.cover_image}
              alt={product.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <Package className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold truncate">{product.title}</h3>
          <p className="text-sm text-muted-foreground truncate">{creatorName}</p>
          <div className="flex items-center justify-between mt-3">
            <span className="font-bold text-lg">¥{product.price}</span>
            {product.rating_count > 0 && (
              <div className="flex items-center gap-1 text-sm">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span>{(product.rating_score || 0).toFixed(1)}</span>
                <span className="text-muted-foreground">
                  ({product.rating_count})
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
