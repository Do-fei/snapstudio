"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function purchaseProduct(productId: string) {
  const supabase = createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "请先登录" };
  }

  // Get product details
  const { data: product } = await supabase
    .from("products")
    .select("id, price, creator_id, slug")
    .eq("id", productId)
    .eq("status", "approved")
    .single();

  if (!product) {
    return { error: "作品不存在或已下架" };
  }

  // Check if already purchased
  const { data: existingPurchase } = await supabase
    .from("user_purchases")
    .select("id")
    .eq("user_id", user.id)
    .eq("product_id", productId)
    .single();

  if (existingPurchase) {
    return { error: "您已购买过此作品" };
  }

  // Cannot purchase own product
  if (product.creator_id === user.id) {
    return { error: "不能购买自己的作品" };
  }

  // Calculate amounts
  const amount = Number(product.price);
  const platformFee = amount * 0.1; // 10% platform fee
  const creatorAmount = amount * 0.9; // 90% to creator

  // Create transaction
  const { data: transaction, error: transactionError } = await supabase
    .from("transactions")
    .insert({
      product_id: productId,
      buyer_id: user.id,
      amount: amount,
      platform_fee: platformFee,
      creator_amount: creatorAmount,
      status: "completed", // In real app, this would be "pending" until payment confirmed
    })
    .select("id")
    .single();

  if (transactionError) {
    return { error: "创建交易失败: " + transactionError.message };
  }

  // Create user purchase record
  const { error: purchaseError } = await supabase
    .from("user_purchases")
    .insert({
      user_id: user.id,
      product_id: productId,
      transaction_id: transaction.id,
    });

  if (purchaseError) {
    return { error: "记录购买失败: " + purchaseError.message };
  }

  // Get splits for this product
  const { data: splits } = await supabase
    .from("splits")
    .select("collaborator_id, percentage")
    .eq("product_id", productId);

  // Create split payments
  if (splits && splits.length > 0) {
    const splitPayments = splits.map((split) => ({
      transaction_id: transaction.id,
      recipient_id: split.collaborator_id,
      amount: creatorAmount * (split.percentage / 100),
      percentage: split.percentage,
    }));

    await supabase.from("split_payments").insert(splitPayments);
  } else {
    // No splits, all goes to creator
    await supabase.from("split_payments").insert({
      transaction_id: transaction.id,
      recipient_id: product.creator_id,
      amount: creatorAmount,
      percentage: 100,
    });
  }

  revalidatePath(`/product/${product.slug}`);
  revalidatePath("/dashboard/purchases");
  revalidatePath("/dashboard/earnings");

  return { success: true };
}

export async function submitReview(
  productId: string,
  rating: number,
  comment: string
) {
  const supabase = createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "请先登录" };
  }

  // Check if user has purchased this product
  const { data: purchase } = await supabase
    .from("user_purchases")
    .select("id")
    .eq("user_id", user.id)
    .eq("product_id", productId)
    .single();

  if (!purchase) {
    return { error: "请先购买作品后再评价" };
  }

  // Check if user has already reviewed
  const { data: existingReview } = await supabase
    .from("reviews")
    .select("id")
    .eq("user_id", user.id)
    .eq("product_id", productId)
    .single();

  if (existingReview) {
    return { error: "您已评价过此作品" };
  }

  // Validate rating
  if (rating < 1 || rating > 5) {
    return { error: "评分必须在 1-5 之间" };
  }

  // Create review
  const { error } = await supabase.from("reviews").insert({
    product_id: productId,
    user_id: user.id,
    rating,
    comment: comment.trim() || null,
  });

  if (error) {
    return { error: "提交评价失败: " + error.message };
  }

  // Get product slug for revalidation
  const { data: product } = await supabase
    .from("products")
    .select("slug")
    .eq("id", productId)
    .single();

  if (product) {
    revalidatePath(`/product/${product.slug}`);
  }

  return { success: true };
}
