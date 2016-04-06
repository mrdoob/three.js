/**
 * @author Andrew H / https://github.com/crimsonFuckr/
 *
 * Parses the Silicon Graphics Image standard( .rgba .rgb .bw .sgi .int .inta) into an rgba data array
 * Currently tested 1 BPC with both RLE & uncompressed. 2 BPC should work but not tested.
 * IMPORTANT: Depends on jDataView (https://github.com/jDataView/jDataView) for reading the buffer
 */

THREE.SGILoader = function ( manager ) {
    this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;
};

// extend THREE.BinaryTextureLoader
THREE.SGILoader.prototype = Object.create( THREE.BinaryTextureLoader.prototype );

THREE.SGILoader.prototype._parser = function ( buffer ) {
    jDataView.prototype.getSByte = function (byteOffset, littleEndian) {
        var byte = this.getBytes(1, byteOffset, littleEndian)[0];
        return ((byte & 127) - (byte & 128));
    };
    var stream = new jDataView(buffer);

    if (stream.getInt16() != 474)
        console.error( "THREE.SGILoader.parse: Wrong magic number. This is not a valid SGI file." );

    /**
     * Contains useful information about the image file.
     * @type {{storage, bpc, dimension: number, size: {x: number, y: number, z: number}, pixel: {min: number, max: number}, skip: *, Name: *, ColorMapID: number, RowStart: Array, RowSize: Array, readOffsets: header.readOffsets}}
     */
    var header = {
        storage     :   stream.getSByte(),
        bpc         :   stream.getSByte(),
        dimension   :   stream.getUint16(),
        size        : { x: stream.getUint16(), y: stream.getUint16(), z: stream.getUint16() },
        pixel       : { min: stream.getInt32(), max: stream.getInt32() },
        skip        :   stream.skip(4)        ,
        Name        :   stream.getString(80)  ,
        ColorMapID  :   stream.getInt32()     ,
        /* skip 404     this is where data starts. ie at offset 512 */
        /**
         * The first table has the file offsets to the RLE data for each scanline in the image. In a file with more than
         * 1 channel (ZSIZE) this table first has all the offsets for the scanlines in the first channel, followed by
         * offsets for the scanlines in the second channel, etc.
         */
        RowStart    :   []                    ,
        /**
         * The second table has the RLE data length for each scanline in the image. In a file with more than 1 channel
         * this table first has all the RLE data lengths for the scanlines in the first channel, followed be RLE data
         * lengths for the scanlines in the second channel, etc.
         */
        RowSize     :   []                    ,

        /**
         * Parses the offset tables.
         * One entry in each table is needed for each scanline of RLE data. The total number of scanlines in the image
         * (tablen) is determined by the product of the YSIZE and ZSIZE. There are two tables of longs that are written.
         */
        readOffsets : function () {
            var count = header.size.y * header.size.z; // num Scanlines * num channels
            for (var i = 0; i < count; ++i) {
                header.RowStart[i] = stream.getInt32();
            }
            for (var j = 0; j < count; ++j) {
                header.RowSize[j]  = stream.getInt32();
            }
        }
    };
    var img = new Uint8Array(header.size.x * header.size.y * 4);
    stream.skip(404);

    /**
     * Parses uncompressed image data.
     * If BPC is 2, there is one short (2 bytes) per pixel. In this case the RLE data should
     * be read into an array of shorts.
     */
    function verbatimParse() {
        var width = header.size.x, height = header.size.y, channels = header.size.z;

        for (var channel = 0; channel < channels; ++ channel){
            for (var row = 0; row < height; ++row) {
                var dst = (width*row*4) + channel;
                stream.seek(512 + (row * width) + (channel * width * height));

                for (var col = 0; col < width; ++col, dst+=4) {
                    img[dst] = stream.getBytes(header.bpc);
                }
            }
        }
    }

    /**
     * Parses RLE compressed image data
     */
    function rleParse() {
        header.readOffsets();
        var width    = header.size.x,
            height   = header.size.y,
            channels = header.size.z;
        for (var channel = 0; channel < channels; ++channel) {
            for (var row = 0; row < height; ++row) {
                var index = row+channel*height;
                stream.seek (header.RowStart[index]);
                readRLE ((width*row*4) + channel , stream.getBytes(header.RowSize[index]));
            }
        }
    }

    /**
     * Read a row of RLE compressed data.
     *
     * To expand data, the low order seven bits of the first short: bits[6..0] are used to form a count. If bit[7] of
     * the first short is 1, then the count is used to specify how many shorts to copy from the RLE data buffer to the
     * destination. Otherwise, if bit[7] of the first short is 0, then the count is used to specify how many times to
     * repeat the value of the following short, in the destination. This process proceeds until a count of 0 is found.
     * This should decompress exactly XSIZE pixels. Note that the byte order of short data in the input file should be
     * used, as described above. If BPC is 2, there is one short (2 bytes) per pixel. In this case the RLE data should
     * be read into an array of shorts.
     * @param dst     starting index in rgbaData array
     * @param src     an array of the data in the scanline
     */
    function readRLE(dst, src) {
        var color, count, offset = 0, i = 4;
        while(true) {
            color = src[offset++];
            count = (color & 0x7f); // bits 0-6
            if ( count == 0 )    // row is over when pixel count is 0;
                break;
            if((color & 0x80)) { // literal run   : copy from the RLE data buffer to the destination.
                while(count--) {
                    img[dst+=i] = src[offset++];
                }
            } else {             // replicate run : repeat the value of the following byte
                color = src[offset++];
                while(count--) {
                    img[dst+=i] = color;
                }
            }
        }
    }
    
    if (header.bpc > 1)
        console.warn("Currently only tested with 1 byte per channel. 2bpc might cause have unexpected results.");
    if (header.storage == 1)
        rleParse();
    else
        verbatimParse();

    //Fills array with the missing channels.
    if (header.size.z !== 4) {
        for (var dst = 0; dst < img.length; dst += 4){
            switch(header.size.z){
                case 1: //Greyscale
                    img[dst + 1] = img[dst + 2] = img[dst];
                    img[dst + 3] = 255;
                    break;
                case 2: //BlackWhite
                    img[dst + 1] = img[dst + 2] = img[dst];
                    break;
                case 3: //RGB
                    img[dst + 3] = 255;
                    break;
            }
        }
    }

    return {
        width       : header.size.x       ,
        height      : header.size.y       ,
        data        : img                 ,
        magFilter   : THREE.NearestFilter ,
        minFilter   : THREE.NearestFilter ,
        anisotropy  : 100 ,
        needsUpdate : true
    };

};
