import connectdb from "@/config/db";
import Order from "@/models/Order";
import Product from "@/models/Product";
import Category from "@/models/Category";
import User from "@/models/User";

export async function GET() {
  try {
    await connectdb();

    const orders = await Order.find().populate("items.product");
    const totalSales = orders.reduce((acc, order) => acc + order.amount, 0);
    const totalOrders = orders.length;

    const pendingOrders = orders.filter((order) => !order.isPaid).length;

    const totalCategories = await Category.countDocuments();
    const totalProducts = await Product.countDocuments();

    const outOfStock = await Product.countDocuments({
      $or: [{ stock: { $lte: 0 } }, { forceOutOfStock: true }],
    });

    // Total Customers - count unique users who placed orders
    const uniqueUsers = new Set(orders.map((order) => order.userId));
    const totalCustomers = uniqueUsers.size;

    // Average Order Value (AOV)
    const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

    // Low Stock Products (stock <= 5, excluding forceOutOfStock)
    const lowStockProducts = await Product.countDocuments({
      stock: { $lte: 5 },
      forceOutOfStock: false,
    });

    // Top selling products
    const productSalesMap = {};
    orders.forEach((order) => {
      order.items.forEach(({ product, quantity }) => {
        if (product && product._id) {
          const id = product._id.toString();
          productSalesMap[id] = productSalesMap[id] || {
            product,
            totalSold: 0,
          };
          productSalesMap[id].totalSold += quantity;
        }
      });
    });

    const topProducts = Object.values(productSalesMap)
      .sort((a, b) => b.totalSold - a.totalSold)
      .slice(0, 5);

    return Response.json({
      totalSales,
      totalOrders,
      pendingOrders,
      totalCategories,
      totalProducts,
      outOfStock,
      totalCustomers,
      averageOrderValue,
      lowStockProducts,
      topProducts,
    });
  } catch (error) {
    console.error("Overview Error:", error);
    return new Response("Server Error", { status: 500 });
  }
}
