import { useEffect } from "react";

export default function SupplierPage() {
  useEffect(() => {
    window.location.href = "/shopkeeper";
  }, []);
  return null;
}
