
import { STAFFNAME, HN, PATIENT, DIAGNOSIS, TREATMENT, CONTACT, QN } from "../model/const.js"
import { refillstaffqueue } from "./fill.js"
import { isConsultsTbl, getMaxQN } from "../util/util.js"
import { refillall } from "./fill.js"
import { fillConsults } from "./fillConsults.js"
import { BOOK, CONSULT, isPACS } from "../util/variables.js"
import { getBOOKrowByQN } from "../util/rowsgetting.js"
import { putNameAge } from "../util/date.js"
import { viewOneDay } from "./viewOneDay.js"
import { setRowData } from "../model/rowdata.js"

export function viewMoveCaseHN(tableID, qn, row, opdate)
{
	fillCellsHN(tableID, qn, row)

	if (tableID === 'tbl') {
		viewOneDay(opdate)
		refillstaffqueue()
	} else {
		refillall()
		fillConsults()
	}
}

export function viewCopyCaseHN(tableID, qn, row)
{
	fillCellsHN(tableID, qn, row)

	if (tableID === 'tbl') {
		refillstaffqueue()
	} else {
		refillall()
		fillConsults()
	}
}

function fillCellsHN(tableID, qn, row)
{
	let	book = (isConsultsTbl(tableID)) ? CONSULT : BOOK
  let cells = row.cells

	// New case input
	if (!qn) {
		qn = getMaxQN(book)
		cells[QN].innerHTML = qn
	}

	let bookq = getBOOKrowByQN(book, qn)

  setRowData(row, bookq)

	if (isPACS) { cells[HN].className = "pacs" }
	cells[PATIENT].className = "upload"
	cells[STAFFNAME].innerHTML = bookq.staffname
	cells[HN].innerHTML = bookq.hn
	cells[PATIENT].innerHTML = putNameAge(bookq)
	cells[DIAGNOSIS].innerHTML = bookq.diagnosis
	cells[TREATMENT].innerHTML = bookq.treatment
	cells[CONTACT].innerHTML = bookq.contact
}
