
import {
	OPDATE, THEATRE, OPROOM, OPTIME, CASENUM, STAFFNAME, HN, PATIENT, DIAGNOSIS,
	TREATMENT, EQUIPMENT, CONTACT, QN, LARGESTDATE
} from "../model/const.js"
import {
	START, ISOdate, nextdays, numDate, thDate, putThdate, putNameAge
} from "../util/date.js"
import { BOOK, CONSULT, isPACS } from "../util/variables.js"
import { isSplit, isConsults } from "../util/util.js"
import { rowDecoration } from "./rowDecoration.js"
import { viewEquip } from "./viewEquip.js"
import { splitPane } from "./splitPane.js"
import { hoverMain } from "./hoverMain.js"
import { setRowData, blankRowData } from "../model/rowdata.js"

// Render Main table
// Consults and dialogAll tables use this too
// START date imported from util.js
// until date is the last row of the table, not of the book
export function fillall(book, table, start, until) {
	let tbody = table.querySelector("tbody"),
		rows = table.rows,
		head = table.rows[0],
		date = start,
		madedate,
		q = book.findIndex(e => e.opdate >= start),
		x = book.findIndex(e => e.opdate >= LARGESTDATE)

  // Get rid of LARGESTDATE cases
	// Consult cases have no LARGESTDATE, findIndex returns x = -1
	if (x >= 0) {
		book = book.slice(0, x)
	}

	let blen = book.length
  // No case
  if (!blen) { book.push({"opdate" : START}) }

	for (q; q < blen; q++) {
		// step over each day that is not in QBOOK
		while (date < book[q].opdate)
		{
			if (date !== madedate)
			{
				// make a blank row for each day which is not in book
				makenextrow(table, date)	// insertRow
				madedate = date
			}
			date = nextdays(date, 1)
			if (date > until) {
        if (((new Date(date)).getDay())%7 === 1)
        {
          let clone = head.cloneNode(true)
          tbody.appendChild(clone)
        }
				return
			}
			// make table head row before every Monday
			if ((new Date(date).getDay())%7 === 1)
			{
				let clone = head.cloneNode(true)
				tbody.appendChild(clone)
			}
		}
		makenextrow(table, date)
		filldata(book[q], rows[table.rows.length-1])
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
		makenextrow(table, date)
	}
	hoverMain()
}

// Used after serviceReview and in idling update
// Similar to fillall but try to use existing DOM table
export function refillall() {
	let	table = document.getElementById("tbl"),
		$tbody = $("#tbl tbody"),
		start = numDate($('#tbl tr:has("td"):first').find('td').eq(OPDATE).html()),
		until = numDate($('#tbl tr:has("td"):last').find('td').eq(OPDATE).html())

	$tbody.html($tbody.find("tr:first").clone())
	fillall(BOOK, table, start, until)
	hoverMain()
	// For new row added to this table
}

// create and decorate new row
let makenextrow = function (table, date) {
	let tbody = table.querySelector("tbody"),
		tblcells = document.getElementById("tblcells"),
		row = tblcells.rows[0].cloneNode(true)

	row = tbody.appendChild(row)
	rowDecoration(row, date)
  blankRowData(row, date)
}

export function filldata(q, row)
{
	let cells = row.cells

  setRowData(row, q)
	if (q.hn && isPACS) { cells[HN].className = "pacs" }
	if (q.patient) { cells[PATIENT].className = "upload" }

	cells[THEATRE].innerHTML = q.theatre
	cells[OPROOM].innerHTML = q.oproom || ""
	cells[OPTIME].innerHTML = q.optime
	cells[CASENUM].innerHTML = q.casenum || ""
	cells[STAFFNAME].innerHTML = q.staffname
	cells[HN].innerHTML = q.hn
	cells[PATIENT].innerHTML = putNameAge(q)
	cells[DIAGNOSIS].innerHTML = q.diagnosis
	cells[TREATMENT].innerHTML = q.treatment
	cells[EQUIPMENT].innerHTML = viewEquip(q.equipment)
	cells[CONTACT].innerHTML = q.contact
}

export function staffqueue(staffname) {
	let todate = ISOdate(new Date()),
		consult = CONSULT,
		$queuetbl = $('#queuetbl'),
		queuetbl = $queuetbl[0]

	// delete previous queuetbl lest it accumulates
	$queuetbl.find('tr').slice(1).remove()

	let staffConsults = () => {

		// No case from server
		if (consult.length) { consult.push({"opdate" : START}) }
    if (!queuetbl.length) {
      let table = document.getElementById("tbl")
      let head = table.rows[0]
      let clone = head.cloneNode(true)
      let tbody = queuetbl.querySelector("tbody")
      tbody.appendChild(clone)
    }

		// render as main table, not as staff table
		fillall(consult, queuetbl, START, todate)
	}

	let staffCases = () => {
		$.each( BOOK, function() {
			this.staffname === staffname && this.opdate >= todate &&
				$('#tblcells tr').clone()
					.appendTo($queuetbl)
						.filldataQueue(this)
		});
	}

	// Not yet split window
	if (!isSplit()) { splitPane() }
	$('#titlename').html(staffname)

	staffname === "Consults" ? staffConsults() : staffCases()

	hoverMain()
}

// Use existing DOM table
export function refillstaffqueue() {
	let todate = ISOdate(new Date()),
		staffname = $('#titlename').html(),
		book = BOOK,
    consult = CONSULT

	let staffConsults = () => {
		let table = document.getElementById("queuetbl")

		// Consults table is rendered same as fillall
		$('#queuetbl tr').slice(1).remove()
		!consult.length && consult.push({"opdate" : START})

		fillall(consult, table, START, todate)
	}
	let staffCases = () => {
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

	isConsults() ? staffConsults() : staffCases()
}

jQuery.fn.extend({
	filldataQueue : function(q) {
		let row = this[0]
		let cells = row.cells

		addColor(this, q.opdate)
		q.hn && isPACS && (cells[HN].className = "pacs")
		q.patient && (cells[PATIENT].className = "upload")
    setRowData(row, q)

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
	}
})

// Same date cases have same color
// In LARGESTDATE, prevdate is "" but q.opdate is LARGESTDATE
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
