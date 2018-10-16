
export const
	STAFF = [
		"อ.เอก",
		"อ.อัตถพร", 
		"อ.สรยุทธ", 
		"อ.วัฒนา", 
		"อ.เกรียงศักดิ์", 
		"อ.พีรพงศ์"
	],

	// tbl, queuetbl
	OPDATE		= 0,
	OPROOM		= 1,
	CASENUM		= 2,
	STAFFNAME	= 3,
	HN			= 4,
	PATIENT		= 5,
	DIAGNOSIS	= 6,
	TREATMENT	= 7,
	CONTACT		= 8,
	QN			= 9,

	LARGESTDATE	= "9999-12-31",

	// At this moment I can't check PACS (always unauthorized 401 with Firefox)
	isPACS = localStorage.getItem("isPACS") === "true",

	// get 1st of last month, the first date of main table
	START = ISOdate(new Date(new Date().getFullYear(), new Date().getMonth()-1, 1))

// End const

// BOOK is data array for main table and staff table
// CONSULT is data array for Consults table (special staff table)
export let
	BOOK = [],
	CONSULT = []

// timestamp is the last time access from this client to the server
// timer is ID of setTimeout
// idleCounter is number of cycles of idle setTimeout
let timestamp = "",
	timer = 0,
	idleCounter = 0

import {
	createEditcellOpdate, createEditcellRoomtime, getPointer, getOldcontent,
	getNewcontent, updateEditcellData, createEditcell, clearEditcell, reposition
} from "./edit.js"

import { clearMouseoverTR, mainMenu, menustyle } from "./menu.js"
import { sortable } from "./sort.js"
import { savePreviousCellService } from "./serv.js"

import {
	modelStart, modelIdling, modelSyncServer, modelFindLatestEntry,
	modelSaveRoomTime, modelSaveContent, modelSaveNoQN, modelSaveByHN
} from "./model.js"

import {
	getOpdate, ISOdate, thDate, 
	calculateWaitnum, URIcomponent, Alert, UndoManager
} from "./util.js"

import {
	viewAll, viewLatestEntry, viewIdling, viewSaveRoomTime, viewSaveContent,
	viewSaveNoQN, viewSaveByHN, animateScroll
} from "./view.js"

// Public functions
export {
	savePreviousCell, editPresentCell,
	PACS, uploadWindow, userStaff, updateBOOK, resetTimer
}

// function declaration (definition ) : public
// function expression (literal) : local

// For staff & residents with login id / password from Get_staff_detail
function userStaff() {
	modelStart().then(response => {
		if (/BOOK/.test(response)) {
			success(response)
		} else {
			failed(response)
		}
	}).catch(error => {})

	document.oncontextmenu = () => false
}

// Success return from server
function success(response) {
	updateBOOK(response)

	// call sortable before render, otherwise it renders very slowly
	sortable()
	makeStart()
	setStafflist()
	resetTimer(true, true)

	$("#wrapper").on("click", function (event) {
		resetTimer(true, true);
		$(".borderfound").removeClass("borderfound")
		event.stopPropagation()
		let	target = event.target,
			clickOutside = function (id) {
				if (($(id).is(":visible")) && (!$(target).closest(id).length)) {
					$(id).hide();
					clearEditcell()
				}
			}

		// clickOutside these 3 pop-ups to close
		clickOutside("#menu")
		clickOutside("#stafflist")
		clickOutside("#undelete")

		if (target.nodeName !== "TD") {
			clearEditcell()
			if (target.nodeName === "TH") {
				if (target.cellIndex === 0) {
					UndoManager.undo()
				}
				else if (target.cellIndex === 1) {
					UndoManager.redo()
				}
			}
			return	
		}
		// Both main and staff tables (same wrapper)
		clicktable(event.target)
	})

	// ctrl+shift+Home to see last entries of local and server
	$(window).on("keydown", function (event) {
		let	keycode = event.which || window.event.keyCode,
			home = keycode === 36,
			y = keycode === 89,
			z = keycode === 90

		if (home && event.ctrlKey && event.shiftKey) {
			// Merge data to server
			latestEntry()
			event.preventDefault()
		}
		else if (y && event.ctrlKey) {
			UndoManager.redo()
			event.preventDefault()
		}
		else if (z && event.ctrlKey) {
			UndoManager.undo()
			event.preventDefault()
		}
	})
}

// Failed return from server, use localStorage, no editing
// --- unfinished coding - sync local to server ***
function failed(response) {
	let title = "Server Error",
		error = error + "<br><br>Response from server has no data",

	// no data from server, load from localStorage
		local = localStorage.getItem('ALLBOOK')
	if (/BOOK/.test(local)) {
		let temp = JSON.parse(local)
		BOOK = temp.BOOK ? temp.BOOK : []
		CONSULT = temp.CONSULT ? temp.CONSULT : []

		makeStart()
		Alert(title, error + "<br><br>Use localStorage instead<br><br>Read Only mode")

		// add 7 days to QTIME in localStorage so that it will not be
		// overrided with backward data after access with failed server
		let date = new Date().setDate(new Date().getDate() + 7),
			mm = date.getMonth() + 1,
			dd = date.getDate()
		date = [date.getFullYear(),
				(mm < 10) ? "0" + mm : "" + mm,
				(dd < 10) ? "0" + dd : "" + dd
				].join("-")
		localStorage.setItem('localQTIME', date)
	} else {
		Alert(title, error + "No localStorage backup")
	}
}

// Display everyday on main table 1 month back, and 2 years ahead
let makeStart = function() {		
	// Start with 1st date of last month
	let	tableID = "tbl",
		table = document.getElementById(tableID),
		book = BOOK

	// No case from server
	if (book.length === 0) {
		book.push({"opdate" : START})
	}

	// Fill until 2 year from now
	let	nextyear = new Date().getFullYear() + 2,
		month = new Date().getMonth(),
		todate = new Date().getDate(),
		until = ISOdate((new Date(nextyear, month, todate)))

	viewAll(book, table, START, until)

	// scroll to today
	let	today = thDate(ISOdate(new Date())),
		thishead = $("tr:contains(" + today + ")")[0]

	animateScroll($('#tblcontainer'), thishead.offsetTop, 300)
}

let setStafflist = function () {
	let	stafflist = '',		// For enter name in Staff column
		staffmenu = ''		// For sub-menu in Opdate column
	for (let each = 0; each < STAFF.length; each++)
	{
		stafflist += '<li><div>' + STAFF[each] + '</div></li>'
		staffmenu += '<li id="staffqueue"><div>' + STAFF[each] + '</div></li>'
	}
	staffmenu += '<li id="staffqueue"><div>Consults</div></li>'
	document.getElementById("stafflist").innerHTML = stafflist
	document.getElementById("staffmenu").innerHTML = staffmenu
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
let idling = function () {

	modelIdling(timestamp).then(response => {
		idleCounter += 1

		// not being editing on screen (idling) 1 minute, clear editing setup
		if (idleCounter === 5) {
			clearMenu()
			clearEditcell()
			clearMouseoverTR()
		} else {
			// idling 10 minutes, logout
			if (idleCounter > 59) {
				window.location = window.location.href
			}
		}

		if (/BOOK/.test(response)) {

			// some changes in database from other users (while this is idling)
			updateBOOK(response)
			viewIdling()

			// To sync data of editcell with underlying table cell
			$("#editcell").is(":visible") && updateEditcellData()
		}
	}).catch(error => {})
}

// Save data got from server
// Two main data for tables and a timestamp
function updateBOOK(response) {
	let temp = JSON.parse(response)

	BOOK = temp.BOOK ? temp.BOOK : []
	CONSULT = temp.CONSULT ? temp.CONSULT : []
	timestamp = temp.QTIME

	// save updated data to override localStorage
	// but not within 7 days after previous failed server
	// timestamp was added 7 days when accessed with failed server
	let localQTIME = localStorage.getItem('localQTIME')
	if (localQTIME < timestamp) {
		localStorage.setItem('ALLBOOK', response)
		localStorage.setItem('localQTIME', timestamp)
	}
}

// timer is just an id number, not the clock object
// poke server every 10 sec.
// set === reset time out
// idle === reset idleCounter
function resetTimer(set, idle) {
	clearTimeout(timer)
	set && (timer = setTimeout( updating, 10000))
	idle && (idleCounter = 0)
}

let clearMenu = function() {
	$('#menu').hide();
	$('#stafflist').hide();
}

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

		;/BOOK/.test(response)
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
}
/* Mysql file length
SELECT 
table_name AS `Table`, 
round(((data_length + index_length) / 1024 / 1024), 2) `Size in MB` 
FROM information_schema.TABLES 
WHERE table_schema = "neurosurgery"
AND table_name = "bookhistory";
*/

// Click on main or staff table
function clicktable(clickedCell) {
	savePreviousCell()
	editPresentCell(clickedCell)
}

// Return true/false for function onChange()
function savePreviousCell() {
	let pointed = getPointer(),
		oldcontent = getOldcontent(),
		newcontent = getNewcontent(),
		cell = pointed && pointed.cellIndex,
		save = {}

	save[OPDATE] = false
	save[OPROOM] = function () {
		saveOpRoom(pointed, newcontent)
		return true	
	}
	save[STAFFNAME] = false
	save[HN] = function () {
		if (newcontent.length === 7) {
			saveHN(pointed, "hn", newcontent)
			return true
		}
		return false
	}
	save[PATIENT] = false
	save[DIAGNOSIS] = function () {
		saveContent(pointed, "diagnosis", newcontent)
		return true
	}
	save[TREATMENT] = function () {
		saveContent(pointed, "treatment", newcontent)
		return true
	}
	save[CONTACT] = function () {
		saveContent(pointed, "contact", newcontent)
		return true
	}

	return pointed && (oldcontent !== newcontent) && save[cell] && save[cell]()
}

// negative waitnum in Consults cases
let saveOpRoom = function (pointed, newcontent) {
	let tableID = $(pointed).closest("table").attr("id"),
		waitnum = (ConsultsTbl(tableID)) ? -1 : 1,
		$cells = $(pointed).closest('tr').children("td"),
		opdate = getOpdate($cells[OPDATE].innerHTML),
		oproom = $cell[OPROOM].innerHTML,
		casenum = $cell[CASENUM].innerHTML,
		qn = $cells[QN].innerHTML,
		content = newcontent && newcontent.split("<br>"),
		args = {
			waitnum: waitnum,
			opdate: opdate,
			qn: qn,
			oproom: oproom,
			optime: optime
		},
		argsold = {
			waitnum: waitnum,
			opdate: opdate,
			qn: qn,
			oproom: oldroom,
			optime: oldtime
		}
	
	doSaveRoomTime(args)

	// make undo-able
	UndoManager.add({
		undo: function() {
			doSaveRoomTime(argsold)
		},
		redo: function() {
			doSaveRoomTime(args)
		}
	})		
}

var doSaveRoomTime = function(args) {
	modelSaveRoomTime(args).then(response => {
		let hasData = function () {
			updateBOOK(response)
			viewSaveRoomTime(args.opdate)
		};

		;/BOOK/.test(response)
		? hasData()
		: Alert ("saveRoomTime", response)
	}).catch(error => {})
}

// use only "pointed" to save data
let saveContent = function (pointed, column, newcontent) {
	// take care of white space, double qoute, single qoute, and back slash
	let content = URIcomponent(newcontent),
		args = {
			pointed: pointed, 
			column: column, 
			content: content, 
			cellindex: pointed.cellIndex,
			tableID: $(pointed).closest("table").attr("id"),
			$row: $(pointed).closest('tr'),
			$cells: args.$row.children("td"),
			opdate: getOpdate(args.$cells.eq(OPDATE).html()),
			oproom: args.$cells[OPROOM].innerHTML,
			casenum: args.$cells[CASENUM].innerHTML,
			staffname: args.$cells.eq(STAFFNAME).html(),
			qn: args.$cells.eq(QN).html() || 0,
			oldcontent: getOldcontent(),
			titlename: $('#titlename').html()
		},
		// Copy object
		argsold = {}
	argsold = $.extend(argsold, args)
	argsold.content = URIcomponent(oldcontent)
	argsold.newcontent = oldcontent
	argsold.oldcontent = newcontent

	qn ? saveContentQN(args, argsold) : saveContentNoQN(args, argsold)
}

let saveContentQN = function (args, argsold) {

	saveConQN(args)

	// make undo-able
	UndoManager.add({
		undo: function() {
			saveConQN(argsold)
		},
		redo: function() {
			saveConQN(args)
		}
	})		
}

let saveConQN = function (args) {

	// transfer from editcell to table cell, no re-render
	args.pointed.innerHTML = args.newcontent

	modelSaveContent(args).then(response => {
		let hasData = function () {

			updateBOOK(response)
			viewSaveContent(args)
		},
			noData = function () {
			Alert("saveContentQN", response)
			args.pointed.innerHTML = args.oldcontent
			// return to previous content
		};

		;/BOOK/.test(response) ? hasData() : noData()
	}).catch(error => {})
}

let saveContentNoQN = function (args, argsold) {

	// new case, calculate waitnum
	args.waitnum = calculateWaitnum(args.tableID, args.$row, args.opdate)

	saveNoQN(args).then(qn => {

		// make undo-able
		UndoManager.add({
			undo: function() {
				argsold.qn = qn
				saveNoQN(argsold).then(() => {}).catch(() => {})
			},
			redo: function() {
				args.qn = qn
				saveNoQN(args).then(() => {}).catch(() => {})
			}
		})
	}	)	
}

let saveNoQN = function (args) {

	// transfer from editcell to table cell, no re-render
	args.pointed.innerHTML = args.newcontent

	return new Promise((resolve, reject) => {
		modelSaveNoQN(args).then(response => {
			let hasData = function () {
				updateBOOK(response)
				resolve(viewSaveNoQN(args))
			}
			let noData = function () {
				Alert("saveContentNoQN", response)

				// return to previous content
				args.pointed.innerHTML = args.oldcontent
				reject()
			};

			;/BOOK/.test(response) ? hasData() : noData()
		}).catch(error => { reject() })
	})
}

// Use 7 digit hn to PHP
// PHP Get_demographic_short($hn) from hospital SOAP server
// PHP finds this patient's previous data in local server
let saveHN = function (pointed, hn, content) {
	if (!/^\d{7}$/.test(content)) {
		pointed.innerHTML = ""
		return false
	}

	var	waiting = getWaitingBOOKrowByHN(content)[0]

//	pointed.innerHTML = content
	if (waiting) {
		getCaseHN(pointed, waiting)
	} else {
		getNameHN(pointed, content)
	}
}

function getCaseHN(pointed, waiting)
{
	let	argsnew = {
		tableID: $(pointed).closest("table").attr("id"),
		$row: $(pointed).closest('tr'),
		rowi: argsnew.$row[0],
		$cells: argsnew.$row.find("td"),
		opdateth: argsnew.$cells[OPDATE].innerHTML,
		opdate: getOpdate(opdateth),
		staffname: argsnew.$cells[STAFFNAME].innerHTML,
		qn: argsnew.$cells[QN].innerHTML,
		noqn: !qn,

		hn: waiting.hn,
		patient: waiting.patient,
		dob: waiting.dob,

		oldcontent: $("#editcell").data("oldcontent"),
		sql: "sqlReturnbook=",

		$dialogMoveCase: $("#dialogMoveCase"),
		$movetbl: $("#movetbl"),
		$movefrom: $("#movefrom").next(),
		$moveto: $("#moveto").next(),
		tblcells: $("#tblcells tr").html()
	},
	// Copy object
	argsold = {}
	argsold = $.extend(argsold, argsnew)
	argsold.content = ""

	!qn && (argsnew.waitnum = calculateWaitnum(tableID, $row, opdate))

	modelSaveHN(argsnew).then(argsreturn => {

		// waitnum
		//	? qnnew
		//		? redoNew()
		//		: newCase()
		//	: qn
		//		? qnnew
		//			? content
		//				? redoExisted()
		//				: undoExisted()
		//			: existedCase()
		//		: undoNew()
		UndoManager.add({
			undo: function() {
				// new case will be deleted when undo
				$.extend(argsold, argsreturn)
				modelSaveHN(argsold).then(() => {}).catch(() => {})
			},
			redo: function() {
				$.extend(argsnew, argsreturn)
				modelSaveHN(argsnew).then(() => {}).catch(() => {})
			}
		})
	}).catch(error => {})

	// To immediately show new content
//	pointed.innerHTML = content
}

let modelSaveHN = function (argsnew) {
	return new Promise((resolve, reject) => {
		modelSaveByHN(argsnew).then(response => {
			let hasData = function () {
				updateBOOK(response)
				resolve(viewSaveByHN(argsnew))
				createEditcell(getPointer())
				// after callback from Ajax, editcell have got new position
				// New case may be higher than blank cell
			},
			noData = function () {
				Alert("saveHN", response)
				// return to previous content
				pointed.innerHTML = oldcontent
				reject()
			};

			;/BOOK/.test(response) ? hasData() : noData()
		}).catch(error => { reject() })
	})
}

// Set up editcell for keyin or menu/spinner selection
// redirect click to openPACS or file upload
function editPresentCell(pointing) {
	let cell = pointing && pointing.cellIndex,
		store = {}

	store[OPDATE] = function () {
		createEditcellOpdate(pointing)
		mainMenu(pointing)
		$("#editcell").blur()
		// prevent mobile keyboard popup
	}
	store[OPROOM] = function () {
		selectRoomTime(pointing)
		createEditcellRoomtime(pointing)
	}
	store[STAFFNAME] = function () {
		createEditcell(pointing)
		stafflist(pointing)
	}
	store[HN] = function () {
		pointing.innerHTML
		? (clearEditcell(),
		   pointing.className === "pacs" && PACS(pointing.innerHTML))
		: createEditcell(pointing)
	}
	store[PATIENT] = function () {
		let hn = $(pointing).closest('tr').children("td").eq(HN).html(),
			patient = pointing.innerHTML

		clearEditcell()
		hn && uploadWindow(hn, patient)
	}
	store[DIAGNOSIS] = function () {
		createEditcell(pointing)
	}
	store[TREATMENT] = function () {
		createEditcell(pointing)
	}
	store[CONTACT] = function () {
		createEditcell(pointing)
	};

	store[cell] && store[cell]()
}

let selectRoomTime = function (pointing) {
	let ORSURG	= "XSU",
		ORNEURO	= "4",
		ORTIME	= "09.00",
		roomtime = pointing.innerHTML
	roomtime = roomtime ? roomtime.split("<br>") : ""
	let oproom = roomtime[0] ? roomtime[0] : "",
		optime = roomtime[1] ? roomtime[1] : "",
		theatre = oproom && oproom.match(/\D+/) || ORSURG,
		$editcell = $("#editcell")
	$editcell.css("height", "")
	$editcell.html(theatre)
	$editcell.append('<input id="orroom"><br><input id="ortime">')
	let $orroom = $("#orroom"),
		$ortime = $("#ortime")
	$orroom.val(oproom ? oproom.match(/\d+/)[0] : "(" + ORNEURO + ")")

	let orroom = ""
	$orroom.spinner({
		min: 1,
		max: 20,
		step: -1,
		spin: function( event, ui ) {
			if ($orroom.val() === "(" + ORNEURO + ")") {
				orroom = ORNEURO
			}
		},
		stop: function( event, ui ) {
			if (orroom) {
				$orroom.val(orroom)
				orroom = ""	
			}
		}
	})

	let ortime
	$ortime.spinner({
		min: 0,
		max: 24,
		step: -0.5,
		create: function( event, ui ) {
			$ortime.val(optime ? optime : "(" + ORTIME + ")")
		},
		spin: function( event, ui ) {
			ortime = ($ortime.val() === "(" + ORTIME + ")") ? ORTIME : decimalToTime(ui.value)
		},
		stop: function( event, ui ) {
			if (ortime) {
				$ortime.val(ortime)
				ortime = ""	
			}
		}
	})
}

// Decimal 9.5 to time 09.30
let decimalToTime = function (dec) {
	let	integer = Math.floor(dec),
		decimal = dec - integer

	return [
		(integer < 10) ? "0" + integer : "" + integer,
		decimal ? String(decimal * 60) : "00"
	].join(".")
}

// Menu on Staff column to select staff name
let stafflist = function (pointing) {
	let $stafflist = $("#stafflist"),
		width = $stafflist.outerWidth()

	$stafflist.menu({
		select: function( event, ui ) {
			let staffname = ui.item.text()
			saveContent(pointing, "staffname", staffname)
			$(pointing).html(staffname)
			clearEditcell()
			$stafflist.hide()		// to disappear after selection
			event.stopPropagation()
		}
	});

	$stafflist.appendTo($(pointing).closest('div'))
	reposition($stafflist, "left top", "left bottom", pointing)
	menustyle($stafflist, pointing, width)
	reposition($stafflist, "left top", "left bottom", pointing)
	// Repeat to make it show on first click on staff table
}

// id to be deleted and replaced by new window, used for uploadWindow only
let id

function uploadWindow(hn, patient) {
	id && !id.closed && id.close();
	id = window.open("jQuery-File-Upload/index.html", "_blank")
	id.hnName = {"hn": hn, "patient": patient}
	// hnName is a pre-defined letiable in child window (jQuery-File-Upload)
}

function PACS(hn) { 
	let pacs = 'http://synapse/explore.asp?path=/All Patients/InternalPatientUID='+hn,
		ua = window.navigator.userAgent,
		msie = ua.indexOf("MSIE"),
		edge = ua.indexOf("Edge"),
		IE = navigator.userAgent.match(/Trident.*rv\:11\./),

		// Chrome, FF send html for download and open by default browser (IE)
		// The html contains javascript to open a window with PACS url
		data_type = 'data:application/vnd.ms-internet explorer',
		openMSIE = function () {
			let html = '<!DOCTYPE html><HTML><HEAD><script>function opener(){window.open("'
					 + pacs
					 + '", "_self")}</script><body onload="opener()"></body></HEAD></HTML>',
				a = document.createElement('a');
			document.body.appendChild(a);  // You need to add this line in FF
			a.href = data_type + ', ' + encodeURIComponent(html);
			a.download = "index.html"
			a.click()
		};

	(msie > 0 || edge > 0 || IE) ? window.open(pacs) : openMSIE()
}
