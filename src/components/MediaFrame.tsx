import React, { useState } from 'react';
import { getMediaSrc } from '../data/media.ts';
import type { MediaKey } from '../types/commerce.ts';

interface MediaFrameProps {
  mediaKey: MediaKey;
  alt: string;
  className?: string;
  imgClassName?: string;
  hoverMediaKey?: MediaKey;
}

export const MediaFrame: React.FC<MediaFrameProps> = ({
  mediaKey,
  alt,
  className = '',
  imgClassName = '',
  hoverMediaKey,
}) => {
  const [failed, setFailed] = useState(false);
  const src = getMediaSrc(mediaKey);
  const hoverSrc = hoverMediaKey ? getMediaSrc(hoverMediaKey) : null;

  if (failed) {
    return (
      <div
        className={`relative flex items-center justify-center bg-[#EFEAE2] text-[#6E6257] ${className}`}
        aria-label={alt}
      >
        <span className="font-editorial text-sm tracking-widest uppercase px-4 text-center">
          Maison Ferya
        </span>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden bg-[#F2EDE6] group ${className}`}>
      <img
        src={src}
        alt={alt}
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
        className={`w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.025] ${imgClassName}`}
      />
      {hoverSrc && (
        <img
          src={hoverSrc}
          alt=""
          aria-hidden="true"
          referrerPolicy="no-referrer"
          className="hidden md:block absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100"
        />
      )}
    </div>
  );
};
