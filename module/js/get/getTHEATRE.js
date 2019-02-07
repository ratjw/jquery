
import { THEATRE } from "../model/const.js"
import { createEditcell, clearEditcell } from "../control/edit.js"

export function getTHEATRE(evt, pointing)
{
  let $maintbl = $("#maintbl")
 
  if ($maintbl.find("th")[THEATRE].offsetWidth < 10) {
    $maintbl.addClass("showColumn2")
    createEditcell(pointing)
  } else if (pointing.nodeName) {
    $maintbl.removeClass("showColumn2")
    clearEditcell()
  } else {
    createEditcell(pointing)
  }
}
