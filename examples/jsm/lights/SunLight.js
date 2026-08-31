import { Light, MathUtils, Object3D } from 'three';
import { SunLightShadow } from './SunLightShadow.js';

/**
 * A sun-like light that gets emitted in a specific direction, with rays that
 * are all parallel, and casts cascaded shadow maps via {@link SunLightShadow},
 * suited for lighting large scenes.
 *
 * Unlike {@link DirectionalLight}, the light has no target: like
 * {@link HemisphereLight}, its direction is defined by its position. The
 * light shines from its position towards the origin and points straight
 * down by default.
 *
 * ```js
 * const sun = new SunLight( 0xfff2e3, 3 );
 * sun.position.set( 1, 1, 1 );
 * sun.castShadow = true;
 * scene.add( sun );
 * ```
 *
 * When used with `WebGPURenderer`, the light must be registered with the
 * renderer's node library first:
 * ```js
 * renderer.library.addLight( SunLightNode, SunLight );
 * ```
 *
 * @augments Light
 * @three_import import { SunLight } from 'three/addons/lights/SunLight.js';
 */
class SunLight extends Light {

	/**
	 * Constructs a new sun light.
	 *
	 * @param {(number|Color|string)} [color=0xffffff] - The light's color.
	 * @param {number} [intensity=1] - The light's strength/intensity.
	 */
	constructor( color, intensity ) {

		super( color, intensity );

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isSunLight = true;

		this.type = 'SunLight';

		this.position.copy( Object3D.DEFAULT_UP );
		this.updateMatrix();

		/**
		 * This property holds the light's shadow configuration.
		 *
		 * @type {SunLightShadow}
		 */
		this.shadow = new SunLightShadow();

	}

	dispose() {

		super.dispose();

		this.shadow.dispose();

	}

	copy( source ) {

		super.copy( source );

		this.shadow = source.shadow.clone();

		return this;

	}

	toJSON( meta ) {

		const data = super.toJSON( meta );

		data.object.shadow = this.shadow.toJSON();

		return data;

	}

}

/**
 * Calculates the apparent position of the sun for a given date, time and
 * geographic location, using a low-precision solar position algorithm
 * (accurate to about 0.01° through 2099). `date`'s UTC time is used, so
 * build it with the correct time zone offset already applied.
 *
 * ```js
 * const { elevation, azimuth } = getSunPosition( new Date(), 51.5, - 0.13 ); // London
 * sunLight.position.setFromSphericalCoords( 1, MathUtils.degToRad( 90 - elevation ), MathUtils.degToRad( azimuth ) );
 * ```
 *
 * Reference: {@link https://en.wikipedia.org/wiki/Position_of_the_Sun}
 *
 * @param {Date} date - The date and time to compute the sun position for.
 * @param {number} latitude - The observer's latitude, in degrees (`-90` to `90`).
 * @param {number} longitude - The observer's longitude, in degrees (`-180` to `180`, east positive).
 * @return {{elevation: number, azimuth: number}} The sun's elevation and azimuth, in degrees.
 */
function getSunPosition( date, latitude, longitude ) {

	const jd = date.getTime() / 86400000 + 2440587.5; // Julian date
	const t = ( jd - 2451545.0 ) / 36525; // centuries since J2000.0

	const L0 = MathUtils.euclideanModulo( 280.46646 + t * ( 36000.76983 + t * 0.0003032 ), 360 );
	const M = 357.52911 + t * ( 35999.05029 - 0.0001537 * t ); // https://en.wikipedia.org/wiki/Mean_anomaly
	const Mrad = M * MathUtils.DEG2RAD;

	const eccentricity = 0.016708634 - t * ( 0.000042037 + 0.0000001267 * t );

	// https://en.wikipedia.org/wiki/Equation_of_the_center
	const equationOfCenter = Math.sin( Mrad ) * ( 1.914602 - t * ( 0.004817 + 0.000014 * t ) ) +
		Math.sin( 2 * Mrad ) * ( 0.019993 - 0.000101 * t ) +
		Math.sin( 3 * Mrad ) * 0.000289;

	const trueLongitude = L0 + equationOfCenter;

	const omega = 125.04 - 1934.136 * t;
	const apparentLongitude = trueLongitude - 0.00569 - 0.00478 * Math.sin( omega * MathUtils.DEG2RAD );

	// https://en.wikipedia.org/wiki/Axial_tilt
	const meanObliquity = 23 + ( 26 + ( 21.448 - t * ( 46.815 + t * ( 0.00059 - t * 0.001813 ) ) ) / 60 ) / 60;
	const obliquity = meanObliquity + 0.00256 * Math.cos( omega * MathUtils.DEG2RAD );

	const lambdaRad = apparentLongitude * MathUtils.DEG2RAD;
	const obliquityRad = obliquity * MathUtils.DEG2RAD;

	const declination = Math.asin( Math.sin( obliquityRad ) * Math.sin( lambdaRad ) );

	const y = Math.pow( Math.tan( obliquityRad / 2 ), 2 );
	const L0rad = L0 * MathUtils.DEG2RAD;

	// https://en.wikipedia.org/wiki/Equation_of_time
	const equationOfTime = 4 * MathUtils.RAD2DEG * (
		y * Math.sin( 2 * L0rad ) -
		2 * eccentricity * Math.sin( Mrad ) +
		4 * eccentricity * y * Math.sin( Mrad ) * Math.cos( 2 * L0rad ) -
		0.5 * y * y * Math.sin( 4 * L0rad ) -
		1.25 * eccentricity * eccentricity * Math.sin( 2 * Mrad )
	);

	const utcMinutes = date.getUTCHours() * 60 + date.getUTCMinutes() + date.getUTCSeconds() / 60;
	const trueSolarTime = MathUtils.euclideanModulo( utcMinutes + equationOfTime + 4 * longitude, 1440 );

	// https://en.wikipedia.org/wiki/Hour_angle
	const hourAngleRad = ( trueSolarTime / 4 - 180 ) * MathUtils.DEG2RAD;

	const latRad = latitude * MathUtils.DEG2RAD;

	// https://en.wikipedia.org/wiki/Solar_zenith_angle
	const cosZenith = Math.sin( latRad ) * Math.sin( declination ) +
		Math.cos( latRad ) * Math.cos( declination ) * Math.cos( hourAngleRad );
	const zenithRad = Math.acos( MathUtils.clamp( cosZenith, - 1, 1 ) );

	// https://en.wikipedia.org/wiki/Solar_azimuth_angle
	let azimuthRad = Math.acos( MathUtils.clamp(
		( Math.sin( declination ) - Math.sin( latRad ) * Math.cos( zenithRad ) ) /
		( Math.cos( latRad ) * Math.sin( zenithRad ) ), - 1, 1
	) );

	if ( hourAngleRad > 0 ) azimuthRad = Math.PI * 2 - azimuthRad;

	return {
		elevation: 90 - zenithRad * MathUtils.RAD2DEG,
		azimuth: azimuthRad * MathUtils.RAD2DEG
	};

}

export { SunLight, getSunPosition };
