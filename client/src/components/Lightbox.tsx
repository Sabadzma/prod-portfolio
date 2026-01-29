import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useResizeObserver from "use-resize-observer";
import { createPortal } from 'react-dom';
import isMobile from './isMobile';

interface LightboxProps {
  attachments: Array<any>;
  startingIndex: number;
  close: () => void;
}

const Lightbox: React.FC<LightboxProps> = ({
  attachments,
  startingIndex,
  close
}) => {
  const [currentIndex, setCurrentIndex] = useState(startingIndex);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current && isMobile() && startingIndex > 0) {
      let bounds = scrollRef.current.getBoundingClientRect();
      scrollRef.current.scrollLeft = bounds.width * startingIndex;
    }
    
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
      document.documentElement.style.overflow = 'unset';
    };
  }, [startingIndex]);

  const handleKey = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      close();
    }
    
    if (event.key === "ArrowRight") {
      next();
    }
    
    if (event.key === "ArrowLeft") {
      prev();
    }
  };
  
  useEffect(() => {
    window.addEventListener('keydown', handleKey);

    return () => {
      window.removeEventListener('keydown', handleKey);
    };
  }, []);

  const next = () => {
    setCurrentIndex(currentIndex => {
      if (currentIndex < attachments.length - 1) {
        return currentIndex + 1;
      } else {
        return 0;
      }
    });
  }
    
  const prev = () => {
    setCurrentIndex(currentIndex => {
      if (currentIndex === 0) {
        return attachments.length - 1;
      } else {
        return currentIndex - 1;
      }
    });
  }

  const handleScroll = (event: React.UIEvent<HTMLElement>) => {
    if (!attachments) { return }
    let view = event.currentTarget;
    setCurrentIndex(currentIndex => {
      let index = Math.round((view.scrollLeft / (view.scrollWidth - view.offsetWidth)) * (attachments.length -1));
      return index
    });
  }

  return createPortal(
    <div
      data-mobile={isMobile()}
      className="lightbox">
      <div
        onScroll={(event) => handleScroll(event)}
        ref={scrollRef}
        className="carouselScroll">
        <div className="carousel">
          {attachments.map((media, index) => {
            return (
              <LightboxImage
                prev={attachments && attachments.length > 1 ? prev : undefined}
                next={attachments && attachments.length > 1 ? next : undefined}
                key={media.url}
                display={currentIndex === index || isMobile() ? true : false}
                media={media}
              />
            )
          })}
        </div>
      </div>
      
      {attachments && attachments.length > 1 ?
        <motion.div
          initial={{ 
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          exit={{
            opacity: 0,
          }}
          transition={{
            type: 'spring',
            stiffness: 700,
            damping: 50,
          }}
          className="dots">
          {attachments.map((media, index) => {
            return (
              <div
                className="pagerDot"
                data-active={currentIndex === index}
                key={media.url + "dot"}/>
            )
          })}
        </motion.div>
      : null}

      <motion.div
        initial={{ 
          opacity: 0,
        }}
        animate={{
          opacity: 1,
        }}
        exit={{
          opacity: 0,
        }}
        transition={{
          type: 'spring',
          stiffness: 700,
          damping: 50,
        }}
        className="close"
        onClick={() => close()}
      />

      <motion.div
        initial={{ 
          opacity: 0,
        }}
        animate={{
          opacity: 1,
        }}
        exit={{
          opacity: 0,
        }}
        transition={{
          type: 'spring',
          stiffness: 700,
          damping: 50,
        }}
        className="backdrop"
        onClick={() => close()}
      />
    </div>,
    document.body
  );
}

interface LightboxImageProps {
  prev?: () => void;
  next?: () => void;
  display: boolean;
  media: any;
}

const LightboxImage: React.FC<LightboxImageProps> = ({
  prev,
  next,
  display,
  media
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [imageAspectRatio, setImageAspectRatio] = useState<number | undefined>(undefined);
  const [containerAspectRatio, setContainerAspectRatio] = useState<number | undefined>(undefined);

  const handleImageLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
    const img = event.currentTarget;
    if (img.naturalWidth && img.naturalHeight) {
      const naturalAspectRatio = img.naturalWidth / img.naturalHeight;
      setImageAspectRatio(naturalAspectRatio);
    }
  };

  let attachment;
  if (media.type === "image") {
    attachment = <img src={media.url} alt="" onLoad={handleImageLoad} />
  } else if (media.type === "video") {
    attachment = <video src={media.url} autoPlay loop muted playsInline/>
  }

  const setRatio = () => {
    if (!containerRef.current) {
      return;
    }
    
    let containerBounds = containerRef.current.getBoundingClientRect();
    setContainerAspectRatio(containerBounds.width / containerBounds.height);
    
    // Only set aspect ratio from media dimensions if image hasn't loaded yet
    if (!imageAspectRatio && media.width && media.height) {
      setImageAspectRatio(media.width / media.height);
    }
  }
  
  const onResize = () => {
    setRatio();
  }

  useResizeObserver({ ref: containerRef as any, onResize });
  
  return (
    <div
      className="lightboxImage"
      style={{
        visibility: display ? "visible" : "hidden",
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{
          type: 'spring',
          stiffness: 700,
          damping: 50,
        }}
        ref={containerRef}
        className="lightboxInner">
        <div
          className="imageWrap"
          style={{
            pointerEvents: display ? "all" : "none",
            aspectRatio: imageAspectRatio,
            width: containerAspectRatio && imageAspectRatio && containerAspectRatio > imageAspectRatio ? "auto" : "100%",
            height: containerAspectRatio && imageAspectRatio && containerAspectRatio > imageAspectRatio ? "100%" : "auto",
          }}
        >
          {prev && next && !isMobile() ?
            <div
              className="navigation">
              <button className="prev" onClick={() => prev()} />
              <button className="next" onClick={() => next()} />
            </div>
          : null}
          {attachment}
        </div>
      </motion.div>
    </div>
  )
}

export default Lightbox;