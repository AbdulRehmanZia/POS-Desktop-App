import prisma from "../../db/db.js";
import ApiError from "../../utils/ApiError.js";
import moment from "moment";

export const exportSalesReport = async (req, res) => {
  try {
    const storeId = req.store?.id;
    const { startDate, endDate } = req.query;

    if (!storeId) {
      return ApiError(res, 400, null, "Store ID missing in request");
    }

    const whereClause = {
      storeId,
      isDeleted: false,
    };

    if (startDate && endDate) {
      whereClause.createdAt = {
        gte: moment(startDate).startOf("day").toDate(),
        lte: moment(endDate).endOf("day").toDate(),
      };
    }

    const sales = await prisma.sale.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            fullname: true,
          },
        },
        saleItems: {
          where: { isDeleted: false },
          include: {
            product: {
              select: {
                name: true,
                category: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Handle empty sales
    if (sales.length === 0) {
      const emptyCSV = "No sales data found for the specified date range";
      res.setHeader("Content-Type", "text/plain");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=sales-report-${moment().format("YYYY-MM-DD")}.csv`
      );
      return res.send(emptyCSV);
    }

    // Convert to CSV
    const csvData = sales.map((sale) => ({
      "Invoice ID": sale.id,
      Date: moment(sale.createdAt).format("YYYY-MM-DD HH:mm"),
      Customer: sale.customerName || "Walk-in Customer",
      Email: sale.customerEmail || "",
      Phone: sale.customerPhone || "",
      "Payment Type": sale.paymentType,
      "Total Amount": sale.totalAmount,
      Cashier: sale.user?.fullname || "Unknown",
      "Items Count": sale.saleItems.length,
      Items: sale.saleItems
        .map(
          (item) =>
            `${item.quantity}x ${item.product?.name || "Unknown Product"} @ Rs.${item.priceAtSale}`
        )
        .join("; "),
      Categories: [
        ...new Set(
          sale.saleItems
            .map((item) => item.product?.category?.name)
            .filter(Boolean)
        ),
      ].join(", "),
    }));

    // Set response headers
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=sales-report-${moment().format("YYYY-MM-DD")}.csv`
    );

    // Create CSV string with UTF-8 BOM for proper Excel compatibility
    const BOM = '\uFEFF';
    const headers = Object.keys(csvData[0]);
    const csvString =
      BOM +
      headers.join(",") +
      "\n" +
      csvData
        .map((row) =>
          headers
            .map((header) => {
              const field = row[header];
              // Handle special characters and commas in CSV
              return `"${String(field || "").replace(/"/g, '""')}"`;
            })
            .join(",")
        )
        .join("\n");

    res.send(csvString);
  } catch (error) {
    console.error("Export sales report error:", error);
    return ApiError(res, 500, error.message || "Internal Server Error", "Export Error");
  }
};