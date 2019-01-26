
import { POINTER, clearEditcell } from "../control/edit.js"
import { savePreviousCellService } from "./savePreviousCellService.js"
import { editPresentCellService } from "./editPresentCellService.js"

export function clickCellSV(evt, target)
{
  let inCell = target.closest("td"),
	onNormalCell = (target.nodeName === "TD" && target.colSpan === 1)

  if (POINTER) {
	if (inCell !== POINTER) {
	  savePreviousCellService()
	  if (onNormalCell) {
		editPresentCellService(evt, inCell)
	  } else {
		clearEditcell()
	  }
	}
  } else {
	if (onNormalCell) {
	  editPresentCellService(evt, inCell)
	}
  }
}
