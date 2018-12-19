
import {
	OPDATE, STAFFNAME, HN, PATIENT, DIAGNOSIS, TREATMENT, CONTACT, QN,
	LARGESTDATE, THAIMONTH
} from "./const.js"
import { modelIdling } from "./model.js"
import { isConsultsTbl } from "./view.js"

export {
	updateBOOK, showUpload, clearTimer, resetTimer, updating,
	getBOOKrowByQN, ISOdate, thDate, numDate, nextdays, getOpdate,
	putThdate, putAgeOpdate, calculateWaitnum, URIcomponent, Alert,
	winWidth, winHeight, menustyle, setuser, UndoManager
}

//--- global variables --------------
// BOOK is for main table and individual staff's cases table
// CONSULT is for Consults table (special table in queuetbl)
// ONCALL is for exchanging between staffs for oncall consultation
// HOLIDAY is for Buddhist holiday entry of every year
// timestamp is the last time access from this client to the server
// timer is just an id number of setTimeout, not the clock object
// idleCounter is number of cycles of idle setTimeout
// uploadWindow is to be replaced by new window, used for showUpload only
// can't check PACS (always unauthorized 401 with Firefox)
export let BOOK = [],
	CONSULT = [],
	STAFF = [],
	ONCALL = [],
	HOLIDAY = [],
	timestamp = "",
	uploadWindow = null,
	timer = 0,
	idleCounter = 0,
	isPACS = true,
	user = "",

	// get 1st of last month, the first date of main table
	START = ISOdate(new Date(new Date().getFullYear(),
			new Date().getMonth()-1, 1))

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

// from login.js
function setuser() {
	user = sessionStorage.getItem("userid")
}

// Save data got from server
// Two main data for tables (BOOK, CONSULT) and a timestamp
// QTIME = datetime of last fetching : $mysqli->query("SELECT now();")
function updateBOOK(response) {
	if (response.BOOK) { BOOK = response.BOOK }
	if (response.CONSULT) { CONSULT = response.CONSULT }
	if (response.STAFF) { STAFF = response.STAFF }
	if (response.ONCALL) { ONCALL = response.ONCALL }
	if (response.HOLIDAY) { HOLIDAY = response.HOLIDAY }
	if (response.QTIME) { timestamp = response.QTIME }
}

// hnName is a pre-defined letiable in child window (jQuery-File-Upload)
function showUpload(hn, patient) {
	uploadWindow && !uploadWindow.closed && uploadWindow.close();
	uploadWindow = window.open("jQuery-File-Upload/index.html", "_blank")
	uploadWindow.hnName = {"hn": hn, "patient": patient}
}

// poke server every 10 sec.
function clearTimer() {
	clearTimeout(timer)
}
function resetTimer() {
	clearTimer()
	timer = setTimeout( updating, 10000)
}

// While idling every 10 sec., get updated by itself and another clients
// 1. Visible editcell
// 	1.1 Editcell changed (update itself and from another client on the way)
//	1.2 Editcell not changed, check updated from another client
// 2. Not visible editcell, get update from another client
let updating = function () {
	if ($("#editcell").is(":visible") && onChange()) {
		idleCounter = 0
		updateEditcellData()
	} else {
		idling()
	}

	resetTimer(true, false)
}

// savePreviousCell and return with true (changed) or false (not changed)
let onChange = function () {
	let whereEditcell = $("#editcell").siblings("table").attr("id")

	// Service table : Main or Staffqueue tables
	return (whereEditcell === "servicetbl")
			? savePreviousCellService()
			: savePreviousCell()
}

// Check data in server changed from last loading timestamp
// if not being editing on screen (idling) 1 minute, clear editing setup
// if idling 10 minutes, logout
// if some changes in database from other users (while this user is idling),
// then sync data of editcell with underlying table cell
let idling = function () {

	modelIdling(timestamp).then(response => {
		idleCounter += 1
		if (idleCounter === 5) {
			clearMenu()
			clearEditcell()
			clearMouseoverTR()
		} else {
			if (idleCounter > 59) {
				window.location = window.location.href
			}
		}

		if (typeof response === "object") {
			updateBOOK(response)
			viewIdling()
			$("#editcell").is(":visible") && updateEditcellData()
		}
	}).catch(error => {})
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

// Shadow down when menu is below target row (high on screen)
// Shadow up when menu is higher than target row (low on screen)
let menustyle = function ($me, target, width) {
	let shadow = ($me.position().top > $(target).position().top)
					? '10px 20px 30px slategray'
					: '10px -20px 30px slategray'
	$me.css({
		width: width,
		boxShadow: shadow
	})
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
/*
// Sync data in localStorage with server
// update if timestamp > max. editdatetime
function latestEntry() {
	findLatestEntry().then((qn) => {
		let latestqn = function(anybook) {
				return $.grep(anybook, function(each) {
					return each.qn === qn
				})
			},
			local = localStorage.getItem("ALLBOOK"),
			temp = JSON.parse(local),
			localbook = temp.BOOK ? temp.BOOK : [],
			localconsult = temp.CONSULT ? temp.CONSULT : [],
			latestLocal = latestqn(localbook)[0]

		if (!latestLocal) {
			latestLocal = latestqn(localconsult)[0]
			if (!latestLocal) {
				return
			}
		}

		let	latestServer = latestqn(BOOK)[0]
		if (!latestServer) {
			latestServer = latestqn(CONSULT)[0]
			if (!latestServer) {
				return
			}
		}

		viewLatestEntry( [ latestLocal, latestServer ] )
	})

	$("#latesttbl").on("click", function (event) {
		event.stopPropagation()
		// row 0 : header
		// row 1 : local
		// row 2 : server
		if (event.target.parentNode.rowIndex === 1) {
			syncServer()
		}
		$("#dialogLatestEntry").dialog("close")
	})
}

let syncServer = function() {
	let book = JSON.stringify(BOOK),
		consult = JSON.stringify(CONSULT)

	modelSyncServer(book, consult).then(response => {
		let syncSuccess = function () {
			updateBOOK(response)
			viewIdling()

			// To sync data of editcell with underlying table cell
			$("#editcell").is(":visible") && updateEditcellData()
		}

		typeof response === "object"
		? syncSuccess()
		: Alert ("syncServer", response)
	}).catch(error => {})
}

let findLatestEntry = () => {
	return new Promise((resolve, reject) => {
		modelFindLatestEntry().then(response => {
			if (response.indexOf('"qn"') !== -1) {
				response = JSON.parse(response)
				resolve(response[0].qn)
			} else {
				Alert ("findLatestEntry", response)
				reject()
			}
		}).catch(error => {})
	})
}*/
/* Mysql file length
SELECT 
table_name AS `Table`, 
round(((data_length + index_length) / 1024 / 1024), 2) `Size in MB` 
FROM information_schema.TABLES 
WHERE table_schema = "neurosurgery"
AND table_name = "bookhistory";
*/
