import { Coupon } from "../../../types";
import { useNewCoupon } from "../../hooks/Admin/useNewCoupon";

interface CouponFormProps {
  onCouponAdd: (newCoupon: Coupon) => void;
}

export default function CouponForm({ onCouponAdd }: CouponFormProps) {
  const { newCoupon, handleCouponChange, handleCouponSelect, addNewCoupon } =
    useNewCoupon(onCouponAdd);

  return (
    <div className="space-y-2 mb-4">
      <input
        type="text"
        placeholder="쿠폰 이름"
        name="name"
        value={newCoupon.name}
        onChange={handleCouponChange}
        className="w-full p-2 border rounded"
      />
      <input
        type="text"
        placeholder="쿠폰 코드"
        name="code"
        value={newCoupon.code}
        onChange={handleCouponChange}
        className="w-full p-2 border rounded"
      />
      <div className="flex gap-2">
        <select
          value={newCoupon.discountType}
          name="discountType"
          onChange={handleCouponSelect}
          className="w-full p-2 border rounded"
        >
          <option value="amount">금액(원)</option>
          <option value="percentage">할인율(%)</option>
        </select>
        <input
          type="number"
          placeholder="할인 값"
          name="discountValue"
          value={newCoupon.discountValue}
          onChange={handleCouponChange}
          className="w-full p-2 border rounded"
        />
      </div>
      <button
        onClick={addNewCoupon}
        className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600"
      >
        쿠폰 추가
      </button>
    </div>
  );
}
