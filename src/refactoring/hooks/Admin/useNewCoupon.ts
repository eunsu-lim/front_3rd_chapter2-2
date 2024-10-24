import { Coupon } from "../../../types";
import { useForm } from "./useForm";

const initialNewCoupon: Omit<Coupon, "id"> = {
  name: "",
  code: "",
  discountType: "percentage",
  discountValue: 0,
};

export const useNewCoupon = (onCouponAdd: (coupon: Coupon) => void) => {
  const {
    inputState: newCoupon,
    onChange: handleCouponChange,
    onSelect: handleCouponSelect,
    onReset: resetNewCoupon,
  } = useForm<Omit<Coupon, "id">>(initialNewCoupon);

  const handleAddCoupon = () => {
    onCouponAdd(newCoupon);
    resetNewCoupon();
  };

  return {
    newCoupon,
    handleCouponChange,
    handleCouponSelect,
    addNewCoupon: handleAddCoupon,
  };
};
