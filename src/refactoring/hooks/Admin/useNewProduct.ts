import { useState } from "react";
import { Product } from "../../../types";
import { useForm } from "./useForm";

const initialNewProduct: Omit<Product, "id"> = {
  name: "",
  price: 0,
  stock: 0,
  discounts: [],
};

export const useNewProduct = () => {
  const [showNewProductForm, setShowNewProductForm] = useState(false);
  const {
    inputState: newProduct,
    onChange: handleProductChange,
    onReset: resetNewProduct,
  } = useForm<Omit<Product, "id">>(initialNewProduct);

  const addNewProduct = (onProductAdd: (newProduct: Product) => void) => {
    const productWithId = { ...newProduct, id: Date.now().toString() };
    onProductAdd(productWithId);
    resetNewProduct();
  };

  const handleShowForm = () => {
    setShowNewProductForm(!showNewProductForm);
  };

  return {
    newProduct,
    handleProductChange,
    addNewProduct,
    showForm: showNewProductForm,
    onToggleForm: handleShowForm,
  };
};
