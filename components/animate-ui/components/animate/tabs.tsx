"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type TabsContextType = {
  value?: string;
  indicatorId: string;
};

const TabsContext = React.createContext<TabsContextType>({
  value: undefined,
  indicatorId: "tabs-indicator",
});

type AnimateTabsProps = React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root>;

const AnimateTabs = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Root>,
  AnimateTabsProps
>(({ value, defaultValue, onValueChange, ...props }, ref) => {
  const [internalValue, setInternalValue] = React.useState<string | undefined>(
    typeof defaultValue === "string" ? defaultValue : undefined
  );
  const indicatorId = React.useId();
  const isControlled = typeof value === "string";
  const activeValue = isControlled ? value : internalValue;

  const handleValueChange = (nextValue: string) => {
    if (!isControlled) setInternalValue(nextValue);
    onValueChange?.(nextValue);
  };

  return (
    <TabsContext.Provider value={{ value: activeValue, indicatorId }}>
      <TabsPrimitive.Root
        ref={ref}
        value={value}
        defaultValue={defaultValue}
        onValueChange={handleValueChange}
        {...props}
      />
    </TabsContext.Provider>
  );
});
AnimateTabs.displayName = "AnimateTabs";

const AnimateTabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "relative inline-grid h-10 w-full grid-cols-2 items-center rounded-xl border border-border/60 bg-muted/60 p-1",
      className
    )}
    {...props}
  />
));
AnimateTabsList.displayName = "AnimateTabsList";

type AnimateTabsTriggerProps = React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>;

const AnimateTabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  AnimateTabsTriggerProps
>(({ className, value, children, ...props }, ref) => {
  const { value: activeValue, indicatorId } = React.useContext(TabsContext);
  const isActive = activeValue === value;

  return (
    <TabsPrimitive.Trigger
      ref={ref}
      value={value}
      className={cn(
        "relative z-10 inline-flex h-8 items-center justify-center rounded-lg px-3 text-sm font-medium",
        "text-muted-foreground transition-colors data-[state=active]:text-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className
      )}
      {...props}
    >
      {isActive ? (
        <motion.span
          layoutId={indicatorId}
          className="absolute inset-0 z-0 rounded-lg bg-background shadow-sm"
          transition={{ type: "spring", stiffness: 380, damping: 34 }}
        />
      ) : null}
      <span className="relative z-10">{children}</span>
    </TabsPrimitive.Trigger>
  );
});
AnimateTabsTrigger.displayName = "AnimateTabsTrigger";

const AnimateTabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    )}
    {...props}
  />
));
AnimateTabsContent.displayName = "AnimateTabsContent";

export { AnimateTabs, AnimateTabsList, AnimateTabsTrigger, AnimateTabsContent };

