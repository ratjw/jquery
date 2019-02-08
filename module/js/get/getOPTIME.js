
import { createEditcell } from "../control/edit.js"
import { spinTime } from "../util/spinner.js"

export function getOPTIME(pointing)
{
  let  editcell = document.getElementById("editcell")
  let  html = '<input id="spin">'
  let  oldtime = pointing.innerHTML || "09.00"
  let  newtime = ""


  // no case
  if (!pointing.parentElement.dataset.qn) { return }

  createEditcell(pointing)
  editcell.style.width = "65px"
  editcell.innerHTML = html
  spinTime($("#spin"), oldtime)
}
