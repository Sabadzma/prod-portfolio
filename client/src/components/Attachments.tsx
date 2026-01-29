import { useRef, useState, useCallback } from "react";
import Scrollbar from "./Scrollbar";
import Lightbox from "./Lightbox";
import { AnimatePresence } from "framer-motion";
import { useScrollBoost } from 'react-scrollbooster';
import isMobile from "./isMobile";
import useResizeObserver from "use-resize-observer";

interface AttachmentsProps {
  attachments: Array<any>;
}

const Attachments: React.FC<AttachmentsProps> = ({
  attachments
}) => {
  const [lightboxState, setLightboxState] = useState({
    open: false,
    startingIndex: 0,
  });
  const scrollRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const galleryHeight = 90;
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [viewport, scrollbooster] = useScrollBoost({
    direction: 'horizontal',
    friction: 0.05,
    scrollMode: 'native',
    textSelection: false,
    onUpdate: (data) => {
      if (containerRef.current) {
        containerRef.current.scrollLeft = data.position.x;
      }
    },
    shouldScroll: () => { return !isMobile() }
  });

  const setRefs = useCallback<React.RefCallback<HTMLDivElement>>(node => {
    containerRef.current = node;
    viewport(node);
    onResize();
  }, [viewport]);

  const updateScrollbooster = () => {
    if (!scrollbooster || !containerRef.current) {
      return;
    }
    scrollbooster.updateMetrics();
  };

  const onResize = () => {
    updateScrollbooster();
  }

  useResizeObserver({ ref: containerRef as any, onResize });
  useResizeObserver({ ref: innerRef as any, onResize });

  let lightbox;
  if (lightboxState.open === true) {
    lightbox = <Lightbox
        attachments={attachments}
        startingIndex={lightboxState.startingIndex}        
        close={() => setLightboxState({
          open: false,
          startingIndex: 0,
        })}
      />
  }

  return (
    <>
      <div
        className="attachments"
        style={{
          paddingTop: galleryHeight
        }}
      >
        <div ref={setRefs} className="scrollableArea">
          <div ref={innerRef} className="images">
            {attachments.map((media, index) => {
              return (
                <Attachment
                  onClick={() => setLightboxState({
                    open: true,
                    startingIndex: index,
                  })}
                  media={media}
                  key={media.url}
                  height={galleryHeight}/>
              )
            })}
          </div>
        </div>
      </div>
      <Scrollbar scrollview={containerRef} innerChild={scrollRef} inlineStyle={{ marginTop: 8 }}/>
      <AnimatePresence>
        {lightbox}
      </AnimatePresence>
    </>
  )
}

interface AttachmentProps {
  media: any;
  height: number;
  onClick: () => void;
}

const Attachment: React.FC<AttachmentProps> = ({
  media,
  height,
  onClick,
}) => {
  const [aspectRatio, setAspectRatio] = useState(16/9); // Default aspect ratio
  const maxWidth = 21/9;   // ultrawide monitor
  const minWidth = 4/9;    // More reasonable minimum for mobile

  const returnThumbnailAspectRatio = (ratio: number) => {
    if (ratio < minWidth) {
      return minWidth
    } else if (ratio > maxWidth) {
      return maxWidth
    } else {
      return ratio
    }
  }

  const handleImageLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
    const img = event.currentTarget;
    if (img.naturalWidth && img.naturalHeight) {
      const naturalAspectRatio = img.naturalWidth / img.naturalHeight;
      setAspectRatio(naturalAspectRatio);
    }
  };

  const finalAspectRatio = returnThumbnailAspectRatio(aspectRatio);

  let item;
  if (media.type === "image") {
    item = <img 
      alt="" 
      src={media.url} 
      height={height} 
      width={height * finalAspectRatio}
      onLoad={handleImageLoad}
    />
  } else if (media.type === "video") {
    item = <video src={media.url} autoPlay loop muted playsInline/>
  }

  return (
    <div
      style={{
        height: height,
        aspectRatio: finalAspectRatio,
      }}
      onClick={onClick}
      className="media">
      {item}
    </div>
  )
}

export default Attachments;
