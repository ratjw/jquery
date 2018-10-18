
// const
const THAIMONTH		= ["มค.", "กพ.", "มีค.", "เมย.", "พค.", "มิย.", "กค.", "สค.", "กย.", "ตค.", "พย.", "ธค."];

import {
	OPDATE, STAFFNAME, HN, PATIENT, DIAGNOSIS, TREATMENT, CONTACT, QN,
	BOOK, CONSULT, LARGESTDATE
} from "./control.js"

import { isConsultsTbl } from "./view.js"

export {
	getBOOKrowByQN, ISOdate, thDate,
	numDate, nextdays, getOpdate, putThdate, putAgeOpdate, calculateWaitnum,
	URIcomponent, Alert, winWidth, winHeight, UndoManager
}
 
// Javascript Date Object to MySQL date (ISOdate 2014-05-11)
function ISOdate(date) {
	if (!date) { return date }

	let mm = date.getMonth() + 1,
		dd = date.getDate();

	return [date.getFullYear(),
			(mm < 10) ? "0" + mm : "" + mm,
			(dd < 10) ? "0" + dd : "" + dd
			].join("-")
} 

// ISOdate (2014-05-11) to Thai date (11 พค. 2557) 
function thDate(opdate) {
	if (!opdate) { return opdate }

	// LARGESTDATE (9999-12-31)
	if (String(opdate) > "9999") { return "" }

	let date = opdate.split("-"),
		yyyy = Number(date[0]) + 543,
		mm = THAIMONTH[Number(date[1]) - 1]

	return [
		date[2],
		THAIMONTH[Number(date[1]) - 1],
		Number(date[0]) + 543
	].join(" ")
}

// Thai date (11 พค. 2557) to ISOdate (2014-05-11)
function numDate(opdate) {
	if (!opdate) { return "" }

	let date = opdate.split(" "),
		mm = THAIMONTH.indexOf(date[1]) + 1

    return [
		Number(date[2]) - 543,
		(mm < 10 ? '0' : '') + mm,
		date[0]
	].join("-")
} 

// Date Object or ISOdate to be added or substracted by days
// Result in ISOdate (2014-05-11)
function nextdays(date, days) {
	if (!date) { return date }

	let next = new Date(date);
		next.setDate(next.getDate() + days);

	return ISOdate(next);
}

// change Thai date from table to ISO date
function getOpdate (date) {
	// Undefined date will be taken care by numDate
	return (String(date) === "") ? LARGESTDATE : numDate(date)
}

// change date in book to show on table taking care of LARGESTDATE
function putThdate (date) {
	if (!date) { return date }

	return (String(date) === LARGESTDATE) ? "" : thDate(date)
}

function putAgeOpdate(dob, date)
{
	return (!date || !dob) ? "" : getAge(dob, date)
}

// Calculate age at (toDate) (iso format) from birth date
function getAge (birth, toDate) {
	// with LARGESTDATE as today
	if (!birth) { return "" }

	birth = new Date(birth);
	let today = (toDate === LARGESTDATE) ? new Date() : new Date(toDate),

		ayear = today.getFullYear(),
		amonth = today.getMonth(),
		adate = today.getDate(),
		byear = birth.getFullYear(),
		bmonth = birth.getMonth(),
		bdate = birth.getDate(),

		days = adate - bdate,
		months = amonth - bmonth,
		years = ayear - byear;
	if (days < 0)
	{
		months -= 1
		days = new Date(byear, bmonth+1, 0).getDate() + days;
	}
	if (months < 0)
	{
		years -= 1
		months += 12
	}

	let ageyears = years ? years + Math.floor(months / 6)  + " ปี " : "",
		agemonths = months ? months + Math.floor(days / 15)  + " ด." : "",
		agedays = days ? days + " ว." : "";

	return years ? ageyears : months ? agemonths : agedays;
}

// thisOpdate was set by caller
// queue within each day is sorted by waitnum only, not staffname
function calculateWaitnum(tableID, $thisrow, thisOpdate) {
	let defaultWaitnum = (ConsultsTbl(tableID)) ? -1 : 1,
		prevWaitnum = $thisrow.prev()[0],
		nextWaitnum = $thisrow.next()[0]
	prevWaitnum = prevWaitnum && Number(prevWaitnum.title)
	nextWaitnum = nextWaitnum && Number(nextWaitnum.title)
	let $prevRowCell = $thisrow.prev().children("td"),
		$nextRowCell = $thisrow.next().children("td"),
		prevOpdate = getOpdate($prevRowCell.eq(OPDATE).html()),
		nextOpdate = getOpdate($nextRowCell.eq(OPDATE).html())
	// Consults cases have negative waitnum

	return (prevOpdate !== thisOpdate && thisOpdate !== nextOpdate)
			? defaultWaitnum
			: (prevOpdate === thisOpdate && thisOpdate !== nextOpdate)
			? prevWaitnum + defaultWaitnum
			: (prevOpdate !== thisOpdate && thisOpdate === nextOpdate)
			? nextWaitnum ? nextWaitnum / 2 : defaultWaitnum
			: (prevWaitnum + nextWaitnum) / 2
				// (prevOpdate === thisOpdate && thisOpdate === nextOpdate)
}

// necessary when passing to http, not when export to excel
function URIcomponent(qoute) {
	qoute = qoute && qoute.replace(/\s+$/,'')
							   .replace(/\"/g, "&#34;")
							   .replace(/\'/g, "&#39;")
							   .replace(/\\/g, "\\\\")
	return encodeURIComponent(qoute)
}

function getMaxQN(book)
{
	var qn = Math.max.apply(Math, $.map(book, function(row, i) {
			return row.qn
		}))
	return String(qn)
}

function getBOOKrowByQN(book, qn) {  
	return ( $.grep( book, function (e) { return e.qn === qn } ) )[0]
}

function getTableRowByQN(tableID, qn)
{
	return $("#" + tableID + " tr:has(td)").filter(function() {
		return this.cells[QN].innerHTML === qn
	})[0]
}

function getWaitingBOOKrowByHN(hn)
{  
	var	todate = new Date().ISOdate()

	return $.grep(gv.BOOK, function(bookq) {
		return bookq.opdate > todate && bookq.hn === hn
	})
}

function getWaitingTableRowByHN(hn)
{
	var	todate = new Date().ISOdate()

	return $("#tbl tr:has(td)").filter(function() {
		return this.cells[OPDATE].innerHTML.numDate() > todate
			&& this.cells[HN].innerHTML === hn
	})
}

// main table (#tbl) only
function getTableRowsByDate(opdateth)
{
	if (!opdateth) { return [] }
	return $("#tbl tr").filter(function() {
		return this.cells[OPDATE].innerHTML === opdateth;
	})
}

function getBOOKrowsByDate(book, opdate)
{
	return book.filter(function(row) {
		return (row.opdate === opdate);
	})
}

function findStartRowInBOOK(book, opdate)
{
	var q = 0
	while ((q < book.length) && (book[q].opdate < opdate)) {
		q++
	}
	return (q < book.length)? q : -1
}

function findLastDateInBOOK(book)
{
	var q = 0
	while ((q < book.length) && (book[q].opdate < LARGESTDATE)) {
		q++
	}
	return book[q-1].opdate
}

// main table (#tbl) only
function sameDateRoomTableQN(opdateth, room)
{
	if (!room) { return [] }

	var sameRoom = $('#tbl tr').filter(function() {
		return this.cells[OPDATE].innerHTML === opdateth
			&& this.cells[OPROOM].innerHTML === room;
	})
	$.each(sameRoom, function(i) {
		sameRoom[i] = this.cells[QN].innerHTML
	})
	return $.makeArray(sameRoom)
}

function sameDateRoomBookQN(book, opdate, room)
{
	if (!room) { return [] }

	var sameRoom = book.filter(function(row) {
		return row.opdate === opdate && Number(row.oproom) === Number(room);
	})
	$.each(sameRoom, function(i) {
		sameRoom[i] = this.qn
	})
	return sameRoom
}

// for main table (#tbl) only
function createThisdateTableRow(opdate, opdateth)
{
	if (opdate === LARGESTDATE) { return null }
	var rows = getTableRowsByDate(opdate.nextdays(-1).thDate()),
		$row = $(rows[rows.length-1]),
		$thisrow = $row && $row.clone().insertAfter($row)

	$thisrow && $thisrow.find("td").eq(OPDATE).html(opdateth)

	return $thisrow
}

function isSplited()
{  
	return $("#queuewrapper").css("display") === "block"
}

function isStaffname(staffname)
{  
	return $('#titlename').html() === staffname
}

function isConsults()
{  
	return $('#titlename').html() === "Consults"
}

function ConsultsTbl(tableID)
{  
	var queuetbl = tableID === "queuetbl"
	var consult = $("#titlename").html() === "Consults"

	return queuetbl && consult
}

// Make dialog box dialogAlert containing error message
function Alert(title, message) {
	let $dialogAlert = $("#dialogAlert")

	$dialogAlert.css({
		"fontSize":" 14px",
		"textAlign" : "center"
	})
	$dialogAlert.html(message)
	$dialogAlert.dialog({
		title: title,
		closeOnEscape: true,
		modal: true,
		hide: 200,
		minWidth: 400,
		height: 230
	}).fadeIn();
}

function winWidth() {
	return window.innerWidth
}

function winHeight(container) {
	return window.innerHeight
}

let UndoManager = (function () {

	let commands = [],
		index = -1,
		limit = 0,
		isExecuting = false,
		callback,
		
		// functions
		execute;

	execute = function(command, action) {
		if (!command || typeof command[action] !== "function") {
			return this;
		}
		isExecuting = true;

		command[action]();

		isExecuting = false;
		return this;
	};

	return {

		// Add a command to the queue.
		add: function (command) {
			if (isExecuting) {
				return this;
			}
			// if we are here after having called undo,
			// invalidate items higher on the stack
			commands.splice(index + 1, commands.length - index);

			commands.push(command);
			
			// if limit is set, remove items from the start
			if (limit && commands.length > limit) {
				removeFromTo(commands, 0, -(limit+1));
			}
			
			// set the current index to the end
			index = commands.length - 1;
			if (callback) {
				callback();
			}
			return this;
		},

		// Pass a function to be called on undo and redo actions.
		setCallback: function (callbackFunc) {
			callback = callbackFunc;
		},

		// Perform undo: call the undo function at the current index
		// and decrease the index by 1.
		undo: function () {
			let command = commands[index];
			if (!command) {
				return this;
			}
			execute(command, "undo");
			index -= 1;
			if (callback) {
				callback();
			}
			return this;
		},

		// Perform redo: call the redo function at the next index
		// and increase the index by 1.
		redo: function () {
			let command = commands[index + 1];
			if (!command) {
				return this;
			}
			execute(command, "redo");
			index += 1;
			if (callback) {
				callback();
			}
			return this;
		},

		// Clears the memory, losing all stored states. Reset the index.
		clear: function () {
			let prev_size = commands.length;

			commands = [];
			index = -1;

			if (callback && (prev_size > 0)) {
				callback();
			}
		},

		hasUndo: function () {
			return index !== -1;
		},

		hasRedo: function () {
			return index < (commands.length - 1);
		},

		getIndex: function() {
			return index;
		}
	};
})();
