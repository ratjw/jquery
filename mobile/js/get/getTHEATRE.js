
import { THEATRE } from "../model/const.js"
import { createEditcell, clearEditcell } from "../control/edit.js"

export function getTHEATRE(evt, pointing)
{
	let $tbl = $("#tbl")
 
	if ($tbl.find("th")[THEATRE].offsetWidth < 10) {
      $tbl.addClass("showColumn2")
      createEditcell(pointing)
    }
    else if (evt.ctrlKey) {
      $tbl.removeClass("showColumn2")
	  clearEditcell()
    } else {
	  createEditcell(pointing)
	}
}
