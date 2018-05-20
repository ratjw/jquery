function clicktable(evt, clickedCell)
{
	savePreviousCell()
	storePresentCell(evt, clickedCell)
}

function keyin(evt, keycode, pointing)
{
	var EDITABLE = [HN, DIAGNOSIS, TREATMENT, CONTACT];
	var thiscell

	if (keycode === 27)	{
		$('#menu').hide();
		$('#stafflist').hide();
		clearEditcell()
		window.focus()
		evt.preventDefault()
		return false
	}
	if (keycode === 9) {
		$('#menu').hide();
		$('#stafflist').hide();
		savePreviousCell()
		if (evt.shiftKey) {
			thiscell = findPrevcell(evt, EDITABLE, pointing)
			if ((thiscell.cellIndex === HN) && (thiscell.innerHTML !== "")) {
				thiscell = findPrevcell(evt, EDITABLE, $(thiscell))
			}
		} else {
			thiscell = findNextcell(evt, EDITABLE, pointing)
			if ((thiscell.cellIndex === HN) && (thiscell.innerHTML !== "")) {
				thiscell = findNextcell(evt, EDITABLE, $(thiscell))
			}
		}
		if (thiscell) {
			storePresentCell(evt, thiscell)
		} else {
			clearEditcell()
			window.focus()
		}
		evt.preventDefault()
		return false
	}
	if (keycode === 13) {
		$('#menu').hide();
		$('#stafflist').hide();
		if (evt.shiftKey || evt.ctrlKey) {
			return
		}
		savePreviousCell()
		thiscell = findNextRow(evt, EDITABLE, pointing)
		if ((thiscell.cellIndex === HN) && (thiscell.innerHTML !== "")) {
			thiscell = findNextcell(evt, EDITABLE, $(thiscell))
		}
		if (thiscell) {
			storePresentCell(evt, thiscell)
		} else {
			clearEditcell()
			window.focus()
		}
		evt.preventDefault()
		return false
	}
	// no keyin on date
	if (pointing.cellIndex === 0) {
		evt.preventDefault()
		return false
	}
}

function savePreviousCell() 
{
	var $editcell = $("#editcell"),
		oldcontent = $editcell.data("oldcontent"),
		newcontent = getText($editcell),
		pointed = $editcell.data("pointing"),
		column = pointed && pointed.cellIndex

	if (column === ROOM) {
		newcontent = newcontent + $("#spin").val()
	}
	if (column === CASENUM) {
		var num = $("#spin").val(),
			time = $("#time").val(),
			dec = Number(time)

		if (time){
			if (isNaN(dec) || dec < 0 || dec > 24) {
				Alert("เวลาผ่าตัด", "<br>รูปแบบเวลา ไม่ถูกต้อง<br><br>ใช้<br><br>ตั้งแต่ 00.00 - 08.30 - 09.00 ถึง 24.00")
				time = ""
			} else {
				time = decimalToTime(time)
			}
		}

		newcontent = num + (time ? ("<br>" + time) : "")
	}

	if (!pointed || (oldcontent === newcontent)) {
		return false
	}

	switch(column)
	{
		case OPDATE:
			return false
		case ROOM:
			return saveRoom(pointed, newcontent)
		case CASENUM:
			return saveCaseNum(pointed, oldcontent, num, time)
		case STAFFNAME:
			return false
		case HN:
			return saveHN(pointed, newcontent)
		case NAME:
			return false
		case DIAGNOSIS:
			return saveContent(pointed, "diagnosis", newcontent)
		case TREATMENT:
			return saveContent(pointed, "treatment", newcontent)
		case CONTACT:
			return saveContent(pointed, "contact", newcontent)
	}
}

function saveRoom(pointed, newcontent)
{
	var tableID = $(pointed).closest("table").attr("id"),
		$row = $(pointed).closest("tr"),
		$cell = $row.find("td"),
		opdateth = $cell[OPDATE].innerHTML,
		opdate = getOpdate(opdateth),
		oproom = $cell[ROOM].innerHTML,
		casenum = $cell[CASENUM].innerHTML,
		qn = $cell[QN].innerHTML,
		allSameDate = allOldCases = allNewCases = [],
		index,
		sql = ""

	if (oproom) {
		allOldCases = sameDateRoomTableQN(opdateth, oproom)
		index = allOldCases.indexOf(qn)
		allOldCases.splice(index, 1)

		for (var i=0; i<allOldCases.length; i++) {
			sql += sqlCaseNum(i + 1, allOldCases[i])
		}

		if (newcontent === "0") {
			sql += sqlNewRoom(null, null, qn)
		}
	}

	if (newcontent !== "0") {
		allNewCases = sameDateRoomTableQN(opdateth, newcontent)
		if (casenum) {
			allNewCases.splice(casenum-1, 0, qn)
		} else {
			allNewCases.push(qn)
		}

		for (var i=0; i<allNewCases.length; i++) {
			if (allNewCases[i] === qn) {
				sql += sqlNewRoom(newcontent, i + 1, qn)
			} else {
				sql += sqlCaseNum(i + 1, allNewCases[i])
			}
		}
	}

	// no oproom, no newcontent
	if (!sql) { return false }
	sql = "sqlReturnbook=" + sql

	Ajax(MYSQLIPHP, sql, callbackSaveRoom)

	return true

	function callbackSaveRoom(response)
	{
		if (/BOOK/.test(response)) {
			updateBOOK(response)
			refillOneDay(opdate)
			if (isSplited() && (isStaffname(staffname) || isConsults())) {
				refillstaffqueue()
			}
			// re-render editcell for keyin cell only
			var newpoint = $('#editcell').data("pointing")
			if (newpoint.cellIndex > NAME) {
				createEditcell(newpoint)
			}
		} else {
			Alert ("saveRoom", response)
		}
		clearEditcell()
	}
}

function sqlNewRoom(oproom, casenum, qn)
{
	return "UPDATE book SET "
		+  "oproom=" + oproom
		+  ",casenum=" + casenum
		+  ",editor='" + gv.user
		+  "' WHERE qn="+ qn + ";"
}

function saveCaseNum(pointed, oldcontent, num, time)
{
	var $cells = $(pointed).closest("tr").find("td"),
		opdateth = $cells[OPDATE].innerHTML,
		opdate = getOpdate(opdateth),
		oproom = $cells[ROOM].innerHTML,
		qn = $cells[QN].innerHTML,
		numtime = oldcontent.split("<br>"),
		oldnum = numtime[0],
		oldtime = numtime[1],
		index,
		sql = "sqlReturnbook="

	if (oldnum !== num) {
		// must have oproom, if no, can't be clicked
		allCases = sameDateRoomTableQN(opdateth, oproom)
		index = allCases.indexOf(qn)
		allCases.splice(index, 1)
		allCases.splice(num - 1, 0, qn)

		for (var i=0; i<allCases.length; i++) {
			if (allCases[i] === qn) {
				sql += sqlCaseNum(num, qn)
			} else {
				sql += sqlCaseNum(i + 1, allCases[i])
			}
		}
	}
	if (oldtime !== time) {
		sql += "UPDATE book SET "
			+  "optime='" + time
			+  "',editor='" + gv.user
			+  "' WHERE qn="+ qn + ";"		
	}

	Ajax(MYSQLIPHP, sql, callbackCaseNum)

	return true

	function callbackCaseNum(response)
	{
		if (/BOOK/.test(response)) {
			updateBOOK(response)
			refillOneDay(opdate)
			if (isSplited() && (isStaffname(staffname) || isConsults())) {
				refillstaffqueue()
			}
			// re-render editcell for keyin cell only
			var newpoint = $('#editcell').data("pointing")
			if (newpoint.cellIndex > NAME) {
				createEditcell(newpoint)
			}
		} else {
			Alert ("saveCaseNum", response)
		}
		clearEditcell()
	}
}

// use only "pointed" to save data
function saveContent(pointed, column, content)
{
	var qn = $(pointed).siblings("td").last().html()

	// just for show instantly
	pointed.innerHTML = content

	// take care of white space, double qoute, single qoute, and back slash
	if (/\W/.test(content)) {
		content = URIcomponent(content)
	}

	if (qn) {
		saveContentQN(pointed, column, content)
	} else {
		saveContentNoQN(pointed, column, content)
	}
	return true
}

function saveContentQN(pointed, column, content)
{
	var	cellindex = pointed.cellIndex,
		tableID = $(pointed).closest("table").attr("id"),
		$row = $(pointed).closest('tr'),
		$cells = $row.children("td"),
		opdateth = $cells[OPDATE].innerHTML,
		opdate = getOpdate(opdateth),
		oproom = $cells[ROOM].innerHTML,
		casenum = $cells[CASENUM].innerHTML,
		staffname = $cells[STAFFNAME].innerHTML,
		qn = $cells[QN].innerHTML,
		oldcontent = $("#editcell").data("oldcontent"),
		titlename = $('#titlename').html(),

		sql = "sqlReturnbook=UPDATE book SET "
		+ column + "='" + content
		+ "',editor='"+ gv.user
		+ "' WHERE qn="+ qn +";"

	Ajax(MYSQLIPHP, sql, callbacksaveContentQN);

	function callbacksaveContentQN(response)
	{
		if (/BOOK/.test(response)) {
			updateBOOK(response)
			if ((column === "oproom") ||
				(column === "casenum")) {
				refillOneDay(opdate)
				refillstaffqueue()
			}
			if (tableID === 'tbl') {
				// Remote effect from editing on main table to queuetbl
				// 1. if staffname that match titlename gets involved
				//    (either change to or from this staffname)
				//    -> refill queuetbl
				// 2. make change to the row which match titlename
				//    (input is not staffname, but on staff that match titlename)
				//    -> refill corresponding cell in another table
				if (isSplited()) {
					if ((oldcontent === titlename) || (pointed.innerHTML === titlename)) {
						refillstaffqueue()
					} else {
						if (titlename === staffname) {
							refillAnotherTableCell('queuetbl', cellindex, qn)
						}
					}
				}
			} else {
				// tableID === 'queuetbl'
				// staffname has been changed, refill staff table
				if (column === "staffname") {
					refillstaffqueue()
				}
				// Remote effect from editing on queuetbl to main table
				// -> refill corresponding cell
				// consults are not apparent on main table, no remote effect
				if (!isConsults()) {
					refillAnotherTableCell('tbl', cellindex, qn)
				}
			}
			// re-render editcell for keyin cell only
			var newpoint = $('#editcell').data("pointing")
			if (newpoint.cellIndex > NAME) {
				createEditcell(newpoint)
			}
		} else {
			Alert("saveContentQN", response)
			pointed.innerHTML = oldcontent
			// return to previous content
		}
	}
}

function saveContentNoQN(pointed, column, content)
{
	var	cellindex = pointed.cellIndex,
		tableID = $(pointed).closest("table").attr("id"),
		$row = $(pointed).closest('tr'),
		$cells = $row.children("td"),
		opdateth = $cells[OPDATE].innerHTML,
		opdate = getOpdate(opdateth),
		staffname = $cells[STAFFNAME].innerHTML,
		qn = $cells[QN].innerHTML,
		oldcontent = $("#editcell").data("oldcontent"),
		titlename = $('#titlename').html(),
		sql1 = "",
		sql2 = "",
		sql,

		// new case, calculate waitnum
		waitnum = calcWaitnum(opdateth, $row.prev(), $row.next())
	// store waitnum in row title
	$row[0].title = waitnum

	if ((tableID === "queuetbl") && (column !== "staffname")) {
		sql1 = "staffname, "
		sql2 = staffname + "','"
	}

	sql = "sqlReturnbook=INSERT INTO book ("
			+ "waitnum, opdate, " + sql1 + column + ", editor) VALUES ("
			+ waitnum + ",'" + opdate +"','"
			+ sql2 + content +"','"+ gv.user + "');"

	Ajax(MYSQLIPHP, sql, callbacksaveContentNoQN);

	function callbacksaveContentNoQN(response)
	{
		if (/BOOK/.test(response)) {
			updateBOOK(response)

			// find and fill qn of new case input in that row, either tbl or queuetbl
			var book = (ConsultsTbl(tableID))? gv.CONSULT : gv.BOOK
			var qn = Math.max.apply(Math, $.map(book, function(bookq, i){
						return bookq.qn
					}))
			$cells[QN].innerHTML = qn

			if (tableID === 'tbl') {
				// delete staffoncall
				if (/(<([^>]+)>)/i.test(staffname)) { $cells[STAFFNAME].innerHTML = "" }
				// Remote effect from editing on tbl to queuetbl if Staffqueue is showing
				// Create new case of staffname that match titlename -> refill queuetbl
				if (isSplited()) {
					if (pointed.innerHTML === titlename) {
						refillstaffqueue()
					}
				}
			} else {
				// tableID === 'queuetbl'
				// staffname has been changed, refill staff table
				if (column === "staffname") {
					refillstaffqueue()
				}
				// Remote effect to main table -> add new case to main table
				// (not just refill corresponding cell)
				// consults are not apparent on main table, no remote effect
				if (!isConsults()) {
					refillOneDay(opdate)
				}
			}
		} else {
			Alert("saveContentNoQN", response)
			pointed.innerHTML = oldcontent
			// return to previous content
		}
	}
}

function saveHN(pointed, content)
{
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
	var	wanting = $.extend({}, waiting)
		tableID = $(pointed).closest("table").attr("id"),
		$row = $(pointed).closest('tr'),
		$cells = $row.children("td"),
		opdateth = $cells[OPDATE].innerHTML,
		opdate = getOpdate(opdateth),
		staffname = $cells[STAFFNAME].innerHTML,
		diagnosis = $cells[DIAGNOSIS].innerHTML,
		treatment = $cells[TREATMENT].innerHTML,
		contact = $cells[CONTACT].innerHTML,
		qn = $cells[QN].innerHTML,
		noqn = !qn,

		hn = waiting.hn,
		patient = waiting.patient,
		dob = waiting.dob,

		oldcontent = $("#editcell").data("oldcontent"),
		sql = "sqlReturnbook=",

		$dialogMoveCase = $("#dialogMoveCase"),
		$movetbl = $("#movetbl"),
		$movefrom = $("#movefrom").next(),
		$moveto = $("#moveto").next(),
		tblcells = $("#tblcells tr").html()

	// not use staffoncall in patient's data
	if (/(<([^>]+)>)/i.test(staffname)) { staffname = "" }
	wanting.opdate = opdate
	wanting.patient = patient
	wanting.dob = dob
	if (staffname) { wanting.staffname = staffname }
	if (diagnosis) { wanting.diagnosis = diagnosis }
	if (treatment) { wanting.treatment = treatment }
	if (contact) { wanting.contact = contact }

	$movefrom.html(tblcells).filldataWaiting(waiting)
	$moveto.html(tblcells).filldataWaiting(wanting)

	$dialogMoveCase.dialog({
		title: "เคสซ้ำ",
		closeOnEscape: true,
		modal: true,
		autoResize: true,
		show: 200,
		hide: 200,
		width: window.innerWidth * 95 / 100,
		buttons: [
			{
				text: "ย้ายมา ลบเคสเดิมออก",
				class: "moveButton",
				click: function() {
					moveCaseHN()
				}
			},
			{
				text: "ก็อปปี้มา คงเคสเดิม",
				class: "copyButton",
				click: function() {
					copyCaseHN()
				}
			},
			{
				text: "ยกเลิก ไม่ทำอะไร",
				click: function() {
					$dialogMoveCase.dialog("close")
				}
			}
		],
		close: function() {
			clearEditcell()
		}
	})

	function moveCaseHN()
	{
		sql += "UPDATE book SET deleted=1"
			+ ",editor='" + gv.user
			+ "' WHERE qn=" + waiting.qn + ";"
			+ sqlCaseHN()

		Ajax(MYSQLIPHP, sql, callbackmoveCaseHN)

		$dialogMoveCase.dialog("close")

		function callbackmoveCaseHN(response)
		{
			if (/BOOK/.test(response)) {
				updateBOOK(response)

				fillCellsHN(tableID, qn, $cells)

				if (tableID === 'tbl') {
					refillOneDay(waiting.opdate)
					refillstaffqueue()
				} else {
					refillall()
					refillstaffqueue()
				}
			} else {
				Alert("saveCaseHN", response)
				pointed.innerHTML = oldcontent
				// unsuccessful entry
			}
		}
	}

	function copyCaseHN()
	{
		sql += sqlCaseHN()

		Ajax(MYSQLIPHP, sql, callbackcopyCaseHN)

		$dialogMoveCase.dialog("close")

		function callbackcopyCaseHN(response)
		{
			if (/BOOK/.test(response)) {
				updateBOOK(response)

				fillCellsHN(tableID, qn, $cells)

				if (tableID === 'tbl') {
					refillstaffqueue()
				} else {
					refillall()
				}
			} else {
				Alert("saveCaseHN", response)
				pointed.innerHTML = oldcontent
				// unsuccessful entry
			}
		}
	}

	function sqlCaseHN()
	{
		if (noqn) {
			return sqlInsertHN()
		} else {
			return sqlUpdateHN()
		}
	}

	function sqlInsertHN()
	{
		// new row, calculate waitnum
		// store waitnum in row title
		var waitnum = calcWaitnum(opdateth, $row.prev(), $row.next())
		$row[0].title = waitnum
		return "INSERT INTO book ("
			+ "waitnum,opdate,hn,patient,dob,"
			+ "staffname,diagnosis,treatment,contact,editor) "
			+ "VALUES (" + waitnum
			+ ",'" + opdate
			+ "','" + hn
			+ "','" + patient
			+ "','" + dob
			+ "','" + wanting.staffname
			+ "','" + URIcomponent(wanting.diagnosis)
			+ "','" + URIcomponent(wanting.treatment)
			+ "','" + URIcomponent(wanting.contact)
			+ "','" + gv.user
			+ "');"
	}

	function sqlUpdateHN()
	{
		return "UPDATE book SET "
			+ "hn='" + hn
			+ "',patient='" + patient
			+ "',dob='" + dob
			+ "',staffname='" + wanting.staffname
			+ "',diagnosis='" + URIcomponent(wanting.diagnosis)
			+ "',treatment='" + URIcomponent(wanting.treatment)
			+ "',contact='" + URIcomponent(wanting.contact)
			+ "',editor='" + gv.user
			+ "' WHERE qn=" + qn
			+ ";"
	}
}

function fillCellsHN(tableID, qn, $cells)
{
	var	book = (ConsultsTbl(tableID)) ? gv.CONSULT : gv.BOOK,
		bookq

	// New case input
	if (noqn) {
		qn = getMaxQN(book)
		$cells[QN].innerHTML = qn
	}

	bookq = getBOOKrowByQN(book, qn)

	if (gv.isPACS) { $cells[HN].className = "pacs" }
	$cells[NAME].className = "camera"
	if (bookq.treatment) { $cells[TREATMENT].className = "equip" }

	$cells[STAFFNAME].innerHTML = bookq.staffname
	$cells[HN].innerHTML = bookq.hn
	$cells[NAME].innerHTML = putNameAge(bookq)
	$cells[DIAGNOSIS].innerHTML = bookq.diagnosis
	$cells[TREATMENT].innerHTML = bookq.treatment
	$cells[CONTACT].innerHTML = bookq.contact
}

jQuery.fn.extend({
	filldataWaiting : function(bookq) {
		var	$cells = this.find("td")

		this[0].className = dayName(NAMEOFDAYFULL, bookq.opdate) || "lightAqua"
		$cells[OPDATE].className = dayName(NAMEOFDAYABBR, bookq.opdate)

		$cells[OPDATE].innerHTML = putThdate(bookq.opdate)
		$cells[STAFFNAME].innerHTML = bookq.staffname
		$cells[HN].innerHTML = bookq.hn
		$cells[NAME].innerHTML = putNameAge(bookq)
		$cells[DIAGNOSIS].innerHTML = bookq.diagnosis
		$cells[TREATMENT].innerHTML = bookq.treatment
		$cells[CONTACT].innerHTML = bookq.contact
		$cells[QN].innerHTML = bookq.qn
	}
})

function getNameHN(pointed, content)
{
	var tableID = $(pointed).closest("table").attr("id"),
		$row = $(pointed).closest('tr'),
		$cells = $row.children("td"),
		cellindex = pointed.cellIndex,
		opdateth = $cells[OPDATE].innerHTML,
		opdate = getOpdate(opdateth),
		staffname = $cells[STAFFNAME].innerHTML,
		diagnosis = $cells[DIAGNOSIS].innerHTML,
		treatment = $cells[TREATMENT].innerHTML,
		contact = $cells[CONTACT].innerHTML,
		qn = $cells[QN].innerHTML,
		noqn = !qn,
		oldcontent = $("#editcell").data("oldcontent"),
		waitnum = 0,
		sql = ""

	// if new case, calculate waitnum
	// store waitnum in row title
	if (noqn) {
		waitnum = calcWaitnum(opdateth, $row.prev(), $row.next())
		$row[0].title = waitnum	
	}
	sql = "hn=" + content
		+ "&waitnum="+ waitnum
		+ "&opdate="+ opdate
		+ "&staffname=" + staffname
		+ "&diagnosis=" + diagnosis
		+ "&treatment=" + treatment
		+ "&contact=" + contact
		+ "&qn=" + qn
		+ "&editor=" + gv.user

	Ajax(GETNAMEHN, sql, callbackgetNameHN)

	return true

	function callbackgetNameHN(response)
	{
		if (/BOOK/.test(response)) {
			updateBOOK(response)

			var book = (ConsultsTbl(tableID)) ? gv.CONSULT : gv.BOOK

			// New case input
			if (noqn) {
				qn = getMaxQN(book)
				$cells[QN].innerHTML = qn
			}

			var bookq = getBOOKrowByQN(book, qn)

			if (gv.isPACS) { $cells[HN].className = "pacs" }
			$cells[NAME].className = "camera"

			// prevent showing null
			$cells[STAFFNAME].innerHTML = bookq.staffname
			$cells[HN].innerHTML = bookq.hn
			$cells[NAME].innerHTML = putNameAge(bookq)
			$cells[DIAGNOSIS].innerHTML = bookq.diagnosis
			$cells[TREATMENT].innerHTML = bookq.treatment
			$cells[CONTACT].innerHTML = bookq.contact

			// Both cases remote effect -> refill corresponding cell
			// no need to refillall main table because new case row was already there
			// Consults cases are not shown in main table
			if (tableID === 'tbl') {
				if (isSplited() && isStaffname(staffname)) {
					refillAnotherTableCell('queuetbl', cellindex, qn)
				}
			} else {
				if (!isConsults()) {
					if (noqn) {
						refillall()
					} else {
						refillAnotherTableCell('tbl', cellindex, qn)
					}
				}
			}
			// re-render editcell for keyin cell only
			var newpoint = $('#editcell').data("pointing")
			if (newpoint.cellIndex > NAME) {
				createEditcell(newpoint)
			}
		} else {
			Alert("getNameHN", response)
			pointed.innerHTML = oldcontent
			// unsuccessful entry
		}
	}
}

function refillAnotherTableCell(tableID, cellindex, qn)
{
	// No consults cases involved
	var book = gv.BOOK
	var bookq = getBOOKrowByQN(book, qn)
	var row = getTableRowByQN(tableID, qn)

	if (!bookq || !row) {
		return
	}

	var cells = row.cells

	switch(cellindex)
	{
		case ROOM:
			cells[ROOM].innerHTML = bookq.oproom || ""
			break
		case CASENUM:
			cells[CASENUM].innerHTML = putCasenumTime(bookq)
			break
		case STAFFNAME:
			cells[STAFFNAME].innerHTML = bookq.staffname
			break
		case HN:
			cells[HN].innerHTML = bookq.hn
			cells[NAME].innerHTML = putNameAge(bookq)
			break
		case DIAGNOSIS:
			cells[DIAGNOSIS].innerHTML = bookq.diagnosis
			break
		case TREATMENT:
			cells[TREATMENT].innerHTML = bookq.treatment
			break
		case CONTACT:
			cells[CONTACT].innerHTML = bookq.contact
			break
	}
}

function storePresentCell(evt, pointing)
{
	switch(pointing.cellIndex)
	{
		case OPDATE:
			getOPDATE(pointing)
			break
		case ROOM:
			getROOM(pointing)
			break
		case CASENUM:
			getCASENUM(pointing)
			break
		case STAFFNAME:
			getSTAFFNAME(pointing)
			break
		case HN:
			getHN(evt, pointing)
			break
		case NAME:
			getNAME(evt, pointing)
			break
		case DIAGNOSIS:
			createEditcell(pointing)
			break
		case TREATMENT:
			getEquip(evt, pointing)
			break
		case CONTACT:
			createEditcell(pointing)
			break
	}
}

function getOPDATE(pointing)
{
	createEditcellOpdate(pointing)
	mainMenu(pointing)
}

function getROOM(pointing)
{
	var ORROOM = "4",
		val = pointing.innerHTML || ORROOM,
		$editcell = $("#editcell"),
		room = "",
		html = '<input id="spin" readonly>'

	// no case
	if ( !$(pointing).siblings(":last").html() ) { return }

	createEditcell(pointing)
	if ($editcell.css("height") < "60px") {
		$editcell.css("height", 60)
	}
	$editcell.css("width", 55)
	$editcell.html(html)

	var	$spin = $("#spin")
	$spin.val(val)
	$spin.spinner({
		min: 0,
		max: 99,
		step: 1,
		spin: function( event, ui ) {
			room = ui.value || ""
		},
		stop: function( event, ui ) {
			$spin.val(room)
			room = ""	
		}
	});
	clearTimeout(gv.timer)
}

function getCASENUM(pointing)
{
	var CASENUM	= "1",
		val = pointing.innerHTML || CASENUM,
		numtime = val.split("<br>"),
		num = numtime[0],
		time = numtime[1],
		ortime = "",
		$editcell = $("#editcell"),
		html = '<input id="spin" readonly><input id="time" readonly>'

	if ( !$(pointing).prev().html() ) { return }

	if (val.indexOf("<br>") === -1) {
		num = val
		time = ""
	}

	createEditcell(pointing)
	if ($editcell.css("height") < "65px") {
		$editcell.css("height", 65)
	}
	$editcell.css("width", 70)
	$editcell.html(html)

	var	$spin = $("#spin")
	$spin.val(num)
	$spin.spinner({
		min: 1,
		max: 99,
		step: 1
	});

	$time = $("#time")
	$time.val(time)
	$time.spinner({
		min: 00,
		max: 24,
		step: 0.5,
		create: function( event, ui ) {
			$time.val(time)
		},
		spin: function( event, ui ) {
			ortime = decimalToTime(ui.value)
		},
		stop: function( event, ui ) {
			$time.val(ortime)
			ortime = ""	
		}
	})
	clearTimeout(gv.timer)
}

function getSTAFFNAME(pointing)
{
	var $stafflist = $("#stafflist"),
		$pointing = $(pointing)

	createEditcell(pointing)
	$stafflist.appendTo($pointing.closest('div'))

	$stafflist.menu({
		select: function( event, ui ) {
			saveContent(pointing, "staffname", ui.item.text())
			clearEditcell()
			$stafflist.hide()
			event.stopPropagation()
		}
	});

	// reposition from main menu to determine shadow
	reposition($stafflist, "left top", "left bottom", $pointing)
	menustyle($stafflist, $pointing)

	// repeat to make it show on first click in queuetbl
	reposition($stafflist, "left top", "left bottom", $pointing)
}

function getHN(evt, pointing)
{
	if (pointing.innerHTML) {
		clearEditcell()
		if (gv.isPACS) {
			if (inPicArea(evt, pointing)) {
				PACS(pointing.innerHTML)
			}
		}
	} else {
		createEditcell(pointing)
	}
}

function getNAME(evt, pointing)
{
	var hn = $(pointing).closest('tr').children("td")[HN].innerHTML
	var patient = pointing.innerHTML

	if (inPicArea(evt, pointing)) {
		showUpload(hn, patient)
	}
	clearEditcell()
}

function getEquip(evt, pointing)
{
	if (inPicArea(evt, pointing)) {
		var tableID = $(pointing).closest('table').attr('id'),
			book = ConsultsTbl(tableID)? gv.CONSULT : gv.BOOK,
			$row = $(pointing).closest('tr'),
			qn = $row.find("td")[QN].innerHTML
		fillEquipTable(book, $row, qn)
	} else {
		createEditcell(pointing)
	}
}

function createEditcellOpdate(pointing)
{
	var $editcell = $("#editcell")
	var $pointing = $(pointing)
	var height = $pointing.height() + "px"
	var width = $pointing.width() + "px"
	var context = ""

	// to show Thai name of day in editcell div
	if (pointing.innerHTML) {
		context = window.getComputedStyle(pointing,':before').content
		context = context.replace(/\"/g, "")
		context = context + pointing.innerHTML
	}
	$editcell.html(context)
	editcellData($editcell, pointing, context)
	showEditcell($editcell, $pointing, height, width)
}

function createEditcell(pointing)
{
	var $editcell = $("#editcell")
	var $pointing = $(pointing)
	var height = $pointing.height() + "px"
	var width = $pointing.width() + "px"
	var context = getText($pointing).replace(/Consult.*$/, "")

	editcellData($editcell, pointing, context)
	$editcell.html(context)
	showEditcell($editcell, $pointing, height, width)
}

function editcellData($editcell, pointing, context)
{
	$editcell.data("pointing", pointing)
	$editcell.data("oldcontent", context)
}

function showEditcell($editcell, $pointing, height, width)
{
	$editcell.css({
		height: height,
		width: width,
		fontSize: $pointing.css("fontSize")
	})
	$editcell.appendTo($pointing.closest('div'))
	reposition($editcell, "left center", "left center", $pointing)
	$editcell.focus()
}

function reposition($me, mypos, atpos, $target, within)
{
	$me.position({
		my: mypos,
		at: atpos,
		of: $target,
		within: within
	}).show()
	$me.position({
		my: mypos,
		at: atpos,
		of: $target,
		within: within
	}).show()
}	// Don't know why have to repeat 2 times

function clearEditcell()
{
	var $editcell = $("#editcell")
	$editcell.data("pointing", "")
	$editcell.data("oldcontent", "")
	$editcell.html("")
	$editcell.hide()
}
 
function getText($cell)
{
	var HTMLTRIM		= /^(\s*<[^>]*>)*\s*|\s*(<[^>]*>\s*)*$/g
	var HTMLNOTBR		= /(<((?!br)[^>]+)>)/ig

	return $cell.length && $cell.html()
							.replace(HTMLTRIM, '')
							.replace(HTMLNOTBR, '')
}
