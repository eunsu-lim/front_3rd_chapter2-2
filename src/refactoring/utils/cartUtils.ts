import { CartItem, Coupon, Product } from "../../types";

export const calculateItemTotal = (item: CartItem) => {
  const { product, quantity } = item;
  const discountRate = getMaxApplicableDiscount(item);
  const itemTotal = product.price * quantity * (1 - discountRate);
  return itemTotal;
};

export const getMaxApplicableDiscount = (item: CartItem) => {
  const { product, quantity } = item;
  const { discounts } = product;

  const maxDiscount = discounts.reduce((maxDiscount, discount) => {
    return quantity >= discount.quantity
      ? Math.max(maxDiscount, discount.rate)
      : maxDiscount;
  }, 0);

  return maxDiscount;
};

export const calculateCartTotal = (
  cart: CartItem[],
  selectedCoupon: Coupon | null
) => {
  let totalBeforeDiscount = 0;
  let totalAfterDiscount = 0;

  cart.forEach((item) => {
    const { price } = item.product;
    const { quantity } = item;
    totalBeforeDiscount += price * quantity;

    const discount = item.product.discounts.reduce((maxDiscount, d) => {
      return quantity >= d.quantity && d.rate > maxDiscount
        ? d.rate
        : maxDiscount;
    }, 0);

    totalAfterDiscount += price * quantity * (1 - discount);
  });

  let totalDiscount = totalBeforeDiscount - totalAfterDiscount;

  // 쿠폰 적용
  if (selectedCoupon) {
    if (selectedCoupon.discountType === "amount") {
      totalAfterDiscount = Math.max(
        0,
        totalAfterDiscount - selectedCoupon.discountValue
      );
    } else {
      totalAfterDiscount *= 1 - selectedCoupon.discountValue / 100;
    }
    totalDiscount = totalBeforeDiscount - totalAfterDiscount;
  }

  return {
    totalBeforeDiscount: Math.round(totalBeforeDiscount),
    totalAfterDiscount: Math.round(totalAfterDiscount),
    totalDiscount: Math.round(totalDiscount),
  };
};

export const updateCartItemQuantity = (
  cart: CartItem[],
  productId: string,
  newQuantity: number
): CartItem[] => {
  return cart
    .map((item) => {
      if (item.product.id === productId) {
        const maxQuantity = item.product.stock;
        const updatedQuantity = Math.max(0, Math.min(newQuantity, maxQuantity));
        return updatedQuantity > 0
          ? { ...item, quantity: updatedQuantity }
          : null;
      }
      return item;
    })
    .filter((item): item is CartItem => item !== null);
};

export const getRemainingStock = (product: Product, cart: CartItem[]) => {
  const cartItem = cart.find((item) => item.product.id === product.id);
  return product.stock - (cartItem?.quantity || 0);
};
