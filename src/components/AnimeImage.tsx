interface AnimeImageProps {
  src: string;
  alt: string;
  className?: string;
}

export const AnimeImage = ({ src, alt, className }: AnimeImageProps) => {
  const imageUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/proxy-image?url=${encodeURIComponent(src)}`;
  
  return (
    <img
      src={imageUrl}
      alt={alt}
      className={className}
      loading="lazy"
    />
  );
};
