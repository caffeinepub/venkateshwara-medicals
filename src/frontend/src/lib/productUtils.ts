import { Category } from "../backend";

export function getCategoryLabel(category: Category): string {
  switch (category) {
    case Category.medicines:
      return "Medicines";
    case Category.firstAid:
      return "First Aid";
    case Category.personalCare:
      return "Personal Care";
    case Category.medicalEquipment:
      return "Medical Equipment";
    case Category.vitaminsSupplements:
      return "Vitamins & Supplements";
    default:
      return "Other";
  }
}

export function getCategoryColor(category: Category): string {
  switch (category) {
    case Category.medicines:
      return "#1a6b3c";
    case Category.firstAid:
      return "#b94040";
    case Category.personalCare:
      return "#5a7a3a";
    case Category.medicalEquipment:
      return "#2a5a7a";
    case Category.vitaminsSupplements:
      return "#a87a20";
    default:
      return "#555";
  }
}

export function getCategoryIcon(category: Category): string {
  switch (category) {
    case Category.medicines:
      return "/assets/generated/cat-medicines.dim_200x200.png";
    case Category.firstAid:
      return "/assets/generated/cat-first-aid.dim_200x200.png";
    case Category.personalCare:
      return "/assets/generated/cat-personal-care.dim_200x200.png";
    case Category.medicalEquipment:
      return "/assets/generated/cat-medical-equipment.dim_200x200.png";
    case Category.vitaminsSupplements:
      return "/assets/generated/cat-vitamins.dim_200x200.png";
    default:
      return "";
  }
}

// Maps backend imageUrl values (seeded) to the correct generated asset paths
const IMAGE_URL_MAP: Record<string, string> = {
  "/assets/generated/paracetamol.jpg":
    "/assets/generated/product-paracetamol.dim_400x400.png",
  "/assets/generated/bandages.jpg":
    "/assets/generated/product-bandage.dim_400x400.png",
  "/assets/generated/thermometer.jpg":
    "/assets/generated/product-thermometer.dim_400x400.png",
  "/assets/generated/sanitizer.jpg":
    "/assets/generated/product-hand-sanitizer.dim_400x400.png",
  "/assets/generated/vitaminc.jpg":
    "/assets/generated/product-vitamin-c.dim_400x400.png",
  "/assets/generated/ibuprofen.jpg":
    "/assets/generated/product-cetirizine.dim_400x400.png",
  "/assets/generated/antiseptic.jpg":
    "/assets/generated/product-antiseptic.dim_400x400.png",
  "/assets/generated/bpmonitor.jpg":
    "/assets/generated/product-bp-monitor.dim_400x400.png",
  "/assets/generated/facewash.jpg":
    "/assets/generated/product-aloe-vera-facewash.dim_400x400.png",
  "/assets/generated/calciumd3.jpg":
    "/assets/generated/product-omega3.dim_400x400.png",
  "/assets/generated/coughsyrup.jpg":
    "/assets/generated/product-omeprazole.dim_400x400.png",
  "/assets/generated/firstaidkit.jpg":
    "/assets/generated/product-gauze.dim_400x400.png",
  "/assets/generated/nebulizer.jpg":
    "/assets/generated/product-oximeter.dim_400x400.png",
  "/assets/generated/sunscreen.jpg":
    "/assets/generated/product-sunscreen-lotion.dim_400x400.png",
  "/assets/generated/multivitamin.jpg":
    "/assets/generated/product-multivitamin.dim_400x400.png",
  "/assets/generated/immunitysyrup.jpg":
    "/assets/generated/product-amoxicillin.dim_400x400.png",
};

export function getProductImageUrl(product: {
  imageUrl: string;
  name: string;
}): string {
  if (!product.imageUrl) {
    return `https://placehold.co/400x400/e8f5ee/1a6b3c?text=${encodeURIComponent(product.name.slice(0, 20))}`;
  }

  // Check if the imageUrl maps to a known generated asset
  if (IMAGE_URL_MAP[product.imageUrl]) {
    return IMAGE_URL_MAP[product.imageUrl];
  }

  // If it already points to a generated asset, use it directly
  if (product.imageUrl.startsWith("/assets/generated/")) {
    return product.imageUrl;
  }

  // Fallback placeholder
  return `https://placehold.co/400x400/e8f5ee/1a6b3c?text=${encodeURIComponent(product.name.slice(0, 20))}`;
}

export const ALL_CATEGORIES = [
  { value: null, label: "All Products" },
  { value: Category.medicines, label: "Medicines" },
  { value: Category.firstAid, label: "First Aid" },
  { value: Category.personalCare, label: "Personal Care" },
  { value: Category.medicalEquipment, label: "Medical Equipment" },
  { value: Category.vitaminsSupplements, label: "Vitamins & Supplements" },
];
