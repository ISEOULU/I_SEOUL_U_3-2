# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 과제 개요

**Chapter 3-2: 디자인 패턴과 함수형 프로그래밍 그리고 상태 관리 설계**

쇼핑몰 앱(장바구니 페이지 + 관리자 페이지)을 구현한 거대 단일 컴포넌트(`src/origin/App.tsx`)를 계층별로 리팩토링하는 과제.

## Commands

```bash
# 개발 서버
pnpm dev:origin     # origin 원본 코드 실행
pnpm dev:basic      # basic 과제 실행
pnpm dev:advanced   # advanced 과제 실행

# 테스트
pnpm test           # 전체 테스트
pnpm test:origin    # origin 테스트만
pnpm test:basic     # basic 테스트만
pnpm test:advanced  # advanced 테스트만
pnpm test:ui        # vitest UI 모드

# 빌드 / 린트
pnpm build
pnpm lint
```

## 프로젝트 구조

```
src/
├── types.ts                    # 공용 타입: Product, Discount, CartItem, Coupon
├── origin/                     # 원본 코드 (거대 단일 컴포넌트, 읽기 전용 참고용)
│   ├── App.tsx
│   └── __tests__/origin.test.tsx
├── basic/                      # 기본과제 작업 폴더
│   ├── App.tsx                 # 시작점 (origin과 동일한 파일)
│   └── __tests__/origin.test.tsx
├── advanced/                   # 심화과제 작업 폴더
│   ├── App.tsx
│   └── __tests__/origin.test.tsx
└── refactoring(hint)/          # 힌트 폴더 (구조 참고용, 수정 금지)
    ├── models/                 # 순수 함수 모델 (cart.ts, coupon.ts, etc.)
    ├── hooks/                  # 엔티티 훅 (useCart.ts, useCoupons.ts, useProducts.ts)
    ├── utils/hooks/            # 유틸리티 훅 (useLocalStorage.ts, useDebounce.ts)
    └── components/             # 분리된 컴포넌트 예시
```

## 기본과제 (basic) Workflow

**목표:** `src/origin/App.tsx`를 `src/basic/` 폴더 내에서 계층별로 분리. 상태관리 라이브러리 사용 금지.

### 분리 순서

**1단계 - 순수 함수(모델) 분리** (`src/basic/models/cart.ts`)
- `calculateItemTotal(item)` — 아이템별 할인 적용 후 금액
- `getMaxApplicableDiscount(item)` — 적용 가능한 최대 할인율
- `calculateCartTotal(cart, coupon)` — 장바구니 총액 (totalBeforeDiscount, totalDiscount, totalAfterDiscount)
- `updateCartItemQuantity(cart, productId, quantity)` — 수량 변경
- `addItemToCart(cart, product)` — 상품 추가
- `removeItemFromCart(cart, productId)` — 상품 제거
- `getRemainingStock(product, cart)` — 남은 재고
- **원칙:** 모든 함수는 순수 함수 (부작용 없음, 파라미터로만 데이터 전달)

**2단계 - 유틸리티 훅 분리** (`src/basic/utils/hooks/`)
- `useLocalStorage<T>(key, initialValue)` — localStorage ↔ React state 동기화
- `useDebounce(value, delay)` — 검색어 디바운스 처리

**3단계 - 엔티티 훅 분리** (`src/basic/hooks/`)
- `useCart()` — 장바구니 상태 + localStorage 연동
- `useCoupon()` — 쿠폰 선택 상태
- `useProduct()` — 상품 목록 상태 + localStorage 연동

**4단계 - 컴포넌트 계층 분리** (`src/basic/components/`)
- **엔티티 컴포넌트:** `CartPage`, `AdminPage`, `ProductCard`, `CartItem` 등
- **UI 컴포넌트:** `Button`, 아이콘 등 재사용 가능한 순수 UI
- Container-Presenter 패턴: 엔티티 컴포넌트가 훅 호출 → Presenter에 props 전달

### 테스트 통과 기준
`pnpm test:basic` 의 모든 테스트를 통과해야 함. 테스트는 `src/basic/__tests__/origin.test.tsx`에 있으며 UI 동작을 통합 테스트로 검증함.

## 심화과제 (advanced) Workflow

**목표:** basic 코드를 기반으로 Props Drilling 제거. basic 완료 후 진행.

### 방법 선택 (하나 선택)
- **Context API** — React만 사용하고 싶을 때
- **Jotai** — 전역 상태관리 입문자에게 추천
- **Zustand** — 현재 대세 라이브러리 학습 목적

### Props Drilling 제거 원칙
- **UI 컴포넌트:** 재사용성을 위해 props로 이벤트 핸들러 전달 (그대로 유지)
- **엔티티 컴포넌트:** props 대신 컴포넌트 내부에서 직접 전역 상태를 소비 (drilling 제거 대상)
- 불필요한 중간 props 제거, 엔티티는 엔티티 중심으로만 props 수신

### 테스트 통과 기준
`pnpm test:advanced` 의 모든 테스트를 통과해야 함 (basic과 동일한 테스트 시나리오).

## 핵심 엔티티와 타입 (`src/types.ts`)

```ts
Product { id, name, price, stock, discounts: Discount[] }
Discount { quantity, rate }         // quantity 이상 구매 시 rate 할인
CartItem { product: Product, quantity }
Coupon { name, code, discountType: 'amount'|'percentage', discountValue }
```

## 테스트 주요 시나리오 (basic/advanced 공통)

| 시나리오 | 핵심 체크포인트 |
|---------|--------------|
| 상품 검색 후 장바구니 추가 | 디바운스 500ms 대기, 알림 메시지 표시 |
| 수량 10개 → 할인 적용 | `-15%` 표시 (10개: 10% + 보너스 5%) |
| 쿠폰 적용 | `결제 정보` 섹션의 `-5,000원` 반영 |
| 재고 초과 시 차단 | 수량 최대 20개, 경고 메시지 `/재고는.*개까지만/` |
| localStorage 동기화 | cart, products 키에 JSON 저장 및 로드 |
| 관리자: 상품 추가/수정/삭제 | `<table>` 내 변경 반영 |
| 쿠폰 할인율 100% 초과 검증 | 에러 메시지 표시 |
| 알림 자동 소멸 | 3초 후 사라짐 (timeout: 4000) |

## 힌트 폴더 활용 방법

`src/refactoring(hint)/` 폴더의 파일들은 **TODO 주석 형태**로 각 계층에서 구현할 내용과 반환값 구조를 설명하고 있음. 실제 구현 로직은 없으므로 구조와 인터페이스 설계 참고용으로만 사용.
