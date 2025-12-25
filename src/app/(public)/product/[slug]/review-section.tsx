"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Star, User, Loader2, MessageSquare } from "lucide-react";
import { submitReview } from "./actions";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  profiles: {
    display_name: string | null;
    avatar_url: string | null;
  } | null;
}

interface ReviewSectionProps {
  productId: string;
  reviews: Review[];
  canReview: boolean;
  isLoggedIn: boolean;
}

export function ReviewSection({
  productId,
  reviews,
  canReview,
  isLoggedIn,
}: ReviewSectionProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [hoveredRating, setHoveredRating] = useState(0);

  const handleSubmitReview = async () => {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }

    setIsSubmitting(true);

    const result = await submitReview(productId, rating, comment);

    if (result.error) {
      toast({
        variant: "destructive",
        title: "提交失败",
        description: result.error,
      });
    } else {
      toast({
        title: "评价成功",
        description: "感谢您的评价！",
      });
      setComment("");
      setRating(5);
      router.refresh();
    }

    setIsSubmitting(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          用户评价 ({reviews.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Submit Review Form */}
        {canReview && (
          <div className="rounded-lg border p-4 space-y-4">
            <h4 className="font-medium">发表评价</h4>

            {/* Star Rating */}
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="p-1"
                >
                  <Star
                    className={`h-6 w-6 transition-colors ${
                      star <= (hoveredRating || rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground"
                    }`}
                  />
                </button>
              ))}
              <span className="ml-2 text-sm text-muted-foreground">
                {rating} 分
              </span>
            </div>

            {/* Comment */}
            <Textarea
              placeholder="分享您对这个作品的看法（可选）"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
            />

            <Button
              onClick={handleSubmitReview}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  提交中...
                </>
              ) : (
                "提交评价"
              )}
            </Button>
          </div>
        )}

        {!canReview && !isLoggedIn && (
          <p className="text-sm text-muted-foreground">
            请<a href="/login" className="text-primary hover:underline">登录</a>后购买作品才能发表评价
          </p>
        )}

        {/* Reviews List */}
        {reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="flex gap-4">
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                  {review.profiles?.avatar_url ? (
                    <Image
                      src={review.profiles.avatar_url}
                      alt={review.profiles.display_name || "用户"}
                      width={40}
                      height={40}
                      className="object-cover"
                    />
                  ) : (
                    <User className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {review.profiles?.display_name || "匿名用户"}
                    </span>
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${
                            star <= review.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-muted-foreground"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(review.created_at).toLocaleDateString("zh-CN")}
                    </span>
                  </div>
                  {review.comment && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {review.comment}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">
            暂无评价，成为第一个评价的用户吧！
          </p>
        )}
      </CardContent>
    </Card>
  );
}
