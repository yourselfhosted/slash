import { motion } from "framer-motion";
import { forwardRef } from "react";
import { Card, CardProps } from "@/components/ui/card";

const AnimatedCard = forwardRef<HTMLDivElement, CardProps>(({ className, children, ...props }, ref) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      whileHover={{ y: -2 }}
    >
      <Card ref={ref} className={className} {...props}>
        {children}
      </Card>
    </motion.div>
  );
});

AnimatedCard.displayName = "AnimatedCard";

export { AnimatedCard };
