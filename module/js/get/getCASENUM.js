
import { OPROOM } from "../model/const.js"
import { createEditcell, clearEditcell } from "../control/edit.js"
import { savePreviousCell } from "../control/clicktable.js"
import { spinNumber } from "../util/spinner.js"

export function getCASENUM(pointing)
{
  let  row = pointing.closest("tr")
  let  oproom = row.dataset.oproom
  let  qn = row.dataset.qn
  let  editcell = document.getElementById("editcell")
  let  html = '<input id="spin">'
  let  oldval = pointing.innerHTML

  if ( !qn || !oproom ) {
    savePreviousCell()
    clearEditcell()
    return
  }

  createEditcell(pointing)
  editcell.style.width = "40px"
  editcell.innerHTML = html
  spinNumber($("#spin"), oldval)
}
