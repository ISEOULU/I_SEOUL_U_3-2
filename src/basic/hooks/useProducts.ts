// TODO: 상품 관리 Hook
// 힌트:
// 1. 상품 목록 상태 관리 (localStorage 연동 고려)
// 2. 상품 CRUD 작업
// 3. 재고 업데이트
// 4. 할인 규칙 추가/삭제
//
// 반환할 값:
// - products: 상품 배열 // OK
// - updateProduct: 상품 정보 수정
// - addProduct: 새 상품 추가
// - updateProductStock: 재고 수정 // OK
// - addProductDiscount: 할인 규칙 추가
// - removeProductDiscount: 할인 규칙 삭제

import { useCallback, useState } from "react";
import { AddNotification, ProductWithUI } from "../../types";
import { initialProducts } from "../constants/constants";

export function useProducts() {
  const [products, setProducts] = useState<ProductWithUI[]>(() => {
    const saved = localStorage.getItem('products');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return initialProducts;
      }
    }
    return initialProducts;
  });

  const addProduct = useCallback((newProduct: Omit<ProductWithUI, 'id'>, addNotification: AddNotification) => {
    const product: ProductWithUI = {
      ...newProduct,
      id: `p${Date.now()}`
    };
    setProducts(prev => [...prev, product]);
    addNotification('상품이 추가되었습니다.', 'success');
  }, []); // addNotification 는 App에서 전달받는 함수이므로 의존성 배열에 포함시키지 않음

  // const updateProductStock = useCallback((productId: string, newStock: number) => {
    // setProducts(prev =>
    //   prev.map(product =>
    //     product.id === productId ? { ...product, stock: newStock } : product
    //   )
    // );
  // }, []);

  return {
    products,
     addProduct,
    //  updateProductStock,
     setProducts
  }
}