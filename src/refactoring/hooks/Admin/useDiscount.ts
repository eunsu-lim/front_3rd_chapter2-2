import { Discount, Product } from "../../../types";
import { useForm } from "./useForm";

const initialNewDiscount: Discount = {
  quantity: 0,
  rate: 0,
};

export const useDiscount = (
  initialProducts: Product[],
  onProductUpdate: (product: Product) => void,
  setEditingProduct: (product: Product) => void
) => {
  const {
    inputState: newDiscount,
    onChange: handleDiscountChange,
    onReset: resetNewDiscount,
  } = useForm<Discount>(initialNewDiscount);

  const handleAddDiscount = (productId: string) => {
    const updatedProduct = initialProducts.find((p) => p.id === productId);
    if (updatedProduct) {
      const newProduct = {
        ...updatedProduct,
        discounts: [...updatedProduct.discounts, newDiscount],
      };
      onProductUpdate(newProduct);
      setEditingProduct(newProduct);
      resetNewDiscount();
    }
  };

  const handleRemoveDiscount = (productId: string, index: number) => {
    const updatedProduct = initialProducts.find((p) => p.id === productId);
    if (updatedProduct) {
      const newProduct = {
        ...updatedProduct,
        discounts: updatedProduct.discounts.filter((_, i) => i !== index),
      };
      onProductUpdate(newProduct);
      setEditingProduct(newProduct);
    }
  };

  return {
    newDiscount,
    handleDiscountChange,
    handleAddDiscount,
    handleRemoveDiscount,
  };
};
