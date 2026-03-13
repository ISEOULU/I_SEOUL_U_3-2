# 과제 진행 Workflow

## 전체 흐름

```
origin 코드 파악 → basic 리팩토링 → basic 테스트 통과 → advanced 상태관리 적용 → advanced 테스트 통과
```

---

## PHASE 1. origin 코드 파악 (시작 전 필수)

`src/origin/App.tsx` 를 읽고 아래 내용을 파악한다.

- [ ] 어떤 state들이 있는지 목록 정리
- [ ] 비즈니스 로직 함수들이 컴포넌트 안에 어디 있는지 파악
- [ ] JSX 렌더링 단위로 어디를 컴포넌트로 쪼갤 수 있는지 파악
- [ ] localStorage를 어디서 읽고 쓰는지 파악

> origin 코드는 수정하지 않는다. 참고만.

---

## PHASE 2. basic — 계층 분리 리팩토링

작업 위치: `src/basic/`

`src/basic/App.tsx` 는 origin과 동일한 파일로 시작한다.
아래 순서대로 **단계별로 분리하고, 각 단계마다 테스트로 확인**한다.

```bash
pnpm test:basic --watch   # 항상 켜두고 진행
```

---

### STEP 1. 순수 함수 분리 (모델 계층)

> **파일:** `src/basic/models/cart.ts`

App.tsx 안에 인라인으로 작성된 계산 로직을 순수 함수로 추출한다.

구현할 함수:

```
calculateItemTotal(item)               — 아이템 1개의 할인 적용 금액
getMaxApplicableDiscount(item)         — 현재 수량 기준 최대 할인율
calculateCartTotal(cart, coupon)       — { totalBeforeDiscount, totalDiscount, totalAfterDiscount }
updateCartItemQuantity(cart, productId, quantity) — 수량 변경된 새 배열 반환
addItemToCart(cart, product)           — 상품 추가된 새 배열 반환
removeItemFromCart(cart, productId)    — 상품 제거된 새 배열 반환
getRemainingStock(product, cart)       — 남은 재고 수량
```

**원칙:** 외부 상태(useState, localStorage 등) 의존 없음. 파라미터 in → 결과 out.

**완료 체크:**
- [ ] 함수들이 App.tsx의 로직과 동일하게 동작하는지 직접 확인
- [ ] App.tsx에서 해당 함수들로 교체해도 테스트 통과

---

### STEP 2. 유틸리티 훅 분리

> **파일:** `src/basic/utils/hooks/`

App.tsx의 localStorage 처리와 디바운스를 훅으로 추출한다.

**`useLocalStorage<T>(key, initialValue)`**
- localStorage에서 초기값 로드 (JSON.parse, 에러 처리 포함)
- 값 변경 시 localStorage에 자동 저장 (JSON.stringify)
- 빈 배열/undefined는 삭제 처리

**`useDebounce(value, delay)`**
- value가 바뀐 후 delay(ms) 뒤에 반영된 값 반환
- 검색어 디바운스에 사용

**완료 체크:**
- [ ] `useLocalStorage` 로 교체 후 localStorage 동기화 테스트 통과
- [ ] `useDebounce` 로 교체 후 검색 디바운스 테스트 통과

---

### STEP 3. 엔티티 훅 분리

> **파일:** `src/basic/hooks/`

STEP 1~2에서 만든 도구를 조합해서 엔티티별 상태 훅을 만든다.

**`useCart()`**
```
반환: cart, selectedCoupon,
      addToCart, removeFromCart, updateQuantity,
      applyCoupon, calculateTotal, getRemainingStock, clearCart
```
- `useLocalStorage('cart', [])` 로 cart 상태 관리
- 내부적으로 models/cart.ts 함수들 활용

**`useProduct()`**
```
반환: products, addProduct, updateProduct, removeProduct
```
- `useLocalStorage('products', initialProducts)` 로 상태 관리

**`useCoupon(coupons)`**
```
반환: coupons, addCoupon, removeCoupon
```
- 쿠폰 목록 상태 관리

**완료 체크:**
- [ ] App.tsx의 useState들을 훅으로 교체 후 테스트 통과

---

### STEP 4. 컴포넌트 계층 분리

> **파일:** `src/basic/components/`

App.tsx의 JSX를 역할에 따라 분리한다.

**분리 기준:**

| 종류 | 특징 | 예시 |
|------|------|------|
| 엔티티 컴포넌트 | 훅을 직접 호출하거나 엔티티 데이터를 받음 | `CartPage`, `AdminPage`, `ProductCard`, `CartItem` |
| UI 컴포넌트 | 순수 표현, props로만 동작 | `Button`, 아이콘 컴포넌트 |

**권장 분리 순서:**
1. `CartPage` — 장바구니 전체 페이지
2. `AdminPage` — 관리자 페이지 전체
3. `ProductCard` — 상품 목록의 개별 카드
4. `CartItem` — 장바구니 내 개별 아이템
5. 공통 UI 컴포넌트 (버튼, 아이콘 등)

**완료 체크:**
- [ ] `pnpm test:basic` 전체 통과
- [ ] App.tsx가 훅 호출 + 페이지 라우팅만 담당하는 형태가 됨

---

## PHASE 3. advanced — Props Drilling 제거

작업 위치: `src/advanced/`

basic 코드를 복사해서 시작한다. 상태관리 방법 하나를 선택한다.

| 선택지 | 설치 |
|-------|------|
| Context API | 별도 설치 없음 |
| Jotai | `pnpm add jotai` |
| Zustand | `pnpm add zustand` |

```bash
pnpm test:advanced --watch   # 항상 켜두고 진행
```

---

### STEP 5. Props Drilling 지점 파악

basic 완성 코드에서 아래를 찾는다.

- [ ] 3단계 이상 내려가는 props 목록 작성
- [ ] 콜백 함수가 여러 컴포넌트를 거쳐 전달되는 지점 파악

---

### STEP 6. 전역 상태 설계

- [ ] 어떤 상태를 전역으로 올릴지 결정 (cart, products, coupons 등)
- [ ] store / atom / context 파일 생성

**엔티티 컴포넌트 패턴 (drilling 제거 방향):**
```
before: <CartItem item={item} onRemove={onRemove} onQuantityChange={onQuantityChange} />
after:  <CartItem item={item} />  ← 내부에서 store/context 직접 소비
```

**UI 컴포넌트는 변경하지 않는다** (props로 동작하는 것이 올바름).

---

### STEP 7. 적용 및 테스트

- [ ] 엔티티 컴포넌트들에 전역 상태 연결
- [ ] 불필요해진 props 제거
- [ ] `pnpm test:advanced` 전체 통과

---

## 테스트 체크리스트 (basic/advanced 공통)

| 테스트 | 핵심 조건 |
|-------|---------|
| 상품 검색 → 장바구니 추가 | 디바운스 500ms, 알림 메시지 |
| 수량 10개 → `-15%` 할인 | 10개 구매 시 10%+보너스 5% |
| 쿠폰 적용 | 결제 정보 섹션 할인 금액 반영 |
| 재고 초과 차단 | 수량 20개 상한, 경고 메시지 |
| 주문 완료 → 장바구니 초기화 | '장바구니가 비어있습니다' |
| localStorage 동기화 | unmount 후 재mount 시 데이터 유지 |
| 관리자: 상품 추가/수정/삭제 | `<table>` 반영 |
| 쿠폰 할인율 100% 초과 | 에러 메시지 |
| 알림 자동 소멸 | 3초 후 사라짐 |

---

## 막혔을 때

- **순수 함수 로직이 헷갈릴 때** → `src/refactoring(hint)/models/cart.ts` 주석 참고
- **훅 구조가 헷갈릴 때** → `src/refactoring(hint)/hooks/` 주석 참고
- **컴포넌트 분리 구조가 헷갈릴 때** → `src/refactoring(hint)/components/` 참고
- **테스트가 깨질 때** → 테스트 파일에서 어떤 DOM 구조를 기대하는지 확인 (section, table, role 등)
