
import { viewSplit } from "./viewSplit.js"
import { LARGESTDATE } from "../model/const.js"
import { viewOneDay } from "./viewOneDay.js"
import { scrolltoThisCase } from "./scrolltoThisCase.js"
import { getBOOKrowByQN } from "../util/rowsgetting.js"
import { BOOK } from "../util/variables.js"
import { filldata } from "./fill.js"

export function viewPostponeCase(row, thisdate)
{
  let opdate = row.dataset.opdate,
    staffname = row.dataset.staffname,
    qn = row.dataset.qn,
    bookq = getBOOKrowByQN(BOOK, qn)

  filldata(row, bookq)

	if (opdate !== LARGESTDATE) { viewOneDay(opdate) }
	if (thisdate !== LARGESTDATE) { viewOneDay(thisdate) }

	// moveCase of this staffname's case, re-render
	viewSplit(staffname)

	scrolltoThisCase(qn)
}
