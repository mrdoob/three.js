export interface LoaderUtils {
    decodeText(array: BufferSource): string;
    extractUrlBase(url: string): string;
    resolveURL(url: string, path: string): string;
}

export const LoaderUtils: LoaderUtils;
