/**
 * Constants for caching logic.
 */
declare const CACHE_HIT = "cache-hit";
declare const DOCKER_IMAGES_LIST = "docker-images-list";
declare const DOCKER_IMAGES_PATH = "~/.docker-images.tar";
/**
 * Loads Docker images from the cache if available; otherwise, records existing images.
 * @returns {Promise<void>}
 */
declare const loadDockerImages: () => Promise<void>;
/**
 * Saves newly created Docker images to the cache if a cache miss occurred.
 * @returns {Promise<void>}
 */
declare const saveDockerImages: () => Promise<void>;
export { saveDockerImages, loadDockerImages, CACHE_HIT, DOCKER_IMAGES_LIST, DOCKER_IMAGES_PATH };
