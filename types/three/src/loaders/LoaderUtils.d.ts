export interface LoaderUtils {
    decodeText(array: BufferSource): string;
    extractUrlBase(url: string): string;
}

export const LoaderUtils: LoaderUtils;
