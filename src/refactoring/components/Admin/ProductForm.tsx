import { Product } from "../../../types";
import { useNewProduct } from "../../hooks/Admin/useNewProduct";

interface ProductFormProps {
  onProductAdd: (newProduct: Product) => void;
}

export default function ProductForm({ onProductAdd }: ProductFormProps) {
  const {
    newProduct,
    handleProductChange,
    addNewProduct,
    showForm,
    onToggleForm,
  } = useNewProduct();
  return (
    <>
      <button
        onClick={onToggleForm}
        className="bg-green-500 text-white px-4 py-2 rounded mb-4 hover:bg-green-600"
      >
        {showForm ? "취소" : "새 상품 추가"}
      </button>
      {showForm && (
        <div className="bg-white p-4 rounded shadow mb-4">
          <h3 className="text-xl font-semibold mb-2">새 상품 추가</h3>
          <div className="mb-2">
            <label
              htmlFor="productName"
              className="block text-sm font-medium text-gray-700"
            >
              상품명
            </label>
            <input
              id="productName"
              type="text"
              name="name"
              value={newProduct.name}
              onChange={handleProductChange}
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="mb-2">
            <label
              htmlFor="productPrice"
              className="block text-sm font-medium text-gray-700"
            >
              가격
            </label>
            <input
              id="productPrice"
              type="number"
              name="price"
              value={newProduct.price}
              onChange={handleProductChange}
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="mb-2">
            <label
              htmlFor="productStock"
              className="block text-sm font-medium text-gray-700"
            >
              재고
            </label>
            <input
              id="productStock"
              type="number"
              name="stock"
              value={newProduct.stock}
              onChange={handleProductChange}
              className="w-full p-2 border rounded"
            />
          </div>
          <button
            onClick={() => addNewProduct(onProductAdd)}
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            추가
          </button>
        </div>
      )}
    </>
  );
}
