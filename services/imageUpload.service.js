// services/imageUpload.service.js
import fs from 'fs';
import path from 'path';
import { getBlurhash } from '../utils/blurHash.js';

/**
 * Processes uploaded image files, generates BlurHash, and returns image data.
 * @param {Array} files - Array of uploaded files.
 * @param {string} baseUrl - Base URL for constructing image URLs.
 * @returns {Promise<Array>} - Array of processed image data objects.
 */
export const processImages = async (files, baseUrl) => {
    if (!files || files.length === 0) return [];

    const processedImages = await Promise.all(
        files.map(async (file) => {
            const hash = await getBlurhash(file.path);
            return {
                url: `${baseUrl}/${file.path}`,
                blurhash: hash,
            };
        })
    );

    return processedImages;
};

/**
 * Deletes specified image files from the server.
 * @param {Array} imageUrls - Array of image URLs to delete.
 * @param {string} baseUrl - Base URL to resolve relative paths.
 * @returns {Promise<void>}
 */
export const deleteImages = async (imageUrls, baseUrl) => {
    if (!imageUrls?.length) return
    await Promise.all(imageUrls.map(async url => {
        const relative = url.replace(`${baseUrl}/`, '')
        const filePath = path.join(process.cwd(), relative)
        try {
            await fs.promises.unlink(filePath)
        } catch (err) {
            console.error('failed delete', filePath, err)
        }
    }))
}

export const processArrayImages = async (files, fieldName, baseUrl) => {
    if (!files || !files.length) return [];

    const filteredFiles = files.filter(f => f.fieldname === fieldName);
    if (!filteredFiles.length) return null;

    const processed = await processImages(filteredFiles, baseUrl);
    return processed[0]?.url || '';
};
