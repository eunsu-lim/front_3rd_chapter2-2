import { ChangeEvent, useState } from "react";
import { describe, expect, it, test } from "vitest";
import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
  within,
} from "@testing-library/react";
import { CartPage } from "../../refactoring/components/CartPage";
import { AdminPage } from "../../refactoring/components/AdminPage";
import { CartItem, Coupon, Product } from "../../types";
import {
  calculateCartTotal,
  calculateItemTotal,
  getMaxApplicableDiscount,
  getRemainingStock,
  updateCartItemQuantity,
} from "../../refactoring/utils/cartUtils";
import { useAccordion } from "../../refactoring/hooks/Admin/useAccordion";
import { useForm } from "../../refactoring/hooks/Admin/useForm";

const mockProducts: Product[] = [
  {
    id: "p1",
    name: "상품1",
    price: 10000,
    stock: 20,
    discounts: [{ quantity: 10, rate: 0.1 }],
  },
  {
    id: "p2",
    name: "상품2",
    price: 20000,
    stock: 20,
    discounts: [{ quantity: 10, rate: 0.15 }],
  },
  {
    id: "p3",
    name: "상품3",
    price: 30000,
    stock: 20,
    discounts: [{ quantity: 10, rate: 0.2 }],
  },
];
const mockCoupons: Coupon[] = [
  {
    name: "5000원 할인 쿠폰",
    code: "AMOUNT5000",
    discountType: "amount",
    discountValue: 5000,
  },
  {
    name: "10% 할인 쿠폰",
    code: "PERCENT10",
    discountType: "percentage",
    discountValue: 10,
  },
];

const TestAdminPage = () => {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [coupons, setCoupons] = useState<Coupon[]>(mockCoupons);

  const handleProductUpdate = (updatedProduct: Product) => {
    setProducts((prevProducts) =>
      prevProducts.map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
    );
  };

  const handleProductAdd = (newProduct: Product) => {
    setProducts((prevProducts) => [...prevProducts, newProduct]);
  };

  const handleCouponAdd = (newCoupon: Coupon) => {
    setCoupons((prevCoupons) => [...prevCoupons, newCoupon]);
  };

  return (
    <AdminPage
      products={products}
      coupons={coupons}
      onProductUpdate={handleProductUpdate}
      onProductAdd={handleProductAdd}
      onCouponAdd={handleCouponAdd}
    />
  );
};

describe("advanced > ", () => {
  describe("시나리오 테스트 > ", () => {
    test("장바구니 페이지 테스트 > ", async () => {
      render(<CartPage products={mockProducts} coupons={mockCoupons} />);
      const product1 = screen.getByTestId("product-p1");
      const product2 = screen.getByTestId("product-p2");
      const product3 = screen.getByTestId("product-p3");
      const addToCartButtonsAtProduct1 =
        within(product1).getByText("장바구니에 추가");
      const addToCartButtonsAtProduct2 =
        within(product2).getByText("장바구니에 추가");
      const addToCartButtonsAtProduct3 =
        within(product3).getByText("장바구니에 추가");

      // 1. 상품 정보 표시
      expect(product1).toHaveTextContent("상품1");
      expect(product1).toHaveTextContent("10,000원");
      expect(product1).toHaveTextContent("재고: 20개");
      expect(product2).toHaveTextContent("상품2");
      expect(product2).toHaveTextContent("20,000원");
      expect(product2).toHaveTextContent("재고: 20개");
      expect(product3).toHaveTextContent("상품3");
      expect(product3).toHaveTextContent("30,000원");
      expect(product3).toHaveTextContent("재고: 20개");

      // 2. 할인 정보 표시
      expect(screen.getByText("10개 이상: 10% 할인")).toBeInTheDocument();

      // 3. 상품1 장바구니에 상품 추가
      fireEvent.click(addToCartButtonsAtProduct1); // 상품1 추가

      // 4. 할인율 계산
      expect(screen.getByText("상품 금액: 10,000원")).toBeInTheDocument();
      expect(screen.getByText("할인 금액: 0원")).toBeInTheDocument();
      expect(screen.getByText("최종 결제 금액: 10,000원")).toBeInTheDocument();

      // 5. 상품 품절 상태로 만들기
      for (let i = 0; i < 19; i++) {
        fireEvent.click(addToCartButtonsAtProduct1);
      }

      // 6. 품절일 때 상품 추가 안 되는지 확인하기
      expect(product1).toHaveTextContent("재고: 0개");
      fireEvent.click(addToCartButtonsAtProduct1);
      expect(product1).toHaveTextContent("재고: 0개");

      // 7. 할인율 계산
      expect(screen.getByText("상품 금액: 200,000원")).toBeInTheDocument();
      expect(screen.getByText("할인 금액: 20,000원")).toBeInTheDocument();
      expect(screen.getByText("최종 결제 금액: 180,000원")).toBeInTheDocument();

      // 8. 상품을 각각 10개씩 추가하기
      fireEvent.click(addToCartButtonsAtProduct2); // 상품2 추가
      fireEvent.click(addToCartButtonsAtProduct3); // 상품3 추가

      const increaseButtons = screen.getAllByText("+");
      for (let i = 0; i < 9; i++) {
        fireEvent.click(increaseButtons[1]); // 상품2
        fireEvent.click(increaseButtons[2]); // 상품3
      }

      // 9. 할인율 계산
      expect(screen.getByText("상품 금액: 700,000원")).toBeInTheDocument();
      expect(screen.getByText("할인 금액: 110,000원")).toBeInTheDocument();
      expect(screen.getByText("최종 결제 금액: 590,000원")).toBeInTheDocument();

      // 10. 쿠폰 적용하기
      const couponSelect = screen.getByRole("combobox");
      fireEvent.change(couponSelect, { target: { value: "1" } }); // 10% 할인 쿠폰 선택

      // 11. 할인율 계산
      expect(screen.getByText("상품 금액: 700,000원")).toBeInTheDocument();
      expect(screen.getByText("할인 금액: 169,000원")).toBeInTheDocument();
      expect(screen.getByText("최종 결제 금액: 531,000원")).toBeInTheDocument();

      // 12. 다른 할인 쿠폰 적용하기
      fireEvent.change(couponSelect, { target: { value: "0" } }); // 5000원 할인 쿠폰
      expect(screen.getByText("상품 금액: 700,000원")).toBeInTheDocument();
      expect(screen.getByText("할인 금액: 115,000원")).toBeInTheDocument();
      expect(screen.getByText("최종 결제 금액: 585,000원")).toBeInTheDocument();
    });

    test("관리자 페이지 테스트 > ", async () => {
      render(<TestAdminPage />);

      const $product1 = screen.getByTestId("product-1");

      // 1. 새로운 상품 추가
      fireEvent.click(screen.getByText("새 상품 추가"));

      fireEvent.change(screen.getByLabelText("상품명"), {
        target: { value: "상품4" },
      });
      fireEvent.change(screen.getByLabelText("가격"), {
        target: { value: "15000" },
      });
      fireEvent.change(screen.getByLabelText("재고"), {
        target: { value: "30" },
      });

      fireEvent.click(screen.getByText("추가"));

      const $product4 = screen.getByTestId("product-4");

      expect($product4).toHaveTextContent("상품4");
      expect($product4).toHaveTextContent("15000원");
      expect($product4).toHaveTextContent("재고: 30");

      // 2. 상품 선택 및 수정
      fireEvent.click($product1);
      fireEvent.click(within($product1).getByTestId("toggle-button"));
      fireEvent.click(within($product1).getByTestId("modify-button"));

      act(() => {
        fireEvent.change(within($product1).getByDisplayValue("20"), {
          target: { value: "25" },
        });
        fireEvent.change(within($product1).getByDisplayValue("10000"), {
          target: { value: "12000" },
        });
        fireEvent.change(within($product1).getByDisplayValue("상품1"), {
          target: { value: "수정된 상품1" },
        });
      });

      fireEvent.click(within($product1).getByText("수정 완료"));

      expect($product1).toHaveTextContent("수정된 상품1");
      expect($product1).toHaveTextContent("12000원");
      expect($product1).toHaveTextContent("재고: 25");

      // 3. 상품 할인율 추가 및 삭제
      fireEvent.click($product1);
      fireEvent.click(within($product1).getByTestId("modify-button"));

      // 할인 추가
      act(() => {
        fireEvent.change(screen.getByPlaceholderText("수량"), {
          target: { value: "5" },
        });
        fireEvent.change(screen.getByPlaceholderText("할인율 (%)"), {
          target: { value: "5" },
        });
      });
      fireEvent.click(screen.getByText("할인 추가"));

      expect(
        screen.queryByText("5개 이상 구매 시 5% 할인")
      ).toBeInTheDocument();

      // 할인 삭제
      fireEvent.click(screen.getAllByText("삭제")[0]);
      expect(
        screen.queryByText("10개 이상 구매 시 10% 할인")
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText("5개 이상 구매 시 5% 할인")
      ).toBeInTheDocument();

      fireEvent.click(screen.getAllByText("삭제")[0]);
      expect(
        screen.queryByText("10개 이상 구매 시 10% 할인")
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText("5개 이상 구매 시 5% 할인")
      ).not.toBeInTheDocument();

      // 4. 쿠폰 추가
      fireEvent.change(screen.getByPlaceholderText("쿠폰 이름"), {
        target: { value: "새 쿠폰" },
      });
      fireEvent.change(screen.getByPlaceholderText("쿠폰 코드"), {
        target: { value: "NEW10" },
      });
      fireEvent.change(screen.getByRole("combobox"), {
        target: { value: "percentage" },
      });
      fireEvent.change(screen.getByPlaceholderText("할인 값"), {
        target: { value: "10" },
      });

      fireEvent.click(screen.getByText("쿠폰 추가"));

      const $newCoupon = screen.getByTestId("coupon-3");

      expect($newCoupon).toHaveTextContent("새 쿠폰 (NEW10):10% 할인");
    });
  });

  // 유틸함수
  describe("Cart Utilities", () => {
    const product: Product = {
      id: "p1",
      name: "Product 1",
      price: 100,
      stock: 10,
      discounts: [
        { quantity: 1, rate: 0.1 },
        { quantity: 5, rate: 0.2 },
      ],
    };

    const cartItem: CartItem = {
      product,
      quantity: 5,
    };

    const couponAmount: Coupon = {
      name: "c1",
      code: "c1",
      discountType: "amount",
      discountValue: 20,
    };

    const couponPercentage: Coupon = {
      name: "c2",
      code: "c2",
      discountType: "percentage",
      discountValue: 10,
    };

    describe("calculateItemTotal", () => {
      it("should calculate total for item with applicable discount", () => {
        const total = calculateItemTotal(cartItem);
        expect(total).toBe(400);
      });
    });

    describe("getMaxApplicableDiscount", () => {
      it("should return the maximum discount applicable based on quantity", () => {
        const discount = getMaxApplicableDiscount(cartItem);
        expect(discount).toBe(0.2);
      });

      it("should return 0 if no discounts are applicable", () => {
        const noDiscountItem: CartItem = {
          product: { ...product, discounts: [] },
          quantity: 1,
        };
        const discount = getMaxApplicableDiscount(noDiscountItem);
        expect(discount).toBe(0);
      });
    });

    describe("calculateCartTotal", () => {
      it("should calculate the cart total without a coupon", () => {
        const cart = [cartItem];
        const total = calculateCartTotal(cart, null);

        expect(total.totalBeforeDiscount).toBe(500);
        expect(total.totalAfterDiscount).toBe(400);
        expect(total.totalDiscount).toBe(100);
      });

      it("should apply an amount coupon to the cart", () => {
        const cart = [cartItem];
        const total = calculateCartTotal(cart, couponAmount);

        expect(total.totalBeforeDiscount).toBe(500);
        expect(total.totalAfterDiscount).toBe(380);
        expect(total.totalDiscount).toBe(120);
      });

      it("should apply a percentage coupon to the cart", () => {
        const cart = [cartItem];
        const total = calculateCartTotal(cart, couponPercentage);

        expect(total.totalBeforeDiscount).toBe(500);
        expect(total.totalAfterDiscount).toBe(360);
        expect(total.totalDiscount).toBe(140);
      });
    });

    describe("updateCartItemQuantity", () => {
      it("should update the quantity of an item in the cart", () => {
        const cart = [cartItem];
        const updatedCart = updateCartItemQuantity(cart, "p1", 7);

        expect(updatedCart[0].quantity).toBe(7);
      });

      it("should not update if new quantity exceeds stock", () => {
        const cart = [cartItem];
        const updatedCart = updateCartItemQuantity(cart, "p1", 20);

        expect(updatedCart[0].quantity).toBe(10);
      });

      it("should remove item if new quantity is 0", () => {
        const cart = [cartItem];
        const updatedCart = updateCartItemQuantity(cart, "p1", 0);

        expect(updatedCart.length).toBe(0);
      });
    });

    describe("getRemainingStock", () => {
      it("should return remaining stock after accounting for items in the cart", () => {
        const cart = [cartItem];
        const remainingStock = getRemainingStock(product, cart);

        expect(remainingStock).toBe(5);
      });

      it("should return full stock if product is not in the cart", () => {
        const cart: CartItem[] = [];
        const remainingStock = getRemainingStock(product, cart);

        expect(remainingStock).toBe(10);
      });
    });
  });

  describe("useForm hook", () => {
    const initialState = {
      name: "",
      price: 0,
      stock: 0,
      discountValue: 0,
      discountType: "amount",
      rate: "",
    };

    it("should initialize with the provided initial state", () => {
      const { result } = renderHook(() => useForm(initialState));

      expect(result.current.inputState).toEqual(initialState);
    });

    it("should handle input change correctly", () => {
      const { result } = renderHook(() => useForm(initialState));

      const mockEvent = {
        target: { name: "name", value: "Test Product" },
      } as ChangeEvent<HTMLInputElement>;

      act(() => {
        result.current.onChange(mockEvent);
      });

      expect(result.current.inputState.name).toBe("Test Product");
    });

    it("should parse numeric input values correctly", () => {
      const { result } = renderHook(() => useForm(initialState));

      const mockPriceEvent = {
        target: { name: "price", value: "150" },
      } as ChangeEvent<HTMLInputElement>;

      act(() => {
        result.current.onChange(mockPriceEvent);
      });

      expect(result.current.inputState.price).toBe(150);
    });

    it("should handle rate as percentage and parse it correctly", () => {
      const { result } = renderHook(() => useForm(initialState));

      const mockRateEvent = {
        target: { name: "rate", value: "25" },
      } as ChangeEvent<HTMLInputElement>;

      act(() => {
        result.current.onChange(mockRateEvent);
      });

      expect(result.current.inputState.rate).toBe(0.25); // Parsed as percentage
    });

    it("should handle select change correctly", () => {
      const { result } = renderHook(() => useForm(initialState));

      const mockSelectEvent = {
        target: { name: "discountType", value: "percentage" },
      } as ChangeEvent<HTMLSelectElement>;

      act(() => {
        result.current.onSelect(mockSelectEvent);
      });

      expect(result.current.inputState.discountType).toBe("percentage");
    });

    it("should reset the form to initial state", () => {
      const { result } = renderHook(() => useForm(initialState));

      const mockEvent = {
        target: { name: "name", value: "Changed Name" },
      } as ChangeEvent<HTMLInputElement>;

      act(() => {
        result.current.onChange(mockEvent);
      });

      expect(result.current.inputState.name).toBe("Changed Name");

      // Reset the state
      act(() => {
        result.current.onReset();
      });

      expect(result.current.inputState).toEqual(initialState);
    });
  });
});
