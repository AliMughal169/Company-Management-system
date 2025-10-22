import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Stock } from "@shared/schema";

interface ProductAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelectProduct: (product: Stock) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
}

export function ProductAutocomplete({
  value,
  onChange,
  onSelectProduct,
  label = "Product",
  placeholder = "Search products...",
  required = false,
}: ProductAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: products = [] } = useQuery<Stock[]>({
    queryKey: [`/api/stock/search?q=${searchTerm}`],
    enabled: searchTerm.length > 0,
  });

  useEffect(() => {
    setSearchTerm(value);
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    onChange(newValue);
    setIsOpen(true);
  };

  const handleSelectProduct = (product: Stock) => {
    onChange(product.productName);
    setSearchTerm(product.productName);
    onSelectProduct(product);
    setIsOpen(false);
  };

  const handleBlur = () => {
    setTimeout(() => setIsOpen(false), 200);
  };

  return (
    <div className="relative">
      {label && (
        <Label htmlFor="product-search" data-testid="label-product">
          {label} {required && <span className="text-destructive">*</span>}
        </Label>
      )}
      <Input
        id="product-search"
        data-testid="input-product-search"
        value={searchTerm}
        onChange={handleInputChange}
        onFocus={() => setIsOpen(true)}
        onBlur={handleBlur}
        placeholder={placeholder}
        autoComplete="off"
        required={required}
      />

      {isOpen && products.length > 0 && (
        <div
          className="absolute z-50 w-full mt-1 bg-card border rounded-md shadow-lg max-h-60 overflow-auto"
          data-testid="dropdown-products"
        >
          {products.map((product) => (
            <div
              key={product.id}
              data-testid={`product-option-${product.id}`}
              onMouseDown={(e) => {
                e.preventDefault();
                handleSelectProduct(product);
              }}
              className={cn(
                "p-3 cursor-pointer hover-elevate active-elevate-2 border-b last:border-b-0",
                product.quantity <= product.reorderLevel && "bg-destructive/10",
              )}
            >
              <div className="flex justify-between items-start gap-2">
                <div className="flex-1">
                  <div
                    className="font-medium"
                    data-testid={`text-product-name-${product.id}`}
                  >
                    {product.productName}
                  </div>
                  <div
                    className="text-sm text-muted-foreground"
                    data-testid={`text-sku-${product.id}`}
                  >
                    SKU: {product.sku}
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className="font-semibold"
                    data-testid={`text-price-${product.id}`}
                  >
                    ${product.unitPrice}
                  </div>
                  <Badge
                    variant={
                      product.quantity > product.reorderLevel
                        ? "default"
                        : "destructive"
                    }
                    className="text-xs"
                    data-testid={`badge-stock-${product.id}`}
                  >
                    {product.quantity} in stock
                  </Badge>
                </div>
              </div>
              {product.quantity <= product.reorderLevel && (
                <div
                  className="text-xs text-destructive mt-1"
                  data-testid={`warning-low-stock-${product.id}`}
                >
                  ⚠️ Low stock! Reorder level: {product.reorderLevel}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
