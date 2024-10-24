import { useState } from "react";
import { Discount, Product } from "../../../types";
import { useForm } from "./useForm";

const initialNewDiscount: Discount = {
  quantity: 0,
  rate: 0,
};

export const useProductList = (
  initialProducts: Product[],
  onProductUpdate: (product: Product) => void
) => {
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const { inputState: newDiscount, onChange: handleDiscountChange } =
    useForm<Discount>(initialNewDiscount);

  const handleEditProduct = (product: Product) => {
    setEditingProduct({ ...product });
  };

  const handleProductNameUpdate = (productId: string, newName: string) => {
    if (editingProduct && editingProduct.id === productId) {
      const updatedProduct = { ...editingProduct, name: newName };
      setEditingProduct(updatedProduct);
    }
  };

  const handlePriceUpdate = (productId: string, newPrice: number) => {
    if (editingProduct && editingProduct.id === productId) {
      const updatedProduct = { ...editingProduct, price: newPrice };
      setEditingProduct(updatedProduct);
    }
  };

  const handleStockUpdate = (productId: string, newStock: number) => {
    const updatedProduct = initialProducts.find((p) => p.id === productId);
    if (updatedProduct) {
      const newProduct = { ...updatedProduct, stock: newStock };
      onProductUpdate(newProduct);
      setEditingProduct(newProduct);
    }
  };

  const handleEditComplete = () => {
    if (editingProduct) {
      onProductUpdate(editingProduct);
      setEditingProduct(null);
    }
  };

  return {
    editingProduct,
    newDiscount,
    handleEditProduct,
    handleProductNameUpdate,
    handlePriceUpdate,
    handleStockUpdate,
    handleEditComplete,
    handleDiscountChange,
  };
};
