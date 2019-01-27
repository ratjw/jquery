
import { OPDATE, HN, PATIENT } from "../model/const.js"
import { viewOneDay } from "./viewOneDay.js"
import { viewSplit } from "./viewSplit.js"
import { getOpdate } from "../util/date.js"
import { isConsults } from "../util/util.js"
import { showStaffOnCall } from "./fillConsults.js"
import { blankRowData } from "../model/rowdata.js"

export function viewDeleteCase(tableID, row) {
	let opdate = row.opdate
  let table = document.getElementById(tableID)

	if (tableID === "tbl") {
    viewOneDay(opdate)
    viewSplit(row.staffname)
  } else if (isConsults()) {
    delRow(row, opdate)
  } else {
    table.deleteRow(row.rowIndex)
  }
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
    let cells = Array.from(row.children)

    cells.filter(e => e !== row.firstElementChild).forEach(e => e.innerHTML = "")
		row.cells[HN].classList.remove("pacs")
		row.cells[PATIENT].classList.remove("upload")
		showStaffOnCall(opdate)
    blankRowData(row, opdate)
	}
}
