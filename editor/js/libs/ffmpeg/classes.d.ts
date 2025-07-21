import { FSNode, FFMessageLoadConfig, OK, IsFirst, LogEventCallback, ProgressEventCallback, FileData, FFFSType, FFFSMountOptions, FFFSPath } from "./types.js";
type FFMessageOptions = {
    signal?: AbortSignal;
};
/**
 * Provides APIs to interact with ffmpeg web worker.
 *
 * @example
 * ```ts
 * const ffmpeg = new FFmpeg();
 * ```
 */
export declare class FFmpeg {
    #private;
    loaded: boolean;
    /**
     * Listen to log or prgress events from `ffmpeg.exec()`.
     *
     * @example
     * ```ts
     * ffmpeg.on("log", ({ type, message }) => {
     *   // ...
     * })
     * ```
     *
     * @example
     * ```ts
     * ffmpeg.on("progress", ({ progress, time }) => {
     *   // ...
     * })
     * ```
     *
     * @remarks
     * - log includes output to stdout and stderr.
     * - The progress events are accurate only when the length of
     * input and output video/audio file are the same.
     *
     * @category FFmpeg
     */
    on(event: "log", callback: LogEventCallback): void;
    on(event: "progress", callback: ProgressEventCallback): void;
    /**
     * Unlisten to log or progress events from `ffmpeg.exec()`.
     *
     * @category FFmpeg
     */
    off(event: "log", callback: LogEventCallback): void;
    off(event: "progress", callback: ProgressEventCallback): void;
    /**
     * Loads ffmpeg-core inside web worker. It is required to call this method first
     * as it initializes WebAssembly and other essential variables.
     *
     * @category FFmpeg
     * @returns `true` if ffmpeg core is loaded for the first time.
     */
    load: ({ classWorkerURL, ...config }?: FFMessageLoadConfig, { signal }?: FFMessageOptions) => Promise<IsFirst>;
    /**
     * Execute ffmpeg command.
     *
     * @remarks
     * To avoid common I/O issues, ["-nostdin", "-y"] are prepended to the args
     * by default.
     *
     * @example
     * ```ts
     * const ffmpeg = new FFmpeg();
     * await ffmpeg.load();
     * await ffmpeg.writeFile("video.avi", ...);
     * // ffmpeg -i video.avi video.mp4
     * await ffmpeg.exec(["-i", "video.avi", "video.mp4"]);
     * const data = ffmpeg.readFile("video.mp4");
     * ```
     *
     * @returns `0` if no error, `!= 0` if timeout (1) or error.
     * @category FFmpeg
     */
    exec: (args: string[], timeout?: number, { signal }?: FFMessageOptions) => Promise<number>;
    /**
     * Execute ffprobe command.
     *
     * @example
     * ```ts
     * const ffmpeg = new FFmpeg();
     * await ffmpeg.load();
     * await ffmpeg.writeFile("video.avi", ...);
     * // Getting duration of a video in seconds: ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 video.avi -o output.txt
     * await ffmpeg.ffprobe(["-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", "video.avi", "-o", "output.txt"]);
     * const data = ffmpeg.readFile("output.txt");
     * ```
     *
     * @returns `0` if no error, `!= 0` if timeout (1) or error.
     * @category FFmpeg
     */
    ffprobe: (args: string[], timeout?: number, { signal }?: FFMessageOptions) => Promise<number>;
    /**
     * Terminate all ongoing API calls and terminate web worker.
     * `FFmpeg.load()` must be called again before calling any other APIs.
     *
     * @category FFmpeg
     */
    terminate: () => void;
    /**
     * Write data to ffmpeg.wasm.
     *
     * @example
     * ```ts
     * const ffmpeg = new FFmpeg();
     * await ffmpeg.load();
     * await ffmpeg.writeFile("video.avi", await fetchFile("../video.avi"));
     * await ffmpeg.writeFile("text.txt", "hello world");
     * ```
     *
     * @category File System
     */
    writeFile: (path: string, data: FileData, { signal }?: FFMessageOptions) => Promise<OK>;
    mount: (fsType: FFFSType, options: FFFSMountOptions, mountPoint: FFFSPath) => Promise<OK>;
    unmount: (mountPoint: FFFSPath) => Promise<OK>;
    /**
     * Read data from ffmpeg.wasm.
     *
     * @example
     * ```ts
     * const ffmpeg = new FFmpeg();
     * await ffmpeg.load();
     * const data = await ffmpeg.readFile("video.mp4");
     * ```
     *
     * @category File System
     */
    readFile: (path: string, encoding?: string, { signal }?: FFMessageOptions) => Promise<FileData>;
    /**
     * Delete a file.
     *
     * @category File System
     */
    deleteFile: (path: string, { signal }?: FFMessageOptions) => Promise<OK>;
    /**
     * Rename a file or directory.
     *
     * @category File System
     */
    rename: (oldPath: string, newPath: string, { signal }?: FFMessageOptions) => Promise<OK>;
    /**
     * Create a directory.
     *
     * @category File System
     */
    createDir: (path: string, { signal }?: FFMessageOptions) => Promise<OK>;
    /**
     * List directory contents.
     *
     * @category File System
     */
    listDir: (path: string, { signal }?: FFMessageOptions) => Promise<FSNode[]>;
    /**
     * Delete an empty directory.
     *
     * @category File System
     */
    deleteDir: (path: string, { signal }?: FFMessageOptions) => Promise<OK>;
}
export {};
