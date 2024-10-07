import React, { MouseEvent, useEffect, useRef, useState } from "react";

const Draggable = ({ children }: { children: React.ReactNode }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mouseDown, setMouseDown] = useState<boolean>(false);
  const [dragging, setDragging] = useState<boolean>(false);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [initialPos, setInitialPos] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });

  const handleMouseDown = (e: MouseEvent) => {
    setMouseDown(true);
    setInitialPos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setMouseDown(false);
    setDragging(false);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (mouseDown) {
      setDragging(true);

      const deltaX = e.clientX - initialPos.x;
      const deltaY = e.clientY - initialPos.y;

      setMousePos((prev) => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY,
      }));

      setInitialPos({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseLeave = () => {
    setMouseDown(false);
  };

  useEffect(() => {
    console.log(mousePos.x);
    if (mousePos.x && mousePos.y && dragging) {
      containerRef.current!.style.cssText = `
            left: ${mousePos.x}px;
            top: ${mousePos.y}px;
        `;
    }
  }, [mousePos]);

  return (
    <div
      className="absolute w-full h-full"
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>
  );
};

export default Draggable;
