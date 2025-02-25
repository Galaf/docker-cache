import { c as cacheExports } from '../../_virtual/cache/index.js';
import { c as coreExports } from '../../_virtual/core/index.js';
import { execShellCommand } from '../shell/index.js';

/**
 * Constants for caching logic.
 */
const CACHE_HIT = 'cache-hit';
const DOCKER_IMAGES_LIST = 'docker-images-list';
const DOCKER_IMAGES_PATH = '~/.docker-images.tar';
/**
 * Command to list Docker images in a format that ensures unique identification.
 * - Named images will be returned as "repository:tag".
 * - Untagged images will be identified by their ID.
 */
const LIST_COMMAND = "docker image list --format '" +
    '{{ if ne .Repository "<none>" }}{{ .Repository }}' +
    `{{ if ne .Tag "<none>" }}:{{ .Tag }}{{ end }}{{ else }}{{ .ID }}{{ end }}'`;
/**
 * Loads Docker images from the cache if available; otherwise, records existing images.
 * @returns {Promise<void>}
 */
const loadDockerImages = async () => {
    try {
        const requestedKey = coreExports.getInput('key', { required: true });
        const restoredKey = await cacheExports.restoreCache([DOCKER_IMAGES_PATH], requestedKey);
        // Determine if a cache hit occurred
        const cacheHit = requestedKey === restoredKey;
        coreExports.saveState(CACHE_HIT, cacheHit.toString());
        coreExports.setOutput(CACHE_HIT, cacheHit);
        if (cacheHit) {
            coreExports.info(`Cache hit: Restoring Docker images from ${DOCKER_IMAGES_PATH}.`);
            await execShellCommand(`docker load --input ${DOCKER_IMAGES_PATH}`);
        }
        else {
            coreExports.info('Cache miss: Recording existing Docker images, including those pre-cached by GitHub Actions.');
            const dockerImages = await execShellCommand(LIST_COMMAND);
            coreExports.saveState(DOCKER_IMAGES_LIST, dockerImages);
        }
    }
    catch (error) {
        throw new Error(`Failed to load Docker images: ${error.message}`);
    }
};
/**
 * Saves newly created Docker images to the cache if a cache miss occurred.
 * @returns {Promise<void>}
 */
const saveDockerImages = async () => {
    try {
        const key = coreExports.getInput('key', { required: true });
        if (coreExports.getState(CACHE_HIT) === 'true') {
            coreExports.info(`Cache hit on key ${key}, skipping cache save.`);
            return;
        }
        if (coreExports.getInput('read-only') === 'true') {
            coreExports.info(`Cache miss on key ${key}, but skipping cache save due to read-only mode.`);
            return;
        }
        /* Check if another parallel process has already saved a cache with this key */
        const existingCacheKey = await cacheExports.restoreCache([''], key, [], {
            lookupOnly: true
        });
        if (key === existingCacheKey) {
            coreExports.info(`Cache miss occurred earlier, but another process has since saved a cache with key ${key}. Skipping save.`);
            return;
        }
        // Retrieve preexisting images before the restore step
        const preexistingImages = coreExports.getState(DOCKER_IMAGES_LIST).split('\n');
        coreExports.info('Fetching current Docker images...');
        const currentImages = await execShellCommand(LIST_COMMAND);
        const imagesList = currentImages.split('\n');
        // Identify new images created after the restore step
        const newImages = imagesList.filter((image) => image && !preexistingImages.includes(image));
        if (newImages.length === 0) {
            coreExports.info('No new Docker images detected. Skipping cache save.');
            return;
        }
        coreExports.info(`Saving ${newImages.length} new Docker images (excluding preexisting images).`);
        const newImagesArgs = newImages.join(' ');
        const saveCommand = `docker save --output ${DOCKER_IMAGES_PATH} ${newImagesArgs}`;
        await execShellCommand(saveCommand);
        // Save the cached Docker images
        await cacheExports.saveCache([DOCKER_IMAGES_PATH], key);
    }
    catch (error) {
        throw new Error(`Failed to save Docker images: ${error.message}`);
    }
};

export { CACHE_HIT, DOCKER_IMAGES_LIST, DOCKER_IMAGES_PATH, loadDockerImages, saveDockerImages };
//# sourceMappingURL=index.js.map
