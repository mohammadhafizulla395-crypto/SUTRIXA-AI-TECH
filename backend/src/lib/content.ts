import { Product } from "./types";

export {
  readProducts,
  writeProducts,
  getPublishedProducts,
  getProductBySlug,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "./github";

export type { Product } from "./types";