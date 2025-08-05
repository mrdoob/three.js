import MP4Box from 'https://cdn.jsdelivr.net/npm/mp4box@0.5.3/+esm';

// From: https://w3c.github.io/webcodecs/samples/video-decode-display/

// Wraps an MP4Box File as a WritableStream underlying sink.
class MP4FileSink {
  #setStatus = null;
  #file = null;
  #offset = 0;

  constructor(file, setStatus) {
    this.#file = file;
    this.#setStatus = setStatus;
  }

  write(chunk) {
    // MP4Box.js requires buffers to be ArrayBuffers, but we have a Uint8Array.
    const buffer = new ArrayBuffer(chunk.byteLength);
    new Uint8Array(buffer).set(chunk);

    // Inform MP4Box where in the file this chunk is from.
    buffer.fileStart = this.#offset;
    this.#offset += buffer.byteLength;

    // Append chunk.
    this.#setStatus("fetch", (this.#offset / (1024 ** 2)).toFixed(1) + " MiB");
    this.#file.appendBuffer(buffer);
  }

  close() {
    this.#setStatus("fetch", "Done");
    this.#file.flush();
  }
}

// Demuxes the first video track of an MP4 file using MP4Box, calling
// `onConfig()` and `onChunk()` with appropriate WebCodecs objects.
export class MP4Demuxer {
  #onConfig = null;
  #onChunk = null;
  #setStatus = null;
  #file = null;

  constructor(uri, {onConfig, onChunk, setStatus}) {
    this.#onConfig = onConfig;
    this.#onChunk = onChunk;
    this.#setStatus = setStatus;

    // Configure an MP4Box File for demuxing.
    this.#file = MP4Box.createFile();
    this.#file.onError = error => setStatus("demux", error);
    this.#file.onReady = this.#onReady.bind(this);
    this.#file.onSamples = this.#onSamples.bind(this);

    // Fetch the file and pipe the data through.
    const fileSink = new MP4FileSink(this.#file, setStatus);
    fetch(uri).then(response => {
      // highWaterMark should be large enough for smooth streaming, but lower is
      // better for memory usage.
      response.body.pipeTo(new WritableStream(fileSink, {highWaterMark: 2}));
    });
  }

  // Get the appropriate `description` for a specific track. Assumes that the
  // track is H.264, H.265, VP8, VP9, or AV1.
  #description(track) {
    const trak = this.#file.getTrackById(track.id);
    for (const entry of trak.mdia.minf.stbl.stsd.entries) {
      const box = entry.avcC || entry.hvcC || entry.vpcC || entry.av1C;
      if (box) {
        const stream = new MP4Box.DataStream(undefined, 0, MP4Box.DataStream.BIG_ENDIAN);
        box.write(stream);
        return new Uint8Array(stream.buffer, 8);  // Remove the box header.
      }
    }
    throw new Error("avcC, hvcC, vpcC, or av1C box not found");
  }

  #onReady(info) {
    this.#setStatus("demux", "Ready");
    const track = info.videoTracks[0];

    // Generate and emit an appropriate VideoDecoderConfig.
    this.#onConfig({
      // Browser doesn't support parsing full vp8 codec (eg: `vp08.00.41.08`),
      // they only support `vp8`.
      codec: track.codec.startsWith('vp08') ? 'vp8' : track.codec,
      codedHeight: track.video.height,
      codedWidth: track.video.width,
      description: this.#description(track),
    });

    // Start demuxing.
    this.#file.setExtractionOptions(track.id);
    this.#file.start();
  }

  #onSamples(track_id, ref, samples) {
    // Generate and emit an EncodedVideoChunk for each demuxed sample.
    for (const sample of samples) {
      this.#onChunk(new EncodedVideoChunk({
        type: sample.is_sync ? "key" : "delta",
        timestamp: 1e6 * sample.cts / sample.timescale,
        duration: 1e6 * sample.duration / sample.timescale,
        data: sample.data
      }));
    }
  }
}
