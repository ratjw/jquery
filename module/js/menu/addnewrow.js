
import { UndoManager } from "../model/UndoManager.js"
import { HN, PATIENT } from "../model/const.js"
import { clearSelection } from "../control/clearSelection.js"
import { createEditcell } from "../control/edit.js"
import { blankRowData } from "../model/rowdata.js"

export function addnewrow() {
	let	selected = document.querySelector(".selected"),
		tableID = selected.closest('table').id,
		row = selected.closest('tr')

	addrow(row)

/*	UndoManager.add({
		undo: function() {
			$row.next().remove()
		},
		redo: function() {
			addrow($row)
		}
	})*/
}

export function addrow(row) {
	let clone = row.cloneNode(true)
  let cells = clone.querySelectorAll("td")

	cells[HN].classList.remove("pacs")
	cells[PATIENT].classList.remove("upload")
	Array.from(clone.querySelectorAll("td:not(:first-child)")).forEach(e => e.innerHTML = "")
  row.classList.remove("selected")
	row.after(clone)
	clearSelection()
	createEditcell(cells[HN])
  blankRowData(clone, row.opdate)
}
