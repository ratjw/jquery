
import { OPDATE, STAFFNAME, HN, PATIENT, LARGESTDATE } from "../model/const.js"
import { putThdate } from "../util/date.js"
import { rowDecoration } from "./rowDecoration.js"
import { getBOOKRowsByDate, getTableRowsByDate } from "../util/getrows.js"
import { showStaffOnCall } from "./fillConsults.js"
import { filldata } from "./fill.js"
import { BOOK } from "../util/variables.js"

// Used for main table ("tbl") only, no LARGESTDATE
// others would refill entire table
export function viewOneDay(opdate) {
	if (opdate === LARGESTDATE) { return }
	let	opdateth = putThdate(opdate),
		opdateBOOKrows = getBOOKRowsByDate(BOOK, opdate),
		$opdateTblRows = getTableRowsByDate(opdateth),
		bookRows = opdateBOOKrows.length,
		tblRows = $opdateTblRows.length,
		$cells, staff

	if (bookRows) {
		if (tblRows > bookRows) {
			while ($opdateTblRows.length > bookRows) {
				$opdateTblRows.eq(0).remove()
				$opdateTblRows = getTableRowsByDate(opdateth)
			}
		}
		else if (tblRows < bookRows) {
			while ($opdateTblRows.length < bookRows) {
				$opdateTblRows.eq(0).clone().insertAfter($opdateTblRows.eq(0))
				$opdateTblRows = getTableRowsByDate(opdateth)
			}
		}
		$.each(opdateBOOKrows, function(key, val) {
			rowDecoration($opdateTblRows[key], this.opdate)
			filldata(this, $opdateTblRows[key])
			staff = $opdateTblRows[key].cells[STAFFNAME].innerHTML
			// on call <p style..>staffname</p>
			if (staff && /<p[^>]*>.*<\/p>/.test(staff)) {
				$opdateTblRows[key].cells[STAFFNAME].innerHTML = ""
			}
		})
	} else {
		while ($opdateTblRows.length > 1) {
			$opdateTblRows.eq(0).remove()
			$opdateTblRows = getTableRowsByDate(opdateth)
		}
		$opdateTblRows.attr("title", "")
		$cells = $opdateTblRows.eq(0).children("td")
		$cells.eq(OPDATE).siblings().html("")
		$cells.eq(STAFFNAME).html(showStaffOnCall(opdate))
		$cells.eq(HN).removeClass("pacs")
		$cells.eq(PATIENT).removeClass("upload")
		rowDecoration($opdateTblRows[0], opdate)
	}
}
