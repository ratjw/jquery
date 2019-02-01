
import { STAFFNAME } from "../model/const.js"
import { viewSplit } from "./viewSplit.js"
import { viewOneDay } from "./viewOneDay.js"
import { isConsults, isConsultsTbl } from "../util/util.js"
import { BOOK, CONSULT } from "../util/variables.js"
import { refillstaffqueue } from "./fill.js"
import { getOpdate } from "../util/date.js"
import { getBOOKrowByQN } from "../util/rowsgetting.js"
import { filldata } from "./fill.js"

export function viewSaveContentNoQN(pointed, column) {
	let tableID = pointed.closest("table").id
	let row = pointed.closest('tr')
	let opdate = row.dataset.opdate

		// see whether it's consult or normal case, to find qn of that case
	let book = (isConsultsTbl(tableID))? CONSULT : BOOK
	let qn = Math.max.apply(Math, book.map(q => q.qn))
  let bookq = getBOOKrowByQN(book, qn)
  let staffname = bookq.staffname

  filldata(row, bookq)

	if (tableID === 'tbl') {
    // Remote effect from editing on tbl to queuetbl
    viewSplit(staffname)
  } else {
		if (!isConsults()) {
      // consults are not apparent on tbl, no remote effect from editing on queuetbl
      viewOneDay(opdate)
    }
  }
}
