/* global QUnit */

import * as Constants from '../../../src/constants.js';

export default QUnit.module( 'Constants', () => {

	QUnit.test( 'default values', ( assert ) => {

		assert.propEqual( Constants.MOUSE, { LEFT: 0, MIDDLE: 1, RIGHT: 2, ROTATE: 0, DOLLY: 1, PAN: 2 }, 'MOUSE equal { LEFT: 0, MIDDLE: 1, RIGHT: 2, ROTATE: 0, DOLLY: 1, PAN: 2 }' );
		assert.propEqual( Constants.TOUCH, { ROTATE: 0, PAN: 1, DOLLY_PAN: 2, DOLLY_ROTATE: 3 }, 'TOUCH equal { ROTATE: 0, PAN: 1, DOLLY_PAN: 2, DOLLY_ROTATE: 3 }' );

		assert.equal( Constants.CullFaceNone, 0, 'CullFaceNone equal 0' );
		assert.equal( Constants.CullFaceBack, 1, 'CullFaceBack equal 1' );
		assert.equal( Constants.CullFaceFront, 2, 'CullFaceFront is equal to 2' );
		assert.equal( Constants.CullFaceFrontBack, 3, 'CullFaceFrontBack is equal to 3' );

		assert.equal( Constants.BasicShadowMap, 0, 'BasicShadowMap is equal to 0' );
		assert.equal( Constants.PCFShadowMap, 1, 'PCFShadowMap is equal to 1' );
		assert.equal( Constants.PCFSoftShadowMap, 2, 'PCFSoftShadowMap is equal to 2' );
		assert.equal( Constants.VSMShadowMap, 3, 'VSMShadowMap is equal to 3' );

		assert.equal( Constants.FrontSide, 0, 'FrontSide is equal to 0' );
		assert.equal( Constants.BackSide, 1, 'BackSide is equal to 1' );
		assert.equal( Constants.DoubleSide, 2, 'DoubleSide is equal to 2' );

		assert.equal( Constants.NoBlending, 0, 'NoBlending is equal to 0' );
		assert.equal( Constants.NormalBlending, 1, 'NormalBlending is equal to 1' );
		assert.equal( Constants.AdditiveBlending, 2, 'AdditiveBlending is equal to 2' );
		assert.equal( Constants.SubtractiveBlending, 3, 'SubtractiveBlending is equal to 3' );
		assert.equal( Constants.MultiplyBlending, 4, 'MultiplyBlending is equal to 4' );
		assert.equal( Constants.CustomBlending, 5, 'CustomBlending is equal to 5' );

		assert.equal( Constants.AddEquation, 100, 'AddEquation is equal to 100' );
		assert.equal( Constants.SubtractEquation, 101, 'SubtractEquation is equal to 101' );
		assert.equal( Constants.ReverseSubtractEquation, 102, 'ReverseSubtractEquation is equal to 102' );
		assert.equal( Constants.MinEquation, 103, 'MinEquation is equal to 103' );
		assert.equal( Constants.MaxEquation, 104, 'MaxEquation is equal to 104' );

		assert.equal( Constants.ZeroFactor, 200, 'ZeroFactor is equal to 200' );
		assert.equal( Constants.OneFactor, 201, 'OneFactor is equal to 201' );
		assert.equal( Constants.SrcColorFactor, 202, 'SrcColorFactor is equal to 202' );
		assert.equal( Constants.OneMinusSrcColorFactor, 203, 'OneMinusSrcColorFactor is equal to 203' );
		assert.equal( Constants.SrcAlphaFactor, 204, 'SrcAlphaFactor is equal to 204' );
		assert.equal( Constants.OneMinusSrcAlphaFactor, 205, 'OneMinusSrcAlphaFactor is equal to 205' );
		assert.equal( Constants.DstAlphaFactor, 206, 'DstAlphaFactor is equal to 206' );
		assert.equal( Constants.OneMinusDstAlphaFactor, 207, 'OneMinusDstAlphaFactor is equal to 207' );
		assert.equal( Constants.DstColorFactor, 208, 'DstColorFactor is equal to 208' );
		assert.equal( Constants.OneMinusDstColorFactor, 209, 'OneMinusDstColorFactor is equal to 209' );
		assert.equal( Constants.SrcAlphaSaturateFactor, 210, 'SrcAlphaSaturateFactor is equal to 210' );
		assert.equal( Constants.ConstantColorFactor, 211, 'ConstantColorFactor is equal to 211' );
		assert.equal( Constants.OneMinusConstantColorFactor, 212, 'OneMinusConstantColorFactor is equal to 212' );
		assert.equal( Constants.ConstantAlphaFactor, 213, 'ConstantAlphaFactor is equal to 213' );
		assert.equal( Constants.OneMinusConstantAlphaFactor, 214, 'OneMinusConstantAlphaFactor is equal to 214' );

		assert.equal( Constants.NeverDepth, 0, 'NeverDepth is equal to 0' );
		assert.equal( Constants.AlwaysDepth, 1, 'AlwaysDepth is equal to 1' );
		assert.equal( Constants.LessDepth, 2, 'LessDepth is equal to 2' );
		assert.equal( Constants.LessEqualDepth, 3, 'LessEqualDepth is equal to 3' );
		assert.equal( Constants.EqualDepth, 4, 'EqualDepth is equal to 4' );
		assert.equal( Constants.GreaterEqualDepth, 5, 'GreaterEqualDepth is equal to 5' );
		assert.equal( Constants.GreaterDepth, 6, 'GreaterDepth is equal to 6' );
		assert.equal( Constants.NotEqualDepth, 7, 'NotEqualDepth is equal to 7' );

		assert.equal( Constants.MultiplyOperation, 0, 'MultiplyOperation is equal to 0' );
		assert.equal( Constants.MixOperation, 1, 'MixOperation is equal to 1' );
		assert.equal( Constants.AddOperation, 2, 'AddOperation is equal to 2' );

		assert.equal( Constants.NoToneMapping, 0, 'NoToneMapping is equal to 0' );
		assert.equal( Constants.LinearToneMapping, 1, 'LinearToneMapping is equal to 1' );
		assert.equal( Constants.ReinhardToneMapping, 2, 'ReinhardToneMapping is equal to 2' );
		assert.equal( Constants.CineonToneMapping, 3, 'CineonToneMapping is equal to 3' );
		assert.equal( Constants.ACESFilmicToneMapping, 4, 'ACESFilmicToneMapping is equal to 4' );
		assert.equal( Constants.CustomToneMapping, 5, 'CustomToneMapping is equal to 5' );
		assert.equal( Constants.AgXToneMapping, 6, 'AgXToneMapping is equal to 6' );
		assert.equal( Constants.NeutralToneMapping, 7, 'NeutralToneMapping is equal to 7' );

		assert.equal( Constants.AttachedBindMode, 'attached', 'AttachedBindMode is equal to attached' );
		assert.equal( Constants.DetachedBindMode, 'detached', 'DetachedBindMode is equal to detached' );

		assert.equal( Constants.UVMapping, 300, 'UVMapping is equal to 300' );
		assert.equal( Constants.CubeReflectionMapping, 301, 'CubeReflectionMapping is equal to 301' );
		assert.equal( Constants.CubeRefractionMapping, 302, 'CubeRefractionMapping is equal to 302' );
		assert.equal( Constants.EquirectangularReflectionMapping, 303, 'EquirectangularReflectionMapping is equal to 303' );
		assert.equal( Constants.EquirectangularRefractionMapping, 304, 'EquirectangularRefractionMapping is equal to 304' );
		assert.equal( Constants.CubeUVReflectionMapping, 306, 'CubeUVReflectionMapping is equal to 306' );

		assert.equal( Constants.RepeatWrapping, 1000, 'RepeatWrapping is equal to 1000' );
		assert.equal( Constants.ClampToEdgeWrapping, 1001, 'ClampToEdgeWrapping is equal to 1001' );
		assert.equal( Constants.MirroredRepeatWrapping, 1002, 'MirroredRepeatWrapping is equal to 1002' );

		assert.equal( Constants.NearestFilter, 1003, 'NearestFilter is equal to 1003' );
		assert.equal( Constants.NearestMipMapNearestFilter, 1004, 'NearestMipMapNearestFilter is equal to 1004' );
		assert.equal( Constants.NearestMipMapLinearFilter, 1005, 'NearestMipMapLinearFilter is equal to 1005' );
		assert.equal( Constants.LinearFilter, 1006, 'LinearFilter is equal to 1006' );
		assert.equal( Constants.LinearMipMapNearestFilter, 1007, 'LinearMipMapNearestFilter is equal to 1007' );
		assert.equal( Constants.LinearMipMapLinearFilter, 1008, 'LinearMipMapLinearFilter is equal to 1008' );
		assert.equal( Constants.UnsignedByteType, 1009, 'UnsignedByteType is equal to 1009' );

		assert.equal( Constants.ByteType, 1010, 'ByteType is equal to 1010' );
		assert.equal( Constants.ShortType, 1011, 'ShortType is equal to 1011' );
		assert.equal( Constants.UnsignedShortType, 1012, 'UnsignedShortType is equal to 1012' );
		assert.equal( Constants.IntType, 1013, 'IntType is equal to 1013' );
		assert.equal( Constants.UnsignedIntType, 1014, 'UnsignedIntType is equal to 1014' );
		assert.equal( Constants.FloatType, 1015, 'FloatType is equal to 1015' );
		assert.equal( Constants.HalfFloatType, 1016, 'HalfFloatType is equal to 1016' );
		assert.equal( Constants.UnsignedShort4444Type, 1017, 'UnsignedShort4444Type is equal to 1017' );
		assert.equal( Constants.UnsignedShort5551Type, 1018, 'UnsignedShort5551Type is equal to 1018' );
		assert.equal( Constants.UnsignedInt248Type, 1020, 'UnsignedInt248Type is equal to 1020' );

		assert.equal( Constants.AlphaFormat, 1021, 'AlphaFormat is equal to 1021' );
		assert.equal( Constants.RGBAFormat, 1023, 'RGBAFormat is equal to 1023' );
		assert.equal( Constants.DepthFormat, 1026, 'DepthFormat is equal to 1026' );
		assert.equal( Constants.DepthStencilFormat, 1027, 'DepthStencilFormat is equal to 1027' );
		assert.equal( Constants.RedFormat, 1028, 'RedFormat is equal to 1028' );
		assert.equal( Constants.RedIntegerFormat, 1029, 'RedIntegerFormat is equal to 1029' );
		assert.equal( Constants.RGFormat, 1030, 'RGFormat is equal to 1030' );
		assert.equal( Constants.RGIntegerFormat, 1031, 'RGIntegerFormat is equal to 1031' );
		assert.equal( Constants.RGBAIntegerFormat, 1033, 'RGBAIntegerFormat is equal to 1033' );

		assert.equal( Constants.RGB_S3TC_DXT1_Format, 33776, 'RGB_S3TC_DXT1_Format is equal to 33776' );
		assert.equal( Constants.RGBA_S3TC_DXT1_Format, 33777, 'RGBA_S3TC_DXT1_Format is equal to 33777' );
		assert.equal( Constants.RGBA_S3TC_DXT3_Format, 33778, 'RGBA_S3TC_DXT3_Format is equal to 33778' );
		assert.equal( Constants.RGBA_S3TC_DXT5_Format, 33779, 'RGBA_S3TC_DXT5_Format is equal to 33779' );
		assert.equal( Constants.RGB_PVRTC_4BPPV1_Format, 35840, 'RGB_PVRTC_4BPPV1_Format is equal to 35840' );
		assert.equal( Constants.RGB_PVRTC_2BPPV1_Format, 35841, 'RGB_PVRTC_2BPPV1_Format is equal to 35841' );
		assert.equal( Constants.RGBA_PVRTC_4BPPV1_Format, 35842, 'RGBA_PVRTC_4BPPV1_Format is equal to 35842' );
		assert.equal( Constants.RGBA_PVRTC_2BPPV1_Format, 35843, 'RGBA_PVRTC_2BPPV1_Format is equal to 35843' );
		assert.equal( Constants.RGB_ETC1_Format, 36196, 'RGB_ETC1_Format is equal to 36196' );
		assert.equal( Constants.RGB_ETC2_Format, 37492, 'RGB_ETC2_Format is equal to 37492' );
		assert.equal( Constants.RGBA_ASTC_4x4_Format, 37808, 'Constants.RGBA_ASTC_4x4_Format is equal to 37808' );
		assert.equal( Constants.RGBA_ASTC_5x4_Format, 37809, 'Constants.RGBA_ASTC_5x4_Format is equal to 37809' );
		assert.equal( Constants.RGBA_ASTC_5x5_Format, 37810, 'Constants.RGBA_ASTC_5x5_Format is equal to 37810' );
		assert.equal( Constants.RGBA_ASTC_6x5_Format, 37811, 'Constants.RGBA_ASTC_6x5_Format is equal to 37811' );
		assert.equal( Constants.RGBA_ASTC_6x6_Format, 37812, 'Constants.RGBA_ASTC_6x6_Format is equal to 37812' );
		assert.equal( Constants.RGBA_ASTC_8x5_Format, 37813, 'Constants.RGBA_ASTC_8x5_Format is equal to 37813' );
		assert.equal( Constants.RGBA_ASTC_8x6_Format, 37814, 'Constants.RGBA_ASTC_8x6_Format is equal to 37814' );
		assert.equal( Constants.RGBA_ASTC_8x8_Format, 37815, 'Constants.RGBA_ASTC_8x8_Format is equal to 37815' );
		assert.equal( Constants.RGBA_ASTC_10x5_Format, 37816, 'Constants.RGBA_ASTC_10x5_Format is equal to 37816' );
		assert.equal( Constants.RGBA_ASTC_10x6_Format, 37817, 'Constants.RGBA_ASTC_10x6_Format is equal to 37817' );
		assert.equal( Constants.RGBA_ASTC_10x8_Format, 37818, 'Constants.RGBA_ASTC_10x8_Format is equal to 37818' );
		assert.equal( Constants.RGBA_ASTC_10x10_Format, 37819, 'Constants.RGBA_ASTC_10x10_Format is equal to 37819' );
		assert.equal( Constants.RGBA_ASTC_12x10_Format, 37820, 'Constants.RGBA_ASTC_12x10_Format is equal to 37820' );
		assert.equal( Constants.RGBA_ASTC_12x12_Format, 37821, 'Constants.RGBA_ASTC_12x12_Format is equal to 37821' );
		assert.equal( Constants.RGBA_BPTC_Format, 36492, 'Constants.RGBA_BPTC_Format is equal to 36492' );
		assert.equal( Constants.RGB_BPTC_SIGNED_Format, 36494, 'Constants.RGB_BPTC_SIGNED_Format is equal to 36494' );
		assert.equal( Constants.RGB_BPTC_UNSIGNED_Format, 36495, 'Constants.RGB_BPTC_UNSIGNED_Format is equal to 36495' );
		assert.equal( Constants.RED_RGTC1_Format, 36283, 'Constants.RED_RGTC1_Format is equal to 36283' );
		assert.equal( Constants.SIGNED_RED_RGTC1_Format, 36284, 'Constants.SIGNED_RED_RGTC1_Format is equal to 36284' );
		assert.equal( Constants.RED_GREEN_RGTC2_Format, 36285, 'Constants.RED_GREEN_RGTC2_Format is equal to 36285' );
		assert.equal( Constants.SIGNED_RED_GREEN_RGTC2_Format, 36286, 'Constants.SIGNED_RED_GREEN_RGTC2_Format is equal to 36286' );

		assert.equal( Constants.LoopOnce, 2200, 'LoopOnce is equal to 2200' );
		assert.equal( Constants.LoopRepeat, 2201, 'LoopRepeat is equal to 2201' );
		assert.equal( Constants.LoopPingPong, 2202, 'LoopPingPong is equal to 2202' );

		assert.equal( Constants.InterpolateDiscrete, 2300, 'InterpolateDiscrete is equal to 2300' );
		assert.equal( Constants.InterpolateLinear, 2301, 'InterpolateLinear is equal to 2301' );
		assert.equal( Constants.InterpolateSmooth, 2302, 'InterpolateSmooth is equal to 2302' );

		assert.equal( Constants.ZeroCurvatureEnding, 2400, 'ZeroCurvatureEnding is equal to 2400' );
		assert.equal( Constants.ZeroSlopeEnding, 2401, 'ZeroSlopeEnding is equal to 2401' );
		assert.equal( Constants.WrapAroundEnding, 2402, 'WrapAroundEnding is equal to 2402' );

		assert.equal( Constants.NormalAnimationBlendMode, 2500, 'NormalAnimationBlendMode is equal to 2500' );
		assert.equal( Constants.AdditiveAnimationBlendMode, 2501, 'AdditiveAnimationBlendMode is equal to 2501' );

		assert.equal( Constants.TrianglesDrawMode, 0, 'TrianglesDrawMode is equal to 0' );
		assert.equal( Constants.TriangleStripDrawMode, 1, 'TriangleStripDrawMode is equal to 1' );
		assert.equal( Constants.TriangleFanDrawMode, 2, 'TriangleFanDrawMode is equal to 2' );

		assert.equal( Constants.BasicDepthPacking, 3200, 'BasicDepthPacking is equal to 3200' );
		assert.equal( Constants.RGBADepthPacking, 3201, 'RGBADepthPacking is equal to 3201' );

		assert.equal( Constants.TangentSpaceNormalMap, 0, 'TangentSpaceNormalMap is equal to 0' );
		assert.equal( Constants.ObjectSpaceNormalMap, 1, 'ObjectSpaceNormalMap is equal to 1' );

		assert.equal( Constants.NoColorSpace, '', 'NoColorSpace is equal to ""' );
		assert.equal( Constants.SRGBColorSpace, 'srgb', 'SRGBColorSpace is equal to srgb' );
		assert.equal( Constants.LinearSRGBColorSpace, 'srgb-linear', 'LinearSRGBColorSpace is equal to srgb-linear' );

		assert.equal( Constants.ZeroStencilOp, 0, 'ZeroStencilOp is equal to 0' );
		assert.equal( Constants.KeepStencilOp, 7680, 'KeepStencilOp is equal to 7680' );
		assert.equal( Constants.ReplaceStencilOp, 7681, 'ReplaceStencilOp is equal to 7681' );
		assert.equal( Constants.IncrementStencilOp, 7682, 'IncrementStencilOp is equal to 7682' );
		assert.equal( Constants.DecrementStencilOp, 7683, 'DecrementStencilOp is equal to 7683' );
		assert.equal( Constants.IncrementWrapStencilOp, 34055, 'IncrementWrapStencilOp is equal to 34055' );
		assert.equal( Constants.DecrementWrapStencilOp, 34056, 'DecrementWrapStencilOp is equal to 34056' );
		assert.equal( Constants.InvertStencilOp, 5386, 'InvertStencilOp is equal to 5386' );

		assert.equal( Constants.NeverStencilFunc, 512, 'NeverStencilFunc is equal to 512' );
		assert.equal( Constants.LessStencilFunc, 513, 'LessStencilFunc is equal to 513' );
		assert.equal( Constants.EqualStencilFunc, 514, 'EqualStencilFunc is equal to 514' );
		assert.equal( Constants.LessEqualStencilFunc, 515, 'LessEqualStencilFunc is equal to 515' );
		assert.equal( Constants.GreaterStencilFunc, 516, 'GreaterStencilFunc is equal to 516' );
		assert.equal( Constants.NotEqualStencilFunc, 517, 'NotEqualStencilFunc is equal to 517' );
		assert.equal( Constants.GreaterEqualStencilFunc, 518, 'GreaterEqualStencilFunc is equal to 518' );
		assert.equal( Constants.AlwaysStencilFunc, 519, 'AlwaysStencilFunc is equal to 519' );

		assert.equal( Constants.StaticDrawUsage, 35044, 'StaticDrawUsage is equal to 35044' );
		assert.equal( Constants.DynamicDrawUsage, 35048, 'DynamicDrawUsage is equal to 35048' );
		assert.equal( Constants.StreamDrawUsage, 35040, 'StreamDrawUsage is equal to 35040' );
		assert.equal( Constants.StaticReadUsage, 35045, 'StaticReadUsage is equal to 35045' );
		assert.equal( Constants.DynamicReadUsage, 35049, 'DynamicReadUsage is equal to 35049' );
		assert.equal( Constants.StreamReadUsage, 35041, 'StreamReadUsage is equal to 35041' );
		assert.equal( Constants.StaticCopyUsage, 35046, 'StaticCopyUsage is equal to 35046' );
		assert.equal( Constants.DynamicCopyUsage, 35050, 'DynamicCopyUsage is equal to 35050' );
		assert.equal( Constants.StreamCopyUsage, 35042, 'StreamCopyUsage is equal to 35042' );

		assert.equal( Constants.GLSL1, '100', 'GLSL1 is equal to 100' );
		assert.equal( Constants.GLSL3, '300 es', 'GLSL3 is equal to 300 es' );

	} );

} );
