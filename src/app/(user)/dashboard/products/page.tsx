import { FiZap } from "react-icons/fi";
import { FaInstagram, FaFacebook } from "react-icons/fa";

const flashSaleProducts = [
  {
    id: 174,
    title: "FOREIGN IG ACCOUNTS",
    stock: "723 Available",
    price: "₦800.00",
    icon: FaInstagram,
    iconColor: "text-pink-500",
    bgColor: "bg-pink-500/10",
  },
  {
    id: 175,
    title: "RANDOM COUNTRY FB ( WITH PAGE )",
    stock: "530 Available",
    price: "₦2,000.00",
    icon: FaFacebook,
    iconColor: "text-blue-600",
    bgColor: "bg-blue-500/10",
  },
];

export default function MarketplaceScreen() {
  return (
      <main>
          {/* Title */}
      <div className="mb-6">
        <h2 className="text-2xl font-black text-slate-900">Marketplace</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Browse all our digital products in one place.
        </p>
      </div>

      {/* Category Header */}
      <div className="mb-4 flex items-center gap-2">
        <span className="rounded-md bg-amber-500/10 p-1.5 text-amber-600 font-bold text-xs flex items-center gap-1">
          <FiZap className="fill-amber-500" /> A
        </span>
        <h3 className="text-sm font-extrabold text-slate-900 tracking-wide flex items-center gap-1.5">
          FLASH SALE 🔥
        </h3>
      </div>
      <p className="text-[11px] font-semibold text-slate-400 mb-4 -mt-2">
        2 products available
      </p>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {flashSaleProducts.map((product) => (
          <div
            key={product.id}
            className="flex flex-col justify-between rounded-3xl border border-purple-100 bg-white p-5 shadow-[0_4px_20px_-4px_rgba(116,62,232,0.06)] transition hover:shadow-md"
          >
            <div>
              {/* Product Badge */}
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-2xl ${product.bgColor} ${product.iconColor}`}
              >
                <product.icon className="h-6 w-6" />
              </div>

              <h4 className="mt-4 text-xs font-extrabold uppercase text-slate-900 tracking-wide">
                {product.title}
              </h4>

              {/* In-Stock Pill */}
              <div className="mt-3 flex items-center gap-1.5 rounded-lg bg-slate-50 border border-slate-100 px-2.5 py-1 w-fit">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span className="text-[11px] font-medium text-slate-500">
                  {product.stock}
                </span>
              </div>
            </div>

            {/* Price & Action */}
            <div className="mt-6 flex items-center justify-between pt-2">
              <span className="text-base font-extrabold text-purple-700">
                {product.price}
              </span>
              <button className="rounded-xl bg-[#743ee8] px-5 py-2 text-xs font-bold text-white shadow-sm shadow-purple-500/30 transition hover:bg-[#622fd4] active:scale-95">
                Buy
              </button>
            </div>
          </div>
        ))}
      </div>
      </main>
  );
}