
import { OPDATE, STAFFNAME, PATIENT, QN, LARGESTDATE } from "../model/const.js"
import { getOpdate } from "../util/date.js"

// disabled some menu-items for the current row
// Menu for the current row -> addrow, postpone, moveCase, equip, history of editing, del
// Menu for all cases -> staffqueue, service, all deleted, search, readme
export function oneRowMenu()
{
	let	$selected = $(".selected"),
		tableID = $selected.closest('table').attr('id'),
		$row = $selected.closest('tr'),
		prevDate = $row.prev().find("td").eq(OPDATE).html() || "",
		$cell = $row.find("td"),
		opdateth = $cell.eq(OPDATE).html(),
		opdate = getOpdate(opdateth),
		staffname = $cell.eq(STAFFNAME).html(),
		patient = $cell.eq(PATIENT).html(),
		qn = $cell.eq(QN).html(),
		notLARGE = (opdate !== LARGESTDATE)

	enable(qn, "#addrow")

	let postpone = qn && staffname && notLARGE
	if (postpone) {
		$("#postponecase").html("<b>Confirm เลื่อน ไม่กำหนดวัน  </b><br>" + patient)
	}
	enable(postpone, "#postpone")

	enable(qn, "#moveCase")

	enable(qn, "#history")

	let Delete = qn || prevDate === opdateth
	if (Delete) {
		$("#delcase").html("<b>Confirm Delete </b><br>" + patient)
	}
	enable(Delete, "#delete")

	enable(true, "#EXCEL")

	enable(true, "#LINE")
}

function enable(able, id)
{
	if (able) {
		$(id).removeClass("disabled")
	} else {
		$(id).addClass("disabled")
	}
}
