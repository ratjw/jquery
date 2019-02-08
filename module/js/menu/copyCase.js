
import { mouseEvent } from "./mouseEvent.js"

// Mark the case
export function copyCase()
{
  let  selected = document.querySelector(".selected")
  let  moveCase = document.querySelector(".moveCase")

  if (selected ) {
    mouseEvent(selected)
    selected.classList.remove("lastselected")
    selected.classList.replace("selected", "copyCase")
  } else if (moveCase) {
    moveCase.classList.replace("moveCase", "copyCase")
  }
}
