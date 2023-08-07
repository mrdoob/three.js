import { Object3D } from './../core/Object3D';
import { AudioListener } from './AudioListener';
import { AudioContext } from './AudioContext';

// Extras / Audio /////////////////////////////////////////////////////////////////////

export class Audio<NodeType extends AudioNode = GainNode> extends Object3D {
    constructor(listener: AudioListener);
    type: 'Audio';

    listener: AudioListener;
    context: AudioContext;
    gain: GainNode;

    /**
     * @default false
     */
    autoplay: boolean;
    buffer: null | AudioBuffer;

    /**
     * @default 0
     */
    detune: number;

    /**
     * @default false
     */
    loop: boolean;

    /**
     * @default 0
     */
    loopStart: number;

    /**
     * @default 0
     */
    loopEnd: number;

    /**
     * @default 0
     */
    offset: number;

    /**
     * @default undefined
     */
    duration: number | undefined;

    /**
     * @default 1
     */
    playbackRate: number;

    /**
     * @default false
     */
    isPlaying: boolean;

    /**
     * @default true
     */
    hasPlaybackControl: boolean;

    /**
     * @default 'empty'
     */
    sourceType: string;
    source: null | AudioBufferSourceNode;

    /**
     * @default []
     */
    filters: AudioNode[];

    getOutput(): NodeType;
    setNodeSource(audioNode: AudioBufferSourceNode): this;
    setMediaElementSource(mediaElement: HTMLMediaElement): this;
    setMediaStreamSource(mediaStream: MediaStream): this;
    setBuffer(audioBuffer: AudioBuffer): this;
    play(delay?: number): this;
    onEnded(): void;
    pause(): this;
    stop(): this;
    connect(): this;
    disconnect(): this;
    setDetune(value: number): this;
    getDetune(): number;
    getFilters(): AudioNode[];
    setFilters(value: AudioNode[]): this;
    getFilter(): AudioNode;
    setFilter(filter: AudioNode): this;
    setPlaybackRate(value: number): this;
    getPlaybackRate(): number;
    getLoop(): boolean;
    setLoop(value: boolean): this;
    setLoopStart(value: number): this;
    setLoopEnd(value: number): this;
    getVolume(): number;
    setVolume(value: number): this;
    /**
     * @deprecated Use {@link AudioLoader} instead.
     */
    load(file: string): Audio;
}
