import React from "react";
import Link from "next/link";
import { assets } from "../../assets/assets";
import Image from "next/image";
import { usePathname } from "next/navigation";

const SideBar = () => {
  const pathname = usePathname();
  const menuItems = [
    {
      name: "Overview",
      path: "/seller/overview",
      icon: assets.dashboard_icon || assets.add_icon || null,
    },
    {
      name: "Sales Analytics",
      path: "/seller/sales-analytics",
      icon: assets.analytics_icon || assets.add_icon || null,
    },
    {
      name: "Add Product",
      path: "/seller",
      icon: assets.add_icon || null,
    },
    {
      name: "Product List",
      path: "/seller/product-list",
      icon: assets.product_list_icon || null,
    },
    {
      name: "Top Products",
      path: "/seller/top-products",
      icon: assets.star_icon || assets.analytics_icon || null,
    },
    {
      name: "Stock Manager",
      path: "/seller/manage-stock",
      icon: assets.order_icon || null,
    },
    {
      name: "Out of Stock",
      path: "/seller/out-of-stock",
      icon: assets.warning_icon || assets.alert_icon || assets.order_icon || null,
    },
    {
      name: "Orders",
      path: "/seller/orders",
      icon: assets.order_icon || null,
    },
    {
      name: "Manage Orders",
      path: "/seller/manage-orders",
      icon: assets.manage_orders_icon || assets.order_icon || null,
    },
    {
      name: "Add Category",
      path: "/seller/add-category",
      icon: assets.category_icon || assets.add_icon || null,
    },
    {
      name: "Manage Category",
      path: "/seller/manage-category",
      icon: assets.category_icon || assets.add_icon || null,
    },
  ];

  return (
    <div className="md:w-64 w-16 border-r min-h-screen text-base border-gray-300 py-2 flex flex-col">
      {menuItems.map((item) => {
        const isActive = pathname === item.path;

        return (
          <Link href={item.path} key={item.name} passHref>
            <div
              className={`flex items-center py-3 px-4 gap-3 cursor-pointer ${
                isActive
                  ? "border-r-4 md:border-r-[6px] bg-orange-600/10 border-orange-500/90"
                  : "hover:bg-gray-100/90 border-white"
              }`}
            >
              {item.icon && (
                <Image
                  src={item.icon}
                  alt={`${item.name.toLowerCase()}_icon`}
                  className="w-7 h-7"
                  width={28}
                  height={28}
                />
              )}
              <p className="md:block hidden text-center">{item.name}</p>
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export default SideBar;
