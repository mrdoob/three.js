/**
 * @author fernandojsg / http://fernandojsg.com
 */

/*
	TODO:
	Allow export TRS instad of matrix
 */


 var WebGLConstants = {
         DEPTH_BUFFER_BIT : 0x00000100,
         STENCIL_BUFFER_BIT : 0x00000400,
         COLOR_BUFFER_BIT : 0x00004000,
         POINTS : 0x0000,
         LINES : 0x0001,
         LINE_LOOP : 0x0002,
         LINE_STRIP : 0x0003,
         TRIANGLES : 0x0004,
         TRIANGLE_STRIP : 0x0005,
         TRIANGLE_FAN : 0x0006,
         ZERO : 0,
         ONE : 1,
         SRC_COLOR : 0x0300,
         ONE_MINUS_SRC_COLOR : 0x0301,
         SRC_ALPHA : 0x0302,
         ONE_MINUS_SRC_ALPHA : 0x0303,
         DST_ALPHA : 0x0304,
         ONE_MINUS_DST_ALPHA : 0x0305,
         DST_COLOR : 0x0306,
         ONE_MINUS_DST_COLOR : 0x0307,
         SRC_ALPHA_SATURATE : 0x0308,
         FUNC_ADD : 0x8006,
         BLEND_EQUATION : 0x8009,
         BLEND_EQUATION_RGB : 0x8009, // same as BLEND_EQUATION
         BLEND_EQUATION_ALPHA : 0x883D,
         FUNC_SUBTRACT : 0x800A,
         FUNC_REVERSE_SUBTRACT : 0x800B,
         BLEND_DST_RGB : 0x80C8,
         BLEND_SRC_RGB : 0x80C9,
         BLEND_DST_ALPHA : 0x80CA,
         BLEND_SRC_ALPHA : 0x80CB,
         CONSTANT_COLOR : 0x8001,
         ONE_MINUS_CONSTANT_COLOR : 0x8002,
         CONSTANT_ALPHA : 0x8003,
         ONE_MINUS_CONSTANT_ALPHA : 0x8004,
         BLEND_COLOR : 0x8005,
         ARRAY_BUFFER : 0x8892,
         ELEMENT_ARRAY_BUFFER : 0x8893,
         ARRAY_BUFFER_BINDING : 0x8894,
         ELEMENT_ARRAY_BUFFER_BINDING : 0x8895,
         STREAM_DRAW : 0x88E0,
         STATIC_DRAW : 0x88E4,
         DYNAMIC_DRAW : 0x88E8,
         BUFFER_SIZE : 0x8764,
         BUFFER_USAGE : 0x8765,
         CURRENT_VERTEX_ATTRIB : 0x8626,
         FRONT : 0x0404,
         BACK : 0x0405,
         FRONT_AND_BACK : 0x0408,
         CULL_FACE : 0x0B44,
         BLEND : 0x0BE2,
         DITHER : 0x0BD0,
         STENCIL_TEST : 0x0B90,
         DEPTH_TEST : 0x0B71,
         SCISSOR_TEST : 0x0C11,
         POLYGON_OFFSET_FILL : 0x8037,
         SAMPLE_ALPHA_TO_COVERAGE : 0x809E,
         SAMPLE_COVERAGE : 0x80A0,
         NO_ERROR : 0,
         INVALID_ENUM : 0x0500,
         INVALID_VALUE : 0x0501,
         INVALID_OPERATION : 0x0502,
         OUT_OF_MEMORY : 0x0505,
         CW : 0x0900,
         CCW : 0x0901,
         LINE_WIDTH : 0x0B21,
         ALIASED_POINT_SIZE_RANGE : 0x846D,
         ALIASED_LINE_WIDTH_RANGE : 0x846E,
         CULL_FACE_MODE : 0x0B45,
         FRONT_FACE : 0x0B46,
         DEPTH_RANGE : 0x0B70,
         DEPTH_WRITEMASK : 0x0B72,
         DEPTH_CLEAR_VALUE : 0x0B73,
         DEPTH_FUNC : 0x0B74,
         STENCIL_CLEAR_VALUE : 0x0B91,
         STENCIL_FUNC : 0x0B92,
         STENCIL_FAIL : 0x0B94,
         STENCIL_PASS_DEPTH_FAIL : 0x0B95,
         STENCIL_PASS_DEPTH_PASS : 0x0B96,
         STENCIL_REF : 0x0B97,
         STENCIL_VALUE_MASK : 0x0B93,
         STENCIL_WRITEMASK : 0x0B98,
         STENCIL_BACK_FUNC : 0x8800,
         STENCIL_BACK_FAIL : 0x8801,
         STENCIL_BACK_PASS_DEPTH_FAIL : 0x8802,
         STENCIL_BACK_PASS_DEPTH_PASS : 0x8803,
         STENCIL_BACK_REF : 0x8CA3,
         STENCIL_BACK_VALUE_MASK : 0x8CA4,
         STENCIL_BACK_WRITEMASK : 0x8CA5,
         VIEWPORT : 0x0BA2,
         SCISSOR_BOX : 0x0C10,
         COLOR_CLEAR_VALUE : 0x0C22,
         COLOR_WRITEMASK : 0x0C23,
         UNPACK_ALIGNMENT : 0x0CF5,
         PACK_ALIGNMENT : 0x0D05,
         MAX_TEXTURE_SIZE : 0x0D33,
         MAX_VIEWPORT_DIMS : 0x0D3A,
         SUBPIXEL_BITS : 0x0D50,
         RED_BITS : 0x0D52,
         GREEN_BITS : 0x0D53,
         BLUE_BITS : 0x0D54,
         ALPHA_BITS : 0x0D55,
         DEPTH_BITS : 0x0D56,
         STENCIL_BITS : 0x0D57,
         POLYGON_OFFSET_UNITS : 0x2A00,
         POLYGON_OFFSET_FACTOR : 0x8038,
         TEXTURE_BINDING_2D : 0x8069,
         SAMPLE_BUFFERS : 0x80A8,
         SAMPLES : 0x80A9,
         SAMPLE_COVERAGE_VALUE : 0x80AA,
         SAMPLE_COVERAGE_INVERT : 0x80AB,
         COMPRESSED_TEXTURE_FORMATS : 0x86A3,
         DONT_CARE : 0x1100,
         FASTEST : 0x1101,
         NICEST : 0x1102,
         GENERATE_MIPMAP_HINT : 0x8192,
         BYTE : 0x1400,
         UNSIGNED_BYTE : 0x1401,
         SHORT : 0x1402,
         UNSIGNED_SHORT : 0x1403,
         INT : 0x1404,
         UNSIGNED_INT : 0x1405,
         FLOAT : 0x1406,
         DEPTH_COMPONENT : 0x1902,
         ALPHA : 0x1906,
         RGB : 0x1907,
         RGBA : 0x1908,
         LUMINANCE : 0x1909,
         LUMINANCE_ALPHA : 0x190A,
         UNSIGNED_SHORT_4_4_4_4 : 0x8033,
         UNSIGNED_SHORT_5_5_5_1 : 0x8034,
         UNSIGNED_SHORT_5_6_5 : 0x8363,
         FRAGMENT_SHADER : 0x8B30,
         VERTEX_SHADER : 0x8B31,
         MAX_VERTEX_ATTRIBS : 0x8869,
         MAX_VERTEX_UNIFORM_VECTORS : 0x8DFB,
         MAX_VARYING_VECTORS : 0x8DFC,
         MAX_COMBINED_TEXTURE_IMAGE_UNITS : 0x8B4D,
         MAX_VERTEX_TEXTURE_IMAGE_UNITS : 0x8B4C,
         MAX_TEXTURE_IMAGE_UNITS : 0x8872,
         MAX_FRAGMENT_UNIFORM_VECTORS : 0x8DFD,
         SHADER_TYPE : 0x8B4F,
         DELETE_STATUS : 0x8B80,
         LINK_STATUS : 0x8B82,
         VALIDATE_STATUS : 0x8B83,
         ATTACHED_SHADERS : 0x8B85,
         ACTIVE_UNIFORMS : 0x8B86,
         ACTIVE_ATTRIBUTES : 0x8B89,
         SHADING_LANGUAGE_VERSION : 0x8B8C,
         CURRENT_PROGRAM : 0x8B8D,
         NEVER : 0x0200,
         LESS : 0x0201,
         EQUAL : 0x0202,
         LEQUAL : 0x0203,
         GREATER : 0x0204,
         NOTEQUAL : 0x0205,
         GEQUAL : 0x0206,
         ALWAYS : 0x0207,
         KEEP : 0x1E00,
         REPLACE : 0x1E01,
         INCR : 0x1E02,
         DECR : 0x1E03,
         INVERT : 0x150A,
         INCR_WRAP : 0x8507,
         DECR_WRAP : 0x8508,
         VENDOR : 0x1F00,
         RENDERER : 0x1F01,
         VERSION : 0x1F02,
         NEAREST : 0x2600,
         LINEAR : 0x2601,
         NEAREST_MIPMAP_NEAREST : 0x2700,
         LINEAR_MIPMAP_NEAREST : 0x2701,
         NEAREST_MIPMAP_LINEAR : 0x2702,
         LINEAR_MIPMAP_LINEAR : 0x2703,
         TEXTURE_MAG_FILTER : 0x2800,
         TEXTURE_MIN_FILTER : 0x2801,
         TEXTURE_WRAP_S : 0x2802,
         TEXTURE_WRAP_T : 0x2803,
         TEXTURE_2D : 0x0DE1,
         TEXTURE : 0x1702,
         TEXTURE_CUBE_MAP : 0x8513,
         TEXTURE_BINDING_CUBE_MAP : 0x8514,
         TEXTURE_CUBE_MAP_POSITIVE_X : 0x8515,
         TEXTURE_CUBE_MAP_NEGATIVE_X : 0x8516,
         TEXTURE_CUBE_MAP_POSITIVE_Y : 0x8517,
         TEXTURE_CUBE_MAP_NEGATIVE_Y : 0x8518,
         TEXTURE_CUBE_MAP_POSITIVE_Z : 0x8519,
         TEXTURE_CUBE_MAP_NEGATIVE_Z : 0x851A,
         MAX_CUBE_MAP_TEXTURE_SIZE : 0x851C,
         TEXTURE0 : 0x84C0,
         TEXTURE1 : 0x84C1,
         TEXTURE2 : 0x84C2,
         TEXTURE3 : 0x84C3,
         TEXTURE4 : 0x84C4,
         TEXTURE5 : 0x84C5,
         TEXTURE6 : 0x84C6,
         TEXTURE7 : 0x84C7,
         TEXTURE8 : 0x84C8,
         TEXTURE9 : 0x84C9,
         TEXTURE10 : 0x84CA,
         TEXTURE11 : 0x84CB,
         TEXTURE12 : 0x84CC,
         TEXTURE13 : 0x84CD,
         TEXTURE14 : 0x84CE,
         TEXTURE15 : 0x84CF,
         TEXTURE16 : 0x84D0,
         TEXTURE17 : 0x84D1,
         TEXTURE18 : 0x84D2,
         TEXTURE19 : 0x84D3,
         TEXTURE20 : 0x84D4,
         TEXTURE21 : 0x84D5,
         TEXTURE22 : 0x84D6,
         TEXTURE23 : 0x84D7,
         TEXTURE24 : 0x84D8,
         TEXTURE25 : 0x84D9,
         TEXTURE26 : 0x84DA,
         TEXTURE27 : 0x84DB,
         TEXTURE28 : 0x84DC,
         TEXTURE29 : 0x84DD,
         TEXTURE30 : 0x84DE,
         TEXTURE31 : 0x84DF,
         ACTIVE_TEXTURE : 0x84E0,
         REPEAT : 0x2901,
         CLAMP_TO_EDGE : 0x812F,
         MIRRORED_REPEAT : 0x8370,
         FLOAT_VEC2 : 0x8B50,
         FLOAT_VEC3 : 0x8B51,
         FLOAT_VEC4 : 0x8B52,
         INT_VEC2 : 0x8B53,
         INT_VEC3 : 0x8B54,
         INT_VEC4 : 0x8B55,
         BOOL : 0x8B56,
         BOOL_VEC2 : 0x8B57,
         BOOL_VEC3 : 0x8B58,
         BOOL_VEC4 : 0x8B59,
         FLOAT_MAT2 : 0x8B5A,
         FLOAT_MAT3 : 0x8B5B,
         FLOAT_MAT4 : 0x8B5C,
         SAMPLER_2D : 0x8B5E,
         SAMPLER_CUBE : 0x8B60,
         VERTEX_ATTRIB_ARRAY_ENABLED : 0x8622,
         VERTEX_ATTRIB_ARRAY_SIZE : 0x8623,
         VERTEX_ATTRIB_ARRAY_STRIDE : 0x8624,
         VERTEX_ATTRIB_ARRAY_TYPE : 0x8625,
         VERTEX_ATTRIB_ARRAY_NORMALIZED : 0x886A,
         VERTEX_ATTRIB_ARRAY_POINTER : 0x8645,
         VERTEX_ATTRIB_ARRAY_BUFFER_BINDING : 0x889F,
         IMPLEMENTATION_COLOR_READ_TYPE : 0x8B9A,
         IMPLEMENTATION_COLOR_READ_FORMAT : 0x8B9B,
         COMPILE_STATUS : 0x8B81,
         LOW_FLOAT : 0x8DF0,
         MEDIUM_FLOAT : 0x8DF1,
         HIGH_FLOAT : 0x8DF2,
         LOW_INT : 0x8DF3,
         MEDIUM_INT : 0x8DF4,
         HIGH_INT : 0x8DF5,
         FRAMEBUFFER : 0x8D40,
         RENDERBUFFER : 0x8D41,
         RGBA4 : 0x8056,
         RGB5_A1 : 0x8057,
         RGB565 : 0x8D62,
         DEPTH_COMPONENT16 : 0x81A5,
         STENCIL_INDEX : 0x1901,
         STENCIL_INDEX8 : 0x8D48,
         DEPTH_STENCIL : 0x84F9,
         RENDERBUFFER_WIDTH : 0x8D42,
         RENDERBUFFER_HEIGHT : 0x8D43,
         RENDERBUFFER_INTERNAL_FORMAT : 0x8D44,
         RENDERBUFFER_RED_SIZE : 0x8D50,
         RENDERBUFFER_GREEN_SIZE : 0x8D51,
         RENDERBUFFER_BLUE_SIZE : 0x8D52,
         RENDERBUFFER_ALPHA_SIZE : 0x8D53,
         RENDERBUFFER_DEPTH_SIZE : 0x8D54,
         RENDERBUFFER_STENCIL_SIZE : 0x8D55,
         FRAMEBUFFER_ATTACHMENT_OBJECT_TYPE : 0x8CD0,
         FRAMEBUFFER_ATTACHMENT_OBJECT_NAME : 0x8CD1,
         FRAMEBUFFER_ATTACHMENT_TEXTURE_LEVEL : 0x8CD2,
         FRAMEBUFFER_ATTACHMENT_TEXTURE_CUBE_MAP_FACE : 0x8CD3,
         COLOR_ATTACHMENT0 : 0x8CE0,
         DEPTH_ATTACHMENT : 0x8D00,
         STENCIL_ATTACHMENT : 0x8D20,
         DEPTH_STENCIL_ATTACHMENT : 0x821A,
         NONE : 0,
         FRAMEBUFFER_COMPLETE : 0x8CD5,
         FRAMEBUFFER_INCOMPLETE_ATTACHMENT : 0x8CD6,
         FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT : 0x8CD7,
         FRAMEBUFFER_INCOMPLETE_DIMENSIONS : 0x8CD9,
         FRAMEBUFFER_UNSUPPORTED : 0x8CDD,
         FRAMEBUFFER_BINDING : 0x8CA6,
         RENDERBUFFER_BINDING : 0x8CA7,
         MAX_RENDERBUFFER_SIZE : 0x84E8,
         INVALID_FRAMEBUFFER_OPERATION : 0x0506,
         UNPACK_FLIP_Y_WEBGL : 0x9240,
         UNPACK_PREMULTIPLY_ALPHA_WEBGL : 0x9241,
         CONTEXT_LOST_WEBGL : 0x9242,
         UNPACK_COLORSPACE_CONVERSION_WEBGL : 0x9243,
         BROWSER_DEFAULT_WEBGL : 0x9244,

         // WEBGL_compressed_texture_s3tc
         COMPRESSED_RGB_S3TC_DXT1_EXT : 0x83F0,
         COMPRESSED_RGBA_S3TC_DXT1_EXT : 0x83F1,
         COMPRESSED_RGBA_S3TC_DXT3_EXT : 0x83F2,
         COMPRESSED_RGBA_S3TC_DXT5_EXT : 0x83F3,

         // WEBGL_compressed_texture_pvrtc
         COMPRESSED_RGB_PVRTC_4BPPV1_IMG : 0x8C00,
         COMPRESSED_RGB_PVRTC_2BPPV1_IMG : 0x8C01,
         COMPRESSED_RGBA_PVRTC_4BPPV1_IMG : 0x8C02,
         COMPRESSED_RGBA_PVRTC_2BPPV1_IMG : 0x8C03,

         // WEBGL_compressed_texture_etc1
         COMPRESSED_RGB_ETC1_WEBGL : 0x8D64,

         // Desktop OpenGL
         DOUBLE : 0x140A,

         // WebGL 2
         READ_BUFFER : 0x0C02,
         UNPACK_ROW_LENGTH : 0x0CF2,
         UNPACK_SKIP_ROWS : 0x0CF3,
         UNPACK_SKIP_PIXELS : 0x0CF4,
         PACK_ROW_LENGTH : 0x0D02,
         PACK_SKIP_ROWS : 0x0D03,
         PACK_SKIP_PIXELS : 0x0D04,
         COLOR : 0x1800,
         DEPTH : 0x1801,
         STENCIL : 0x1802,
         RED : 0x1903,
         RGB8 : 0x8051,
         RGBA8 : 0x8058,
         RGB10_A2 : 0x8059,
         TEXTURE_BINDING_3D : 0x806A,
         UNPACK_SKIP_IMAGES : 0x806D,
         UNPACK_IMAGE_HEIGHT : 0x806E,
         TEXTURE_3D : 0x806F,
         TEXTURE_WRAP_R : 0x8072,
         MAX_3D_TEXTURE_SIZE : 0x8073,
         UNSIGNED_INT_2_10_10_10_REV : 0x8368,
         MAX_ELEMENTS_VERTICES : 0x80E8,
         MAX_ELEMENTS_INDICES : 0x80E9,
         TEXTURE_MIN_LOD : 0x813A,
         TEXTURE_MAX_LOD : 0x813B,
         TEXTURE_BASE_LEVEL : 0x813C,
         TEXTURE_MAX_LEVEL : 0x813D,
         MIN : 0x8007,
         MAX : 0x8008,
         DEPTH_COMPONENT24 : 0x81A6,
         MAX_TEXTURE_LOD_BIAS : 0x84FD,
         TEXTURE_COMPARE_MODE : 0x884C,
         TEXTURE_COMPARE_FUNC : 0x884D,
         CURRENT_QUERY : 0x8865,
         QUERY_RESULT : 0x8866,
         QUERY_RESULT_AVAILABLE : 0x8867,
         STREAM_READ : 0x88E1,
         STREAM_COPY : 0x88E2,
         STATIC_READ : 0x88E5,
         STATIC_COPY : 0x88E6,
         DYNAMIC_READ : 0x88E9,
         DYNAMIC_COPY : 0x88EA,
         MAX_DRAW_BUFFERS : 0x8824,
         DRAW_BUFFER0 : 0x8825,
         DRAW_BUFFER1 : 0x8826,
         DRAW_BUFFER2 : 0x8827,
         DRAW_BUFFER3 : 0x8828,
         DRAW_BUFFER4 : 0x8829,
         DRAW_BUFFER5 : 0x882A,
         DRAW_BUFFER6 : 0x882B,
         DRAW_BUFFER7 : 0x882C,
         DRAW_BUFFER8 : 0x882D,
         DRAW_BUFFER9 : 0x882E,
         DRAW_BUFFER10 : 0x882F,
         DRAW_BUFFER11 : 0x8830,
         DRAW_BUFFER12 : 0x8831,
         DRAW_BUFFER13 : 0x8832,
         DRAW_BUFFER14 : 0x8833,
         DRAW_BUFFER15 : 0x8834,
         MAX_FRAGMENT_UNIFORM_COMPONENTS : 0x8B49,
         MAX_VERTEX_UNIFORM_COMPONENTS : 0x8B4A,
         SAMPLER_3D : 0x8B5F,
         SAMPLER_2D_SHADOW : 0x8B62,
         FRAGMENT_SHADER_DERIVATIVE_HINT : 0x8B8B,
         PIXEL_PACK_BUFFER : 0x88EB,
         PIXEL_UNPACK_BUFFER : 0x88EC,
         PIXEL_PACK_BUFFER_BINDING : 0x88ED,
         PIXEL_UNPACK_BUFFER_BINDING : 0x88EF,
         FLOAT_MAT2x3 : 0x8B65,
         FLOAT_MAT2x4 : 0x8B66,
         FLOAT_MAT3x2 : 0x8B67,
         FLOAT_MAT3x4 : 0x8B68,
         FLOAT_MAT4x2 : 0x8B69,
         FLOAT_MAT4x3 : 0x8B6A,
         SRGB : 0x8C40,
         SRGB8 : 0x8C41,
         SRGB8_ALPHA8 : 0x8C43,
         COMPARE_REF_TO_TEXTURE : 0x884E,
         RGBA32F : 0x8814,
         RGB32F : 0x8815,
         RGBA16F : 0x881A,
         RGB16F : 0x881B,
         VERTEX_ATTRIB_ARRAY_INTEGER : 0x88FD,
         MAX_ARRAY_TEXTURE_LAYERS : 0x88FF,
         MIN_PROGRAM_TEXEL_OFFSET : 0x8904,
         MAX_PROGRAM_TEXEL_OFFSET : 0x8905,
         MAX_VARYING_COMPONENTS : 0x8B4B,
         TEXTURE_2D_ARRAY : 0x8C1A,
         TEXTURE_BINDING_2D_ARRAY : 0x8C1D,
         R11F_G11F_B10F : 0x8C3A,
         UNSIGNED_INT_10F_11F_11F_REV : 0x8C3B,
         RGB9_E5 : 0x8C3D,
         UNSIGNED_INT_5_9_9_9_REV : 0x8C3E,
         TRANSFORM_FEEDBACK_BUFFER_MODE : 0x8C7F,
         MAX_TRANSFORM_FEEDBACK_SEPARATE_COMPONENTS : 0x8C80,
         TRANSFORM_FEEDBACK_VARYINGS : 0x8C83,
         TRANSFORM_FEEDBACK_BUFFER_START : 0x8C84,
         TRANSFORM_FEEDBACK_BUFFER_SIZE : 0x8C85,
         TRANSFORM_FEEDBACK_PRIMITIVES_WRITTEN : 0x8C88,
         RASTERIZER_DISCARD : 0x8C89,
         MAX_TRANSFORM_FEEDBACK_INTERLEAVED_COMPONENTS : 0x8C8A,
         MAX_TRANSFORM_FEEDBACK_SEPARATE_ATTRIBS : 0x8C8B,
         INTERLEAVED_ATTRIBS : 0x8C8C,
         SEPARATE_ATTRIBS : 0x8C8D,
         TRANSFORM_FEEDBACK_BUFFER : 0x8C8E,
         TRANSFORM_FEEDBACK_BUFFER_BINDING : 0x8C8F,
         RGBA32UI : 0x8D70,
         RGB32UI : 0x8D71,
         RGBA16UI : 0x8D76,
         RGB16UI : 0x8D77,
         RGBA8UI : 0x8D7C,
         RGB8UI : 0x8D7D,
         RGBA32I : 0x8D82,
         RGB32I : 0x8D83,
         RGBA16I : 0x8D88,
         RGB16I : 0x8D89,
         RGBA8I : 0x8D8E,
         RGB8I : 0x8D8F,
         RED_INTEGER : 0x8D94,
         RGB_INTEGER : 0x8D98,
         RGBA_INTEGER : 0x8D99,
         SAMPLER_2D_ARRAY : 0x8DC1,
         SAMPLER_2D_ARRAY_SHADOW : 0x8DC4,
         SAMPLER_CUBE_SHADOW : 0x8DC5,
         UNSIGNED_INT_VEC2 : 0x8DC6,
         UNSIGNED_INT_VEC3 : 0x8DC7,
         UNSIGNED_INT_VEC4 : 0x8DC8,
         INT_SAMPLER_2D : 0x8DCA,
         INT_SAMPLER_3D : 0x8DCB,
         INT_SAMPLER_CUBE : 0x8DCC,
         INT_SAMPLER_2D_ARRAY : 0x8DCF,
         UNSIGNED_INT_SAMPLER_2D : 0x8DD2,
         UNSIGNED_INT_SAMPLER_3D : 0x8DD3,
         UNSIGNED_INT_SAMPLER_CUBE : 0x8DD4,
         UNSIGNED_INT_SAMPLER_2D_ARRAY : 0x8DD7,
         DEPTH_COMPONENT32F : 0x8CAC,
         DEPTH32F_STENCIL8 : 0x8CAD,
         FLOAT_32_UNSIGNED_INT_24_8_REV : 0x8DAD,
         FRAMEBUFFER_ATTACHMENT_COLOR_ENCODING : 0x8210,
         FRAMEBUFFER_ATTACHMENT_COMPONENT_TYPE : 0x8211,
         FRAMEBUFFER_ATTACHMENT_RED_SIZE : 0x8212,
         FRAMEBUFFER_ATTACHMENT_GREEN_SIZE : 0x8213,
         FRAMEBUFFER_ATTACHMENT_BLUE_SIZE : 0x8214,
         FRAMEBUFFER_ATTACHMENT_ALPHA_SIZE : 0x8215,
         FRAMEBUFFER_ATTACHMENT_DEPTH_SIZE : 0x8216,
         FRAMEBUFFER_ATTACHMENT_STENCIL_SIZE : 0x8217,
         FRAMEBUFFER_DEFAULT : 0x8218,
         UNSIGNED_INT_24_8 : 0x84FA,
         DEPTH24_STENCIL8 : 0x88F0,
         UNSIGNED_NORMALIZED : 0x8C17,
         DRAW_FRAMEBUFFER_BINDING : 0x8CA6, // Same as FRAMEBUFFER_BINDING
         READ_FRAMEBUFFER : 0x8CA8,
         DRAW_FRAMEBUFFER : 0x8CA9,
         READ_FRAMEBUFFER_BINDING : 0x8CAA,
         RENDERBUFFER_SAMPLES : 0x8CAB,
         FRAMEBUFFER_ATTACHMENT_TEXTURE_LAYER : 0x8CD4,
         MAX_COLOR_ATTACHMENTS : 0x8CDF,
         COLOR_ATTACHMENT1 : 0x8CE1,
         COLOR_ATTACHMENT2 : 0x8CE2,
         COLOR_ATTACHMENT3 : 0x8CE3,
         COLOR_ATTACHMENT4 : 0x8CE4,
         COLOR_ATTACHMENT5 : 0x8CE5,
         COLOR_ATTACHMENT6 : 0x8CE6,
         COLOR_ATTACHMENT7 : 0x8CE7,
         COLOR_ATTACHMENT8 : 0x8CE8,
         COLOR_ATTACHMENT9 : 0x8CE9,
         COLOR_ATTACHMENT10 : 0x8CEA,
         COLOR_ATTACHMENT11 : 0x8CEB,
         COLOR_ATTACHMENT12 : 0x8CEC,
         COLOR_ATTACHMENT13 : 0x8CED,
         COLOR_ATTACHMENT14 : 0x8CEE,
         COLOR_ATTACHMENT15 : 0x8CEF,
         FRAMEBUFFER_INCOMPLETE_MULTISAMPLE : 0x8D56,
         MAX_SAMPLES : 0x8D57,
         HALF_FLOAT : 0x140B,
         RG : 0x8227,
         RG_INTEGER : 0x8228,
         R8 : 0x8229,
         RG8 : 0x822B,
         R16F : 0x822D,
         R32F : 0x822E,
         RG16F : 0x822F,
         RG32F : 0x8230,
         R8I : 0x8231,
         R8UI : 0x8232,
         R16I : 0x8233,
         R16UI : 0x8234,
         R32I : 0x8235,
         R32UI : 0x8236,
         RG8I : 0x8237,
         RG8UI : 0x8238,
         RG16I : 0x8239,
         RG16UI : 0x823A,
         RG32I : 0x823B,
         RG32UI : 0x823C,
         VERTEX_ARRAY_BINDING : 0x85B5,
         R8_SNORM : 0x8F94,
         RG8_SNORM : 0x8F95,
         RGB8_SNORM : 0x8F96,
         RGBA8_SNORM : 0x8F97,
         SIGNED_NORMALIZED : 0x8F9C,
         COPY_READ_BUFFER : 0x8F36,
         COPY_WRITE_BUFFER : 0x8F37,
         COPY_READ_BUFFER_BINDING : 0x8F36, // Same as COPY_READ_BUFFER
         COPY_WRITE_BUFFER_BINDING : 0x8F37, // Same as COPY_WRITE_BUFFER
         UNIFORM_BUFFER : 0x8A11,
         UNIFORM_BUFFER_BINDING : 0x8A28,
         UNIFORM_BUFFER_START : 0x8A29,
         UNIFORM_BUFFER_SIZE : 0x8A2A,
         MAX_VERTEX_UNIFORM_BLOCKS : 0x8A2B,
         MAX_FRAGMENT_UNIFORM_BLOCKS : 0x8A2D,
         MAX_COMBINED_UNIFORM_BLOCKS : 0x8A2E,
         MAX_UNIFORM_BUFFER_BINDINGS : 0x8A2F,
         MAX_UNIFORM_BLOCK_SIZE : 0x8A30,
         MAX_COMBINED_VERTEX_UNIFORM_COMPONENTS : 0x8A31,
         MAX_COMBINED_FRAGMENT_UNIFORM_COMPONENTS : 0x8A33,
         UNIFORM_BUFFER_OFFSET_ALIGNMENT : 0x8A34,
         ACTIVE_UNIFORM_BLOCKS : 0x8A36,
         UNIFORM_TYPE : 0x8A37,
         UNIFORM_SIZE : 0x8A38,
         UNIFORM_BLOCK_INDEX : 0x8A3A,
         UNIFORM_OFFSET : 0x8A3B,
         UNIFORM_ARRAY_STRIDE : 0x8A3C,
         UNIFORM_MATRIX_STRIDE : 0x8A3D,
         UNIFORM_IS_ROW_MAJOR : 0x8A3E,
         UNIFORM_BLOCK_BINDING : 0x8A3F,
         UNIFORM_BLOCK_DATA_SIZE : 0x8A40,
         UNIFORM_BLOCK_ACTIVE_UNIFORMS : 0x8A42,
         UNIFORM_BLOCK_ACTIVE_UNIFORM_INDICES : 0x8A43,
         UNIFORM_BLOCK_REFERENCED_BY_VERTEX_SHADER : 0x8A44,
         UNIFORM_BLOCK_REFERENCED_BY_FRAGMENT_SHADER : 0x8A46,
         INVALID_INDEX : 0xFFFFFFFF,
         MAX_VERTEX_OUTPUT_COMPONENTS : 0x9122,
         MAX_FRAGMENT_INPUT_COMPONENTS : 0x9125,
         MAX_SERVER_WAIT_TIMEOUT : 0x9111,
         OBJECT_TYPE : 0x9112,
         SYNC_CONDITION : 0x9113,
         SYNC_STATUS : 0x9114,
         SYNC_FLAGS : 0x9115,
         SYNC_FENCE : 0x9116,
         SYNC_GPU_COMMANDS_COMPLETE : 0x9117,
         UNSIGNALED : 0x9118,
         SIGNALED : 0x9119,
         ALREADY_SIGNALED : 0x911A,
         TIMEOUT_EXPIRED : 0x911B,
         CONDITION_SATISFIED : 0x911C,
         WAIT_FAILED : 0x911D,
         SYNC_FLUSH_COMMANDS_BIT : 0x00000001,
         VERTEX_ATTRIB_ARRAY_DIVISOR : 0x88FE,
         ANY_SAMPLES_PASSED : 0x8C2F,
         ANY_SAMPLES_PASSED_CONSERVATIVE : 0x8D6A,
         SAMPLER_BINDING : 0x8919,
         RGB10_A2UI : 0x906F,
         INT_2_10_10_10_REV : 0x8D9F,
         TRANSFORM_FEEDBACK : 0x8E22,
         TRANSFORM_FEEDBACK_PAUSED : 0x8E23,
         TRANSFORM_FEEDBACK_ACTIVE : 0x8E24,
         TRANSFORM_FEEDBACK_BINDING : 0x8E25,
         COMPRESSED_R11_EAC : 0x9270,
         COMPRESSED_SIGNED_R11_EAC : 0x9271,
         COMPRESSED_RG11_EAC : 0x9272,
         COMPRESSED_SIGNED_RG11_EAC : 0x9273,
         COMPRESSED_RGB8_ETC2 : 0x9274,
         COMPRESSED_SRGB8_ETC2 : 0x9275,
         COMPRESSED_RGB8_PUNCHTHROUGH_ALPHA1_ETC2 : 0x9276,
         COMPRESSED_SRGB8_PUNCHTHROUGH_ALPHA1_ETC2 : 0x9277,
         COMPRESSED_RGBA8_ETC2_EAC : 0x9278,
         COMPRESSED_SRGB8_ALPHA8_ETC2_EAC : 0x9279,
         TEXTURE_IMMUTABLE_FORMAT : 0x912F,
         MAX_ELEMENT_INDEX : 0x8D6B,
         TEXTURE_IMMUTABLE_LEVELS : 0x82DF,

         // Extensions
         MAX_TEXTURE_MAX_ANISOTROPY_EXT : 0x84FF
     };


THREE.GLTFExporter = function () {};

THREE.GLTFExporter.prototype = {

	constructor: THREE.GLTFExporter,
	parse: function ( input, onDone ) {

		var outputJSON = {
/*
        asset : [],
        buffers : [],
        bufferViews : [],
        extensionsUsed : ['KHR_materials_common'],
        images : [],
        materials : [],
				*/
        //meshes : [],
				/*
        samplers : [],
        textures : []
*/
    };

		outputJSON.asset = {
			version: "2.0",
			generator: "THREE.JS GLTFExporter"
	 	};

		outputJSON.materials = [
				{
						"pbrMetallicRoughness": {
								"baseColorFactor": [
										0.800000011920929,
										0.0,
										0.0,
										1.0
								],
								"metallicFactor": 0.0
						},
						"name": "Red"
				}
		];

		var indexScene = 0;
		var indexNode = 0;
		var byteOffset = 0;

		var vertexBuffers = [];
    var vertexBufferByteOffset = 0;
    var indexBuffers = [];
    var indexBufferByteOffset = 0;
		var buffer = [];
		var dataViews = [];

		/**
		 * [processBuffer description]
		 * @param  {[type]} data [description]
		 * @return {[type]}      [description]
		 */
		function processBuffer ( attribute, componentType ) {
			if (!outputJSON.buffers) {
				outputJSON.buffers = [
					{
						byteLength: 0,
						uri: ''
					}
				];
			}

			var dataView = new DataView( new ArrayBuffer( attribute.array.byteLength ) );

			var offset = 0;
			var offsetInc = componentType === WebGLConstants.UNSIGNED_SHORT ? 2 : 4;

			for ( var i = 0; i < attribute.count; i++ ) {
				for (var a = 0; a < attribute.itemSize; a++ ) {
					var value = attribute.array[i * attribute.itemSize + a];
					if (componentType === WebGLConstants.FLOAT) {
						dataView.setFloat32(offset, value, true);
					} else if (componentType === WebGLConstants.UNSIGNED_INT) {
						dataView.setUint8(offset, value, true);
					} else if (componentType === WebGLConstants.UNSIGNED_SHORT) {
						dataView.setUint16(offset, value, true);
					}
					offset += offsetInc;
				}
			}

			dataViews.push(dataView);

			return 0;
		}

		/**
		 * [processBufferView description]
		 * @param  {[type]} data [description]
		 * @return {[type]}      [description]
		 */
		function processBufferView ( data, componentType ) {
			var isVertexAttributes = componentType === WebGLConstants.FLOAT;
			if (!outputJSON.bufferViews) {
				outputJSON.bufferViews = [];
			}

			var gltfBufferView = {
				buffer: processBuffer( data, componentType ),
				byteOffset: byteOffset,
				byteLength: data.array.byteLength,
				byteStride: data.itemSize * (componentType === WebGLConstants.UNSIGNED_SHORT ? 2 : 4),
				target: isVertexAttributes ? WebGLConstants.ARRAY_BUFFER : WebGLConstants.ELEMENT_ARRAY_BUFFER
			};

			byteOffset += data.array.byteLength;

			outputJSON.bufferViews.push(gltfBufferView);
/*
			var output = {
				id: isVertexAttributes ? 0 : 1, //@ 0 is for vertex attributes, 1 for indices
				byteLength: 2
			};
*/
			var output = {
				id: outputJSON.bufferViews.length - 1,
				byteLength: 0
			};
			return output;
		}

		function getMinMax ( attribute ) {
			var output = {
				min: new Array( attribute.itemSize ).fill( Number.POSITIVE_INFINITY ),
				max: new Array( attribute.itemSize ).fill( Number.NEGATIVE_INFINITY )
			};

			for ( var i = 0; i < attribute.count; i++ ) {
				for (var a = 0; a < attribute.itemSize; a++ ) {
					var value = attribute.array[i * attribute.itemSize + a];
					output.min[ a ] = Math.min( output.min[ a ], value );
					output.max[ a ] = Math.max( output.max[ a ], value );
				}
			}

			return output;
		}

		/**
		 * [processAccessor description]
		 * @param  {[type]} attribute [description]
		 * @return {[type]}           [description]
		 */
		function processAccessor ( attribute ) {
			if (!outputJSON.accessors) {
				outputJSON.accessors = [];
			}

			var types = [
				"SCALAR",
				"VEC2",
				"VEC3",
				"VEC4"
			];

			var componentType = attribute instanceof THREE.Float32BufferAttribute ? WebGLConstants.FLOAT :
				(attribute instanceof THREE.Uint32BufferAttribute ? WebGLConstants.UNSIGNED_INT : WebGLConstants.UNSIGNED_SHORT);

			var minMax = getMinMax( attribute );
			var bufferView = processBufferView( attribute, componentType );
			console.log(">>>>>",bufferView);
			var gltfAccessor = {
				bufferView: bufferView.id,
				byteOffset: bufferView.byteOffset,
				componentType: componentType,
				count: attribute.count,
				max: minMax.max,
				min: minMax.min,
				type: types[ attribute.itemSize - 1]
			};

			outputJSON.accessors.push( gltfAccessor );

			return outputJSON.accessors.length - 1;
		}

		/**
		 * [processMaterial description]
		 * @param  {[type]} mesh [description]
		 * @return {[type]}      [description]
		 */
		function processMaterial ( material ) {
			if (!outputJSON.materials) {
				outputJSON.materials = [];
			}
			var gltfMaterial = {
				pbrMetallicRoughness: {
					baseColorFactor: material.color.toArray().concat([material.opacity]),
					metallicFactor: material.metalness,
					roughnessFactor: material.roughness
				}
			};

			if (material.side === THREE.DoubleSide) {
				gltfMaterial.doubleSided = true;
			}

			if (material.name) {
				gltfMaterial.name = material.name;
			}

			outputJSON.materials.push(gltfMaterial);

			return outputJSON.materials.length - 1;
		}

		/**
		 * [processMesh description]
		 * @param  {[type]} mesh [description]
		 * @return {[type]}      [description]
		 */
		function processMesh( mesh ) {
			if ( !outputJSON.meshes ) {
				outputJSON.meshes = [];
			}

			var geometry = mesh.geometry;
			var mode = 4;

			var gltfMesh = {
				primitives: [
					{
						mode: mode,
						attributes: {},
						material: processMaterial( mesh.material ),
					 	indices: processAccessor( geometry.index )
					}
				]
			};

			var gltfAttributes = gltfMesh.primitives[0].attributes;
			var attributes = geometry.attributes;

			for (attributeName in geometry.attributes) {
				var attribute = geometry.attributes[ attributeName ];
				gltfAttributes[attributeName.toUpperCase()] = processAccessor( attribute );
			}

			//gltfMesh.primitives.indices = processAccessor( geometry.index );

			// @todo Not really necessary, isn't it?
			if ( geometry.type ) {
				gltfMesh.name = geometry.type;
			}

			outputJSON.meshes.push( gltfMesh );

			return outputJSON.meshes.length - 1;
		}

		/**
		 * Process Object3D node
		 * @param  {THREE.Object3D} node Object3D to processNode
		 * @return {Integer}      Index of the node in the nodes list
		 */
		function processNode ( object ) {

			if (!outputJSON.nodes) {
				outputJSON.nodes = [];
			}

			var gltfNode = {
				matrix: object.matrix.elements
			};

			if ( object.name ) {
				gltfNode.name = object.name;
			}

			if ( object instanceof THREE.Mesh ) {
				gltfNode.mesh = processMesh( object );
			}

			if ( object.children.length > 0 ) {
				gltfNode.nodes = [];

				for ( var i = 0, l = object.children.length; i < l; i ++ ) {
					var child = object.children[ i ];
					if ( child instanceof THREE.Mesh ) {
						gltfNode.nodes.push( processNode( child ) );
					}
				}
			}

			outputJSON.nodes.push( gltfNode );

			return outputJSON.nodes.length - 1;
		}

		/**
		 * processScene
		 * @param  {THREE.Scene} node Scene to process
		 * @return {[type]}      [description]
		 */
		function processScene( scene ) {
			if (!outputJSON.scene) {
				outputJSON.scenes = [];
				outputJSON.scene = 0;
			}

			var gltfScene = {
				nodes: []
			};

			if ( scene.name ) {
				gltfScene.name = scene.name;
			}

			outputJSON.scenes.push(gltfScene);
			indexScene ++;

			for ( var i = 0, l = scene.children.length; i < l; i ++ ) {
				gltfScene.nodes.push( processNode( scene.children[ i ] ) );
			}
		}

		processScene( input );

		var blob = new Blob(dataViews, {type: 'application/octet-binary'});
		outputJSON.buffers[0].byteLength = blob.size;

		objectURL = URL.createObjectURL(blob);

		var reader = new window.FileReader();
		 reader.readAsDataURL(blob);
		 reader.onloadend = function() {
			 base64data = reader.result;
			 outputJSON.buffers[0].uri = base64data;
			 console.log(JSON.stringify(outputJSON, null, 2));
			 onDone(outputJSON);
		 }
	}
};
