import HeroBanner from "../components/home/Herobanner.jsx";
import TopProducts from "../components/home/Topproducts.jsx";
import TopShops from "../components/home/TopShop.jsx";
import VoucherTeaser from "../components/home/Voucherteaser.jsx";

export default function HomePage() {
  return (
    <div className="bg-[#f5f5f5]">
      <HeroBanner />
      <VoucherTeaser />
      <TopProducts />
      <TopShops />
    </div>
  );
}
