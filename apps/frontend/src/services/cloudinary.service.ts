interface CloudinaryImageOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: "auto" | "webp" | "avif" | "jpg" | "png";
  crop?: "fill" | "fit" | "crop" | "thumb" | "scale";
}

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

const getImageUrl = (
  publicId: string,
  options: CloudinaryImageOptions = {}
) => {
  const {
    width,
    height,
    quality = 80,
    format = "auto",
    crop = "fill",
  } = options;

  const transformations = [`q_${quality}`, `f_${format}`, `c_${crop}`];

  if (width) {
    transformations.push(`w_${width}`);
  }

  if (height) {
    transformations.push(`h_${height}`);
  }

  const transformationString = transformations.join(",");

  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transformationString}/${publicId}`;
};

const getResponsiveImageUrl = (
  publicId: string,
  maxWidth: number,
  options: Omit<CloudinaryImageOptions, "width" | "height"> = {}
) => {
  return getImageUrl(publicId, {
    ...options,
    width: maxWidth,
  });
};

const getThumbnailUrl = (publicId: string, size: number = 100) => {
  return getImageUrl(publicId, {
    width: size,
    height: size,
    crop: "thumb",
  });
};

const CloudinaryService = {
  getImageUrl,
  getResponsiveImageUrl,
  getThumbnailUrl,
};

export default CloudinaryService;
