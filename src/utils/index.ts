import { Op } from "sequelize";
import { Order } from "../models";

export async function generateOrderNumber() {
  // get tanggal hari ini
  const today = new Date();
  today.setHours(0, 0, 0, 0); // set ke awal hari

  const year = today.getFullYear();
  const month = (today.getMonth() + 1).toString().padStart(2, "0");
  const day = today.getDate().toString().padStart(2, "0");

  const datePrefix = `${year}${month}${day}`; // contoh hasil: "20251013"

  // cari order terakhir yang dibuat pada hari ini (dalam sebuah transaksi)
  const lastOrderToday = await Order.findOne({
    where: {
      createdAt: {
        [Op.gte]: today, // Op.gte: "greater than or equal to"
      },
    },
    order: [["createdAt", "DESC"]], // urutkan dari yang terbaru
  });

  let sequence = 1; // default sequence jika ini order pertama hari ini

  // jika sudah ada order hari ini, ambil nomor urutnya dan +1
  if (lastOrderToday) {
    const lastOrderNumber = lastOrderToday.orderNumber; // misal: "ORD-20251013-0015"
    const lastSequence = parseInt(lastOrderNumber.split("-")[2]);
    sequence = lastSequence + 1;
  }

  // format nomor urut dengan padding nol (misal: 1 -> "0001", 16 -> "0016")
  const paddedSequence = sequence.toString().padStart(4, "0");

  // gabungkan menjadi nomor order final
  const newOrderNumber = `ORD-${datePrefix}-${paddedSequence}`; // Hasil: "ORD-2025103-0001"

  return newOrderNumber;
}

// Cara penggunaan di dalam controller Anda
// const noOrder = await generateOrderNumber();
// const newOrder = await Order.create({ noOrder, ... });
