import { Object3D } from './../core/Object3D';
import { AudioListener } from './AudioListener';
import { AudioContext } from './AudioContext';

// Extras / Audio /////////////////////////////////////////////////////////////////////

export class Audio extends Object3D {

	constructor( listener: AudioListener );
	type: 'Audio';

	context: AudioContext;
	gain: GainNode;
	autoplay: boolean;
	buffer: null | Audio;
	detune: number;
	loop: boolean;
	startTime: number;
	offset: number;
	duration: number | undefined;
	playbackRate: number;
	isPlaying: boolean;
	hasPlaybackControl: boolean;
	sourceType: string;
	source: AudioBufferSourceNode;
	filters: any[];

	getOutput(): GainNode;
	setNodeSource( audioNode: AudioBufferSourceNode ): this;
	setMediaElementSource( mediaElement: HTMLMediaElement ): this;
	setMediaStreamSource( mediaStream: MediaStream ): this;
	setBuffer( audioBuffer: AudioBuffer ): this;
	play(): this;
	onEnded(): void;
	pause(): this;
	stop(): this;
	connect(): this;
	disconnect(): this;
	setDetune( value: number ): this;
	getDetune(): number;
	getFilters(): any[];
	setFilter( value: any[] ): this;
	getFilter(): any;
	setFilter( filter: any ): this;
	setPlaybackRate( value: number ): this;
	getPlaybackRate(): number;
	getLoop(): boolean;
	setLoop( value: boolean ): void;
	getVolume(): number;
	setVolume( value: number ): this;
	/**
	 * @deprecated Use {@link AudioLoader} instead.
	 */
	load( file: string ): Audio;

}

export class AudioBuffer {

	constructor( context: any );

	context: any;
	ready: boolean;
	readyCallbacks: Function[];

	load( file: string ): AudioBuffer;
	onReady( callback: Function ): void;

}
