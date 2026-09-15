import { Product } from "./types";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || "";
const GITHUB_OWNER = process.env.GITHUB_OWNER || "";
const GITHUB_REPO = process.env.GITHUB_REPO || "";
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || "main";
const CONTENT_PATH = "content/products/products.json";

async function getLocalProducts(): Promise<Product[]> {
  const fs = await import("fs");
  const path = await import("path");
  const PRODUCTS_FILE = path.resolve(__dirname, "../../../content/products/products.json");
  try {
    if (!fs.existsSync(PRODUCTS_FILE)) return [];
    const data = fs.readFileSync(PRODUCTS_FILE, "utf-8");
    return JSON.parse(data) as Product[];
  } catch {
    return [];
  }
}

async function saveLocalProducts(products: Product[]): Promise<void> {
  const fs = await import("fs");
  const path = await import("path");
  const PRODUCTS_FILE = path.resolve(__dirname, "../../../content/products/products.json");
  const dir = path.dirname(PRODUCTS_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2), "utf-8");
}

async function githubReadProducts(): Promise<Product[]> {
  if (!GITHUB_TOKEN || !GITHUB_OWNER || !GITHUB_REPO) {
    return await getLocalProducts();
  }
  try {
    const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${CONTENT_PATH}?ref=${GITHUB_BRANCH}`;
    const res = await fetch(url, {
      headers: { Authorization: `token ${GITHUB_TOKEN}` },
    });
    if (!res.ok) return await getLocalProducts();
    const data: any = await res.json();
    const content = Buffer.from(data.content, "base64").toString("utf-8");
    return JSON.parse(content) as Product[];
  } catch {
    return await getLocalProducts();
  }
}

async function githubWriteProducts(products: Product[]): Promise<boolean> {
  if (!GITHUB_TOKEN || !GITHUB_OWNER || !GITHUB_REPO) {
    await saveLocalProducts(products);
    return false;
  }
  try {
    const content = Buffer.from(JSON.stringify(products, null, 2)).toString("base64");
    const existingUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${CONTENT_PATH}?ref=${GITHUB_BRANCH}`;
    const existingRes = await fetch(existingUrl, {
      headers: { Authorization: `token ${GITHUB_TOKEN}` },
    });
    let sha: string | undefined;
    if (existingRes.ok) {
      const existingData: any = await existingRes.json();
      sha = existingData.sha;
    }
    const putUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${CONTENT_PATH}`;
    const res = await fetch(putUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `token ${GITHUB_TOKEN}`,
      },
      body: JSON.stringify({
        message: "Update products via admin",
        content,
        sha,
        branch: GITHUB_BRANCH,
      }),
    });
    await saveLocalProducts(products);
    return res.ok;
  } catch {
    await saveLocalProducts(products);
    return false;
  }
}

export async function readProducts(): Promise<Product[]> {
  return await githubReadProducts();
}

export async function writeProducts(products: Product[]): Promise<void> {
  await githubWriteProducts(products);
}

export async function getPublishedProducts(): Promise<Product[]> {
  const products = await readProducts();
  return products.filter((p) => p.status === "published");
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  const products = await getPublishedProducts();
  return products.find((p) => p.slug === slug);
}

export async function getProductById(id: string): Promise<Product | undefined> {
  const products = await readProducts();
  return products.find((p) => p.id === id);
}

export async function createProduct(product: Product): Promise<void> {
  const products = await readProducts();
  products.push(product);
  await writeProducts(products);
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product | undefined> {
  const products = await readProducts();
  const index = products.findIndex((p) => p.id === id);
  if (index === -1) return undefined;
  products[index] = { ...products[index], ...updates, updatedAt: new Date().toISOString() };
  await writeProducts(products);
  return products[index];
}

export async function deleteProduct(id: string): Promise<boolean> {
  const products = await readProducts();
  const filtered = products.filter((p) => p.id !== id);
  if (filtered.length === products.length) return false;
  await writeProducts(filtered);
  return true;
}

export async function githubWriteFile(repoPath: string, base64Content: string, commitMessage: string): Promise<boolean> {
  if (!GITHUB_TOKEN || !GITHUB_OWNER || !GITHUB_REPO) return false;
  try {
    const existingUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${repoPath}?ref=${GITHUB_BRANCH}`;
    const existingRes = await fetch(existingUrl, {
      headers: { Authorization: `token ${GITHUB_TOKEN}` },
    });
    let sha: string | undefined;
    if (existingRes.ok) {
      const existingData: any = await existingRes.json();
      sha = existingData.sha;
    }
    const putUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${repoPath}`;
    const res = await fetch(putUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `token ${GITHUB_TOKEN}`,
      },
      body: JSON.stringify({
        message: commitMessage,
        content: base64Content,
        sha,
        branch: GITHUB_BRANCH,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}