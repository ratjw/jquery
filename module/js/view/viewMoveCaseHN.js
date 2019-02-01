
import { refillstaffqueue } from "./fill.js"
import { isConsultsTbl, getMaxQN } from "../util/util.js"
import { refillall } from "./fill.js"
import { fillConsults } from "./fillConsults.js"
import { BOOK, CONSULT, isPACS } from "../util/variables.js"
import { getBOOKrowByQN } from "../util/rowsgetting.js"
import { putNameAge } from "../util/date.js"
import { viewOneDay } from "./viewOneDay.js"
import { setGetNameHNRowData } from "../model/rowdata.js"
import { filldata } from "./fill.js"

export function viewMoveCaseHN(tableID, qn, row, opdate)
{
	let	book = (isConsultsTbl(tableID)) ? CONSULT : BOOK
	let bookq = getBOOKrowByQN(book, qn)

  filldata(row, bookq)

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
	let	book = (isConsultsTbl(tableID)) ? CONSULT : BOOK

	// New case input
	if (!qn) {
		qn = getMaxQN(book)
		row.dataset.qn = qn
	}

	let bookq = getBOOKrowByQN(book, qn)

  filldata(row, bookq)

	if (tableID === 'tbl') {
		refillstaffqueue()
	} else {
		refillall()
		fillConsults()
	}
}
