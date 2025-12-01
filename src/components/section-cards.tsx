import { MinusIcon, PlusIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface CardData {
  title: string;
  value: string;
  change?: {
    value?: string;
    trend?: "up" | "down";
    description: string;
  };
  footerDescription?: string;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  iconBgColor?: string;
  cardBgColor?: string; // New prop for card background color
  textColor?: string; // Optional text color to ensure readability
}

type LayoutType = "1x2" | "2x2" | "1x3" | "1x4" | "1x5" | "2x3" | "3x3";

interface SectionCardsProps {
  cards: CardData[];
  className?: string;
  layout?: LayoutType;
  cardBackgrounds?: (string | undefined)[]; // Alternative way: array of background colors for each card
}

const layoutConfig = {
  "1x2": {
    gridClass: "grid-cols-1 @xl/main:grid-cols-2",
    containerClass: "max-w-4xl mx-auto",
  },
  "2x2": {
    gridClass: "grid-cols-1 @md/main:grid-cols-2",
    containerClass: "w-full",
  },
  "1x3": {
    gridClass: "grid-cols-1 @xl/main:grid-cols-3",
    containerClass: "mx-auto",
  },
  "1x4": {
    gridClass: "grid-cols-1 @md/main:grid-cols-2 @xl/main:grid-cols-4",
    containerClass: "w-full",
  },
  "1x5": {
    gridClass: "grid-cols-1 @md/main:grid-cols-2 @xl/main:grid-cols-5",
    containerClass: "w-full",
  },
  "2x3": {
    gridClass: "grid-cols-1 @md/main:grid-cols-2 @xl/main:grid-cols-3",
    containerClass: "w-full",
  },
  "3x3": {
    gridClass:
      "grid-cols-1 @md/main:grid-cols-2 @xl/main:grid-cols-3 @2xl/main:grid-cols-4 @5xl/main:grid-cols-5",
    containerClass: "w-full",
  },
};

export function SectionCards({
  cards,
  className = "",
  layout = "1x4",
  cardBackgrounds = [],
}: SectionCardsProps) {
  const config = layoutConfig[layout];

  return (
    <div
      className={cn(
        "grid w-full gap-4",
        config.gridClass,
        config.containerClass,
        className
      )}
    >
      {cards.map((card, index) => {
        // Get background color from either card.cardBgColor or cardBackgrounds array
        const backgroundColor = card.cardBgColor || cardBackgrounds[index];
        // Use provided text color or default based on background
        const textColor =
          card.textColor || (backgroundColor ? "text-white" : "");
        const mutedTextColor = backgroundColor
          ? "text-white/80"
          : "text-muted-foreground";

        return (
          <Card
            key={index}
            className={cn(
              "@container/card w-full h-full shadow-none",
              "flex flex-col",
              backgroundColor && "border-0", // Remove border if background is set
              textColor
            )}
            style={backgroundColor ? { backgroundColor } : undefined}
          >
            <CardHeader className="relative flex-1">
              <CardDescription
                className={cn(
                  "flex items-center justify-between gap-2",
                  textColor || "text-muted-foreground"
                )}
              >
                <div className="flex items-center gap-2">
                  {card.icon && (
                    <div
                      className={cn(
                        "flex items-center justify-center p-2 rounded-lg",
                        card.iconBgColor ||
                          (backgroundColor ? "bg-white/20" : "bg-primary/10")
                      )}
                    >
                      <div
                        className={cn(
                          "size-4",
                          card.iconBgColor
                            ? "text-white"
                            : backgroundColor
                            ? "text-white"
                            : "text-primary"
                        )}
                      >
                        {card.icon}
                      </div>
                    </div>
                  )}
                  <span className=" text-[16px] font-medium">
                  {card.title}
                  </span>
                </div>

                {card.rightIcon && (
                  <div
                    className={cn(
                      "flex items-center justify-center p-2 rounded-lg",
                      card.iconBgColor ||
                        (backgroundColor ? "bg-white/20" : "bg-primary/10")
                    )}
                  >
                    <div
                      className={cn(
                        "size-4",
                        card.iconBgColor
                          ? "text-white"
                          : backgroundColor
                          ? "text-white"
                          : "text-primary"
                      )}
                    >
                      {card.rightIcon}
                    </div>
                  </div>
                )}
              </CardDescription>
              <CardTitle
                className={cn(
                  "@[250px]/card:text-5xl text-5xl mt-4 font-semibold tabular-nums",
                  textColor || "text-foreground"
                )}
              >
                {card.value}
              </CardTitle>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1 text-sm">
              <div className="flex items-center gap-2 w-full">
                <Badge
                  variant="outline"
                  className={cn(
                    "flex p-0 rounded-lg border-0 text-xs",
                    card.change?.trend === "up"
                      ? backgroundColor
                        ? "text-green-300"
                        : "text-green-600 dark:text-green-400"
                      : card.change?.trend === "down"
                      ? backgroundColor
                        ? "text-red-300"
                        : "text-red-600 dark:text-red-400"
                      : backgroundColor
                      ? "text-white/80"
                      : "text-muted-foreground"
                  )}
                >
                  {card.change?.trend === "up" ? (
                    <PlusIcon className="size-3" />
                  ) : card.change?.trend === "down" ? (
                    <MinusIcon className="size-3" />
                  ) : (
                    ""
                  )}
                  {card.change?.value}
                </Badge>
                <span className={mutedTextColor}>
                  {card.change?.description}
                </span>
              </div>
              {card.footerDescription && (
                <div className={mutedTextColor}>{card.footerDescription}</div>
              )}
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}
