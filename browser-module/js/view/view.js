import {
	OPDATE, THEATRE, OPROOM, OPTIME, CASENUM, STAFFNAME, HN, PATIENT, DIAGNOSIS,
	TREATMENT, EQUIPMENT, CONTACT, QN, LARGESTDATE, NAMEOFDAYABBR, NAMEOFDAYFULL
} from "../model/const.js"

import { clearEditcell } from "../control/edit.js"
import { reViewService } from "../model/serv.js"
import {
	getBOOK, getCONSULT, getONCALL, getSTAFF, isPACS, getBOOKrowByQN, ISOdate,
	nextdays, dayName, numDate, thDate, getOpdate, putThdate, getTableRowByQN,
	START, isConsultsTbl, getBOOKrowsByDate, getTableRowsByDate, putNameAge,
	rowDecoration, holiday, isSplit, inPicArea, getClass, isStaffname
} from "../model/util.js"
import { viewEquip } from "./viewmenu.js"

// Render Main table
// Consults and dialogAll tables use this too
// START date imported from util.js
// until date is the last row of the table, not of the book
export function viewAll(book, table, start, until, num=0) {
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
// Similar to viewAll but try to use existing DOM table
export function reViewAll() {
	let	table = document.getElementById("tbl"),
		$tbody = $("#tbl tbody"),
		start = numDate($('#tbl tr:has("td")').first().find('td').eq(OPDATE).html()),
		until = numDate($('#tbl tr:has("td")').last().find('td').eq(OPDATE).html())

	$tbody.html($tbody.find("tr:first").clone())
	viewAll(getBOOK(), table, start, until)
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
export function reViewOneDay(opdate) {
	if (opdate === LARGESTDATE) { return }
	let	opdateth = putThdate(opdate),
		opdateBOOKrows = getBOOKrowsByDate(getBOOK(), opdate),
		$opdateTblRows = getTableRowsByDate(opdateth),
		bookRows = opdateBOOKrows.length,
		tblRows = $opdateTblRows.length,
		$cells, staff

	// Occur when dragging the only row of a date to somewhere else
	if (!tblRows) {
		createThisdateTableRow(opdate, opdateth)
		$opdateTblRows = getTableRowsByDate(opdateth)
		tblRows = $opdateTblRows.length
	}

	let hasCase = function () {
		let lessCase = function () {
			while ($opdateTblRows.length > bookRows) {
				$opdateTblRows.eq(0).remove()
				$opdateTblRows = getTableRowsByDate(opdateth)
			}
		},
		moreCase = function () {
			while ($opdateTblRows.length < bookRows) {
				$opdateTblRows.eq(0).clone().insertAfter($opdateTblRows.eq(0))
				$opdateTblRows = getTableRowsByDate(opdateth)
			}
		}

		tblRows > bookRows ? lessCase() : moreCase()

		$.each(opdateBOOKrows, function(key, val) {
			rowDecoration($opdateTblRows[key], this.opdate)
			filldata(this, $opdateTblRows[key])
			staff = $opdateTblRows[key].cells[STAFFNAME].innerHTML
			// on call <p style..>staffname</p>
			if (staff && /<p[^>]*>.*<\/p>/.test(staff)) {
				$opdateTblRows[key].cells[STAFFNAME].innerHTML = ""
			}
		})
	}
	let noCase = function () {
		tblRows > 1 && $opdateTblRows.slice(1).remove()
		$opdateTblRows.attr("title", "")
		$opdateTblRows.prop("class", dayName(NAMEOFDAYFULL, opdate))
		$cells = $opdateTblRows.eq(0).children("td")
		$cells.eq(OPDATE).siblings().html("")
		$cells.eq(OPDATE).prop("class", dayName(NAMEOFDAYABBR, opdate))
		$cells.eq(STAFFNAME).html(showStaffOnCall(opdate))
		$cells.eq(HN).removeClass("pacs")
		$cells.eq(PATIENT).removeClass("upload")
		$cells.eq(DIAGNOSIS).css("backgroundImage", holiday(opdate))
	}

	bookRows ? hasCase() : noCase()
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

export function viewStaffqueue(staffname) {
	let todate = ISOdate(new Date()),
		consult = getCONSULT(),
		$queuetbl = $('#queuetbl'),
		queuetbl = $queuetbl[0]

	// delete previous queuetbl lest it accumulates
	$queuetbl.find('tr').slice(1).remove()

	let staffConsults = function () {

		// No case from server
		!consult.length && consult.push({"opdate" : START})

		// render as main table, not as staff table
		viewAll(consult, queuetbl, START, todate)
	}
	let staffCases = function () {
		$.each( getBOOK(), function() {
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
export function reViewStaffqueue() {
	let todate = ISOdate(new Date()),
		staffname = $('#titlename').html(),
		book = getBOOK()
	let staffConsults = function () {
		let table = document.getElementById("queuetbl")

		// Consults table is rendered same as viewAll
		$('#queuetbl tr').slice(1).remove()
		!book.length && book.push({"opdate" : START})

		viewAll(book, table, START, todate)
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
export function hoverMain()
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
			viewStaffqueue(staffname)
		}
	})

	document.getElementById("clickclosequeue").onclick = closequeue
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

export function viewSaveTheatre(opdate, staffname)
{
	reViewOneDay(opdate)
	if (isSplit() && (isStaffname(staffname) || isConsults())) {
		reViewStaffqueue()
	}
	// re-render editcell for keyin cell only
	let newpoint = getPointer()
	if (newpoint.cellIndex > PATIENT) {
		createEditcell(newpoint)
	}
}

export function viewSaveOpRoom(opdate, staffname) {
	reViewOneDay(opdate)
	if (isSplit() && (isStaffname(staffname) || isConsults())) {
		reViewStaffqueue()
	}
	// re-render editcell for keyin cell only
	let newpoint = getPointer()
	if (newpoint.cellIndex > PATIENT) {
		createEditcell(newpoint)
	}
}

export function viewSaveCaseNum(opdate, staffname) {
	reViewOneDay(opdate)
	if (isSplit() && (isStaffname(staffname) || isConsults())) {
		reViewStaffqueue()
	}
	// re-render editcell for keyin cell only
	let newpoint = getPointer()
	if (newpoint.cellIndex > PATIENT) {
		createEditcell(newpoint)
	}
}

export function viewSaveContentQN(pointed, oldcontent) {
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
			if ((oldcontent === titlename) || (pointed.innerHTML === titlename)) {
					reViewStaffqueue()
			} else {
				// input is not staffname, but on this titlename row
				if (titlename === staffname) {
					reViewAnotherTableCell('queuetbl', cellindex, qn)
				}
			}
		}
	}
	let onStafftable = function () {

		// staffname is changed to other staff => re-render
		if ((column === "staffname") && !isConsultsTbl()) {
			reViewStaffqueue()
		}

		// consults are not apparent on tbl, no remote effect from editing on queuetbl
		// Remote effect from editing on queuetbl to tbl
		// view corresponding row
		if (!isConsultsTbl()) {
			reViewAnotherTableCell('tbl', cellindex, qn)
		}
	}

	if ((column === "oproom") || (column === "casenum")) {
		reViewOneDay(opdate)
		reViewStaffqueue()
	}

	tableID === 'tbl' ? onMaintable() : onStafftable()

	// re-render editcell for keyin cell only
	let newpoint = getPointer()
	if (newpoint.cellIndex > PATIENT) {
		createEditcell(newpoint)
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
		book = (isConsultsTbl(tableID))? getCONSULT() : getBOOK()
		qn = Math.max.apply(Math, $.map(q => q.qn ))

	$cells.eq(QN).html(qn)

	tableID === 'tbl' ? onMaintableNoQN() : onStafftableNoQN()

	function onMaintableNoQN() {
		// delete staffoncall
		if (/(<([^>]+)>)/i.test(staffname)) { $cells[STAFFNAME].innerHTML = "" }

		// Remote effect from editing on tbl to queuetbl
		// Staffqueue is showing, re-render to have new case of this staffname
		isSplit() && (pointed.innerHTML === titlename) && reViewStaffqueue()
	}

	function onStafftableNoQN() {

		// staffname is changed to other staff => re-render to drop the case
		(column === "staffname") && !isConsultsTbl() && reViewStaffqueue()

		// consults are not apparent on tbl, no remote effect from editing on queuetbl
		// Remote effect from editing on queuetbl to tbl
		// view the entire day, not just reViewAnotherTableCell
		!isConsultsTbl() && reViewOneDay(opdate)
	}
}

export function viewMoveCaseHN(tableID, qn, $cells)
{
	fillCellsHN(tableID, qn, $cells)

	if (tableID === 'tbl') {
		reViewOneDay(waiting.opdate)
		reViewStaffqueue()
	} else {
		reViewAll()
		fillConsults()
		reViewStaffqueue()
	}
}

export function viewCopyCaseHN(pointed, column)
{
	fillCellsHN(tableID, qn, $cells)

	if (tableID === 'tbl') {
		reViewStaffqueue()
	} else {
		reViewAll()
		fillConsults()
	}
}

function fillCellsHN(tableID, qn, $cells)
{
	let	book = (isConsultsTbl(tableID)) ? getCONSULT() : getBOOK()

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
}

jQuery.fn.extend({
	filldataWaiting : function(bookq) {
		let	$cells = this.find("td")

		this[0].className = dayName(NAMEOFDAYFULL, bookq.opdate) || "lightAqua"
		$cells[OPDATE].className = dayName(NAMEOFDAYABBR, bookq.opdate)

		$cells[OPDATE].innerHTML = putThdate(bookq.opdate)
		$cells[STAFFNAME].innerHTML = bookq.staffname
		$cells[HN].innerHTML = bookq.hn
		$cells[PATIENT].innerHTML = putNameAge(bookq)
		$cells[DIAGNOSIS].innerHTML = bookq.diagnosis
		$cells[TREATMENT].innerHTML = bookq.treatment
		$cells[CONTACT].innerHTML = bookq.contact
		$cells[QN].innerHTML = bookq.qn
	}
})

export function viewGetNameHN(pointed) {
	let tableID = $(pointed).closest("table").attr("id"),
		$row = $(pointed).closest('tr'),
		$cells = $row.children("td"),
		cellindex = pointed.cellIndex,
		staffname = $cells[STAFFNAME].innerHTML,
		qn = $cells[QN].innerHTML,
		noqn = !qn,
		book = (isConsultsTbl(tableID)) ? getCONSULT() : getBOOK()

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
			reViewAnotherTableCell('queuetbl', cellindex, qn)
		}
	} else {
		if (!isConsults()) {
			if (noqn) {
				reViewAll()
				fillConsults()
			} else {
				reViewAnotherTableCell('tbl', cellindex, qn)
			}
		}
	}
	// re-render editcell for keyin cell only
	let newpoint = getPointer()
	if (newpoint.cellIndex > PATIENT) {
		createEditcell(newpoint)
	}
}

// view corresponding cell in another table
let reViewAnotherTableCell = function (tableID, cellindex, qn) {
	let q = getBOOKrowByQN(getBOOK(), qn),
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
		oldOpdate = argView.oldOpdate,
		thisOpdate = argView.thisOpdate,

	dropOnTbl = function () {
		reViewOneDay(oldOpdate)
		reViewOneDay(thisOpdate)
		isSplit() && reViewStaffqueue()
		// While splitting, dragging inside tbl of this staff's case
	},
	dropOnStaff = function () {
		reViewStaffqueue()
		reViewOneDay(oldOpdate)
		reViewOneDay(thisOpdate)
	}

	receiver === "tbl" ? dropOnTbl() : dropOnStaff()

	// attach hover to changed DOM elements
	hoverMain()
}

export function viewIdling() {
	if ($('#dialogService').hasClass('ui-dialog-content')
		&& $('#dialogService').dialog('isOpen')) {

		reViewService()
	}

	reViewAll()
	isSplit() && reViewStaffqueue()
}

// Only on main table
export function fillConsults()
{
  let table = document.getElementById("tbl")
  let rows = table.rows
  let tlen = rows.length
  let today = ISOdate(new Date())
  let lastopdate = numDate(rows[tlen-1].cells[OPDATE].innerHTML)
  let staffoncall = getSTAFF().filter(staff => (staff.oncall === "1"))
  let slen = staffoncall.length
  let nextrow = 1
  let index = 0
  let start = staffoncall.filter(staff => staff.startoncall)
      .reduce((a, b) => a.startoncall > b.startoncall ? a : b, 0)
  let dateoncall = start.startoncall
  let staffstart = start.staffname
  let oncallRow = {}

  // The staff who has latest startoncall date, is to start
  while ((index < slen) && (staffoncall[index].staffname !== staffstart)) {
    index++
  }

  // find first date immediately after today, to begin
  while (dateoncall <= today) {
    dateoncall = nextdays(dateoncall, 7)
    index++
  }

  // write staffoncall if no patient
  index = index % slen
  while (dateoncall <= lastopdate) {
    oncallRow = findOncallRow(rows, nextrow, tlen, dateoncall)
    if (oncallRow && !oncallRow.cells[QN].innerHTML) {
      oncallRow.cells[STAFFNAME].innerHTML = htmlwrap(staffoncall[index].staffname)
    }
    nextrow = oncallRow.rowIndex + 1
    dateoncall = nextdays(dateoncall, 7)
    index = (index + 1) % slen
  }

  // write substitute oncall
  nextrow = 1
  getONCALL().forEach(oncall => {
    dateoncall = oncall.dateoncall
    if (dateoncall > today) {
      oncallRow = findOncallRow(rows, nextrow, tlen, dateoncall)
      if (oncallRow && !oncallRow.cells[QN].innerHTML) {
        oncallRow.cells[STAFFNAME].innerHTML = htmlwrap(oncall.staffname)
      }
      nextrow = oncallRow.rowIndex + 1
    }
  })
}

function findOncallRow(rows, nextrow, tlen, dateoncall)
{
  let opdateth = dateoncall && thDate(dateoncall)

  for (let i = nextrow; i < tlen; i++) {
    if (rows[i].cells[OPDATE].innerHTML === opdateth) {
      return rows[i]
    }
  }
}

function htmlwrap(staffname)
{
  return '<p style="color:#999999;font-size:12px">Consult<br>' + staffname + '</p>'
}

// refill after deleted or written over
export function showStaffOnCall(opdate)
{
  if (new Date(opdate).getDay() === 6) {
    fillConsults()
  }
}

export function viewGetUpdate(response)
{
	if (dialogServiceShowing()) {
		setSERVICE(response.SERVICE)
		SERVE = calcSERVE()
		refillService(fromDate, toDate)
	}
	reViewAll()
	fillConsults()
	if (isSplit()) { reViewStaffqueue() }
	renewEditcell()
}

export function viewOnIdling()
{
	reViewStaffqueue()
	reViewAll()
	fillConsults()
}

export function viewAddStaff()
{
  let $stafftbl = $("#stafftbl")
  let scbb = document.getElementById("scbb")

  SPECIALTY.forEach(function(each) {
    scbb.innerHTML += `<option value=${each}>${each}</option>`
  })

  clearval()
  $stafftbl.find('tr').slice(3).remove()

  $.each( getSTAFF(), (i, item) => {
    $('#staffcells tr').clone()
      .appendTo($stafftbl.find('tbody'))
        .filldataStaff(i, item)
  });
}

jQuery.fn.extend({
  filldataStaff : function (i, q) {
    let cells = this[0].cells

	cells[0].innerHTML = `<a onclick="getval('${i}')">${q.staffname}</a>`
	cells[1].innerHTML = `<a onclick="getval('${i}')">${q.specialty}</a>`
	cells[2].innerHTML = `<a onclick="getval('${i}')">${q.startoncall}</a>`
  }
})

function getval(each)
{  
  let staff = getSTAFF()
  document.getElementById("sname").value = staff[each].staffname;
  document.getElementById("scbb").value = staff[each].specialty;
  document.getElementById("sdate").value = staff[each].startoncall; 
  document.getElementById("shidden").value = staff[each].number;
}

function clearval()
{  
  document.getElementById("sname").value = ""
  document.getElementById("scbb").value = ""
  document.getElementById("sdate").value = ""
  document.getElementById("shidden").value = ""
}
