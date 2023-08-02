import { reactive } from "vue"

const mousePos = reactive({x: -1, y:  -1})

let mouseMoveEventCount = 0

const onMouseMove = e => {
  mousePos.x = e.clientX
  mousePos.y = e.clientY
}

const activateMouseMove = (initX = -1, initY = -1) => {
  if (!mouseMoveEventCount) {
    window.addEventListener('mousemove', onMouseMove)
    mousePos.x = initX
    mousePos.y = initY
  }
  mouseMoveEventCount++
}
const deactivateMouseMove = () => {
  mouseMoveEventCount--
  if (mouseMoveEventCount <= 0) {
    window.removeEventListener('mousemove', onMouseMove)
    mousePos.x = -1
    mousePos.y = -1
  }
  
}

export { mousePos, activateMouseMove, deactivateMouseMove }
