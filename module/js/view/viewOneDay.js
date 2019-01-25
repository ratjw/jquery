
import { OPDATE, STAFFNAME, HN, PATIENT, LARGESTDATE } from "../model/const.js"
import { putThdate } from "../util/date.js"
import { rowDecoration } from "./rowDecoration.js"
import { getBOOKRowsByDate, getTableRowsByDate } from "../util/rowsgetting.js"
import { showStaffOnCall } from "./fillConsults.js"
import { filldata } from "./fill.js"
import { BOOK } from "../util/variables.js"
import { deleteAttr } from "../util/util.js"

// Used for main table ("tbl") only, no LARGESTDATE
// others would refill entire table
export function viewOneDay(opdate) {
	if (opdate === LARGESTDATE) { return }
	let table = document.getElementById('tbl'),
  	opdateth = putThdate(opdate),
		opdateBOOKrows = getBOOKRowsByDate(BOOK, opdate),
		opdateTblRows = getTableRowsByDate(opdateth),
		bookRows = opdateBOOKrows.length,
		tblRows = opdateTblRows.length,
		$cells, staff

	if (bookRows) {
		if (tblRows > bookRows) {
			while (opdateTblRows.length > bookRows) {
				table.deleteRow(opdateTblRows[0].rowIndex)
				opdateTblRows = getTableRowsByDate(opdateth)
			}
		}
		else if (tblRows < bookRows) {
			while (opdateTblRows.length < bookRows) {
				opdateTblRows[0].after(opdateTblRows[0].cloneNode(true))
				opdateTblRows = getTableRowsByDate(opdateth)
			}
		}
		opdateBOOKrows.forEach((e, i) => {
			rowDecoration(opdateTblRows[i], e.opdate)
			filldata(e, opdateTblRows[i])
			staff = opdateTblRows[i].cells[STAFFNAME].innerHTML

			// on call <p style..>staffname</p>
			if (staff && /<p[^>]*>.*<\/p>/.test(staff)) {
				opdateTblRows[i].cells[STAFFNAME].innerHTML = ""
			}
		})
	} else {
		while (opdateTblRows.length > 1) {
			table.deleteRow(opdateTblRows[0].rowIndex)
			opdateTblRows = getTableRowsByDate(opdateth)
		}

    let row = opdateTblRows[0]
    let cells = Array.from(row.children)

    cells.filter(e => e.cellIndex !== OPDATE).forEach(e => e.innerHTML = "")
		cells[HN].classList.remove("pacs")
		cells[PATIENT].classList.remove("upload")
		rowDecoration(row, opdate)
		showStaffOnCall(opdate)
    deleteAttr(row)
	}
}
