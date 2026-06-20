import React, { useRef, useState } from "react";
import { motion } from "motion/react";

interface MagneticProps {
  children: React.ReactElement;
  range?: number; // Distance threshold for attraction
  actionMaxX?: number; // Max pull horizontal
  actionMaxY?: number; // Max pull vertical
}

export default function Magnetic({
  children,
  range = 35,
  actionMaxX = 14,
  actionMaxY = 14,
}: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const distanceX = clientX - centerX;
    const distanceY = clientY - centerY;

    // Calculate mouse distance from element center
    const distance = Math.hypot(distanceX, distanceY);

    if (distance < range) {
      // Pull proportional to distance with capping
      const pullX = (distanceX / range) * actionMaxX;
      const pullY = (distanceY / range) * actionMaxY;
      setPosition({ x: pullX, y: pullY });
    } else {
      setPosition({ x: 0, y: 0 });
    }
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 180, damping: 14, mass: 0.15 }}
      style={{ display: "inline-block" }}
    >
      {React.cloneElement(children, {
        className: `${children.props.className || ""} active:scale-95 transition-transform duration-100 ease-out`
      })}
    </motion.div>
  );
}
