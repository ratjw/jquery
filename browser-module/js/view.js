
// NAMEOFDAYABBR : for row color
// NAMEOFDAYFULL : for 1st column color
const NAMEOFDAYABBR = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const NAMEOFDAYFULL = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

import {
	OPDATE, OPROOM, CASENUM, STAFFNAME, HN, PATIENT, DIAGNOSIS, TREATMENT, CONTACT, QN,
	BOOK, CONSULT, LARGESTDATE, isPACS, START,
	PACS, uploadWindow
} from "./control.js"

import { reViewService } from "./serv.js"
import { reposition, clearEditcell } from "./edit.js"
import { getBOOKrowByQN, ISOdate, thDate, nextdays, numDate,
			getOpdate, putThdate, putAgeOpdate, winWidth, winHeight
		} from "./util.js"

export {
	viewAll, reViewAll, reViewStaffqueue, viewChangeDate, viewAllCases,
	viewDeleteCase, viewDeletedCases, viewCaseHistory, viewFind,
	viewIdling, viewLatestEntry, viewSaveByHN,
	viewSaveContent, viewSaveNoQN, viewSaveRoomTime, viewSortable,
	viewStaffqueue, viewUndelete, animateScroll, isConsultsTbl, winResizeFix
}

;(function($) {
	$.fn.fixMe = function($container) {
		let $this = $(this),
			$t_fixed,
			pad = $container.css("paddingLeft")
		init();
		$container.off("scroll").on("scroll", scrollFixed);

		function init() {
			$t_fixed = $this.clone();
			$t_fixed.attr("id", "fixheader")
			$t_fixed.find("tbody").remove().end()
					.addClass("fixed").insertBefore($this);
			$container.scrollTop(0)
			resizeFixed();
			reposition($t_fixed, "left top", "left+" + pad + " top", $container)
			$t_fixed.hide()
		}
		function resizeFixed() {
			$t_fixed.find("th").each(function(index) {
				$(this).css("width",$this.find("th").eq(index).width() + "px");
			});
		}
		function scrollFixed() {
			let offset = $(this).scrollTop(),
			tableTop = $this[0].offsetTop,
			tableBottom = tableTop + $this.height() - $this.find("thead").height();
			if(offset < tableTop || offset > tableBottom) {
				$t_fixed.hide();
			}
			else if (offset >= tableTop && offset <= tableBottom && $t_fixed.is(":hidden")) {
				$t_fixed.show();
			}
		}
	};
})(jQuery);

// function declaration (definition ) : public
// function expression (literal) : local

function winResizeFix($this, $container) {
	let $fix = $("#fixheader"),
		hide = $fix.css("display") === "none",
		pad = $container.css("paddingLeft")

	$fix.find("th").each(function(index) {
		$(this).css("width",$this.find("th").eq(index).width() + "px");
	});
	reposition($fix, "left top", "left+" + pad + " top", $container)
	hide && $fix.hide()
}

// Render Main table
// Consults and dialogAll tables use this too
// START date imported from control.js
// until date is the last row of the table, not of the book
function viewAll(book, table, start, until) {
	let tbody = table.getElementsByTagName("tbody")[0],
		rows = table.rows,
		head = table.rows[0],
		date = start,
		madedate,
		q = findStartRowInBOOK(book, start),
		k = findStartRowInBOOK(book, LARGESTDATE)

	// Get rid of LARGESTDATE cases
	book = book.slice(0, k)

	// i for rows in table (with head as the first row)
	let i = 0,
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
}

// Used after serviceReview and in idling update
// Similar to viewAll but try to use existing DOM table
function reViewAll() {
	let	table = document.getElementById("tbl"),
		tbody = table.getElementsByTagName("tbody")[0],
		start = numDate($('#tbl tr:has("td")').first().find('td').eq(OPDATE).html()),
		until = numDate($('#tbl tr:has("td")').last().find('td').eq(OPDATE).html())

	$tbody.html($tbody.find("tr:first").clone())
	viewAll(BOOK, table, start, until)
//	hoverMain()
}

// Used for main table ("tbl") only, no LARGESTDATE
// others would refill entire table
let reViewOneDay = function (opdate) {
	if (opdate === LARGESTDATE) { return }
	let	opdateth = putThdate(opdate),
		opdateBOOKrows = getBOOKrowsByDate(BOOK, opdate),
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
			let i = tblRows - bookRows
			while (i--) {
				$opdateTblRows.eq(tblRows-1).remove()
			}
			// Have to renew $opdateTblRows for filldata to correct rows
			$opdateTblRows = getTableRowsByDate(opdateth)
		},
		moreCase = function () {
			let i = tblRows - bookRows
			while (i++) {
				$opdateTblRows.eq(0).clone()
					.insertAfter($opdateTblRows.eq(tblRows-1))
				$opdateTblRows = getTableRowsByDate(opdateth)
			}	// Have to renew $opdateTblRows for filldata to correct rows
		}
		tblRows > bookRows
			? lessCase()
			: moreCase()
		$.each(opdateBOOKrows, function(key, val) {
//			rowDecoration($opdateTblRows[key], this.opdate)
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
		$cells.eq(PATIENT).removeClass("camera")
		$cells.eq(TREATMENT).removeClass("equip")
		$cells.eq(DIAGNOSIS).css("backgroundImage", holiday(opdate))
	}

	bookRows ? hasCase() : noCase()
}

let	getBOOKrowsByDate = function (book, opdate) {
	return book.filter(function(q) {
		return (q.opdate === opdate);
	})
}

let	getTableRowsByDate = function (opdateth) {
	if (!opdateth) { return [] }
	return $('#tbl tr').filter(function() {
		return $(this).cells[OPDATE].innerHTML === opdateth;
	})
}

// create and decorate new row
let makenextrow = function (table, date) {
	let tbody = table.getElementsByTagName("tbody")[0],
		tblcells = document.getElementById("tblcells"),
		row = tblcells.rows[0].cloneNode(true),
		rowi = tbody.appendChild(row)

	rowi.cells[OPDATE].innerHTML = thDate(date)
	rowi.cells[OPDATE].className = NAMEOFDAYABBR[(new Date(date)).getDay()]
	rowi.cells[DIAGNOSIS].style.backgroundImage = holiday(date)
	rowi.className = NAMEOFDAYFULL[(new Date(date)).getDay()]
}

// renew and decorate existing row
let fillrowdate = function (rows, i, date) {
	let tblcells = document.getElementById("tblcells"),
		rowi = rows[i]

	if (rowi.cells[OPDATE].nodeName !== "TD") {
		rowi.parentNode.replaceChild( tblcells.rows[0].cloneNode(true), rowi )
	}
	rowi.cells[OPDATE].innerHTML = thDate(date)
	rowi.cells[OPDATE].className = NAMEOFDAYABBR[(new Date(date)).getDay()]
	rowi.cells[DIAGNOSIS].style.backgroundImage = holiday(date)
	rowi.className = NAMEOFDAYFULL[(new Date(date)).getDay()]
}

// Delete data in an existing row
let fillblank = function (rowi) {
	let cells = rowi.cells

	rowi.title = ""
	cells[HN].className = ""
	cells[PATIENT].className = ""

	cells[OPROOM].innerHTML = ""
	cells[STAFFNAME].innerHTML = ""
	cells[HN].innerHTML = ""
	cells[PATIENT].innerHTML = ""
	cells[DIAGNOSIS].innerHTML = ""
	cells[TREATMENT].innerHTML = ""
	cells[CONTACT].innerHTML = ""
	cells[QN].innerHTML = ""
}

// q is a row of BOOK array
let filldata = function (q, rowi) {
	let cells = rowi.cells

	rowi.title = q.waitnum
	q.hn && isPACS && (cells[HN].className = "pacs")
	q.patient && (cells[PATIENT].className = "camera")

	cells[OPROOM].innerHTML = putRoomTime(q)
	cells[STAFFNAME].innerHTML = q.staffname
	cells[HN].innerHTML = q.hn
	cells[PATIENT].innerHTML = putNameAge(q)
	cells[DIAGNOSIS].innerHTML = q.diagnosis
	cells[TREATMENT].innerHTML = q.treatment
	cells[CONTACT].innerHTML = q.contact
	cells[QN].innerHTML = q.qn
}

let putNameAge = function (q) {
	return q.patient + (q.dob ? ("<br>อายุ " + putAgeOpdate(q.dob, q.opdate)) : "")
}

let putRoomTime = function (q) {
	return (q.oproom ? (q.oproom +"<br>"+ q.optime) : "")
}

function viewStaffqueue(staffname) {
	let todate = ISOdate(new Date()),
		consult = gv.CONSULT,
		queuetbl = document.getElementById("queuetbl")

	// delete previous queuetbl lest it accumulates
	$('#queuetbl tr').slice(1).remove()

	let staffConsults = function () {

		// No case from server
		!consult.length && consult.push({"opdate" : START})

		// render as main table, not as staff table
		viewAll(consult, table, START, todate)
	}
	let staffCases = function () {
		$.each( BOOK, function() {	// each === this
			this.staffname === staffname && this.opdate >= todate &&
				$('#tblcells tr').clone()
					.appendTo($queuetbl)
						.filldataQueue(this)
		});
	}

	// Not yet split window
	!isStaffQueueShow() && splitPane()
	$('#titlename').html(staffname)
	staffname === "Consults" ? staffConsults() : staffCases()
	$queuecontainer.scrollTop($queuetbl.height())
}

// Use existing DOM table
function reViewStaffqueue() {
	let todate = ISOdate(new Date()),
		staffname = $('#titlename').html(),
		book = BOOK,
	staffConsults = function () {
		let table = document.getElementById("queuetbl")

		// Consults table is rendered same as viewAll
		$('#queuetbl tr').slice(1).remove()
		!book.length && book.push({"opdate" : START})

		viewAll(book, table, START, todate)
	},
	staffCases = function () {
		let i = 0
		$.each( book, function(q, each) {	// each === this
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
		if (q.opdate === LARGESTDATE) {
			cells[OPDATE].className = ""
		} else {
			cells[OPDATE].className = NAMEOFDAYABBR[(new Date(q.opdate)).getDay()]
		}
		q.hn && isPACS && (cells[HN].className = "pacs")
		q.patient && (cells[PATIENT].className = "camera")
		newRowColor(this, q.opdate)
		? this.addClass("odd")
		: this.removeClass("odd")
		// clear colored row that is moved to non-color opdate

		cells[OPDATE].innerHTML = putThdate(q.opdate)
		cells[OPROOM].innerHTML = putRoomTime(q)
		cells[STAFFNAME].innerHTML = q.staffname
		cells[HN].innerHTML = q.hn
		cells[PATIENT].innerHTML = putNameAge(q)
		cells[DIAGNOSIS].innerHTML = q.diagnosis
		cells[TREATMENT].innerHTML = q.treatment
		cells[CONTACT].innerHTML = q.contact
		cells[QN].innerHTML = q.qn
	}
})

// Same date cases have same color
// In LARGESTDATE, prevdate = "" but q.opdate = LARGESTDATE
// So LARGESTDATE cases has alternate colors
let newRowColor = function ($this, opdate) {
	let prevdate = numDate($this.prev().children("td").eq(OPDATE).html()),
		prevIsOdd = ($this.prev()[0].className.indexOf("odd") !== -1),
		sameAsPrev = (opdate === prevdate)

	return	sameAsPrev ? prevIsOdd : !prevIsOdd
}

let splitPane = function () {
	let scrolledTop = document.getElementById("tblcontainer").scrollTop,
		tohead = findVisibleHead('#tbl'),
		width = screen.availWidth,
		height = screen.availHeight

	$("#queuewrapper").show()
	$("#tblwrapper").css({"float":"left", "height":"100%", "width":"50%"})
	$("#queuewrapper").css({"float":"right", "height":"100%", "width":"50%"})
	$("#closequeue").off("click").on("click", function () { closequeue() })
	initResize($("#tblwrapper"))
	$('.ui-resizable-e').css('height', $("#tbl").css("height"))

	fakeScrollAnimate("tblcontainer", "tbl", scrolledTop, tohead.offsetTop)
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

let closequeue = function closequeue() {
	let scrolledTop = document.getElementById("tblcontainer").scrollTop,
		tohead = findVisibleHead('#tbl')
	
	$("#queuewrapper").hide()
	$("#tblwrapper").css({
		"height": "100%", "width": "100%"
	})

	fakeScrollAnimate("tblcontainer", "tbl", scrolledTop, tohead.offsetTop)
}

// Both main and staff tables
let scrolltoThisCase = function(qn) {
	let onTbl = showFound("tblcontainer", "tbl", qn),
		onQueue = false
	if (isStaffQueueShow()) {
		onQueue = showFound("queuecontainer", "queuetbl", qn)
	}

	return onTbl || onQueue
}

// Scroll to specified qn case and add a border
let showFound = function (containerID, tableID, qn) {
	let rowi = $("#" + tableID + " tr:has(td)").filter( function() {
		return (this.cells[QN].innerHTML === qn);
	})[0]

	if (!rowi) {
		return false
	}

	$("#" + tableID + " tr.borderfound").removeClass("borderfound")
	$(rowi).addClass("borderfound")

	let scrolledTop = document.getElementById(containerID).scrollTop,
		offset = rowi.offsetTop,
		divheight = winHeight()

	if (containerID === "queuecontainer") {
		divheight = divheight - 100
	}

	if ((offset < scrolledTop) || (offset > (scrolledTop + divheight))) {
		do {
			rowi = rowi.previousSibling
		} while ((offset - rowi.offsetTop) < divheight / 2)

		fakeScrollAnimate(containerID, tableID, scrolledTop, rowi.offsetTop)
	}

	return true
}

// Set position (fake position) to 300 px before or after the target position
// then animate scroll to the target position
let fakeScrollAnimate = function (containerID, tableID, scrolledTop, offsetTop) {
	let $container = $('#' + containerID),
		$table = $('#' + tableID),
		pixel = (scrolledTop < offsetTop) && (offsetTop > 300) ? 300 : -300;

	if ((offsetTop + $container.height()) < $table.height()) {
		$container.scrollTop(offsetTop - pixel)
		animateScroll($container, $container.scrollTop() + pixel, 500)
	} else {
		// Stay the same at table end
		$container.scrollTop(offsetTop)
	}
}

function animateScroll($container, pixel, ms) {
	$container.animate({scrollTop: pixel}, ms);
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

function viewChangeDate(args) {
	let thisDate = args.thisDate,
		opdate = args.opdate,
		staffname = args.staffname,
		qn = args.qn
	
	reViewOneDay(opdate)
	reViewOneDay(thisDate)
							// changeDate of this staffname's case, re-render
	isStaffQueueShow() && ($('#titlename').html() === staffname) && 
		reViewStaffqueue()
	scrolltoThisCase(qn)
}

function viewDeleteCase(opdate, staffname) {
	reViewOneDay(opdate)
	if (isStaffQueueShow() && ($('#titlename').html() === staffname)) {
		reViewStaffqueue()
	}
}

function viewSaveRoomTime(opdate) {
	reViewOneDay(opdate)
	isStaffQueueShow() && reViewStaffqueue()
	clearEditcell()
}

function viewSaveContent(args) {
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
		if (isStaffQueueShow()) {

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

function viewSaveNoQN(args) {
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
		qn = Math.max.apply(Math, $.map(BOOK, function(q, i){
			return q.qn
		}))
	$row[0].title = waitnum
	$cells.eq(QN).html(qn)

	tableID === 'tbl' ? onMaintableNoQN() : onStafftableNoQN()
	return qn

	function onMaintableNoQN() {

		// Remote effect from editing on tbl to queuetbl
		// Staffqueue is showing, re-render to have new case of this staffname
		isStaffQueueShow() && (staffname === titlename) && reViewStaffqueue()
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

function viewSaveByHN(args) {
	let tableID = args.tableID,
		waitnum = args.waitnum,
		$cells = args.$cells,
		rowi = args.rowi,
		qn = args.qn

	// have waitnum = newCase, redo
	// no waitnum yes qn = existedCase
	// no waitnum = undoNew, undoExisted
	if (waitnum || (!waitnum && qn)) {
		// New case input
		if (!qn) {
			qn = Math.max.apply(Math, $.map(BOOK, function(row, i) {
					return row.qn
				}))
			qn = String(qn)
			$cells.eq(QN).html(qn)
			rowi.title = waitnum
		}

		let q = $.grep(BOOK, function(each) {
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
		$cells.eq(PATIENT).addClass("camera")
	} else {
		// argsold (passed as args by undo) has no waitnum
		$cells.eq(HN).html("")
		$cells.eq(PATIENT).html("")
		$cells.eq(DIAGNOSIS).html("")
		$cells.eq(TREATMENT).html("")
		$cells.eq(CONTACT).html("");
		$cells.eq(QN).html("");

		$cells.eq(HN).removeClass("pacs")
		$cells.eq(PATIENT).removeClass("camera")

	}

	tableID === 'tbl'

			// Remote effect from tbl to queuetbl
			// saveHN on this staffname row
		? isStaffQueueShow() && ($('#titlename').html() === staffname) && 
			reViewAnotherTableCell('queuetbl', cellindex, qn)

			// Consults cases are not shown in tbl
			// Remote effect from queuetbl to tbl
			// No need to reViewAll because new case row was already there
		: !isConsultsTbl() && reViewAnotherTableCell('tbl', cellindex, qn)

	return argsnew
}

// view corresponding cell in another table
let reViewAnotherTableCell = function (tableID, cellindex, qn) {
	let rowi = $.grep( $("#" + tableID + " tr:has(td)"), function (e) {
			return e.cells[QN].innerHTML === qn
		})[0],
		q = getBOOKrowByQN(BOOK, qn),
		cells = rowi.cells,
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

// Method to remove or just blank the row, used in main and Consults tables
let deleteRow = function ($rowi, opdate) {
	let prevDate = $rowi.prev().children("td").eq(OPDATE).html(),
		nextDate = $rowi.next().children("td").eq(OPDATE).html()

	prevDate = getOpdate(prevDate)
	nextDate = getOpdate(nextDate)

	if (prevDate === opdate
		|| nextDate === opdate
		|| $rowi.closest("tr").is(":last-child")) {
			$rowi.remove()
	} else {
		$rowi.children("td").eq(OPDATE).siblings().html("")
		$rowi.children("td").eq(HN).removeClass("pacs")
		$rowi.children("td").eq(PATIENT).removeClass("camera")
	}
}

// Make box dialog dialogAll containing alltbl
function viewAllCases(response) {
	let book = JSON.parse(response),
		start = book[0].opdate,
		k = findStartRowInBOOK(book, LARGESTDATE),
		//Stop row in book
		until = book[k-1].opdate,
		alltbl = document.getElementById("alltbl")

	// Delete all rows except first
	alltbl.querySelector("tbody").innerHTML = alltbl.rows[0].outerHTML;

	viewAll(book, alltbl, start, until)

	let $dialogAll = $("#dialogAll")
	$dialogAll.css("height", 0)
	$dialogAll.dialog({
		title: "All Cases",
		closeOnEscape: true,
		modal: true,
		hide: 200,
		width: window.innerWidth * 95 / 100,
		height: window.innerHeight * 95 / 100,
		close: function() {
			$(window).off("resize")
		}
	})

	//scroll to today
	let today = thDate(ISOdate(new Date())),
		thishead = $("#alltbl tr:contains(" + today + ")")[0]
	$('#dialogAll').animate({
		scrollTop: thishead.offsetTop
	}, 300);
	$('#dialogAll .pacs').off("click").on("click", function() {
			PACS(this.innerHTML)
	})
	$('#dialogAll .camera').off("click").on("click", function() {
		let patient = this.innerHTML,
			hn = $(this).prev().html()

		hn && uploadWindow(hn, patient)
	})

	// for resizing dialogs in landscape / portrait view
	$(window).resize(function() {
		$dialogAll.dialog({
			width: winWidth() * 95 / 100,
			height: winHeight() * 95 / 100
		})
	})
}

// Make box dialog dialogHistory containing historytbl
function viewCaseHistory(rowi, response) {
	let tracing	= JSON.parse(response)
	
	// delete previous table lest it accumulates
	$('#historytbl tr').slice(1).remove()

	$.each( tracing, function() {
		$('#historycells tr').clone()
			.appendTo($('#historytbl tbody'))
				.filldataHistory(this)
	});

	let $dialogHistory = $("#dialogHistory")
	$dialogHistory.css("height", 0)
	$dialogHistory.dialog({
		title: rowi.cells[HN].innerHTML +' '+ rowi.cells[PATIENT].innerHTML,
		closeOnEscape: true,
		modal: true,
		hide: 200,
		width: winWidth() * 95 / 100,
		height: winHeight() * 95 / 100,
		close: function() {
			$(window).off("resize")
			$("#fixheader").remove()
		}
	})
	$("#historytbl").fixMe($("#dialogHistory"));

	// for resizing dialogs in landscape / portrait view
	$(window).resize(function() {
		$dialogHistory.dialog({
			width: winWidth() * 95 / 100,
			height: winHeight() * 95 / 100
		})
		winResizeFix($("#historytbl"), $dialogHistory)
	})
}

jQuery.fn.extend({
	filldataHistory : function(q) {
		let cells = this[0].cells

		// Define colors for deleted and undeleted rows
		q.action === 'delete'
		? this.css("background-color", "#FFCCCC")
		: (q.action === 'undelete') && this.css("background-color", "#CCFFCC")

		cells[0].innerHTML = q.editdatetime
		cells[1].innerHTML = putThdate(q.opdate)
		cells[2].innerHTML = putRoomTime(q)
		cells[3].innerHTML = q.staffname
		cells[4].innerHTML = q.diagnosis
		cells[5].innerHTML = q.treatment
		cells[6].innerHTML = q.admission
		cells[7].innerHTML = q.final
		cells[8].innerHTML = showEquip(q.equipment)
		cells[9].innerHTML = q.contact
		cells[10].innerHTML = q.editor
	}
})

// Add all equipments in one string to show in 1 cell
let showEquip = function (equipString) {
	let equipHistory = equipString && JSON.parse(equipString),
		equipstr = function() {
			let equip = ""
			$.each( equipHistory, function(key, value) {
				if (value === "checked") {
					let itemname = $('#' + key).closest('div').prop("title")
					equip += (equip && ", ") + (itemname + ":" + key)
				} else {
					equip += (equip && ", ") + (key + ":" + value)
				}
			})
			return equip
		}
	return equipString && equipstr()
}

// Make dialog box dialogDeleted containing historytbl
function viewDeletedCases(response) {
	let deleted = JSON.parse(response)
	
	// delete previous table lest it accumulates
	$('#deletedtbl tr').slice(1).remove()

	$.each( deleted, function() {
		$('#deletedcells tr').clone()
			.appendTo($('#deletedtbl tbody'))
				.filldataDeleted(this)
	});

	let $dialogDeleted = $("#dialogDeleted")
	$dialogDeleted.css("height", 0)
	$dialogDeleted.dialog({
		title: "All Deleted Cases",
		closeOnEscape: true,
		modal: true,
		hide: 200,
		width: winWidth() * 95 / 100,
		height: winHeight() * 95 / 100,
		close: function() {
			$(window).off("resize")
			$("#fixheader").remove()
		}
	})
	$("#deletedtbl").fixMe($("#dialogDeleted"));

	let $undelete = $("#undelete")
	$undelete.off("click").on("click", function () { closeUndel() }).hide()
	$(".undelete").off("click").on("click", function () {
		reposition($undelete, "left center", "left center", this)
		$("#undel").data("case", this)
	})

	// for resizing dialogs in landscape / portrait view
	$(window).resize(function() {
		$dialogDeleted.dialog({
			width: winWidth() * 95 / 100,
			height: winHeight() * 95 / 100
		})
		winResizeFix($("#deletedtbl"))
	})
}

jQuery.fn.extend({
	filldataDeleted : function(q) {
		let cells = this[0].cells

		cells[0].className = "undelete"
		cells[0].innerHTML = q.editdatetime
		cells[1].innerHTML = putThdate(q.opdate)
		cells[2].innerHTML = q.staffname
		cells[3].innerHTML = q.hn
		cells[4].innerHTML = q.patient
		cells[5].innerHTML = q.diagnosis
		cells[6].innerHTML = q.treatment
		cells[7].innerHTML = q.contact
		cells[8].innerHTML = q.editor
		cells[9].innerHTML = q.qn
		cells[9].style.display = "none"
	}
})

function viewUndelete(opdate, staffname, qn) {
	reViewOneDay(opdate)
	if (isStaffQueueShow() && 
		(($('#titlename').html() === staffname) || isConsultsTbl())) {
		reViewStaffqueue()
	}
	scrolltoThisCase(qn)
}

let closeUndel = function () {
	$('#undelete').hide()
}

function viewFind (response, hn) {
	let found = JSON.parse(response),
		findrow = scrolltoThisCase(found[0].qn)

	// Scroll to the first found case
	// Dialog box shows not found on screen or more than 1 case
	if (!findrow || (found.length > 1)) {
		makeDialogFind(found, hn )
	}
}

// Make dialog box dialogFind containing historytbl
let makeDialogFind = function (found, hn) {
	
	// delete previous table lest it accumulates
	$('#findtbl tr').slice(1).remove()

	$.each( found, function() {	// each === this
		$('#findcells tr').clone()
			.appendTo($('#findtbl tbody'))
				.filldataFind(this)
	});

	let $dialogFind = $("#dialogFind")
	$dialogFind.css("height", 0)
	$dialogFind.dialog({
		title: "HN " + hn,
		closeOnEscape: true,
		modal: true,
		hide: 200,
		width: winWidth() * 95 / 100,
		height: winHeight() * 95 / 100,
		buttons: [],
		close: function() {
			$(window).off("resize")
			$("#fixheader").remove()
		}
	})
	$("#findtbl").fixMe($("#dialogFind"));
	$('#dialogFind .pacs').off("click").on("click", function() {
			PACS(this.innerHTML)
	})
	$('#dialogFind .camera').off("click").on("click", function() {
		let patient = this.innerHTML
		let hn = $(this).prev().html()

		hn && uploadWindow(hn, patient)
	})

	// for resizing dialogs in landscape / portrait view
	$(window).resize(function() {
		$dialogFind.dialog({
			width: winWidth() * 95 / 100,
			height: winHeight() * 95 / 100
		})
		winResizeFix($("#findtbl"))
	})
}

jQuery.fn.extend({
	filldataFind : function(q) {
		let cells = this[0].cells

		!q.waitnum && this.css("background-color", "#FFCCCC")
		q.hn && isPACS && (cells[2].className = "pacs")
		q.patient && (cells[3].className = "camera")

		cells[0].innerHTML = putThdate(q.opdate)
		cells[1].innerHTML = q.staffname
		cells[2].innerHTML = q.hn
		cells[3].innerHTML = q.patient
		cells[4].innerHTML = q.diagnosis
		cells[5].innerHTML = q.treatment
		cells[6].innerHTML = q.contact
		cells[7].innerHTML = q.editor
	}
})

function viewSortable(argv) {
	let receiver = argv.receiver,
		oldOpdate = argv.oldOpdate,
		thisOpdate = argv.thisOpdate,
		titlename = argv.titlename,
		staffname = argv.staffname,

	dropOnTbl = function () {
		reViewOneDay(oldOpdate)
		reViewOneDay(thisOpdate)
		isStaffQueueShow() && (titlename === staffname) &&
			reViewStaffqueue()
			// dragging inside tbl of this staff's case
	},
	dropOnStaff = function () {
		reViewStaffqueue()
		reViewOneDay(oldOpdate)
		reViewOneDay(thisOpdate)
	}

	receiver === "tbl" ? dropOnTbl() : dropOnStaff()
}

function viewIdling() {
	if ($('#dialogService').hasClass('ui-dialog-content')
		&& $('#dialogService').dialog('isOpen')) {

		reViewService()
	}

	reViewAll()
	isStaffQueueShow() && reViewStaffqueue()
}

function viewLatestEntry(latestCase) {

	// delete previous table lest it accumulates
	$('#latesttbl tr').slice(1).remove()
	$.each( latestCase, function() {	// each === this
		$('#latestcells tr').clone()
			.appendTo($('#latesttbl tbody'))
				.filldataLatest(this)
	});

	let $dialogLatestEntry = $("#dialogLatestEntry")
	$dialogLatestEntry.css("height", 0)
	$dialogLatestEntry.dialog({
		title: "THE Latest Entry Case",
		closeOnEscape: true,
		modal: true,
		hide: 200,
		width: winWidth() * 95 / 100,
		height: winHeight() * 70 / 100
	})
}

jQuery.fn.extend({
	filldataLatest : function(q) {
		let cells = this[0].cells

		cells[0].innerHTML = putThdate(q.opdate)
		cells[1].innerHTML = q.staffname
		cells[2].innerHTML = q.hn
		cells[3].innerHTML = q.patient
		cells[4].innerHTML = q.diagnosis
		cells[5].innerHTML = q.treatment
		cells[6].innerHTML = q.contact
		cells[7].innerHTML = q.admission
		cells[8].innerHTML = q.final
	}
})

// Find first row in the book that have same or later date than start date
let findStartRowInBOOK = function (book, opdate) {
	let q = 0
	while ((q < book.length) && (book[q].opdate < opdate)) {
		q++
	}
	return (q < book.length) ? q : -1
}

let isStaffQueueShow = function() {  
	return $("#queuewrapper").css('display') === 'block';
}

function isConsultsTbl() {  
	return $('#titlename').html() === "Consults"
}

let holiday = function (date) {
	// Buddhist holiday and compensation for religious day on weekend
	let Buddhist = {
		"2018-03-01" : "url('css/pic/Magha.jpg')",
		"2018-05-09" : "url('css/pic/Ploughing.jpg')",
		"2018-05-29" : "url('css/pic/Vesak.jpg')",
		"2018-07-27" : "url('css/pic/Asalha.jpg')",
		"2018-07-28" : "url('css/pic/Vassa.jpg')"		// delete trailing comma
//		"2019-02-19" : "url('css/pic/Magha.jpg')",
//		"2019-05-13" : "url('css/pic/Ploughing.jpg')",
//		"2019-05-18" : "url('css/pic/Vesak.jpg')",
//		"2019-05-20" : "url('css/pic/Vesaksub.jpg')",
//		"2019-07-16" : "url('css/pic/Asalha.jpg')",
//		"2019-07-17" : "url('css/pic/Vassa.jpg')",
//		"2020-02-08" : "url('css/pic/Magha.jpg')",
//		"2020-02-10" : "url('css/pic/Maghasub.jpg')",	// หยุดชดเชยวันมาฆบูชา
//		"2020-05-06" : "url('css/pic/Vesak.jpg')",
//		"2020-05-13" : "url('css/pic/Ploughing.jpg')",
//		"2020-07-04" : "url('css/pic/Asalha.jpg')",
//		"2020-07-05" : "url('css/pic/Vassa.jpg')",
//		"2020-07-06" : "url('css/pic/Asalhasub.jpg')",	// หยุดชดเชยวันอาสาฬหบูชา
//		"2020-07-07" : "url('css/pic/Vassasub.jpg')",
//		"2021-02-25" : "url('css/pic/Magha.jpg')",
//		"2021-05-13" : "url('css/pic/Ploughing.jpg')",
//		"2021-05-25" : "url('css/pic/Vesak.jpg')",
//		"2021-07-23" : "url('css/pic/Asalha.jpg')",
//		"2021-07-24" : "url('css/pic/Vassa.jpg')",
//		"2021-07-26" : "url('css/pic/Vassasub.jpg')",	// หยุดชดเชยวันเข้าพรรษา
//		"2022-02-15" : "url('css/pic/Magha.jpg')",		// วันมาฆบูชา
//		"2022-05-13" : "url('css/pic/Ploughing.jpg')",	// วันพืชมงคล
//		"2022-05-14" : "url('css/pic/Vesak.jpg')",		// วันวิสาขบูชา
//		"2022-05-16" : "url('css/pic/Vesaksub.jpg')",	// หยุดชดเชยวันวิสาขบูชา
//		"2022-07-12" : "url('css/pic/Asalha.jpg')",		// วันอาสาฬหบูชา
//		"2022-07-13" : "url('css/pic/Vassa.jpg')",		// วันเข้าพรรษา
//		"2023-03-05" : "url('css/pic/Magha.jpg')",
//		"2023-03-06" : "url('css/pic/Maghasub.jpg')",
//		"2023-05-13" : "url('css/pic/Ploughing.jpg')",	// วันพืชมงคล???
//		"2023-06-02" : "url('css/pic/Vesak.jpg')",
//		"2023-07-31" : "url('css/pic/Asalha.jpg')",
//		"2023-08-01" : "url('css/pic/Vassa.jpg')",
//		"2024-02-24" : "url('css/pic/Magha.jpg')",
//		"2024-05-13" : "url('css/pic/Ploughing.jpg')",	// วันพืชมงคล???
//		"2024-05-22" : "url('css/pic/Vesak.jpg')",
//		"2024-07-20" : "url('css/pic/Asalha.jpg')",
//		"2024-07-21" : "url('css/pic/Vassa.jpg')",
//		"2024-07-22" : "url('css/pic/Asalhasub.jpg')",
//		"2024-07-23" : "url('css/pic/Vassasub.jpg')",
//		"2025-02-12" : "url('css/pic/Magha.jpg')",
//		"2025-05-11" : "url('css/pic/Vesak.jpg')",
//		"2025-05-12" : "url('css/pic/Vesaksub.jpg')",
//		"2025-05-13" : "url('css/pic/Ploughing.jpg')",	// วันพืชมงคล???
//		"2025-07-10" : "url('css/pic/Asalha.jpg')",
//		"2025-07-11" : "url('css/pic/Vassa.jpg')",
//		"2026-03-03" : "url('css/pic/Magha.jpg')",
//		"2026-05-13" : "url('css/pic/Ploughing.jpg')",	// วันพืชมงคล???
//		"2026-05-31" : "url('css/pic/Vesak.jpg')",
//		"2026-06-01" : "url('css/pic/Vesaksub.jpg')",
//		"2026-07-29" : "url('css/pic/Asalha.jpg')",
//		"2026-07-30" : "url('css/pic/Vassa.jpg')",
//		"2027-02-21" : "url('css/pic/Magha.jpg')",
//		"2027-02-22" : "url('css/pic/Maghasub.jpg')",
//		"2027-05-13" : "url('css/pic/Ploughing.jpg')",	// วันพืชมงคล???
//		"2027-05-20" : "url('css/pic/Vesak.jpg')",
//		"2027-07-18" : "url('css/pic/Asalha.jpg')",
//		"2027-07-19" : "url('css/pic/Vassa.jpg')",
//		"2027-07-20" : "url('css/pic/Asalhasub.jpg')"
	}

	let monthdate = date.substring(5),
		dayofweek = (new Date(date)).getDay(),
		Mon = dayofweek === 1,
		Tue = dayofweek === 2,
		Wed = dayofweek === 3,

	// Thai official holiday & Compensation
	Thai = {
		"12-31": () => geturl("Yearend"),
		"01-01": () => geturl("Newyear"),
		"01-02": () => (Mon || Tue) && geturl("Yearendsub"),
		"01-03": () => (Mon || Tue) && geturl("Newyearsub"),
		"04-06": () => geturl("Chakri"),
		"04-07": () => Mon && geturl("Chakrisub"),
		"04-08": () => Mon && geturl("Chakrisub"),
		"04-13": () => geturl("Songkran"),
		"04-14": () => geturl("Songkran"),
		"04-15": () => geturl("Songkran"),
		"04-16": () => (Mon || Tue || Wed) && geturl("Songkransub"),
		"04-17": () => (Mon || Tue || Wed) && geturl("Songkransub"),
		"07-28": () => geturl("King10"),
		"07-29": () => Mon && geturl("King10sub"),
		"07-30": () => Mon && geturl("King10sub"),
		"08-12": () => geturl("Queen"),
		"08-13": () => Mon && geturl("Queensub"),
		"08-14": () => Mon && geturl("Queensub"),
		"10-13": () => geturl("King09"),
		"10-14": () => Mon && geturl("King09sub"),
		"10-15": () => Mon && geturl("King09sub"),
		"10-23": () => geturl("Piya"),
		"10-24": () => Mon && geturl("Piyasub"),
		"10-25": () => Mon && geturl("Piyasub"),
		"12-05": () => geturl("King9"),
		"12-06": () => Mon && geturl("Kingsub"),
		"12-07": () => Mon && geturl("Kingsub"),
		"12-10": () => geturl("Constitution"),
		"12-11": () => Mon && geturl("Constitutionsub"),
		"12-12": () => Mon && geturl("Constitutionsub")
	},
	geturl = (dayname) => "url('css/pic/" + dayname + ".jpg')"

	return Buddhist[date] || Thai[monthdate] && Thai[monthdate]()
}
