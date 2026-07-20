// Run with: node seed/seedProducts.js
// Populates the database with sample products for testing.
import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "../models/Product.js";

dotenv.config();

const sampleProducts = [
  {
    name: "Wireless Bluetooth Headphones",
    description: "Over-ear headphones with active noise cancellation, 30-hour battery life, and rich bass.",
    price: 2999,
    discountPrice: 2199,
    category: "Electronics",
    brand: "SoundPeak",
    stock: 45,
    images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600"],
  },
  {
    name: "Smart Fitness Watch",
    description: "Track your heart rate, sleep, and workouts with this water-resistant smartwatch.",
    price: 4499,
    discountPrice: 3599,
    category: "Electronics",
    brand: "FitTrack",
    stock: 30,
    images: ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600"],
  },
  {
    name: "Cotton Casual Shirt",
    description: "Breathable 100% cotton shirt, perfect for everyday wear.",
    price: 899,
    category: "Fashion",
    brand: "UrbanFit",
    stock: 100,
    images: ["https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600"],
  },
  {
    name: "Stainless Steel Water Bottle",
    description: "Insulated bottle that keeps drinks cold for 24 hours or hot for 12 hours. 1L capacity.",
    price: 599,
    category: "Home & Kitchen",
    brand: "HydroLife",
    stock: 80,
    images: ["https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600"],
  },
  {
    name: "Ergonomic Office Chair",
    description: "Adjustable lumbar support office chair with breathable mesh back.",
    price: 8999,
    discountPrice: 6999,
    category: "Furniture",
    brand: "ComfortPlus",
    stock: 15,
    images: ["https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=600"],
  },
  {
    name: "Organic Green Tea (100 bags)",
    description: "Premium organic green tea bags, rich in antioxidants.",
    price: 349,
    category: "Grocery",
    brand: "LeafPure",
    stock: 200,
    images: ["https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5?w=600"],
  },
];

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");
    await Product.deleteMany({});
    await Product.insertMany(sampleProducts);
    console.log(`Seeded ${sampleProducts.length} products successfully`);
    process.exit(0);
  } catch (err) {
    console.error("Seeding failed:", err.message);
    process.exit(1);
  }
};

run();
