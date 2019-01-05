import {
	OPDATE, OPROOM, CASENUM, STAFFNAME, HN, PATIENT, DIAGNOSIS,
	TREATMENT, CONTACT, QN, LARGESTDATE
} from "../model/const.js"
import {
	POINTER, OLDCONTENT, createEditcell, renewEditcell
} from "../control/edit.js"
import { getOpdate, putNameAge } from "../util/date.js"
import {
	getBOOKrowByQN, getTableRowByQN, getTableRowsByDate
} from "../util/getrows.js"
import { BOOK, CONSULT, isPACS } from "../util/variables.js"
import { isConsults, isConsultsTbl, isSplit, isStaffname } from "../util/util.js"
import { fillConsults, showStaffOnCall } from "./fillConsults.js"
import { refillall, refillstaffqueue } from "./fill.js"

// Used for main table ("tbl") only, no LARGESTDATE
// others would refill entire table
function refillOneDay(opdate) {
	if (opdate === LARGESTDATE) { return }
	let	opdateth = putThdate(opdate),
		opdateBOOKrows = getBOOKrowsByDate(BOOK, opdate),
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

function getBOOKrowsByDate(book, opdate)
{
	return book.filter(function(q) {
		return (q.opdate === opdate);
	})
}

export function viewSaveTheatre(opdate, staffname)
{
	refillOneDay(opdate)
	if (isSplit() && (isStaffname(staffname) || isConsults())) {
		refillstaffqueue()
	}
	// re-render editcell for keyin cell only
	if (POINTER.cellIndex > PATIENT) {
		createEditcell(POINTER)
	}
}

export function viewSaveOpRoom(opdate, staffname) {
	refillOneDay(opdate)
	if (isSplit() && (isStaffname(staffname) || isConsults())) {
		refillstaffqueue()
	}
	// re-render editcell for keyin cell only
	if (POINTER.cellIndex > PATIENT) {
		createEditcell(POINTER)
	}
}

export function viewSaveOpTime(opdate, staffname) {
	refillOneDay(opdate)
	if (isSplit() && (isStaffname(staffname) || isConsults())) {
		refillstaffqueue()
	}
	// re-render editcell for keyin cell only
	if (POINTER.cellIndex > PATIENT) {
		createEditcell(POINTER)
	}
}

export function viewSaveCaseNum(opdate, staffname) {
	refillOneDay(opdate)
	if (isSplit() && (isStaffname(staffname) || isConsults())) {
		refillstaffqueue()
	}
	// re-render editcell for keyin cell only
	if (POINTER.cellIndex > PATIENT) {
		createEditcell(POINTER)
	}
}

export function viewSaveContentQN(pointed, OLDCONTENT) {
	let	cellindex = pointed.cellIndex,
		tableID = $(pointed).closest("table").attr("id"),
		$cells = $(pointed).closest('tr').children("td"),
		opdate = getOpdate($cells[OPDATE].innerHTML),
		staffname = $cells[STAFFNAME].innerHTML,
		qn = $cells[QN].innerHTML,
		titlename = $('#titlename').html()

	let onMaintable = function () {

		// Remote effect from editing on tbl to queuetbl
		// Staffqueue is showing
		if (isSplit()) {

			// this staffname is changed to another staff or to this staffname
			if ((OLDCONTENT === titlename) || (pointed.innerHTML === titlename)) {
					refillstaffqueue()
			} else {
				// input is not staffname, but on this titlename row
				if (titlename === staffname) {
					refillAnotherTableCell('queuetbl', cellindex, qn)
				}
			}
		}
	}
	let onStafftable = function () {

		// staffname is changed to other staff => re-render
		if ((column === "staffname") && !isConsultsTbl()) {
			refillstaffqueue()
		}

		// consults are not apparent on tbl, no remote effect from editing on queuetbl
		// Remote effect from editing on queuetbl to tbl
		// view corresponding row
		if (!isConsultsTbl()) {
			refillAnotherTableCell('tbl', cellindex, qn)
		}
	}

	if ((column === "oproom") || (column === "casenum")) {
		refillOneDay(opdate)
		refillstaffqueue()
	}

	tableID === 'tbl' ? onMaintable() : onStafftable()

	// re-render editcell for keyin cell only
	if (POINTER.cellIndex > PATIENT) {
		createEditcell(POINTER)
	}
}

export function viewSaveContentNoQN(pointed, column) {
	let	cellindex = pointed.cellIndex,
		tableID = $(pointed).closest("table").attr("id"),
		$row = $(pointed).closest('tr'),
		$cells = $row.children("td"),
		opdateth = $cells[OPDATE].innerHTML,
		opdate = getOpdate(opdateth),
		staffname = $cells[STAFFNAME].innerHTML,
		qn = $cells[QN].innerHTML,
		titlename = $('#titlename').html(),

		// find qn of new case input in that row, either tbl or queuetbl
		// fill qn in the blank QN
		book = (isConsultsTbl(tableID))? CONSULT : BOOK
		qn = Math.max.apply(Math, $.map(q => q.qn ))

	$cells.eq(QN).html(qn)

	tableID === 'tbl' ? onMaintableNoQN() : onStafftableNoQN()

	function onMaintableNoQN() {
		// delete staffoncall
		if (/(<([^>]+)>)/i.test(staffname)) { $cells[STAFFNAME].innerHTML = "" }

		// Remote effect from editing on tbl to queuetbl
		// Staffqueue is showing, re-render to have new case of this staffname
		isSplit() && (pointed.innerHTML === titlename) && refillstaffqueue()
	}

	function onStafftableNoQN() {

		// staffname is changed to other staff => re-render to drop the case
		(column === "staffname") && !isConsultsTbl() && refillstaffqueue()

		// consults are not apparent on tbl, no remote effect from editing on queuetbl
		// Remote effect from editing on queuetbl to tbl
		// view the entire day, not just refillAnotherTableCell
		!isConsultsTbl() && refillOneDay(opdate)
	}
}

export function viewMoveCaseHN(tableID, qn, $cells, opdate)
{
	fillCellsHN(tableID, qn, $cells)

	if (tableID === 'tbl') {
		refillOneDay(opdate)
		refillstaffqueue()
	} else {
		refillall()
		fillConsults()
		refillstaffqueue()
	}
}

export function viewCopyCaseHN(tableID, qn, $cells)
{
	fillCellsHN(tableID, qn, $cells)

	if (tableID === 'tbl') {
		refillstaffqueue()
	} else {
		refillall()
		fillConsults()
	}
}

function fillCellsHN(tableID, qn, $cells)
{
	let	book = (isConsultsTbl(tableID)) ? CONSULT : BOOK

	// New case input
	if (!qn) {
		qn = getMaxQN(book)
		$cells[QN].innerHTML = qn
	}

	let bookq = getBOOKrowByQN(book, qn)

	if (isPACS) { $cells[HN].className = "pacs" }
	$cells[PATIENT].className = "upload"
	$cells[STAFFNAME].innerHTML = bookq.staffname
	$cells[HN].innerHTML = bookq.hn
	$cells[PATIENT].innerHTML = putNameAge(bookq)
	$cells[DIAGNOSIS].innerHTML = bookq.diagnosis
	$cells[TREATMENT].innerHTML = bookq.treatment
	$cells[CONTACT].innerHTML = bookq.contact
}

function getMaxQN(book)
{
	var qn = Math.max.apply(Math, $.map(book, function(row, i) {
			return row.qn
		}))
	return String(qn)
}

export function viewGetNameHN(pointed) {
	let tableID = $(pointed).closest("table").attr("id"),
		$row = $(pointed).closest('tr'),
		$cells = $row.children("td"),
		cellindex = pointed.cellIndex,
		staffname = $cells[STAFFNAME].innerHTML,
		qn = $cells[QN].innerHTML,
		noqn = !qn,
		book = (isConsultsTbl(tableID)) ? CONSULT : BOOK

	// New case input
	if (noqn) {
		qn = getMaxQN(book)
		$cells[QN].innerHTML = qn
	}

	let bookq = getBOOKrowByQN(book, qn)

	if (isPACS) { $cells[HN].className = "pacs" }
	$cells[PATIENT].className = "upload"
	$cells[STAFFNAME].innerHTML = bookq.staffname
	$cells[HN].innerHTML = bookq.hn
	$cells[PATIENT].innerHTML = putNameAge(bookq)
	$cells[DIAGNOSIS].innerHTML = bookq.diagnosis
	$cells[TREATMENT].innerHTML = bookq.treatment
	$cells[CONTACT].innerHTML = bookq.contact

	// Both cases remote effect -> refill corresponding cell
	// no need to refillall main table because new case row was already there
	// Consults cases are not shown in main table
	if (tableID === 'tbl') {
		if (isSplit() && isStaffname(staffname)) {
			refillAnotherTableCell('queuetbl', cellindex, qn)
		}
	} else {
		if (!isConsults()) {
			if (noqn) {
				refillall()
				fillConsults()
			} else {
				refillAnotherTableCell('tbl', cellindex, qn)
			}
		}
	}
	// re-render editcell for keyin cell only
	if (POINTER.cellIndex > PATIENT) {
		createEditcell(POINTER)
	}
}

// view corresponding cell in another table
let refillAnotherTableCell = function (tableID, cellindex, qn) {
	let q = getBOOKrowByQN(BOOK, qn),
		row = getTableRowByQN(tableID, qn),
		cells = row.cells,
		viewcell = {
			OPROOM: q.oproom || "",
			CASENUM: q.casenum || "",
			STAFFNAME: q.staffname,
			HN: q.hn,
			PATIENT: putNameAge(q),
			DIAGNOSIS: q.diagnosis,
			TREATMENT: q.treatment,
			CONTACT: q.contact,
		}

	if (!q || !row) { return }
	if (cellindex === HN) {
		cells[HN].innerHTML = viewcell[HN]
		cells[PATIENT].innerHTML = viewcell[PATIENT]
	} else {
		cells[cellindex].innerHTML = viewcell[cellindex]
	}
}

export function viewSortable(argView) {
	let receiver = argView.receiver,
		moveOpdate = argView.moveOpdate,
		thisOpdate = argView.thisOpdate,

	dropOnTbl = function () {
		refillOneDay(moveOpdate)
		refillOneDay(thisOpdate)
		isSplit() && refillstaffqueue()
		// While splitting, dragging inside tbl of this staff's case
	},
	dropOnStaff = function () {
		refillstaffqueue()
		refillOneDay(moveOpdate)
		refillOneDay(thisOpdate)
	}

	receiver === "tbl" ? dropOnTbl() : dropOnStaff()

	// attach hover to changed DOM elements
	hoverMain()
}

export function viewGetUpdate(response)
{
	refillall()
	fillConsults()
	if (isSplit()) { refillstaffqueue() }
	renewEditcell()
}

export function viewGetUpdateWithService(response)
{
	refillService()
	refillall()
	fillConsults()
	if (isSplit()) { refillstaffqueue() }
	renewEditcell()
}

export function viewOnIdling()
{
	refillstaffqueue()
	refillall()
	fillConsults()
}

export function viewPostponeCase(opdate, thisdate, staffname, qn)
{
	if (opdate !== LARGESTDATE) { refillOneDay(opdate) }
	if (thisdate !== LARGESTDATE) { refillOneDay(thisdate) }

	// moveCase of this staffname's case, re-render
	isSplit() && isStaffname(staffname) && refillstaffqueue()

	scrolltoThisCase(qn)
}

export function viewmoveCase(movedate, thisdate, staffname, qn)
{
	refillOneDay(movedate)

	if (movedate !== thisdate) {
		refillOneDay(thisdate)
	}
	if (isSplit()) {
		let titlename = $('#titlename').html()
		if ((titlename === staffname) || (titlename === "Consults")) {
			// moveCase of this staffname's case
			refillstaffqueue()
		}
	} 

	// moveCase of this staffname's case, re-render
	isSplit() && isStaffname(staffname) && refillstaffqueue()

	scrolltoThisCase(qn)
}

export function viewDeleteCase(tableID, $row, opdate, staffname) {
	refillOneDay(opdate)
	tableID === "tbl"
	? isSplit() && isStaffname(staffname) && refillstaffqueue()
	: isConsults()
	? deleteRow($row, opdate)
	: $row.remove()
}

export function viewUndelete(opdate, staffname, qn) {
	refillOneDay(opdate)
	if (isSplit() && (isStaffname(staffname) || isConsults())) {
		refillstaffqueue()
	}
	scrolltoThisCase(qn)
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
