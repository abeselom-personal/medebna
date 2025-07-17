import { encode } from 'blurhash';
import sharp from 'sharp';

export const getBlurhash = async (imagePath) => {
    const image = await sharp(imagePath)
        .raw()
        .ensureAlpha()
        .resize(32, 32, { fit: 'inside' })
        .toBuffer({ resolveWithObject: true });

    const { data, info } = image;
    return encode(new Uint8ClampedArray(data), info.width, info.height, 4, 3);
};
