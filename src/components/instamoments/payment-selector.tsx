import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  description: string;
  isPopular?: boolean;
  isAvailable: boolean;
}

interface PaymentSelectorProps {
  selectedMethod?: string;
  onSelect: (methodId: string) => void;
  className?: string;
}

const paymentMethods: PaymentMethod[] = [
  {
    id: "gcash",
    name: "GCash",
    icon: "💚",
    description: "Pay with GCash wallet",
    isPopular: true,
    isAvailable: true,
  },
  {
    id: "paymaya",
    name: "PayMaya",
    icon: "💙",
    description: "Pay with PayMaya wallet",
    isAvailable: true,
  },
  {
    id: "grabpay",
    name: "GrabPay",
    icon: "🟢",
    description: "Pay with GrabPay wallet",
    isAvailable: true,
  },
  {
    id: "bpi",
    name: "BPI",
    icon: "🏦",
    description: "BPI Online Banking",
    isAvailable: true,
  },
  {
    id: "bdo",
    name: "BDO",
    icon: "🏦",
    description: "BDO Online Banking",
    isAvailable: true,
  },
  {
    id: "credit_card",
    name: "Credit Card",
    icon: "💳",
    description: "Visa, Mastercard, JCB",
    isAvailable: true,
  },
];

export function PaymentSelector({
  selectedMethod,
  onSelect,
  className,
}: PaymentSelectorProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <div className="text-center space-y-2">
        <h3 className="mobile-heading font-semibold">Choose Payment Method</h3>
        <p className="mobile-text text-muted-foreground">
          Select your preferred payment option
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {paymentMethods.map((method) => (
          <Card
            key={method.id}
            className={cn(
              "cursor-pointer transition-all duration-200",
              "border-2 hover:border-golden/30",
              selectedMethod === method.id
                ? "border-golden bg-golden/5 shadow-golden"
                : "border-border hover:shadow-md",
              !method.isAvailable && "opacity-50 cursor-not-allowed",
            )}
            onClick={() => method.isAvailable && onSelect(method.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{method.icon}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium mobile-text">{method.name}</h4>
                      {method.isPopular && (
                        <Badge
                          variant="secondary"
                          className="text-xs bg-golden/20 text-golden-foreground"
                        >
                          Popular
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {method.description}
                    </p>
                  </div>
                </div>

                {selectedMethod === method.id && (
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-golden">
                    <Check className="h-4 w-4 text-golden-foreground" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedMethod && (
        <div className="mt-4 p-4 bg-golden/10 border border-golden/20 rounded-lg">
          <div className="flex items-center gap-2">
            <Check className="h-5 w-5 text-golden" />
            <span className="font-medium">
              {paymentMethods.find((m) => m.id === selectedMethod)?.name}{" "}
              selected
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
