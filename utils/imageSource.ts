import { ImageSourcePropType } from "react-native";
import images from "@/constants/images";

export const isValidRemoteImageUri = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const ensureImageSourceType = (
  value?: ImageSourcePropType | string
): ImageSourcePropType | undefined => {
  if (!value) return undefined;

  if (typeof value === "string") {
    return { uri: value };
  }

  if (typeof value === "number") {
    return value;
  }

  return value as ImageSourcePropType;
};

export const resolveImageSource = (
  value?: unknown,
  fallback: ImageSourcePropType | string = images.teamLogo
): ImageSourcePropType => {
  if (isValidRemoteImageUri(value)) {
    return { uri: value };
  }

  if (typeof value === "number") {
    return value;
  }

  if (value && typeof value === "object") {
    return value as ImageSourcePropType;
  }

  return ensureImageSourceType(fallback) || images.teamLogo;
};
