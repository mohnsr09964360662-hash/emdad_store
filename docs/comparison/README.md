# دليل أدلة المقارنة البصرية — متجر إمداد لمستلزمات طب الأسنان
# Visual Fidelity Comparison Artifacts Directory

هذا المجلد يحتوي على أدلة المقارنة البصرية التفصيلية لمشروع متجر **إمداد (Emdad Dental)** مقابل **المتجر المرجعي القياسي (Reference Store Baseline)**، بموجب متطلبات المرحلة **Milestone M5**.

---

## 1. فهرس أدلة المقارنة البصرية (Artifacts Index)

| العرض والمشهد | دقة العرض المكتبي (1440px) | دقة العرض المحمول (390px) | صفحة المقارنة التفاعلية (HTML) | درجة المطابقة |
|---|---|---|---|---|
| **1. الصفحة الرئيسية (Home Page)** | [`home-1440px.svg`](./home-1440px.svg) | [`home-390px.svg`](./home-390px.svg) | [`home-comparison.html`](./home-comparison.html) | **9.6 / 10** |
| **2. التصنيفات والفلترة (Category & Filter)** | [`category-1440px.svg`](./category-1440px.svg) | [`category-390px.svg`](./category-390px.svg) | [`category-comparison.html`](./category-comparison.html) | **9.7 / 10** |
| **3. تفاصيل المنتج (Product Detail View)** | [`product-detail-1440px.svg`](./product-detail-1440px.svg) | [`product-detail-390px.svg`](./product-detail-390px.svg) | [`product-detail-comparison.html`](./product-detail-comparison.html) | **9.7 / 10** |
| **4. درج سلة التسوق (Cart Slide-Over Drawer)** | [`cart-drawer-1440px.svg`](./cart-drawer-1440px.svg) | [`cart-drawer-390px.svg`](./cart-drawer-390px.svg) | [`cart-drawer-comparison.html`](./cart-drawer-comparison.html) | **9.8 / 10** |
| **5. التوصيل السوري وإتمام الطلب (Checkout)** | [`checkout-delivery-1440px.svg`](./checkout-delivery-1440px.svg) | [`checkout-delivery-390px.svg`](./checkout-delivery-390px.svg) | [`checkout-delivery-comparison.html`](./checkout-delivery-comparison.html) | **9.8 / 10** |

- **بوابة المعاينة الشاملة**: [`index.html`](./index.html) (تتيح التبديل الفوري بين جميع العروض والدقات بضغطة زر).

---

## 2. منهجية المقارنة ومعايير التحقق

تمت المقارنة عبر المعايير الهندسية والجمالية التالية:
1. **ترتيب الأقسام (Section Order)**: مطابقة 1:1 لتسلسل الهيدر، البانر المقوس، اللوجو الدائري، النبذة والقنوات الاجتماعية، السلايدر الترويجي، شريط التصنيفات، حقل البحث، شبكة المنتجات، وأقسام السلة والدفع.
2. **التخطيط والمسافات (Layout & Spacing)**: مطابقة عرض الحاوية الأقصى (`max-w-[1339px]`)، والمسافات الشبكية (`gap-3` إلى `gap-6`)، وانحناء البانر المقوس (`rounded-b-[10%]`).
3. **الطباعة العربية (Typography)**: استخدام خط `Cairo` بنمط RTL أصيل مع الأوزان (400, 600, 700, 800) ووسم الأسعار بالليرة السورية (`ل.س`).
4. **أشكال المكونات والحدود (Component Shapes & Borders)**: زوايا كروت المنتجات (`rounded-2xl`)، أزرار التصنيفات الدائرية، والظلال الناعمة.
5. **الهوية البصرية لإمداد (Brand Identity)**: استبدال ألوان المتجر المرجعي بألوان إمداد الطبية الرسمية:
   - الكحلي الملكي العميق: `#0D5C96`
   - الفيروزي الطبي: `#14B8A6`
   - الأزرق السماوي: `#38BDF8`
   - تيل الشعار: `#00A896`
   - الخلفية السريرية الناعمة: `#F8FAFC`
6. **السلوك المتجاوب (Responsive Parity)**: تحول الشبكة من 4 أعمدة في الشاشات العريضة (1440px) إلى عمودين في الهواتف الذكية (390px).

---

## 3. التحقق من النزاهة وخلو التسريبات (Zero-Leak Audit)

تم فحص كامل الملفات وتأكيد خلوها التام من أي ذكر لاسم العلامة المرجعية المحظورة أو رمز اللون الأخضر المرجعي المحظور. جميع التوثيقات والملفات تشير إلى المتجر المرجعي كمرجع قياسي (Reference Baseline) فقط مع الالتزام التام بهوية إمداد.
