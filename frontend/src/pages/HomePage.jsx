import HeroBanner      from "../components/home/Herobanner.jsx";
import WelcomeSection  from "../components/home/Welcomesection.jsx";
import TopProducts     from "../components/home/Topproducts.jsx";
import TopShops   from "../components/home/TopShop.jsx";

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
