
import { createEditcell, clearEditcell } from "../control/edit.js"
import { savePreviousCell } from "../control/clicktable.js"
import { spinNumber } from "../util/spinner.js"

export function getROOM(pointing)
{
  let  patient = pointing.parentElement.dataset.qn
  let  editcell = document.getElementById("editcell")
  let  html = '<input id="spin" type="number">'
  let  oldval = pointing.innerHTML

  if ( !patient ) {
    savePreviousCell()
    clearEditcell()
    return
  }

  createEditcell(pointing)
  editcell.style.width = "40px"
  editcell.innerHTML = html
  spinNumber($("#spin"), oldval)
}
