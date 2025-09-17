import React from 'react';
import { Image, ImageProps, ImageSourcePropType } from 'react-native';
import images from '../../constants/images'; // Default fallback icon

// Define the props for our component. It will take a 'source' which is a string,
// and all other props that the standard Image component takes.
interface ManagedImageProps extends Omit<ImageProps, 'source'> {
  source: string | null | undefined;
}

const ManagedImage: React.FC<ManagedImageProps> = ({ source, style, ...rest }) => {
  const isBase64 = source && !source.startsWith('http') && !source.startsWith('data:');
  const isUrl = source && source.startsWith('http');
  const isDataUri = source && source.startsWith('data:');

  let imageSource: ImageSourcePropType = images.teamLogo; // Default fallback

  if (isUrl || isDataUri) {
    imageSource = { uri: source };
  } else if (isBase64) {
    imageSource = { uri: `data:image/png;base64,${source}` };
  }

  return <Image source={imageSource} style={style} {...rest} />;
};

export default ManagedImage;