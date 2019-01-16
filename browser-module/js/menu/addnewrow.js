
import { UndoManager } from "../model/UndoManager.js"
import { OPDATE, HN, PATIENT } from "../model/const.js"
import { clearSelection } from "../control/clearSelection.js"
import { createEditcell } from "../control/edit.js"

export function addnewrow() {
	let	$selected = $(".selected"),
		tableID = $selected.closest('table').attr('id'),
		$row = $selected.closest('tr')

	addrow($row)

/*	UndoManager.add({
		undo: function() {
			$row.next().remove()
		},
		redo: function() {
			addrow($row)
		}
	})*/
}

// "tbl" copy title, Date, Room Time
// "queuetbl" copy title, Date, Room Time, Staff
export function addrow($row) {
	let $clone = $row.clone()

	$clone.removeClass("selected")
		.insertAfter($row)
			.find("td").eq(HN).removeClass("pacs")
			.parent().find("td").eq(PATIENT).removeClass("upload")
			.parent().find("td").eq(OPDATE)
				.nextAll()
					.html("")
	clearSelection()
	createEditcell($clone.find("td")[HN])
}
