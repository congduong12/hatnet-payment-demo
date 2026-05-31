# SPEC — Vietnam Payment Learning Demo Web Application

## 1. Product Overview

### 1.1. Tên tạm thời

**VN Payment Learning Lab**

### 1.2. Mục tiêu sản phẩm

Xây dựng một web application demo để học và thử nghiệm end-to-end flow thương mại điện tử/thanh toán tại Việt Nam.

Ứng dụng tập trung vào các flow chính:

* Authentication
* Product catalog
* Shopping cart
* Billing/subscription
* Checkout bằng VND
* Payment provider integration
* Webhook/callback verification
* Reward points
* LLM-assisted product search bằng Gemini
* Admin/dev inspection page để debug order/payment/point/LLM flow

Backend dùng **NestJS**.
Frontend dùng **ReactJS**.

SPEC này cần đủ rõ để sau đó có thể chuyển thành:

* Architecture design
* Database schema
* API contract
* Task breakdown
* Implementation plan
* Test plan

---

## 2. MVP Scope

### 2.1. MVP build first

MVP tập trung vào một flow hoàn chỉnh:

1. User login/logout.
2. User xem danh sách sản phẩm demo.
3. User thêm sản phẩm vào cart.
4. User xem cart, chỉnh quantity, thấy subtotal/discount/total.
5. User checkout bằng VND.
6. Backend reserve reward points nếu user chọn dùng điểm.
7. Backend tạo order với trạng thái `PENDING_PAYMENT`.
8. Backend tạo payment link/QR với payment provider.
9. User redirect/scan QR/pay.
10. Provider gọi webhook/callback về backend.
11. Backend verify signature/status/amount/currency.
12. Backend mark payment `PAID`.
13. Backend mark order `PAID`.
14. Backend confirm reserved points.
15. Nếu order chứa Pro plan, backend activate/extend Pro subscription.
16. Backend cộng 10 reward points cho user sau khi Pro payment thành công.
17. User dùng điểm cho lần mua sau.
18. User tìm sản phẩm bằng search thường hoặc LLM search.
19. Admin/dev có thể inspect orders, payments, payment events, reward ledger, LLM search logs.

### 2.2. Defer sau MVP

Các phần chưa cần làm ngay:

* Multiple payment providers chạy production cùng lúc
* Real recurring subscription billing
* Auto-charge hàng tháng
* Passkeys/WebAuthn
* Refund automation đầy đủ
* MoMo/ZaloPay/VNPay production integration
* Multi-currency phức tạp ngoài USD canonical price và VND checkout
* Invoice/VAT/e-invoice
* Fraud detection nâng cao
* Full admin portal
* Analytics dashboard nâng cao
* Security hardening nâng cao
* Open redirect protection nâng cao
* Advanced rate limit/security policy

---

## 3. Core Domains

### 3.1. User

Đại diện cho người dùng nội bộ trong hệ thống.

Thông tin chính:

* identity
* auth provider id
* email
* display name
* current plan
* created date

### 3.2. Product

Đại diện cho sản phẩm/gói demo.

Thông tin chính:

* product name
* package/plan type
* price source
* currency
* category
* tags
* metadata

### 3.3. Cart

Đại diện cho giỏ hàng hiện tại của user.

Thông tin chính:

* user cart items
* quantity
* preview subtotal
* selected products

### 3.4. Order

Đại diện cho purchase request immutable sau khi checkout.

Thông tin chính:

* line items snapshot
* currency
* discounts
* point redemption
* reserved points
* final payable amount
* status

### 3.5. Payment

Đại diện cho payment attempt với provider.

Thông tin chính:

* provider
* provider order id/payment id
* amount VND
* payment URL/QR
* status
* raw callback reference

### 3.6. Subscription

Đại diện cho Free/Pro subscription state của user.

MVP dùng **simulated subscription**, nghĩa là:

* Có plan state thật.
* Có `startedAt`.
* Có `expiresAt`.
* Có renew/extend flow.
* Nhưng chưa có recurring auto-charge.
* User phải tự thanh toán lại nếu muốn gia hạn.

Thông tin chính:

* plan
* status
* start date
* expiry date
* source order

### 3.7. RewardLedger

Đại diện cho tất cả point transactions.

Thông tin chính:

* earned
* reserved
* confirmed/redeemed
* released
* refunded/restored
* expired
* adjustment

Rule quan trọng:

**Reward ledger is append-only.**

Không mutate point history trực tiếp.
Point balance có thể là cached balance, nhưng mọi thay đổi balance phải có ledger transaction tương ứng.

### 3.8. LlmSearchQuery

Đại diện cho một lần user search bằng LLM.

Thông tin chính:

* prompt
* parsed intent
* filters extracted
* product ids suggested
* fallback status
* Gemini latency
* error reason nếu có
* created date

Mục đích:

* Debug LLM search
* Audit vì sao result được trả về
* Theo dõi fallback rate
* Tối ưu prompt/search quality sau này

---

## 4. Authentication SPEC

### 4.1. Auth mục tiêu

Authentication cần phục vụ:

* Login/logout
* Bảo vệ API
* Map external auth user với internal user
* Gắn user với cart, order, points, subscription
* Giảm rủi ro tự implement auth sai

### 4.2. Option comparison

#### Clerk

Ưu điểm:

* DX tốt cho React.
* Có hosted UI.
* Support OAuth, email, magic link, passkeys tùy cấu hình.
* Backend NestJS có thể verify JWT/JWKS.
* Giảm thời gian tự xử lý password/session security.

Nhược điểm:

* Phụ thuộc SaaS.
* Một số feature có thể phụ thuộc pricing.
* Cần sync external user vào internal DB.

#### Firebase Auth

Ưu điểm:

* Tốt cho demo/free-tier.
* Có SDK mạnh.
* Support nhiều login providers.
* Backend verify ID token bằng Admin SDK.

Nhược điểm:

* Phụ thuộc Firebase ecosystem.
* Ít “backend-auth architecture” hơn nếu mục tiêu là học sâu NestJS auth.

#### Auth.js

Ưu điểm:

* Tốt nếu dùng Next.js.
* Hỗ trợ OAuth/OIDC phổ biến.

Nhược điểm:

* Ít tự nhiên hơn nếu frontend là plain React và backend là NestJS riêng.
* Cần tự thiết kế session/token boundary kỹ.

#### Passkeys/WebAuthn

Ưu điểm:

* Công nghệ mới đáng học.
* Bảo mật tốt.
* UX hiện đại.

Nhược điểm:

* Nhiều ceremony.
* Không nên làm scope chính của MVP nếu mục tiêu là payment flow.

#### DIY JWT/Refresh Token

Ưu điểm:

* Học sâu backend auth.
* Chủ động hoàn toàn.

Nhược điểm:

* Security footgun cao.
* Cần xử lý refresh token rotation, revoke session, password hashing, CSRF/cookie strategy.

### 4.3. Auth decision

MVP recommendation:

**Clerk + Google OAuth**

Lý do:

* Phù hợp project học tập.
* Setup nhanh.
* Giảm rủi ro tự làm auth sai.
* Cho phép tập trung vào payment, billing, reward ledger và LLM search.
* Backend NestJS vẫn học được flow verify token và sync user.

Phase sau:

* Phase 2: bật thêm Passkeys thông qua Clerk.
* Phase 3: thử custom JWT/Refresh Token trong branch/lab riêng để học sâu.

### 4.4. Auth acceptance criteria

* User login/logout được.
* User chưa login không được checkout.
* Backend không tin userId từ client.
* Backend lấy user identity từ verified auth token.
* Login lần đầu tạo internal user record.
* Token invalid/expired trả `401`.
* Không đủ quyền trả `403`.

---

## 5. Product Catalog SPEC

### 5.1. Product types

MVP có 2 loại product:

### One-time demo product

Ví dụ:

* NestJS Payment Workshop
* React Checkout UI Kit
* Gemini Product Search Pack

Đặc điểm:

* Mua một lần.
* Có giá.
* Có category/tags.
* Có thể add vào cart.

### Billing plan product

Gồm:

* Free
* Pro

Free:

* Giá 0.
* Default plan cho user mới.
* Không cần payment.

Pro:

* Giá niêm yết: 10 USD.
* Checkout tại Việt Nam bằng VND.
* Sau khi payment thành công:

  * user plan chuyển thành Pro.
  * Pro subscription được activate hoặc extend.
  * user được cộng 10 reward points.

### 5.2. Product fields

Mỗi product cần có:

* id
* name
* slug
* description
* shortDescription
* productType: `ONE_TIME` hoặc `PLAN`
* priceAmount
* priceCurrency
* displayPrice
* category
* tags
* isActive
* metadata
* createdAt
* updatedAt

### 5.3. Product rules

* Product inactive không được add vào cart.
* Product price hiển thị ở frontend chỉ để preview.
* Backend luôn là source of truth cho giá.
* Khi tạo order, backend snapshot product price vào order item.
* Nếu product price đổi sau khi order tạo, order cũ không bị thay đổi.

---

## 6. Shopping Cart SPEC

### 6.1. Cart decision

MVP dùng **server-side cart**.

Lý do:

* Gần production hơn.
* Dễ sync theo user.
* Backend kiểm soát quantity/product validity.
* Dễ chuyển sang checkout/order.
* Phù hợp học backend flow bằng NestJS.

Frontend vẫn có local UI state, nhưng source of truth là backend.

### 6.2. Cart rules

* Mỗi authenticated user có một active cart.
* Cart item trỏ tới productId.
* Quantity tối thiểu là 1.
* Quantity tối đa MVP: 10/item.
* Add cùng product lần 2 thì tăng quantity.
* Empty cart không được checkout.
* Checkout xong cart được clear hoặc mark checked out.
* Backend luôn tính lại total từ DB product price.

### 6.3. Cart actions

User có thể:

* Add product to cart
* Update quantity
* Remove item
* Clear cart
* View cart summary
* Proceed to checkout

---

## 7. Billing & Subscription SPEC

### 7.1. Billing page

Billing page hiển thị:

* Current plan
* Plan benefits
* Free/Pro comparison
* Pro price
* Pro expiry date nếu đang Pro
* Reward point balance
* Point transaction history
* Order/subscription history
* CTA upgrade/renew Pro

### 7.2. Đánh giá các hướng làm Pro

Có 3 hướng chính:

### Option A — Pro as one-time entitlement

User mua Pro một lần, sau đó tài khoản là Pro vĩnh viễn.

Ưu điểm:

* Dễ làm nhất.
* Ít edge case.
* Không cần xử lý expiry.
* Không cần renew.

Nhược điểm:

* Ít học được subscription lifecycle.
* Billing page hơi đơn giản.
* Không có flow expired/renew.
* Không giống subscription thật.

Phù hợp nếu:

* Mục tiêu chỉ là học payment success và unlock feature.

### Option B — Pro as simulated monthly subscription

User mua Pro, được Pro trong một khoảng thời gian, ví dụ 30 ngày.
Không có auto-charge.
Khi gần hết hạn hoặc đã hết hạn, user tự renew bằng cách thanh toán lại.

Ưu điểm:

* Học được subscription state thật hơn.
* Có `startedAt`, `expiresAt`, `PRO_ACTIVE`, `PRO_EXPIRED`.
* Có renew/extend flow.
* Vẫn dễ hơn recurring billing thật.
* Không cần xử lý auto-charge, saved payment method, failed recurring payment.
* Phù hợp project học tập.

Nhược điểm:

* Phức tạp hơn one-time entitlement.
* Cần xử lý expiry logic.
* Cần rule renew/extend.

Phù hợp nếu:

* Muốn củng cố kiến thức billing/subscription nhưng vẫn giữ MVP vừa sức.

### Option C — Real recurring subscription

User đăng ký Pro và hệ thống tự charge định kỳ.

Ưu điểm:

* Gần production nhất.
* Học được recurring billing thật.
* Có nhiều edge case thực tế.

Nhược điểm:

* Khó nhất.
* Phụ thuộc payment provider có support recurring tốt.
* Cần xử lý saved payment method, failed payment, retry, grace period, cancellation, webhook phức tạp.
* Quá nặng cho MVP học tập ban đầu.

Phù hợp nếu:

* Project đã hoàn thành MVP.
* Muốn làm phase nâng cao về billing system.

### 7.3. Subscription decision

MVP chọn:

**Pro as simulated monthly subscription**

Cụ thể:

* Pro có thời hạn 30 ngày.
* User thanh toán thủ công để activate/renew.
* Không làm recurring auto-charge trong MVP.
* Không lưu payment method.
* Không tự động charge user.
* Khi Pro hết hạn, user quay về Free hoặc hiển thị `PRO_EXPIRED`.
* User có thể renew bằng cách mua Pro lại.

Lý do chọn hướng này:

* Dễ hơn recurring billing thật.
* Học được nhiều hơn one-time entitlement.
* Phù hợp mục tiêu củng cố kiến thức.
* Có đủ flow billing/subscription thực tế để thiết kế DB/API/test.

### 7.4. Subscription rules

#### New user

* Default plan: `FREE`
* Không có `expiresAt`

#### User mua Pro lần đầu

Khi payment success:

* Tạo hoặc update subscription.
* plan = `PRO`
* status = `PRO_ACTIVE`
* startedAt = current time
* expiresAt = current time + 30 days
* sourceOrderId = order id
* cộng 10 reward points

#### User đang Pro và renew

Nếu user đang `PRO_ACTIVE` và mua Pro tiếp:

* Extend from current `expiresAt`.
* New expiresAt = current expiresAt + 30 days.
* Cộng 10 reward points sau payment success.

Ví dụ:

* User Pro expiresAt = 2026-06-30.
* User renew ngày 2026-06-20.
* New expiresAt = 2026-07-30.

#### User đã hết Pro và renew

Nếu user `PRO_EXPIRED` hoặc `expiresAt < now`:

* startedAt = current time hoặc giữ historical startedAt tùy implementation.
* expiresAt = current time + 30 days.
* status = `PRO_ACTIVE`.
* Cộng 10 reward points sau payment success.

#### Expiry check

MVP có thể xử lý expiry bằng lazy check:

* Khi user gọi `/me`, `/billing`, hoặc API cần kiểm tra plan:

  * Nếu subscription là `PRO_ACTIVE` nhưng `expiresAt < now`, backend update hoặc return status `PRO_EXPIRED`.
* Chưa cần cron job ở MVP.

Phase sau:

* Thêm scheduled job để expire subscriptions tự động.

### 7.5. Subscription states

MVP cần:

* `FREE`
* `PRO_ACTIVE`
* `PRO_EXPIRED`

Phase sau có thể thêm:

* `CANCELLED`
* `PAST_DUE`
* `GRACE_PERIOD`

---

## 8. Reward Points SPEC

### 8.1. Mục tiêu

Reward points dùng để học:

* Wallet/ledger design
* Earn points
* Reserve points
* Confirm/release points
* Redeem points
* Refund handling
* Expiry
* Idempotency
* Transaction audit

### 8.2. Quy đổi điểm

Rule MVP:

* 1 point = 1,000 VND discount.
* Point chỉ dùng cho order thanh toán bằng VND.
* Point không quy đổi thành tiền mặt.
* Point không chuyển nhượng user khác.

Ví dụ:

* User có 10 points.
* Order subtotal = 250,000 VND.
* 10 points = 10,000 VND discount.
* Payable amount = 240,000 VND.

### 8.3. Earn points

Rule:

* Mua Pro thành công cộng 10 points.
* Points chỉ được cộng sau khi payment webhook/callback đã verified thành công.
* Không cộng points dựa trên frontend return URL.
* Failed/cancelled/expired payment không được cộng points.
* Mỗi paid Pro order chỉ được earn points một lần.
* Nếu user renew Pro thành công, vẫn được cộng 10 points cho order đó.

### 8.4. Redeem points

Rule chính:

Max redeemable points per order = min:

* available points
* 30% of order subtotal converted to points
* order total after other discounts converted to points

Nói đơn giản:

* User không được dùng quá số điểm đang có.
* User không được dùng điểm vượt quá 30% subtotal.
* User không được dùng điểm làm payable amount âm hoặc bằng 0 nếu provider yêu cầu minimum amount.
* Điểm chỉ được apply trước khi tạo payment.
* Nếu muốn đổi số điểm sau khi payment đã tạo, phải cancel payment cũ và tạo payment mới.

Ví dụ:

* Order subtotal = 250,000 VND.
* 30% subtotal = 75,000 VND.
* 1 point = 1,000 VND.
* Max redeem theo subtotal = 75 points.
* Nếu user có 10 points, dùng tối đa 10 points.
* Nếu user có 100 points, dùng tối đa 75 points.

### 8.5. Reserve points decision

MVP chọn:

**Option A — Reserve points when creating order**

Lý do:

* Tránh user dùng cùng một điểm cho nhiều pending orders.
* Flow gần production hơn.
* Học được wallet reservation pattern.
* Dễ audit hơn qua ledger.

### 8.6. Point reservation lifecycle

Khi user checkout và chọn dùng points:

1. Backend validate cart.
2. Backend tính subtotal.
3. Backend tính max redeemable points.
4. Backend kiểm tra available points.
5. Backend tạo order `PENDING_PAYMENT`.
6. Backend tạo point transaction type `REDEEM_RESERVED`.
7. Available balance bị giảm.
8. Reserved balance tăng.
9. Backend tạo payment.

Nếu payment success:

1. Webhook verified.
2. Backend mark payment `PAID`.
3. Backend mark order `PAID`.
4. Backend chuyển reserved points thành confirmed redemption.
5. Tạo transaction `REDEEM_CONFIRMED` hoặc update reservation status thành `CONFIRMED`.
6. Reserved balance giảm.
7. Points được xem là đã dùng chính thức.

Nếu payment failed/cancelled/expired:

1. Backend mark payment failed/cancelled/expired.
2. Backend release reserved points.
3. Tạo transaction `REDEEM_RELEASED`.
4. Reserved balance giảm.
5. Available balance tăng lại.

### 8.7. Point account balance model

PointAccount nên có:

* balance
* availableBalance
* reservedBalance

Trong đó:

* `availableBalance`: điểm có thể dùng cho checkout mới.
* `reservedBalance`: điểm đang bị giữ cho pending orders.
* `balance`: tổng điểm còn lại, có thể tính bằng available + reserved hoặc lưu cached tùy implementation.

Rule:

* User chỉ được redeem từ `availableBalance`.
* Reserved points không được dùng tiếp cho order khác.
* Mọi thay đổi balance đều phải có ledger transaction.

### 8.8. Point expiry

Rule:

**Points expire after 12 months from earned date.**

MVP implementation:

* Khi cộng điểm, lưu `expiresAt = earnedAt + 12 months`.
* MVP có thể chưa cần scheduled job expire tự động.
* Khi tính available points, backend có thể exclude expired points.
* Phase sau thêm cron/job để expire points.
* Khi expire, tạo ledger transaction type `EXPIRE`.
* Không delete point transaction cũ.

### 8.9. Ledger rule

Reward ledger là append-only.

Không làm:

* Không sửa trực tiếp transaction cũ.
* Không xóa transaction cũ.
* Không update balance mà không có ledger record.

Có thể làm:

* Lưu PointAccount balance như cached balance.
* Mỗi thay đổi balance phải đi kèm một PointTransaction.
* Có thể update transaction status từ `RESERVED` sang `CONFIRMED` nếu muốn đơn giản, nhưng vẫn nên có audit rõ.

### 8.10. Refund rule

Refund automation không nằm trong MVP, nhưng SPEC định nghĩa rule trước.

Nếu refund order đã earn points:

* Nếu points earned từ order đó chưa dùng: tạo transaction trừ lại điểm.
* Nếu points đã dùng: MVP có thể block refund automation và yêu cầu manual review.
* Không âm balance trong MVP, trừ khi có rule debt rõ ràng.

Nếu refund order có redeemed points:

* Hoàn lại redeemed points cho user.
* Tạo ledger transaction type `REFUND_RESTORE`.

### 8.11. Point transaction types

MVP cần:

* `EARN_PRO_PURCHASE`
* `REDEEM_RESERVED`
* `REDEEM_CONFIRMED`
* `REDEEM_RELEASED`
* `EXPIRE`
* `ADMIN_ADJUSTMENT`

Phase sau:

* `REFUND_REVOKE_EARNED`
* `REFUND_RESTORE_REDEEMED`

### 8.12. Point acceptance criteria

* Mua Pro thành công được cộng đúng 10 points.
* Duplicate webhook không cộng điểm nhiều lần.
* User dùng điểm thì payable amount giảm đúng.
* User không dùng được quá available balance.
* User không dùng được quá 30% subtotal.
* Khi tạo order, points được reserve.
* Pending order giữ points trong reserved balance.
* Payment success confirm reserved points.
* Payment failed/cancelled/expired release reserved points.
* Points expire sau 12 tháng.
* Mọi thay đổi point đều có ledger record.
* Balance không âm trong MVP.
* Refund restore/revoke points phải idempotent ở phase sau.

---

## 9. Currency & Pricing SPEC

### 9.1. Currency direction

App hướng tới Việt Nam nên checkout ưu tiên VND.

Product có thể có:

* Base currency: USD
* Checkout currency: VND

Pro plan:

* Listed price: 10 USD
* Charged as VND equivalent

### 9.2. FX conversion rule

MVP:

* Dùng static FX rate config.
* Ví dụ: `USD_TO_VND_RATE`.
* Backend convert khi tạo order.
* Lưu FX snapshot vào order.
* Tất cả amount gửi sang payment provider là integer VND.
* Không dùng floating point cho money calculation.

Phase sau:

* Tích hợp external FX API.
* Cache daily FX rate.
* Lưu provider/source của FX rate.

### 9.3. Money representation

Backend không được dùng floating point cho money.

Rule:

* USD lưu bằng cents.

  * 10 USD = 1000 cents.
* VND lưu bằng integer.

  * 250,000 VND = 250000.
* FX calculation dùng Decimal library hoặc integer-safe calculation.
* Frontend chỉ display amount backend trả về.

### 9.4. Rounding rule USD → VND

MVP chọn rule:

**Round up to nearest 1,000 VND.**

Lý do:

* Đơn giản.
* Dễ hiển thị.
* Tránh payable amount lẻ.
* Phù hợp demo payment bằng VND/QR.
* Tránh thiếu tiền do rounding xuống.

Ví dụ:

* Product price = 10 USD.
* FX rate = 24,850 VND/USD.
* Raw amount = 248,500 VND.
* Rounded amount = 249,000 VND.

Ví dụ khác:

* Product price = 9.99 USD.
* FX rate = 24,850 VND/USD.
* Raw amount = 248,251.5 VND.
* Rounded amount = 249,000 VND.

### 9.5. FX snapshot rule

Khi tạo order, backend snapshot:

* product name
* product price
* original currency
* checkout currency
* FX rate
* FX source
* FX applied at
* rounding mode
* rounded amount
* discount
* redeemed/reserved points
* final payable amount

### 9.6. Amount validation

Backend phải validate:

* Payment amount từ provider khớp order payable amount.
* Currency là VND.
* Order chưa paid trước đó.
* Payment status hợp lệ.
* Không tin amount từ frontend.

---

## 10. Payment Provider Decision

### 10.1. Recommended MVP provider

MVP provider:

**payOS**

Lý do:

* Phù hợp thị trường Việt Nam.
* Phù hợp flow VND/VietQR/bank transfer.
* Có payment link/QR style flow.
* Có return/cancel URL và webhook.
* Dễ học payment lifecycle hơn so với bắt đầu bằng global card checkout.

### 10.2. Provider comparison

### payOS

Ưu điểm:

* Best fit cho MVP Việt Nam.
* Dễ demo VND payment.
* Phù hợp học hosted payment link, QR, webhook, idempotency.

Nhược điểm:

* Cần account/provider setup.
* Sandbox/dev experience cần kiểm tra theo account.

### MoMo

Ưu điểm:

* Rất phổ biến ở Việt Nam.
* Tốt để học wallet payment.

Nhược điểm:

* Onboarding merchant/test app có thể phức tạp hơn.
* Nên để phase 2.

### ZaloPay

Ưu điểm:

* Phổ biến ở Việt Nam.
* Có callback/redirect flow.

Nhược điểm:

* Sandbox/merchant config và callback domain có thể gây friction.
* Nên để phase 2/3.

### VNPay

Ưu điểm:

* Traditional payment gateway phổ biến.
* Tốt để học payment gateway style.

Nhược điểm:

* Integration/onboarding nặng hơn.
* Nhiều tham số signature cần xử lý kỹ.

### Stripe

Ưu điểm:

* Developer experience rất tốt.
* Rất tốt để học Checkout/Billing/subscriptions global.

Nhược điểm:

* Không phải lựa chọn primary nếu trọng tâm là Vietnam merchant demo.
* Không đại diện tốt cho QR/bank transfer flow ở Việt Nam.

### 10.3. Payment architecture decision

Dù MVP chỉ implement payOS, backend vẫn nên thiết kế theo adapter pattern:

* PAYOS
* MOMO
* VNPAY
* ZALOPAY
* STRIPE

MVP chỉ enable:

* PAYOS

Không implement mock payment provider trong MVP.

Lý do:

* Project thử nghiệm tập trung vào real provider flow.
* Giảm số lượng code giả lập.
* Tránh mất thời gian vào abstraction quá sớm.
* Nếu payOS setup gây khó khăn, có thể cân nhắc mock provider ở phase sau.

---

## 11. Payment Lifecycle SPEC

### 11.1. Order statuses

* `DRAFT`
* `PENDING_PAYMENT`
* `PAID`
* `PAYMENT_FAILED`
* `CANCELLED`
* `EXPIRED`
* `REFUNDED`

### 11.2. Payment statuses

* `INITIATED`
* `PENDING`
* `PAID`
* `FAILED`
* `CANCELLED`
* `EXPIRED`
* `REFUNDED`
* `AMOUNT_MISMATCH`
* `VERIFY_FAILED`

### 11.3. Happy path

1. User click checkout.
2. Frontend calls `POST /checkout`.
3. Backend validates cart.
4. Backend recalculates price from DB.
5. Backend applies point redemption if requested.
6. Backend reserves points.
7. Backend converts USD to VND if needed.
8. Backend applies rounding rule.
9. Backend creates order with status `PENDING_PAYMENT`.
10. Backend creates payment with status `INITIATED`.
11. Backend calls payOS create payment API.
12. payOS returns payment URL/QR/payment link.
13. Backend updates payment status to `PENDING`.
14. Frontend redirects user or renders QR.
15. User completes payment.
16. Provider calls webhook/callback.
17. Backend verifies signature.
18. Backend verifies provider payment id.
19. Backend verifies amount and currency.
20. Backend handles idempotency.
21. Backend marks payment `PAID`.
22. Backend marks order `PAID`.
23. Backend confirms reserved points.
24. Backend activates/extends Pro if order contains Pro.
25. Backend grants 10 points for Pro purchase.
26. Frontend success page polls order status.
27. User sees payment success.

### 11.4. Return URL vs webhook

Return URL:

* Chỉ dùng cho UX.
* Không được dùng làm source of truth.
* Success page nên hiển thị “confirming payment” nếu webhook chưa về.

Webhook/callback:

* Source of truth.
* Phải verify signature.
* Phải verify amount/currency.
* Phải idempotent.
* Phải chịu được retry.

### 11.5. Webhook transaction boundary

Khi nhận webhook success:

1. Verify signature ngoài DB transaction.
2. Parse provider event.
3. Open DB transaction.
4. Lock payment/order row.
5. Check duplicate event/transaction id.
6. Verify amount/currency.
7. Mark payment paid.
8. Mark order paid.
9. Confirm reserved points.
10. Activate/extend Pro nếu cần.
11. Earn 10 points nếu order mua Pro.
12. Insert payment event log.
13. Commit transaction.

### 11.6. Failure cases

Hệ thống cần xử lý:

* User đóng payment page.
* Return URL về trước webhook.
* Webhook về trước return URL.
* Duplicate webhook.
* Wrong signature.
* Amount mismatch.
* Currency mismatch.
* Provider timeout.
* Payment expired.
* Payment cancelled.
* User retry payment.
* Order đã paid nhưng webhook retry.
* Payment success nhưng grant points fail.
* Payment failed nhưng points đang reserved.
* Payment expired nhưng points chưa release.

### 11.7. Payment failed/cancelled/expired handling

Nếu payment failed/cancelled/expired:

* Payment status chuyển sang state tương ứng.
* Order status chuyển sang `PAYMENT_FAILED`, `CANCELLED`, hoặc `EXPIRED`.
* Reserved points phải được released.
* User có thể retry payment nếu order còn hợp lệ.
* Nếu retry payment, backend có thể tạo payment attempt mới cho cùng order hoặc tạo order mới tùy implementation.

MVP recommendation:

* Retry payment tạo payment attempt mới cho cùng order.
* Không tạo lại order nếu line items không đổi.
* Nếu user muốn đổi cart/points, phải tạo checkout mới.

---

## 12. LLM Product Search SPEC

### 12.1. Goal

User có thể tìm sản phẩm/gói bằng ngôn ngữ tự nhiên.

Ví dụ:

* “Gói nào phù hợp cho người mới học?”
* “Tìm sản phẩm dưới 10 đô”
* “Tôi muốn học payment ở Việt Nam thì nên mua gì?”
* “Gói nào có điểm thưởng?”
* “Sản phẩm nào rẻ nhất?”

### 12.2. LLM scope

Gemini chỉ được dùng cho:

* search assistance
* intent understanding
* ranking
* explanation
* search suggestion

Gemini không được phép:

* quyết định giá
* tạo discount
* tạo order
* mark payment paid
* cộng điểm
* cấp Pro entitlement
* thay đổi business rule
* gọi payment provider trực tiếp

### 12.3. LLM architecture

MVP dùng approach an toàn:

1. User nhập natural language query.
2. Backend nhận request `/search`.
3. Backend chạy deterministic DB search trước:

   * keyword
   * price range
   * plan type
   * category
   * tags
4. Backend lấy candidate products từ DB.
5. Backend gửi candidate product metadata đã sanitize sang Gemini.
6. Gemini trả structured response:

   * intent
   * filters
   * ranking
   * suggested product ids
   * explanations
   * confidence
7. Backend validate Gemini response bằng schema.
8. Backend re-check product ids/prices từ DB.
9. Backend return final result.
10. Nếu Gemini fail/timeout/invalid schema, backend return deterministic search result.

### 12.4. LLM response schema

Expected fields:

* intent
* filters
* maxPrice
* currency
* category
* tags
* productType
* suggestedProductIds
* explanationByProductId
* confidence
* fallbackQuery

### 12.5. LLM guardrails

Backend phải:

* Validate JSON schema.
* Set timeout cho Gemini.
* Không gửi auth token/payment info/PII.
* Không gửi mutable payment/order state.
* Chỉ gửi product metadata cần thiết.
* Không tin productId do Gemini trả về nếu không tồn tại trong DB.
* Không tin price/discount do Gemini sinh ra.
* Log prompt/response cẩn thận.
* Có deterministic fallback.

Rate limit/advanced abuse protection có thể để phase sau vì đây là project thử nghiệm.

### 12.6. LLM acceptance criteria

* Query “tìm sản phẩm dưới 10 đô” trả về product hợp lệ từ DB.
* Query “gói nào phù hợp cho người mới học?” gợi ý Free/Pro hợp lý.
* Gemini không thể tạo fake product.
* Gemini không thể đổi giá product.
* Gemini timeout thì fallback search vẫn hoạt động.
* Gemini invalid JSON thì fallback search vẫn hoạt động.
* Search result cuối cùng luôn dựa trên DB.

---

## 13. Admin/Dev Inspection Page

### 13.1. Mục tiêu

Vì app này dùng để học payment flow, MVP nên có một trang admin/dev đơn giản để debug.

Không cần full admin portal, nhưng cần inspect được các flow quan trọng.

### 13.2. MVP dev page features

Admin/dev page hiển thị:

* Orders
* Order status
* Payments
* Payment status
* Provider payment id
* Payment events/webhook logs
* Reward ledger
* Point balance
* Reserved point balance
* Subscription status
* LLM search logs/fallback status

### 13.3. Optional dev actions

Phase MVP hoặc phase sau:

* Manual refresh payment status
* Manual verify payment
* Retry failed webhook processing
* View redacted raw provider payload
* View order timeline
* Release expired reserved points

### 13.4. Security note

Dev/admin page chỉ nên enable trong local/staging hoặc protected admin role.

Vì đây là project thử nghiệm, security hardening nâng cao chưa nằm trong MVP.
Sau khi hoàn thành core flow, có thể quay lại cải thiện:

* role-based access control
* audit log đầy đủ
* rate limit
* protected redirect URL
* payload redaction/encryption
* admin permission model

---

## 14. API Surface Draft

### 14.1. Auth/User

* `GET /me`
* `POST /auth/sync-user`

### 14.2. Products

* `GET /products`
* `GET /products/:slug`
* `GET /products/search`

### 14.3. Cart

* `GET /cart`
* `POST /cart/items`
* `PATCH /cart/items/:itemId`
* `DELETE /cart/items/:itemId`
* `DELETE /cart`

### 14.4. Checkout

`POST /checkout`

Request:

* usePoints
* pointsToRedeem
* paymentProvider
* successUrl
* cancelUrl

MVP note:

* Vì đây là project thử nghiệm, có thể tạm cho frontend truyền `successUrl` và `cancelUrl`.
* Phase sau nên chuyển sang backend-generated URL hoặc domain allowlist để tránh open redirect risk.

Response:

* orderId
* paymentId
* amount
* currency
* paymentUrl
* qrCode
* expiresAt
* status
* reservedPoints

### 14.5. Orders

* `GET /orders`
* `GET /orders/:id`
* `POST /orders/:id/cancel`
* `POST /orders/:id/retry-payment`

### 14.6. Payments

* `GET /payments/:id`
* `POST /payments/webhooks/payos`
* `POST /payments/:id/verify` — dev/admin only

### 14.7. Billing

* `GET /billing`
* `POST /billing/upgrade-pro`
* `POST /billing/renew-pro`

### 14.8. Points

* `GET /points/balance`
* `GET /points/transactions`

### 14.9. Search

`POST /search`

Response includes:

* mode: `DETERMINISTIC`, `LLM_ENHANCED`, or `FALLBACK`
* products
* explanations
* parsedIntent
* confidence
* fallbackReason

### 14.10. Dev/Admin

* `GET /dev/orders`
* `GET /dev/orders/:id/timeline`
* `GET /dev/payments`
* `GET /dev/payment-events`
* `GET /dev/reward-ledger`
* `GET /dev/llm-search-queries`

---

## 15. Data Model Draft

### 15.1. User

* id
* externalAuthProvider
* externalAuthUserId
* email
* name
* avatarUrl
* currentPlan
* createdAt
* updatedAt

### 15.2. Product

* id
* name
* slug
* description
* type
* priceAmount
* priceCurrency
* category
* tags
* isActive
* metadata
* createdAt
* updatedAt

### 15.3. Cart

* id
* userId
* status
* createdAt
* updatedAt

### 15.4. CartItem

* id
* cartId
* productId
* quantity
* createdAt
* updatedAt

### 15.5. Order

* id
* userId
* status
* subtotalAmount
* discountAmount
* pointDiscountAmount
* payableAmount
* currency
* originalCurrency
* fxRateSnapshot
* fxSource
* fxAppliedAt
* roundingMode
* provider
* reservedPoints
* pointReservationStatus
* createdAt
* updatedAt
* paidAt
* cancelledAt
* expiredAt

### 15.6. OrderItem

* id
* orderId
* productId
* productNameSnapshot
* unitPriceAmount
* unitPriceCurrency
* checkoutUnitPriceAmount
* checkoutCurrency
* quantity
* lineTotalAmount
* metadataSnapshot

### 15.7. Payment

* id
* orderId
* userId
* provider
* providerPaymentId
* providerTransactionId
* status
* amount
* currency
* paymentUrl
* qrCode
* rawProviderResponse
* expiresAt
* paidAt
* createdAt
* updatedAt

### 15.8. PaymentEvent

* id
* paymentId
* provider
* eventType
* eventId
* signatureValid
* payload
* processedAt
* createdAt

### 15.9. PointAccount

* id
* userId
* balance
* availableBalance
* reservedBalance
* createdAt
* updatedAt

### 15.10. PointTransaction

* id
* userId
* orderId
* type
* points
* amountVndEquivalent
* status
* idempotencyKey
* expiresAt
* metadata
* createdAt

### 15.11. Subscription

* id
* userId
* plan
* status
* startedAt
* expiresAt
* lastRenewedAt
* sourceOrderId
* createdAt
* updatedAt

### 15.12. LlmSearchQuery

* id
* userId
* prompt
* parsedIntent
* extractedFilters
* suggestedProductIds
* resultProductIds
* mode
* confidence
* fallbackStatus
* fallbackReason
* provider
* latencyMs
* errorMessage
* createdAt

---

## 16. Technical Architecture

### 16.1. NestJS modules

* AuthModule
* UsersModule
* ProductsModule
* CartModule
* CheckoutModule
* OrdersModule
* PaymentsModule
* BillingModule
* PointsModule
* SearchModule
* GeminiModule
* AdminDevModule
* AuditModule
* ConfigModule

### 16.2. Payment adapter interface

MVP implement payOS only, nhưng giữ abstraction:

* createPayment(order)
* verifyWebhook(payload, headers)
* parsePaymentStatus(payload)
* queryPaymentStatus(providerPaymentId)
* cancelPayment(providerPaymentId)
* refundPayment(providerPaymentId) — phase sau

### 16.3. Idempotency

Cần idempotency cho:

* checkout request
* create payment
* webhook processing
* point earning
* point reservation
* point confirmation
* point release
* order paid transition
* subscription activation/extension

### 16.4. Logging

Log:

* checkout created
* points reserved
* payment created
* webhook received
* signature verification result
* status transitions
* point ledger transactions
* subscription activated/extended
* LLM fallback reason

Không log:

* auth token
* provider secret
* full sensitive payload
* PII không cần thiết
* payment secret/signature key

---

## 17. Risks & Mitigation

### Risk 1 — Payment webhook duplicate

Mitigation:

* unique provider transaction id
* unique webhook event id nếu có
* DB transaction
* row lock
* idempotency key

### Risk 2 — Tin nhầm frontend return URL

Mitigation:

* return URL chỉ dùng cho UX
* order paid chỉ dựa trên webhook/callback verified
* success page poll backend order status

### Risk 3 — LLM hallucinate price/product

Mitigation:

* deterministic DB search trước
* Gemini chỉ ranking/explanation
* backend validate schema
* backend re-check product ids/prices từ DB

### Risk 4 — Auth complexity

Mitigation:

* dùng Clerk MVP
* NestJS verify token
* internal user table riêng

### Risk 5 — Money calculation sai

Mitigation:

* amount lưu integer
* USD lưu cents
* VND lưu integer
* không dùng floating point
* snapshot FX rate
* backend tính lại toàn bộ amount
* round up to nearest 1,000 VND

### Risk 6 — Points bị cộng/trừ sai

Mitigation:

* ledger append-only
* point transaction idempotency
* max redeem 30%
* reserve points khi tạo order
* confirm/release points theo payment result
* expire sau 12 tháng
* no direct balance mutation without ledger

### Risk 7 — Subscription scope creep

Mitigation:

* MVP chỉ làm simulated monthly subscription
* không làm recurring auto-charge
* không lưu payment method
* không xử lý failed recurring payment
* không làm grace period trong MVP

### Risk 8 — Scope creep tổng thể

Mitigation:

* MVP chỉ payOS
* Pro là simulated subscription 30 ngày
* Passkeys/refund/multi-provider để phase sau
* Admin/dev page chỉ để inspect, không làm full portal
* Security hardening nâng cao để phase sau

---

## 18. MVP Acceptance Criteria

MVP hoàn thành khi:

* User login/logout được.
* User xem product list được.
* User add product vào cart được.
* User update/remove cart item được.
* User checkout bằng VND được.
* Backend tạo order/payment đúng.
* Backend convert USD sang VND bằng static FX rate.
* Backend round up amount tới 1,000 VND.
* User nhận payment URL/QR.
* Webhook/callback verified thành công.
* Order được mark paid sau verified webhook.
* Billing page hiển thị Free/Pro.
* Mua Pro thành công activate Pro 30 ngày.
* Renew Pro thành công extend thêm 30 ngày.
* Mua/renew Pro thành công cộng đúng 10 points.
* User dùng points cho lần mua sau.
* User không dùng points vượt quá 30% subtotal.
* Khi checkout, points được reserve.
* Payment success confirm reserved points.
* Payment failed/cancelled/expired release reserved points.
* Points có expiry 12 tháng.
* Reward ledger append-only.
* Gemini search hoạt động với DB search first.
* Gemini fail thì fallback deterministic search.
* Admin/dev page inspect được orders/payments/payment events/reward ledger/LLM logs.
* Không flow nào tin price/payment status từ frontend.
* Duplicate webhook không tạo duplicate points hoặc duplicate paid transition.

---

## 19. Final Recommended Decisions

### Auth

Use **Clerk + Google OAuth** for MVP.

### Payment

Use **payOS** as primary MVP provider.

Không implement mock payment provider trong MVP.

### Subscription

Use **simulated monthly subscription**.

Rule:

* Pro price: 10 USD.
* Checkout currency: VND.
* Pro duration: 30 days.
* No recurring auto-charge.
* Manual renew only.
* Renew while active extends from current expiresAt.
* Renew after expired starts from current time.

### Currency

* Product can be listed as USD.
* Checkout is VND.
* Static FX rate for MVP.
* USD stored as cents.
* VND stored as integer.
* Round up to nearest 1,000 VND.
* Snapshot FX rate and rounding mode into order.

### Points

* Buying or renewing Pro grants 10 points.
* 1 point = 1,000 VND.
* Max redeem = 30% of order subtotal.
* Points expire after 12 months.
* Ledger append-only.
* Reserve points when creating order.
* Confirm points on payment success.
* Release points on payment failed/cancelled/expired.

### LLM Search

* Deterministic DB search first.
* Gemini ranks/explains candidate products.
* Backend validates all LLM output.
* Fallback search required.

### Admin/Dev

Include simple admin/dev inspection page in MVP for debugging:

* orders
* payments
* payment events
* reward ledger
* point balance
* subscription
* LLM search logs

### Security

Because this is a learning/demo project:

* Basic auth protection is required.
* Webhook signature verification is required.
* Backend must not trust frontend price/payment status.
* Advanced security hardening can be phase later.

Phase later may include:

* strict redirect URL allowlist
* rate limit
* RBAC admin permission
* payload encryption/redaction
* detailed audit policy
* production-grade CORS policy

---

## 20. Suggested Implementation Phases

### Phase 0 — Project setup

* Setup NestJS backend
* Setup React frontend
* Setup PostgreSQL
* Setup Prisma/TypeORM
* Setup env config
* Setup basic product seed

### Phase 1 — Auth + User

* Integrate Clerk
* Google OAuth login
* Backend verify token
* Sync internal user
* Protect APIs

### Phase 2 — Product + Cart

* Product list
* Product detail
* Server-side cart
* Add/update/remove cart item
* Cart summary

### Phase 3 — Checkout + Currency

* Checkout endpoint
* Order creation
* Order item snapshot
* USD to VND conversion
* Round up to nearest 1,000 VND
* FX snapshot

### Phase 4 — Points Reservation

* PointAccount
* PointTransaction
* Earn points structure
* Reserve points on checkout
* Confirm/release points based on payment result

### Phase 5 — payOS Payment

* Payment adapter
* Create payment link/QR
* Return/cancel page
* Webhook endpoint
* Verify webhook
* Mark payment/order paid
* Idempotency handling

### Phase 6 — Subscription

* Billing page
* Free/Pro display
* Activate Pro 30 days
* Renew Pro
* Expiry lazy check
* Earn 10 points on Pro purchase/renewal

### Phase 7 — LLM Search

* Deterministic search
* Gemini integration
* Structured response schema
* DB-first ranking
* Fallback search
* LLM search log

### Phase 8 — Admin/Dev Inspection

* Orders list
* Payment list
* Payment event list
* Reward ledger view
* Subscription view
* LLM search query logs
* Order timeline

### Phase 9 — Test Plan & Hardening

* Unit tests for money calculation
* Unit tests for point redeem/reserve/confirm/release
* Integration tests for checkout
* Integration tests for webhook
* Integration tests for subscription activation/renewal
* LLM fallback tests
* Basic logging cleanup

---

## 21. Important Test Scenarios

### Auth

* User login lần đầu tạo internal user.
* Invalid token trả `401`.
* User chưa login không checkout được.

### Cart

* Add same product twice increases quantity.
* Quantity không được nhỏ hơn 1.
* Quantity không vượt quá 10.
* Empty cart checkout bị reject.
* Product inactive không add được.

### Checkout

* Backend không tin price từ frontend.
* Product price thay đổi sau khi add cart, order dùng DB price tại checkout time.
* USD to VND conversion đúng.
* Amount được round up tới 1,000 VND.
* Checkout với points reserve thành công.
* Checkout vượt quá 30% subtotal bị reject.

### Payment

* payOS create payment thành công.
* Webhook success mark payment paid.
* Webhook success mark order paid.
* Wrong signature không mark paid.
* Amount mismatch không mark paid.
* Currency mismatch không mark paid.
* Duplicate webhook không duplicate transition.
* Return URL success nhưng chưa có webhook thì order vẫn pending.

### Points

* Payment success confirm reserved points.
* Payment failed release reserved points.
* Payment cancelled release reserved points.
* Payment expired release reserved points.
* Pro purchase cộng 10 points.
* Duplicate webhook không cộng 10 points lần hai.
* Expired points không được dùng.
* Balance không âm.

### Subscription

* User mới default Free.
* Mua Pro lần đầu set `PRO_ACTIVE`.
* Pro có expiresAt = now + 30 days.
* Renew khi đang active extend từ current expiresAt.
* Renew khi expired extend từ current time.
* Billing page hiển thị đúng current plan.

### LLM Search

* Query “tìm sản phẩm dưới 10 đô” trả product hợp lệ.
* Gemini trả fake product id thì backend ignore.
* Gemini timeout thì fallback deterministic search.
* Gemini invalid JSON thì fallback deterministic search.
* Gemini không thể đổi price/discount.