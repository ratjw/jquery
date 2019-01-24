
import { OPDATE, HN, PATIENT, STAFFNAME } from "../model/const.js"
import { viewOneDay } from "./viewOneDay.js"
import { viewSplit } from "./viewSplit.js"
import { getOpdate } from "../util/date.js"
import { isConsults } from "../util/util.js"
import { showStaffOnCall } from "./fillConsults.js"

export function viewDeleteCase(tableID, $row, opdate, staffname) {
	viewOneDay(opdate)
	tableID === "tbl"
	? viewSplit(staffname)
	: isConsults()
	? deleteRow($row, opdate)
	: $row.remove()
}

// Method to remove or just blank the row, used in main and Consults tables
let deleteRow = function ($row, opdate) {
	let prevDate = $row.prev().children("td").eq(OPDATE).html(),
		nextDate = $row.next().children("td").eq(OPDATE).html()

	prevDate = getOpdate(prevDate)
	nextDate = getOpdate(nextDate)

	if (prevDate === opdate
		|| nextDate === opdate
		|| $row.closest("tr").is(":last-child")) {
			$row.remove()
	} else {
		$row.children("td").eq(OPDATE).siblings().html("")
		$row.children("td").eq(HN).removeClass("pacs")
		$row.children("td").eq(PATIENT).removeClass("upload")
		$row.children('td').eq(STAFFNAME).html(showStaffOnCall(opdate))
	}
}
