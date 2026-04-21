import HeroBanner      from "../components/home/Herobanner.jsx";
import WelcomeSection  from "../components/home/Welcomesection.jsx";
import TopProducts     from "../components/home/Topproducts.jsx";
import TopShops   from "../components/home/TopShop.jsx";

/**
 * HomePage  —  /
 *
 * Layout theo mockup Image 1:
 * ┌──────────────────────────────┐
 * │  HeroBanner                  │  ← "Giảm giá cực mạnh..." + BIG SALE
 * │  WelcomeSection              │  ← Clouds + intro ZenGo
 * │  TopProducts                 │  ← Category tabs + carousel 2×3
 * │  VoucherTeaser               │  ← Banner + grid voucher + CTA
 * └──────────────────────────────┘
 */
export default function HomePage() {
  return (
    <div className="animate-fade-in">
      <HeroBanner />
      <WelcomeSection />
      <TopProducts />
      <TopShops />
    </div>
  );
}