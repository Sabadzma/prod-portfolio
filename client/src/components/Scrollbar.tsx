import { useEffect, useRef, useState } from "react";

interface ScrollbarProps {
  scrollview: React.RefObject<HTMLDivElement>;
  innerChild: React.RefObject<HTMLDivElement>;
  inlineStyle?: React.CSSProperties;
}

const Scrollbar: React.FC<ScrollbarProps> = ({ scrollview, innerChild, inlineStyle = {} }) => {
  const [scrollPercentage, setScrollPercentage] = useState(0);
  const [thumbWidth, setThumbWidth] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const scrollbarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!scrollview.current) return;
      
      const element = scrollview.current;
      const scrollLeft = Math.round(element.scrollLeft);
      const scrollWidth = element.scrollWidth;
      const clientWidth = element.clientWidth;
      
      if (scrollWidth > clientWidth) {
        // Calculate thumb width as a percentage of the track (represents visible content ratio)
        const thumbWidthPercentage = Math.max((clientWidth / scrollWidth) * 100, 8); // minimum 8% width for visibility
        
        // Calculate the scroll percentage (0 to 1)
        const maxScroll = scrollWidth - clientWidth;
        let scrollPercentage = scrollLeft / maxScroll;
        
        // Handle edge case where we're very close to the end due to floating point precision
        if (scrollLeft >= maxScroll - 1) {
          scrollPercentage = 1;
        }
        
        // Clamp scroll percentage
        const clampedScrollPercentage = Math.max(0, Math.min(1, scrollPercentage));
        
        // Calculate the available space for thumb movement
        const availableSpace = 100 - thumbWidthPercentage;
        
        // Position the thumb within the available space
        const thumbPosition = clampedScrollPercentage * availableSpace;
        
        setScrollPercentage(thumbPosition);
        setThumbWidth(thumbWidthPercentage);
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    const element = scrollview.current;
    if (element) {
      element.addEventListener('scroll', handleScroll);
      handleScroll(); // Initial check
      
      // Also listen for resize events to recalculate
      const resizeObserver = new ResizeObserver(handleScroll);
      resizeObserver.observe(element);
      
      return () => {
        element.removeEventListener('scroll', handleScroll);
        resizeObserver.disconnect();
      };
    }
  }, [scrollview]);

  if (!isVisible) return null;

  return (
    <div 
      ref={scrollbarRef}
      style={{
        height: '2px',
        backgroundColor: 'var(--wash1)',
        position: 'relative',
        borderRadius: '1px',
        ...inlineStyle
      }}
    >
      <div
        style={{
          height: '100%',
          backgroundColor: 'var(--grey3)',
          borderRadius: '1px',
          transform: `translateX(${scrollPercentage}%)`,
          width: `${thumbWidth}%`,
          transition: 'transform 0.1s ease',
        }}
      />
    </div>
  );
};

export default Scrollbar;