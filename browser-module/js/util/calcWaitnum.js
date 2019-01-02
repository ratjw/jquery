
import { OPDATE } from "../model/const.js"
import { isConsultsTbl } from "./util.js"

// waitnum is for ordering where there is no oproom, casenum
// nextWaitNum is undefined in case of new blank row
//Consults cases have negative waitnum
export function calcWaitnum(thisOpdate, $prevrow, $nextrow)
{
  let prevWaitNum = Number($prevrow.prop("title")),
    nextWaitNum = Number($nextrow.prop("title")),

    $prevRowCell = $prevrow.children("td"),
    $nextRowCell = $nextrow.children("td"),
    prevOpdate = $prevRowCell.eq(OPDATE).html(),
    nextOpdate = $nextRowCell.eq(OPDATE).html(),
    tableID = $prevrow.closest("table").attr("id"),
    defaultWaitnum = (isConsultsTbl(tableID))? -1 : 1

	return (prevOpdate !== thisOpdate && thisOpdate !== nextOpdate)
			? defaultWaitnum
			: (prevOpdate === thisOpdate && thisOpdate !== nextOpdate)
			? prevWaitNum + defaultWaitnum
			: (prevOpdate !== thisOpdate && thisOpdate === nextOpdate)
			? nextWaitNum ? nextWaitNum / 2 : defaultWaitnum
			: nextWaitNum
			? ((prevWaitNum + nextWaitNum) / 2)
			: (prevWaitNum + defaultWaitnum)
}
