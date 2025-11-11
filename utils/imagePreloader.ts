import { Image } from 'react-native';
import { ImageURISource } from 'react-native';

interface PreloadedImages {
  [key: string]: ImageURISource | null;
}

class ImagePreloader {
  private static instance: ImagePreloader;
  private preloadedImages: PreloadedImages = {};
  private preloadPromises: Map<string, Promise<void>> = new Map();

  private constructor() {}

  static getInstance(): ImagePreloader {
    if (!ImagePreloader.instance) {
      ImagePreloader.instance = new ImagePreloader();
    }
    return ImagePreloader.instance;
  }

  // 预加载图片
  preloadImage(key: string, source: number | ImageURISource): Promise<void> {
    if (this.preloadedImages[key] || this.preloadPromises.has(key)) {
      return Promise.resolve();
    }

    const promise = new Promise<void>((resolve, reject) => {
      const imageSource = typeof source === 'number' ? source : Image.resolveAssetSource(source);

      Image.getSize(imageSource, (width, height) => {
        this.preloadedImages[key] = imageSource;
        console.log(`🖼️ [ImagePreloader] Preloaded: ${key} (${width}x${height})`);
        resolve();
      }, (error) => {
        console.warn(`⚠️ [ImagePreloader] Failed to preload: ${key}`, error);
        // 不reject，允许后续加载
        resolve();
      });
    });

    this.preloadPromises.set(key, promise);
    return promise;
  }

  // 获取预加载的图片
  getImage(key: string): ImageURISource | null {
    return this.preloadedImages[key] || null;
  }

  // 批量预加载图片
  preloadImages(images: Record<string, number | ImageURISource>): Promise<void[]> {
    const promises = Object.entries(images).map(([key, source]) =>
      this.preloadImage(key, source)
    );

    return Promise.all(promises);
  }

  // 清除缓存
  clearCache(): void {
    this.preloadedImages = {};
    this.preloadPromises.clear();
    console.log("🗑️ [ImagePreloader] Cache cleared");
  }
}

export default ImagePreloader;
