SpotLight - A spotlight
-----------------------

.. ...............................................................................
.. rubric:: Constructor
.. ...............................................................................

.. class:: SpotLight( hex, intensity, distance, castShadow )

    A point light that can cast shadow in one direction

    Part of scene graph

    Inherits from :class:`Light` :class:`Object3D`

    Affects :class:`MeshLambertMaterial` and :class:`MeshPhongMaterial`

    :param integer hex: light color
    :param float intensity: light intensity
    :param float distance: distance affected by light
    :param bool castShadow: shadow casting



.. ...............................................................................
.. rubric:: Attributes
.. ...............................................................................

.. attribute:: SpotLight.color

    Light :class:`Color`

.. attribute:: SpotLight.intensity

    Light intensity

    ``default 1.0``

.. attribute:: SpotLight.position

    Position of the light

.. attribute:: SpotLight.distance

    If non-zero, light will attenuate linearly from maximum intensity at light ``position`` down to zero at ``distance``



.. ...............................................................................
.. rubric:: Shadow attributes
.. ...............................................................................

.. attribute:: SpotLight.castShadow

    If set to `true` light will cast dynamic shadows

    Warning: this is expensive and requires tweaking to get shadows looking right.

    ``default false``

.. attribute:: SpotLight.onlyShadow

    If set to `true` light will only cast shadow but not contribute any lighting (as if intensity was 0 but cheaper to compute)

    ``default false``

.. attribute:: SpotLight.target

    :class:`Object3D` target used for shadow camera orientation

.. attribute:: SpotLight.shadowCameraNear

    Perspective shadow camera frustum ``near``

    ``default 50``

.. attribute:: SpotLight.shadowCameraFar

    Perspective shadow camera frustum ``far``

    ``default 5000``

.. attribute:: SpotLight.shadowCameraFov

    Perspective shadow camera frustum ``field-of-view``

    ``default 50``

.. attribute:: SpotLight.shadowCameraVisible

    Show debug shadow camera frustum

    ``default false``

.. attribute:: SpotLight.shadowBias

    Shadow map bias

    ``default 0``

.. attribute:: SpotLight.shadowDarkness

    Darkness of shadow casted by this light (``float`` from 0 to 1)

    ``default 0.5``

.. attribute:: SpotLight.shadowMapWidth

    Shadow map texture width in pixels

    ``default 512``

.. attribute:: SpotLight.shadowMapHeight

    Shadow map texture height in pixels

    ``default 512``


.. ...............................................................................
.. rubric:: Example
.. ...............................................................................

::

    // white spotlight shining from the side, casting shadow

    var spotLight = new THREE.SpotLight( 0xffffff );
    spotLight.position.set( 100, 1000, 100 );

    spotLight.castShadow = true;

    spotLight.shadowMapWidth = 1024;
    spotLight.shadowMapHeight = 1024;

    spotLight.shadowCameraNear = 500;
    spotLight.shadowCameraFar = 4000;
    spotLight.shadowCameraFov = 30;

    scene.add( spotLight );
