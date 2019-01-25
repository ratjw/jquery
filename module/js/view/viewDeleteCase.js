
import { OPDATE, HN, PATIENT } from "../model/const.js"
import { viewOneDay } from "./viewOneDay.js"
import { viewSplit } from "./viewSplit.js"
import { getOpdate } from "../util/date.js"
import { isConsults, deleteAttr } from "../util/util.js"
import { showStaffOnCall } from "./fillConsults.js"

export function viewDeleteCase(tableID, row) {
	let opdate = row.opdate
  let table = document.getElementById(tableID)

  viewOneDay(opdate)
	tableID === "tbl"
	? viewSplit(row.staffname)
	: isConsults()
	? delRow(row, opdate)
	: table.deleteRow(row.rowIndex)
}

let delRow = function (row, opdate) {
	let prevDate = row.previousElementSibling.opdate,
		nextDate = row.nextElementSibling.opdate,
    table = row.closest('table'),
    index = row.rowIndex,
    lastrow = table.rows.length === (index + 1)

	if (prevDate === opdate || nextDate === opdate || lastrow) {
			table.deleteRow()
	} else {
    let row = opdateTblRows[0]
    let cells = Array.from(row.children)

    cells.filter(e => e.cellIndex !== OPDATE).forEach(e => e.innerHTML = "")
		row.cells[HN].classList.remove("pacs")
		row.cells[PATIENT].classList.remove("upload")
		showStaffOnCall(opdate)
    deleteAttr(row)
	}
}
