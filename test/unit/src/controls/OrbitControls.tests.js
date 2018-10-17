import { PerspectiveCamera } from "../../../../src/cameras/PerspectiveCamera"
import { OrbitControls } from "../../../../src/controls/OrbitControls"

export default QUnit.module("Controls", () => {
  QUnit.module("OrbitControls", hooks => {
    hooks.beforeEach(function() {
      const camera = new PerspectiveCamera()
      this.controls = new OrbitControls(camera)
    })

    // INHERITANCE
    QUnit.todo("Extending", assert => {
      assert.ok(false, "everything's gonna be alright")
    })

    // INSTANCING
    QUnit.todo("Instancing", assert => {
      assert.ok(false, "everything's gonna be alright")
    })
  })
})
