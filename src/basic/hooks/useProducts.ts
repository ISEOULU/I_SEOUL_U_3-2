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

import { useCallback, useEffect, useState } from 'react';
import { ActionResult, ProductWithUI } from '../../types';
import { initialProducts } from '../constants/constants';
import { useLocalStorage } from './useLocalStorage';

export type ProductActions = ReturnType<typeof useProducts>;

export function useProducts() {
  const { getLocalStorageItem, setLocalStorageItem } = useLocalStorage();
  const [products, setProducts] = useState<ProductWithUI[]>(() => {
    const saved = getLocalStorageItem('products');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return initialProducts;
      }
    }
    return initialProducts;
  });

  useEffect(() => {
    setLocalStorageItem('products', products);
  }, [products]);

  const updateProduct = useCallback(
    (productId: string, updates: Partial<ProductWithUI>) => {
      setProducts((prev) =>
        prev.map((product) =>
          product.id === productId ? { ...product, ...updates } : product,
        ),
      );
      return { success: true, message: '상품이 수정되었습니다.' };
    },
    [],
  );

  const addProduct = useCallback(
    (newProduct: Omit<ProductWithUI, 'id'>): ActionResult => {
      const product: ProductWithUI = {
        ...newProduct,
        id: `p${Date.now()}`,
      };
      setProducts((prev) => [...prev, product]);
      return { success: true, message: '상품이 추가되었습니다.' };
    },
    [],
  );

  const deleteProduct = useCallback((productId: string): ActionResult => {
    setProducts((prev) => prev.filter((product) => product.id !== productId));
    return { success: true, message: '상품이 삭제되었습니다.' };
  }, []);

  return {
    products,
    updateProduct,
    addProduct,
    deleteProduct,
  };
}
