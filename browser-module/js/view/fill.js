import {
	OPDATE, THEATRE, OPROOM, OPTIME, CASENUM, STAFFNAME, HN, PATIENT, DIAGNOSIS,
	TREATMENT, EQUIPMENT, CONTACT, QN, LARGESTDATE
} from "../model/const.js"
import {
	POINTER, OLDCONTENT, createEditcell, clearEditcell, renewEditcell
} from "../control/edit.js"
import {
	START, ISOdate, nextdays, numDate, thDate, getOpdate, putThdate, putNameAge
} from "../util/date.js"
import {
	getBOOKrowByQN, getTableRowByQN, getBOOKrowsByDate, getTableRowsByDate
} from "../util/getrows.js"
import { BOOK, CONSULT, ONCALL, STAFF, isPACS } from "../util/variables.js"
import {
	isConsults, isConsultsTbl, isSplit, isStaffname, getClass, inPicArea
} from "../util/util.js"
import { rowDecoration } from "./rowDecoration.js"
import { viewEquip } from "./viewEquip.js"
import { fillConsults, showStaffOnCall } from "./fillConsults.js"

// Render Main table
// Consults and dialogAll tables use this too
// START date imported from util.js
// until date is the last row of the table, not of the book
export function fillall(book, table, start, until, num=0) {
	let tbody = table.getElementsByTagName("tbody")[0],
		rows = table.rows,
		head = table.rows[0],
		date = start,
		madedate,
		q = findStartRowInBOOK(book, start),
		k = findStartRowInBOOK(book, LARGESTDATE)

	// Get rid of LARGESTDATE cases
	// Consult cases have no LARGESTDATE, findStartRowInBOOK returns k = -1
	if (k >= 0) {
		book = book.slice(0, k)
	}

	// i for rows in table (with head as the first row)
	let i = num,
		booklength = book.length
	for (q; q < booklength; q++)
	{	
		// step over each day that is not in QBOOK
		while (date < book[q].opdate)
		{
			if (date !== madedate)
			{
				// make a blank row for each day which is not in book
				makenextrow(table, date)	// insertRow
				i++
				
				madedate = date
			}
			date = nextdays(date, 1)
			if (date > until) {
				return
			}

			// make table head row before every Monday
			if ((new Date(date).getDay())%7 === 1)
			{
				let clone = head.cloneNode(true)
				tbody.appendChild(clone)
				i++
			}
		}
		makenextrow(table, date)
		i++
		filldata(book[q], rows[i])
		madedate = date
	}

	while (date < until)
	{
		date = nextdays(date, 1)

		// make table head row before every Monday
		if (((new Date(date)).getDay())%7 === 1)
		{
			let clone = head.cloneNode(true)
			tbody.appendChild(clone)
		}
		// make a blank row
		makenextrow(table, date)	// insertRow
	}
	hoverMain()
}

// Used after serviceReview and in idling update
// Similar to fillall but try to use existing DOM table
export function refillall() {
	let	table = document.getElementById("tbl"),
		$tbody = $("#tbl tbody"),
		start = numDate($('#tbl tr:has("td")').first().find('td').eq(OPDATE).html()),
		until = numDate($('#tbl tr:has("td")').last().find('td').eq(OPDATE).html())

	$tbody.html($tbody.find("tr:first").clone())
	fillall(BOOK, table, start, until)
	hoverMain()
	// For new row added to this table
}

// Find first row in the book that have same or later date than start date
let findStartRowInBOOK = function (book, opdate) {
	let q = 0
	while ((q < book.length) && (book[q].opdate < opdate)) {
		q++
	}
	return (q < book.length) ? q : -1
}

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

// in main table (#tbl) only
let createThisdateTableRow = function (opdate, opdateth)
{
	if (opdate === LARGESTDATE) { return null }
	var rows = getTableRowsByDate(thDate(nextdays(opdate, -1))),
		$row = $(rows[rows.length-1]),
		$thisrow = $row && $row.clone().insertAfter($row)

	$thisrow && $thisrow.find("td").eq(OPDATE).html(opdateth)

	return $thisrow
}

// create and decorate new row
let makenextrow = function (table, date) {
	let tbody = table.getElementsByTagName("tbody")[0],
		tblcells = document.getElementById("tblcells"),
		row = tblcells.rows[0].cloneNode(true)

	row = tbody.appendChild(row)
	rowDecoration(row, date)
}

// Delete data in an existing row
let fillblank = function (row) {
	let cells = row.cells

	row.title = ""
	cells[HN].className = ""
	cells[PATIENT].className = ""

	cells[THEATRE].innerHTML = ""
	cells[OPROOM].innerHTML = ""
	cells[OPTIME].innerHTML = ""
	cells[CASENUM].innerHTML = ""
	cells[STAFFNAME].innerHTML = ""
	cells[HN].innerHTML = ""
	cells[PATIENT].innerHTML = ""
	cells[DIAGNOSIS].innerHTML = ""
	cells[TREATMENT].innerHTML = ""
	cells[EQUIPMENT].innerHTML = ""
	cells[CONTACT].innerHTML = ""
	cells[QN].innerHTML = ""
}

function filldata(bookq, row)
{
	let cells = row.cells

	row.title = bookq.waitnum
	if (bookq.hn && isPACS) { cells[HN].className = "pacs" }
	if (bookq.patient) { cells[PATIENT].className = "upload" }

	cells[THEATRE].innerHTML = bookq.theatre
	cells[OPROOM].innerHTML = bookq.oproom || ""
	cells[OPTIME].innerHTML = bookq.optime
	cells[CASENUM].innerHTML = bookq.casenum || ""
	cells[STAFFNAME].innerHTML = bookq.staffname
	cells[HN].innerHTML = bookq.hn
	cells[PATIENT].innerHTML = putNameAge(bookq)
	cells[DIAGNOSIS].innerHTML = bookq.diagnosis
	cells[TREATMENT].innerHTML = bookq.treatment
	cells[EQUIPMENT].innerHTML = viewEquip(bookq.equipment)
	cells[CONTACT].innerHTML = bookq.contact
	cells[QN].innerHTML = bookq.qn
}

export function staffqueue(staffname) {
	let todate = ISOdate(new Date()),
		consult = CONSULT,
		$queuetbl = $('#queuetbl'),
		queuetbl = $queuetbl[0]

	// delete previous queuetbl lest it accumulates
	$queuetbl.find('tr').slice(1).remove()

	let staffConsults = function () {

		// No case from server
		!consult.length && consult.push({"opdate" : START})

		// render as main table, not as staff table
		fillall(consult, queuetbl, START, todate)
	}
	let staffCases = function () {
		$.each( BOOK, function() {
			this.staffname === staffname && this.opdate >= todate &&
				$('#tblcells tr').clone()
					.appendTo($queuetbl)
						.filldataQueue(this)
		});
	}

	// Not yet split window
	!isSplit() && splitPane()
	$('#titlename').html(staffname)

	staffname === "Consults" ? staffConsults() : staffCases()

	clearEditcell()
	hoverMain()
}

// Use existing DOM table
export function refillstaffqueue() {
	let todate = ISOdate(new Date()),
		staffname = $('#titlename').html(),
		book = BOOK
	let staffConsults = function () {
		let table = document.getElementById("queuetbl")

		// Consults table is rendered same as fillall
		$('#queuetbl tr').slice(1).remove()
		!book.length && book.push({"opdate" : START})

		fillall(book, table, START, todate)
	}
	let staffCases = function () {
		let i = 0
		$.each( book, function(q, each) {
			if ((this.opdate >= todate) && (this.staffname === staffname)) {
				i++
				i >= $('#queuetbl tr').length
				? $('#tblcells tr').clone()
						.appendTo($('#queuetbl'))
							.filldataQueue(this)
				: $('#queuetbl tr').eq(i).filldataQueue(this)
			}
		});
		i < ($('#queuetbl tr').length - 1) && $('#queuetbl tr').slice(i+1).remove()
	}

	isConsultsTbl() ? staffConsults() : staffCases()
}

jQuery.fn.extend({
	filldataQueue : function(q) {
		let cells = this[0].cells
		
		this[0].title = q.waitnum
		addColor(this, q.opdate)
		q.hn && isPACS && (cells[HN].className = "pacs")
		q.patient && (cells[PATIENT].className = "upload")

		cells[OPDATE].innerHTML = putThdate(q.opdate)
		cells[OPROOM].innerHTML = q.oproom || ""
		cells[CASENUM].innerHTML = q.casenum || ""
		cells[STAFFNAME].innerHTML = q.staffname
		cells[HN].innerHTML = q.hn
		cells[PATIENT].innerHTML = putNameAge(q)
		cells[DIAGNOSIS].innerHTML = q.diagnosis
		cells[TREATMENT].innerHTML = q.treatment
		cells[EQUIPMENT].innerHTML = viewEquip(q.equipment)
		cells[CONTACT].innerHTML = q.contact
		cells[QN].innerHTML = q.qn
	}
})

// Same date cases have same color
// In LARGESTDATE, prevdate = "" but q.opdate = LARGESTDATE
// So LARGESTDATE cases are !samePrevDate, thus has alternate colors
// clear the color of NAMEOFDAYFULL row that is moved to non-color opdate
function addColor($this, bookqOpdate) 
{
	let prevdate = numDate($this.prev().children("td").eq(OPDATE).html()),
		prevIsOdd = /odd/.test($this.prev().prop("class")),
		samePrevDate = bookqOpdate === prevdate

	if ((!samePrevDate && !prevIsOdd) || (samePrevDate && prevIsOdd)) {
		$this.addClass("odd")
	} else {
		$this.removeClass("odd")
	}
}

// hover on background pics
function hoverMain()
{
	let	paleClasses = ["pacs", "upload"],
		boldClasses = ["pacs2", "upload2"]

	$("td.pacs, td.upload").mousemove(function(event) {
		if (inPicArea(event, this)) {
			getClass(this, paleClasses, boldClasses)
		} else {
			getClass(this, boldClasses, paleClasses)
		}
	})
	.mouseout(function (event) {
		getClass(this, boldClasses, paleClasses)
	})
}

let splitPane = function () {
	let scrolledTop = document.getElementById("tblcontainer").scrollTop,
		tohead = findVisibleHead('#tbl'),
		menuHeight = $("#cssmenu").height(),
		titleHeight = $("#titlebar").height()

	$("#tblwrapper").css({
		"height": "100%" - menuHeight,
		"width": "50%"
	})
	$("#queuewrapper").show().css({
		"height": "100%" - menuHeight,
		"width": "50%"
	})
	$("#queuecontainer").css({
		"height": $("#tblcontainer").height() - titleHeight
	})

	initResize($("#tblwrapper"))
	$('.ui-resizable-e').css('height', $("#tbl").css("height"))
}

let initResize = function ($wrapper) {
	$wrapper.resizable(
	{
		autoHide: true,
		handles: 'e',
		resize: function(e, ui) 
		{
			let parent = ui.element.parent();
			let remainSpace = parent.width() - ui.element.outerWidth()
			let divTwo = ui.element.next()
			let margin = divTwo.outerWidth() - divTwo.innerWidth()
			let divTwoWidth = (remainSpace-margin)/parent.width()*100+"%";
			divTwo.css("width", divTwoWidth);
		},
		stop: function(e, ui) 
		{
			let parent = ui.element.parent();
			let remainSpace = parent.width() - ui.element.outerWidth()
			let divTwo = ui.element.next()
			let margin = divTwo.outerWidth() - divTwo.innerWidth()
			ui.element.css(
			{
				width: ui.element.outerWidth()/parent.width()*100+"%",
			});
			ui.element.next().css(
			{
				width: (remainSpace-margin)/parent.width()*100+"%",
			});
		}
	});
}

function closequeue() {
	let scrolledTop = document.getElementById("tblcontainer").scrollTop,
		tohead = findVisibleHead('#tbl')
	
	$("#queuewrapper").hide()
	$("#tblwrapper").css({
		"height": "100%" - $("#cssmenu").height(),
		"width": "100%"
	})
}

// Find first row on screen to be the target position
let findVisibleHead = function (table) {
	let tohead

	$.each($(table + ' tr'), function(i, tr) {
		tohead = tr
		return ($(tohead).offset().top < 0)
	})
	return tohead
}

export function setClickStaff()
{
	document.querySelectorAll(".clickStaff").forEach(function(item) {
		item.onclick = function() {
			let staffname = item.className.split(" ")[1]
			staffqueue(staffname)
		}
	})

	document.getElementById("clickclosequeue").onclick = closequeue
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
