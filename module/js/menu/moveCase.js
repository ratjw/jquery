
import { mouseEvent } from "./mouseEvent.js"

// Mark the case
export function moveCase()
{
  let  selected = document.querySelector(".selected")
  let  copyCase = document.querySelector(".copyCase")

  if (selected ) {
    mouseEvent(selected)
    selected.classList.remove("lastselected")
    selected.classList.replace("selected", "moveCase")
  } else if (copyCase) {
    copyCase.classList.replace("copyCase", "moveCase")
  }
}
