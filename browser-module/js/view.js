
import {
	OPDATE, THEATRE, OPROOM, OPTIME, CASENUM, STAFFNAME, HN, PATIENT, DIAGNOSIS, TREATMENT,
	EQUIPMENT, CONTACT, QN, LARGESTDATE, THAIMONTH, HOLIDAYENGTHAI, NAMEOFDAYABBR,
	NAMEOFDAYFULL, EQUIPICONS
} from "./const.js"

import { showStaffOnCall, PACS } from "./control.js"
import { reViewService } from "./serv.js"
import { clearEditcell } from "./edit.js"
import {
	getBOOK, getCONSULT, isPACS, getBOOKrowByQN, ISOdate, thDate, nextdays, dayName,
	numDate, getOpdate, putThdate, putAgeOpdate, winWidth, winHeight, getTableRowByQN,
	START, showUpload, isConsultsTbl, getBOOKrowsByDate, getTableRowsByDate, reposition,
	putNameAge, rowDecoration, holiday, isSplit, winResizeFix, inPicArea, getClass,
	isStaffname
} from "./util.js"

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

// Used for main table ("tbl") only, no LARGESTDATE
// others would refill entire table
let reViewOneDay = function (opdate) {
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
	},
	noCase = function () {
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
		book = getBOOK(),
	staffConsults = function () {
		let table = document.getElementById("queuetbl")

		// Consults table is rendered same as viewAll
		$('#queuetbl tr').slice(1).remove()
		!book.length && book.push({"opdate" : START})

		viewAll(book, table, START, todate)
	},
	staffCases = function () {
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

export function viewPostponeCase(opdate, thisdate, staffname, qn)
{
	if (opdate !== LARGESTDATE) { reViewOneDay(opdate) }
	if (thisdate !== LARGESTDATE) { reViewOneDay(thisdate) }

	// changeDate of this staffname's case, re-render
	isSplit() && isStaffname(staffname) && reViewStaffqueue()

	scrolltoThisCase(qn)
}

export function viewChangeDate(movedateth, movedate, thisdate, staffname, qn)
{
	if (movedateth) {
		reViewOneDay(movedate)
	}
	if (movedate !== thisdate) {
		reViewOneDay(thisdate)
	}
	if (isSplit()) {
		let titlename = $('#titlename').html()
		if ((titlename === staffname) || (titlename === "Consults")) {
			// changeDate of this staffname's case
			reViewStaffqueue()
		}
	} 

	// changeDate of this staffname's case, re-render
	isSplit() && isStaffname(staffname) && reViewStaffqueue()

	scrolltoThisCase(qn)
}

export function viewDeleteCase(tableID, $row, opdate, staffname) {
	reViewOneDay(opdate)
	tableID === "tbl"
	? isSplit() && isStaffname(staffname) && reViewStaffqueue()
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

export function viewSaveRoomTime(opdate) {
	reViewOneDay(opdate)
	isSplit() && reViewStaffqueue()
	clearEditcell()
}

export function viewSaveContent(args) {
	let tableID = args.tableID,
		titlename = args.titlename,
		staffname = args.staffname,
		oldcontent = args.oldcontent,
		pointed = args.pointed,
		cellindex = args.cellindex,
		column = args.column,
		qn = args.qn,

	onMaintable = function () {

		// Remote effect from editing on tbl to queuetbl
		// Staffqueue is showing
		if (isSplit()) {

			// this staffname is changed to another staff or to this staffname
			if ((oldcontent === titlename)
				|| (pointed.innerHTML === titlename)) {
					reViewStaffqueue()
			} else {
				// input is not staffname, but on this titlename row
				if (titlename === staffname) {
					reViewAnotherTableCell('queuetbl', cellindex, qn)
				}
					
			}
		}
	},

	onStafftable = function () {

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

	tableID === 'tbl' ? onMaintable() : onStafftable()
}

export function viewSaveNoQN(args) {
	let tableID = args.tableID,
		waitnum = args.waitnum,
		$cells = args.$cells,
		$row = args.$row,
		column = args.column,
		opdate = args.opdate,
		titlename = args.titlename,
		staffname = args.staffname,

		// find and view qn of new case input in that row, either tbl or queuetbl
		// store waitnum in row title
		// fill qn in the blank QN
		qn = Math.max.apply(Math, $.map(getBOOK(), function(q, i){
			return q.qn
		}))
	$row[0].title = waitnum
	$cells.eq(QN).html(qn)

	tableID === 'tbl' ? onMaintableNoQN() : onStafftableNoQN()
	return qn

	function onMaintableNoQN() {

		// Remote effect from editing on tbl to queuetbl
		// Staffqueue is showing, re-render to have new case of this staffname
		isSplit() && (staffname === titlename) && reViewStaffqueue()
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

export function viewSaveByHN(args) {
	let tableID = args.tableID,
		waitnum = args.waitnum,
		$cells = args.$cells,
		row = args.row,
		qn = args.qn

	// have waitnum = newCase, redo
	// no waitnum yes qn = existedCase
	// no waitnum = undoNew, undoExisted
	if (waitnum || (!waitnum && qn)) {
		// New case input
		if (!qn) {
			qn = Math.max.apply(Math, $.map(getBOOK(), function(row, i) {
					return row.qn
				}))
			qn = String(qn)
			$cells.eq(QN).html(qn)
			row.title = waitnum
		}

		let q = $.grep(getBOOK(), function(each) {
			return each.qn === qn
		})[0],
		argsnew = {
			qnnew: qn,
			patientnew: q.patient,
			dobnew: q.dob,
			diagnosisold: $cells.eq(DIAGNOSIS).html(),
			diagnosisnew: q.diagnosis,
			treatmentold: $cells.eq(TREATMENT).html(),
			treatmentnew: q.treatment,
			contactold: $cells.eq(CONTACT).html(),
			contactnew: q.contact
		}

		$cells.eq(OPROOM).html(putRoomTime(q))
		$cells.eq(STAFFNAME).html(q.staffname)
		$cells.eq(HN).html(q.hn)
		$cells.eq(PATIENT).html(putNameAge(q))
		$cells.eq(DIAGNOSIS).html(q.diagnosis)
		$cells.eq(TREATMENT).html(q.treatment)
		$cells.eq(CONTACT).html(q.contact)

		isPACS && $cells.eq(HN).addClass("pacs")
		$cells.eq(PATIENT).addClass("upload")
	} else {
		// argsold (passed as args by undo) has no waitnum
		$cells.eq(HN).html("")
		$cells.eq(PATIENT).html("")
		$cells.eq(DIAGNOSIS).html("")
		$cells.eq(TREATMENT).html("")
		$cells.eq(CONTACT).html("");
		$cells.eq(QN).html("");

		$cells.eq(HN).removeClass("pacs")
		$cells.eq(PATIENT).removeClass("upload")

	}

	tableID === 'tbl'

			// Remote effect from tbl to queuetbl
			// saveHN on this staffname row
		? isSplit() && ($('#titlename').html() === staffname) && 
			reViewAnotherTableCell('queuetbl', cellindex, qn)

			// Consults cases are not shown in tbl
			// Remote effect from queuetbl to tbl
			// No need to reViewAll because new case row was already there
		: !isConsultsTbl() && reViewAnotherTableCell('tbl', cellindex, qn)

	return argsnew
}

// view corresponding cell in another table
let reViewAnotherTableCell = function (tableID, cellindex, qn) {
	let row = $.grep( $("#" + tableID + " tr:has(td)"), function (e) {
			return e.cells[QN].innerHTML === qn
		})[0],
		q = getBOOKrowByQN(getBOOK(), qn),
		cells = row.cells,
		viewcell = {}

	viewcell[OPROOM] = putRoomTime(q)
	viewcell[STAFFNAME] = q.staffname
	viewcell[HN] = q.hn
	viewcell[PATIENT] = putNameAge(q)
	viewcell[DIAGNOSIS] = q.diagnosis
	viewcell[TREATMENT] = q.treatment
	viewcell[CONTACT] = q.contact

	q && ((cellindex !== HN)
		? cells[cellindex].innerHTML = viewcell[cellindex]
		: (cells[HN].innerHTML = viewcell[HN],
		  cells[PATIENT].innerHTML = viewcell[PATIENT]))
}

// Make box dialog dialogAll containing alltbl
export function viewAllCases(response) {
    // Make paginated dialog box containing alltbl
    pagination($("#dialogAll"), $("#alltbl"), response, "All Saved Cases")
}

export function pagination($dialog, $tbl, book, search)
{
  let  beginday = book[0].opdate,
    lastday = findLastDateInBOOK(book),
    firstday = getPrevMonday()

  $dialog.dialog({
    title: search,
    closeOnEscape: true,
    modal: true,
    show: 200,
    hide: 200,
    width: winWidth(95),
    height: winHeight(95),
    close: function() {
      $(window).off("resize", resizeDialog )
      $(".fixed").remove()
    },
    buttons: [
      {
        text: "<<< Year",
        class: "yearbut",
        click: function () {
          showOneWeek(book, firstday, -364)
        }
      },
      {
        text: "<< Month",
        class: "monthbut",
        click: function () {
          offset = firstday.slice(-2) > 28 ? -35 : -28
          showOneWeek(book, firstday, offset)
        }
      },
      {
        text: "< Week",
        click: function () {
          showOneWeek(book, firstday, -7)
        }
      },
      {
        click: function () { return }
      },
      {
        text: "Week >",
        click: function () {
          showOneWeek(book, firstday, 7)
        }
      },
      {
        text: "Month >>",
        class: "monthbut",
        click: function () {
          offset = firstday.slice(-2) > 28 ? 35 : 28
          showOneWeek(book, firstday, offset)
        }
      },
      {
        text: "Year >>>",
        class: "yearbut",
        click: function () {
          showOneWeek(book, firstday, 364)
        }
      }
    ]
  })

  showOneWeek(book, firstday, 0)
  $tbl.fixMe($dialog)

  //for resizing dialogs in landscape / portrait view
  $(window).on("resize", resizeDialog )

  $dialog.find('.pacs').on("click", function() {
    if (isPACS) {
      PACS(this.innerHTML)
    }
  })
  $dialog.find('.upload').on("click", function() {
    let hn = this.previousElementSibling.innerHTML
    let patient = this.innerHTML

    showUpload(hn, patient)
  })

  function showOneWeek(book, Monday, offset)
  {
    let  bookOneWeek, Sunday

    firstday = nextdays(Monday, offset)
    if (firstday < beginday) { firstday = getPrevMonday(beginday) }
    if (firstday > lastday) {
      firstday = nextdays(getPrevMonday(lastday), 7)
      bookOneWeek = getBookNoDate(book)
      showAllCases(bookOneWeek)
    } else {
      Sunday = getNextSunday(firstday)
      bookOneWeek = getBookOneWeek(book, firstday, Sunday)
      showAllCases(bookOneWeek, firstday, Sunday)
    }
  }

  function getPrevMonday(date)
  {
    let today = date
          ? new Date(date.replace(/-/g, "/"))
          : new Date();
    today.setDate(today.getDate() - today.getDay() + 1);
    return ISOdate(today);
  }

  function getNextSunday(date)
  {
    let today = new Date(date);
    today.setDate(today.getDate() - today.getDay() + 7);
    return ISOdate(today);
  }

  function getBookOneWeek(book, Monday, Sunday)
  {
    return $.grep(book, function(bookq) {
      return bookq.opdate >= Monday && bookq.opdate <= Sunday
    })
  }

  function getBookNoDate(book)
  {
    return $.grep(book, function(bookq) {
      return bookq.opdate === LARGESTDATE
    })
  }

  function showAllCases(bookOneWeek, Monday, Sunday)
  {
    let  Mon = Monday && thDate(Monday) || "",
      Sun = Sunday && thDate(Sunday) || ""

    $dialog.dialog({
      title: search + " : " + Mon + " - " + Sun
    })
    // delete previous table lest it accumulates
    $tbl.find('tr').slice(1).remove()

    if (Monday) {
      let  $row, row, cells,
        date = Monday,
        nocase = true

      $.each( bookOneWeek, function() {
        while (this.opdate > date) {
          if (nocase) {
            $row = $('#allcells tr').clone().appendTo($tbl.find('tbody'))
            row = $row[0]
            cells = row.cells
            rowDecoration(row, date)
          }
          date = nextdays(date, 1)
          nocase = true
        }
        $('#allcells tr').clone()
          .appendTo($tbl.find('tbody'))
            .filldataAllcases(this)
        nocase = false
      })
      date = nextdays(date, 1)
      while (date <= Sunday) {
        $row = $('#allcells tr').clone().appendTo($tbl.find('tbody'))
        row = $row[0]
        cells = row.cells
        rowDecoration(row, date)
        date = nextdays(date, 1)
      }
    } else {
      $.each( bookOneWeek, function() {
        $('#allcells tr').clone()
          .appendTo($tbl.find('tbody'))
            .filldataAllcases(this)
      });
    }
  }

  function resizeDialog() {
    $dialog.dialog({
      width: winWidth(95),
      height: winHeight(95)
    })
    winResizeFix($tbl, $dialog)
  }
}

jQuery.fn.extend({
  filldataAllcases : function(q) {
    let row = this[0],
      cells = row.cells

	cells[0].innerHTML = putThdate(q.opdate)
	cells[1].innerHTML = q.staffname
	cells[2].innerHTML = q.hn
	cells[3].innerHTML = q.patient
	cells[4].innerHTML = q.diagnosis
	cells[5].innerHTML = q.treatment
	cells[6].innerHTML = viewEquip(q.equipment)
	cells[7].innerHTML = q.admission
	cells[8].innerHTML = q.final
	cells[9].innerHTML = q.contact

    rowDecoration(row, date)
  }
})

// Make box dialog dialogHistory containing historytbl
export function viewCaseHistory(row, hn, tracing)
{
	let  $historytbl = $('#historytbl'),
		nam = row.cells[PATIENT].innerHTML,
		name = nam && nam.replace('<br>', ' '),
		$dialogHistory = $("#dialogHistory")
	
	// delete previous table lest it accumulates
	$('#historytbl tr').slice(1).remove()

	tracing.forEach(function(item) {
		$('#historycells tr').clone()
			.appendTo($('#historytbl tbody'))
				.filldataHistory(item)
	});

	$dialogHistory.dialog({
		title: `${hn} ${name}`,
		closeOnEscape: true,
		modal: true,
		show: 200,
		hide: 200,
		width: winWidth(95),
		height: winHeight(95),
		close: function() {
			$(window).off("resize", resizeHistory )
			$("#fixed").remove()
		}
	})
	$("#historytbl").fixMe($("#dialogHistory"));

	// for resizing dialogs in landscape / portrait view
	$(window).on("resize", resizeHistory )

	function resizeHistory() {
		$dialogHistory.dialog({
			width: winWidth(95),
			height: winHeight(95)
		})
		winResizeFix($historytbl, $dialogHistory)
	}
}

jQuery.fn.extend({
	filldataHistory : function(q) {
		let cells = this[0].cells

		// Define colors for deleted and undeleted rows
		q.action === 'delete'
		? this.addClass("deleted")
		: (q.action === 'undelete') && this.addClass("undelete")

		cells[0].innerHTML = putThdate(q.opdate) || ""
		cells[1].innerHTML = q.oproom || ""
		cells[2].innerHTML = q.casenum || ""
		cells[3].innerHTML = q.staffname
		cells[4].innerHTML = q.diagnosis
		cells[5].innerHTML = q.treatment
		cells[6].innerHTML = viewEquip(q.equipment)
		cells[7].innerHTML = q.admission
		cells[8].innerHTML = q.final
		cells[9].innerHTML = q.contact
		cells[10].innerHTML = q.editor
		cells[11].innerHTML = q.editdatetime
	}
})

// Add all equipments in one string to show in 1 cell
export function viewEquip(equipString)
{
  return equipString ? makeEquip(JSON.parse(equipString)) : ""
}

export function makeEquip(equipJSON)
{
  let equip = [],
    monitor = [],
	equipPics = []

  $.each(equipJSON, function(key, value) {
    if (value === "checked") {
      if (key in EQUIPICONS) {
        equipPics.push(EQUIPICONS[key])
        if (EQUIPICONS[key] === "Monitor") {
          monitor.push(key)
        } else {
          equip.push(key)
		}
      } else {
        equip.push(key)
	  }
    } else {
      if (key === "Monitor") {
        monitor.push(value)
      } else {
        equip.push(key + ":" + value)
      }
    }
  })
  // remove duplicated pics
  equipPics = equipPics.filter(function(pic, pos) {
    return equipPics.indexOf(pic) === pos;
  })
  // convert to string
  equip = equip.length ? equip.join('; ') : ''
  monitor = monitor.length ? "; Monitor:" + monitor.toString() : ''
  
  return equip + monitor + "<br>" + equipImg(equipPics)
}

function equipImg(equipPics)
{
  let img = ""

  $.each(equipPics, function() {
    img += '<img src="css/pic/equip/' + this + '.jpg"> '
  })

  return img
}

export function viewCancelAllEquip(qn)
{
	let $row = getTableRowByQN("tbl", qn)

	$row.find("td").eq(EQUIPMENT).html('')
	$("#dialogEquip").dialog('close')
}

export function viewRestoreAllEquip(response, bookqEquip, JsonEquip)
{
	// Error update server
	// Roll back. If old form has equips, fill checked & texts
	// prop("checked", true) : radio and checkbox
	// .val(val) : <input text> && <textarea>
	Alert("cancelAllEquip", response)
	$('#dialogEquip input').val('')
	$('#dialogEquip textarea').val('')
	if ( bookqEquip ) {
		$.each(JsonEquip, function(key, val) {
			if (val === 'checked') {
				$("#"+ key).prop("checked", true)
			} else {
				$("#"+ key).val(val)
			}
		})
	}
}

// Make dialog box dialogDeleted containing historytbl
export function viewDeletedCases(deleted) {
  let $deletedtbl = $('#deletedtbl'),
    $deletedtr = $('#deletedcells tr')

  // delete previous table lest it accumulates
  $deletedtbl.find('tr').slice(1).remove()

  // display the first 20
  $.each( deleted, function(i) {
    $deletedtr.clone()
      .appendTo($deletedtbl.find('tbody'))
        .filldataDeleted(this)
    return i < 20;
  });

  let $dialogDeleted = $("#dialogDeleted")
  $dialogDeleted.dialog({
    title: "All Deleted Cases",
    closeOnEscape: true,
    modal: true,
    hide: 200,
    width: winWidth(95),
    height: winHeight(95),
    close: function() {
      $(window).off("resize", resizeDeleted )
      $(".fixed").remove()
    }
  })
  $deletedtbl.fixMe($dialogDeleted);

  let $undelete = $("#undelete")
  $undelete.hide()
  $undelete.off("click").on("click", closeUndel )

  //for resizing dialogs in landscape / portrait view
  $(window).on("resize", resizeDeleted )

  function resizeDeleted() {
    $dialogDeleted.dialog({
      width: winWidth(95),
      height: winHeight(95)
    })
    winResizeFix($deletedtbl, $dialogDeleted)
  }

  // display the rest
  setTimeout(function() {
    $.each( deleted, function(i) {
      if (i < 21) return
      $deletedtr.clone()
        .appendTo($deletedtbl.find('tbody'))
          .filldataDeleted(this)
    });
  }, 100)
}

jQuery.fn.extend({
	filldataDeleted : function(q) {
		let cells = this[0].cells

		rowDecoration(this[0], q.opdate)
		cells[0].classList.add("toUndelete")

		cells[0].innerHTML = putThdate(q.opdate)
		cells[1].innerHTML = q.staffname
		cells[2].innerHTML = q.hn
		cells[3].innerHTML = q.patient
		cells[4].innerHTML = q.diagnosis
		cells[5].innerHTML = q.treatment
		cells[6].innerHTML = q.contact
		cells[7].innerHTML = q.editor
		cells[8].innerHTML = q.editdatetime
		cells[9].innerHTML = q.qn
	}
})

export function viewUndelete(opdate, staffname, qn) {
	reViewOneDay(opdate)
	if (isSplit() && (isStaffname(staffname) || isConsults())) {
		reViewStaffqueue()
	}
	scrolltoThisCase(qn)
}

let closeUndel = function () {
	$('#undelete').hide()
}

export function viewSearchDB(found, search)
{
  let flen = found.length,
    $dialogFind = $("#dialogFind"),
    $findtbl = $("#findtbl"),
    show = scrolltoThisCase(found[flen-1].qn)

  if (!show || (flen > 1)) {
    if (flen > 100) {
      pagination($dialogFind, $findtbl, found, search)
    } else {
      makeDialogFound($dialogFind, $findtbl, found, search)
    }
  }
}

// Both main and staff tables
function scrolltoThisCase(qn)
{
  let showtbl, showqueuetbl

  showtbl = locateFound("tblcontainer", "tbl", qn)
  if (isSplit()) {
    showqueuetbl = locateFound("queuecontainer", "queuetbl", qn)
  }
  return showtbl || showqueuetbl
}

// Scroll to specified qn case and add a border
let locateFound = function (containerID, tableID, qn) {
  let container = document.getElementById(containerID),
    row = getTableRowByQN(tableID, qn),
    scrolledTop = container.scrollTop,
    offset = row && row.offsetTop,
    rowHeight = row && row.offsetHeight,
    height = container.clientHeight - rowHeight,
    bottom = scrolledTop + height,
    $container = $("#" + containerID)

  $("#" + tableID + " tr.marker").removeClass("marker")
  if (row) {
    $(row).addClass("marker")
    if (offset < scrolledTop) {
      $container.animate({
        scrollTop: offset
      }, 500);
    }
    else if (offset > bottom) {
      $container.animate({
        scrollTop: offset - height
      }, 500);
    }
    return true
  }
}

function makeDialogFound($dialogFind, $findtbl, found, search)
{
  $dialogFind.dialog({
    title: "Search: " + search,
    closeOnEscape: true,
    modal: true,
    width: winWidth(95),
    height: winHeight(95),
    buttons: [
      {
        text: "Export to xls",
        click: function() {
          exportFindToExcel(search)
        }
      }
    ],
    close: function() {
      $(window).off("resize", resizeFind )
      $(".fixed").remove()
      $("#dialogInput").dialog("close")
      $(".marker").removeClass("marker")
    }
  })

  // delete previous table lest it accumulates
  $findtbl.find('tr').slice(1).remove()

  $.each( found, function() {  // each === this
    $('#findcells tr').clone()
      .appendTo($findtbl.find('tbody'))
        .filldataFind(this)
  });
  $findtbl.fixMe($dialogFind);

  //for resizing dialogs in landscape / portrait view
  $(window).on("resize", resizeFind )

  function resizeFind() {
    $dialogFind.dialog({
      width: window.innerWidth,
      height: window.innerHeight
    })
    winResizeFix($findtbl, $dialogFind)
  }

  $dialogFind.find('.pacs').click(function() {
    if (isPACS) {
      PACS(this.innerHTML)
    }
  })
  $dialogFind.find('.upload').click(function() {
    let patient = this.innerHTML
    let hn = this.previousElementSibling.innerHTML

    hn && showUpload(hn, patient)
  })

  //scroll to todate when there many cases
  let today = new Date(),
    todate = ISOdate(today),
    thishead

  $findtbl.find("tr").each(function() {
    thishead = this
    return numDate(this.cells[OPDATE].innerHTML) < todate
  })
  $dialogFind.animate({
    scrollTop: $(thishead).offset().top - $dialogFind.height()
  }, 300);
}

jQuery.fn.extend({
	filldataFind : function(q) {
		let cells = this[0].cells


		if (Number(q.deleted)) {
		  this.addClass("deleted")
		} else {
		  rowDecoration(this[0], q.opdate)
		}
		q.hn && isPACS && (cells[2].className = "pacs")
		q.patient && (cells[3].className = "upload")

		cells[0].innerHTML = putThdate(q.opdate)
		cells[1].innerHTML = q.staffname
		cells[2].innerHTML = q.hn
		cells[3].innerHTML = q.patient
		cells[4].innerHTML = q.diagnosis
		cells[5].innerHTML = q.treatment
        cells[6].innerHTML = viewEquip(q.equipment),
        cells[7].innerHTML = q.admission,
        cells[8].innerHTML = q.final,
		cells[9].innerHTML = q.contact
	}
})

export function viewSortable(argv) {
	let receiver = argv.receiver,
		oldOpdate = argv.oldOpdate,
		thisOpdate = argv.thisOpdate,

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

// Find first row in the book that have same or later date than start date
let findStartRowInBOOK = function (book, opdate) {
	let q = 0
	while ((q < book.length) && (book[q].opdate < opdate)) {
		q++
	}
	return (q < book.length) ? q : -1
}
