Camera - Abstract base class for cameras
----------------------------------------

.. ...............................................................................
.. rubric:: Constructor
.. ...............................................................................

.. class:: Camera()

    Abstract base class for cameras

    Inherits from :class:`Object3D`


.. ...............................................................................
.. rubric:: Attributes
.. ...............................................................................

.. attribute:: Camera.matrixWorldInverse

    :class:`Matrix4`

.. attribute:: Camera.projectionMatrix

    :class:`Matrix4`

.. attribute:: Camera.projectionMatrixInverse

    :class:`Matrix4`



.. ...............................................................................
.. rubric:: Methods
.. ...............................................................................

.. function:: Camera.lookAt( vector )

    Orient camera to look at :class:`Vector3`