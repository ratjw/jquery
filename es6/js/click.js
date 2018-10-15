function clicktable(evt, clickedCell)
{
	savePreviousCell()
	storePresentCell(evt, clickedCell)
}

function keyin(evt, keycode, pointing)
{
	var EDITABLE = [DIAGNOSIS, TREATMENT, CONTACT];
	var thiscell

	if (keycode === 9) {
		$('#stafflist').hide();
		savePreviousCell()
		if (evt.shiftKey) {
			thiscell = findPrevcell(EDITABLE, pointing)
		} else {
			thiscell = findNextcell(EDITABLE, pointing)
		}
		if (thiscell) {
			storePresentCell(evt, thiscell)
		} else {
			clearEditcell()
		}
		evt.preventDefault()
		return false
	}
	if (keycode === 13) {
		$('#stafflist').hide();
		if (evt.shiftKey || evt.ctrlKey) {
			return
		}
		savePreviousCell()
		thiscell = findNextRow(EDITABLE, pointing)
		if (thiscell) {
			storePresentCell(evt, thiscell)
		} else {
			clearEditcell()
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

	if ($("#spin").is(":visible")) {
		newcontent = $("#spin").val()
	}

	if (!pointed || (oldcontent === newcontent)) {
		return false
	}

	switch(column)
	{
		case OPDATE:
			return false
		case THEATRE:
			return saveTheatre(pointed, newcontent)
		case OPROOM:
			return saveOpRoom(pointed, newcontent)
		case OPTIME:
			return saveContent(pointed, "optime", newcontent)
		case CASENUM:
			return saveCaseNum(pointed, newcontent)
		case STAFFNAME:
			return false
		case HN:
			return saveHN(pointed, newcontent)
		case PATIENT:
			return false
		case DIAGNOSIS:
			return saveContent(pointed, "diagnosis", newcontent)
		case TREATMENT:
			return saveContent(pointed, "treatment", newcontent)
		case CONTACT:
			return saveContent(pointed, "contact", newcontent)
	}
}

function saveTheatre(pointed, newcontent)
{
	var	$cell = $(pointed).closest("tr").find("td"),
		opdateth = $cell[OPDATE].innerHTML,
		opdate = getOpdate(opdateth),
		theatre = $cell[THEATRE].innerHTML,
		oproom = $cell[OPROOM].innerHTML,
		casenum = $cell[CASENUM].innerHTML,
		qn = $cell[QN].innerHTML,
		allSameDate = allOldCases = allNewCases = [],
		index,
		sql = ""

	allOldCases = sameDateRoomTableQN(opdateth, oproom, theatre)
	index = allOldCases.indexOf(qn)
	allOldCases.splice(index, 1)

	sql += updateCasenum(allOldCases)

	allNewCases = sameDateRoomTableQN(opdateth, oproom, newcontent)
	if (casenum) {
		allNewCases.splice(casenum-1, 0, qn)
	} else {
		allNewCases.push(qn)
	}

	for (var i=0; i<allNewCases.length; i++) {
		if (allNewCases[i] === qn) {
			sql += sqlNewTheatre(newcontent, i + 1, qn)
		} else {
			sql += sqlCaseNum(i + 1, allNewCases[i])
		}
	}

	if (!sql) { return false }
	sql = "sqlReturnbook=" + sql

	Ajax(MYSQLIPHP, sql, callbackSaveRoom)

	return true

	function callbackSaveRoom(response)
	{
		if (typeof response === "object") {
			updateBOOK(response)
			refillOneDay(opdate)
			if (isSplited() && (isStaffname(staffname) || isConsults())) {
				refillstaffqueue()
			}
			// re-render editcell for keyin cell only
			var newpoint = $('#editcell').data("pointing")
			if (newpoint.cellIndex > PATIENT) {
				createEditcell(newpoint)
			}
		} else {
			Alert ("saveTheatre", response)
		}
	}
}

function sqlNewTheatre(theatre, casenum, qn)
{
	return "UPDATE book SET "
		+  "theatre='" + theatre
		+  "',casenum=" + casenum
		+  ",editor='" + gv.user
		+  "' WHERE qn="+ qn + ";"
}

function saveOpRoom(pointed, newcontent)
{
	var	$cell = $(pointed).closest("tr").find("td"),
		opdateth = $cell[OPDATE].innerHTML,
		opdate = getOpdate(opdateth),
		theatre = $cell[THEATRE].innerHTML,
		oproom = $cell[OPROOM].innerHTML,
		casenum = $cell[CASENUM].innerHTML,
		qn = $cell[QN].innerHTML,
		allSameDate = allOldCases = allNewCases = [],
		index,
		sql = ""

	if (oproom) {
		allOldCases = sameDateRoomTableQN(opdateth, oproom, theatre)
		index = allOldCases.indexOf(qn)
		allOldCases.splice(index, 1)

		sql += updateCasenum(allOldCases)

		if (newcontent === "") {
			sql += sqlNewRoom(null, null, qn)
		}
	}

	if (newcontent) {
		allNewCases = sameDateRoomTableQN(opdateth, newcontent, theatre)
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

	if (!sql) { return false }
	sql = "sqlReturnbook=" + sql

	Ajax(MYSQLIPHP, sql, callbackSaveRoom)

	return true

	function callbackSaveRoom(response)
	{
		if (typeof response === "object") {
			updateBOOK(response)
			refillOneDay(opdate)
			if (isSplited() && (isStaffname(staffname) || isConsults())) {
				refillstaffqueue()
			}
			// re-render editcell for keyin cell only
			var newpoint = $('#editcell').data("pointing")
			if (newpoint.cellIndex > PATIENT) {
				createEditcell(newpoint)
			}
		} else {
			Alert ("saveOpRoom", response)
		}
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

function saveCaseNum(pointed, newcontent)
{
	var $cells = $(pointed).closest("tr").find("td"),
		opdateth = $cells[OPDATE].innerHTML,
		opdate = getOpdate(opdateth),
		theatre = $cells[THEATRE].innerHTML,
		oproom = $cells[OPROOM].innerHTML,
		qn = $cells[QN].innerHTML,
		index,
		sql = "sqlReturnbook="

	// must have oproom, if no, can't be clicked
	allCases = sameDateRoomTableQN(opdateth, oproom, theatre)
	index = allCases.indexOf(qn)
	allCases.splice(index, 1)
	if (newcontent === "") {
		sql += sqlCaseNum(null, qn)
	} else {
		allCases.splice(newcontent - 1, 0, qn)
	}

	for (var i=0; i<allCases.length; i++) {
		if (allCases[i] === qn) {
			sql += sqlCaseNum(newcontent, qn)
		} else {
			sql += sqlCaseNum(i + 1, allCases[i])
		}
	}

	Ajax(MYSQLIPHP, sql, callbackCaseNum)

	return true

	function callbackCaseNum(response)
	{
		if (typeof response === "object") {
			updateBOOK(response)
			refillOneDay(opdate)
			if (isSplited() && (isStaffname(staffname) || isConsults())) {
				refillstaffqueue()
			}
			// re-render editcell for keyin cell only
			var newpoint = $('#editcell').data("pointing")
			if (newpoint.cellIndex > PATIENT) {
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
		oproom = $cells[OPROOM].innerHTML,
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
		if (typeof response === "object") {
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
			if (newpoint.cellIndex > PATIENT) {
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
		if (typeof response === "object") {
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
			if (typeof response === "object") {
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
			if (typeof response === "object") {
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
	if (gv.isMobile) { $cells[PATIENT].className = "camera" }

	$cells[STAFFNAME].innerHTML = bookq.staffname
	$cells[HN].innerHTML = bookq.hn
	$cells[PATIENT].innerHTML = putNameAge(bookq)
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
		$cells[PATIENT].innerHTML = putNameAge(bookq)
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
		if (typeof response === "object") {
			updateBOOK(response)

			var book = (ConsultsTbl(tableID)) ? gv.CONSULT : gv.BOOK

			// New case input
			if (noqn) {
				qn = getMaxQN(book)
				$cells[QN].innerHTML = qn
			}

			var bookq = getBOOKrowByQN(book, qn)

			if (gv.isPACS) { $cells[HN].className = "pacs" }
			if (gv.isMobile) { $cells[PATIENT].className = "camera" }

			// prevent showing null
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
			if (newpoint.cellIndex > PATIENT) {
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
		case OPROOM:
			cells[OPROOM].innerHTML = bookq.oproom || ""
			break
		case CASENUM:
			cells[CASENUM].innerHTML = bookq.casenum || ""
			break
		case STAFFNAME:
			cells[STAFFNAME].innerHTML = bookq.staffname
			break
		case HN:
			cells[HN].innerHTML = bookq.hn
			cells[PATIENT].innerHTML = putNameAge(bookq)
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
			clearEditcell()
			clearMouseoverTR()
			selectRow(evt, pointing)
			return
		case THEATRE:
			createEditcell(pointing)
			break
		case OPROOM:
			getROOMCASE(pointing)
			break
		case OPTIME:
			getOPTIME(pointing)
			break
		case CASENUM:
			getROOMCASE(pointing)
			break
		case STAFFNAME:
			getSTAFFNAME(pointing)
			break
		case HN:
			getHN(evt, pointing)
			break
		case PATIENT:
			getNAME(evt, pointing)
			break
		case DIAGNOSIS:
		case TREATMENT:
		case CONTACT:
			createEditcell(pointing)
			break
		case EQUIPMENT:
			getEQUIP(pointing)
			break
	}
	clearSelection()
}

function selectRow(event, target)
{
  var $target = $(target).closest("tr"),
      $targetTRs = $(target).closest("table").find("tr"),
      $allTRs = $("tr")

  if (event.ctrlKey) {
    $targetTRs.removeClass("lastselected")
    $target.addClass("selected lastselected")
    disableOneRowMenu()
  } else if (event.shiftKey) {
    $targetTRs.not(".lastselected").removeClass("selected")
    shiftSelect($target)
    disableOneRowMenu()
  } else {
    $allTRs.removeClass("selected lastselected")
    $target.addClass("selected lastselected")
    oneRowMenu()
  }
}

function shiftSelect($target)
{
  var $lastselected = $(".lastselected").closest("tr"),
      lastIndex = $lastselected.index(),
      targetIndex = $target.index(),
      $select = {}

  if (targetIndex > lastIndex) {
    $select = $target.prevUntil('.lastselected')
  } else if (targetIndex < lastIndex) {
    $select = $target.nextUntil('.lastselected')
  } else {
    return
  }
  $select.addClass("selected")
  $target.addClass("selected")
}

function clearSelection()
{
  $('.selected').removeClass('selected lastselected');
  disableOneRowMenu()
  disableExcelLINE()
}

function getROOMCASE(pointing)
{
	var	noPatient = !$(pointing).siblings(":last").html(),
		noRoom = !$(pointing).closest("tr").find("td").eq(OPROOM).html(),
		getCasenum = pointing.cellIndex === CASENUM,
		oldval = pointing.innerHTML,
		$editcell = $("#editcell"),
		newval = null,
		html = '<input id="spin">'

	if ( noPatient || getCasenum && noRoom ) {
		savePreviousCell()
		clearEditcell()
		return
	}

	createEditcell(pointing)
	$editcell.css("width", 40)
	$editcell.html(html)

	var	$spin = $("#spin")
	$spin.css("width", 35)
	$spin.val(oldval)
	$spin.spinner({
		min: 0,
		max: 99,
		step: 1,
		// make newval 0 as blank value
		spin: function( event, ui ) {
			newval = ui.value || ""
		},
		stop: function( event, ui ) {
			if (newval !== null) {
				$spin.val(newval)
				newval = null
			}
		}
	})
	$spin.focus()
	clearTimeout(gv.timer)
}

function getOPTIME(pointing)
{
	var	oldtime = pointing.innerHTML || "09.00",
		$editcell = $("#editcell"),
		newtime,
		html = '<input id="spin">'

	// no case
	if ( !$(pointing).siblings(":last").html() ) { return }

	createEditcell(pointing)
	$editcell.css("width", 65)
	$editcell.html(html)

	$spin = $("#spin")
	$spin.css("width", 60)
	$spin.spinner({
		min: 00,
		max: 24,
		step: 0.5,
		create: function( event, ui ) {
			$spin.val(oldtime)
		},
		spin: function( event, ui ) {
			newtime = decimalToTime(ui.value)
		},
		stop: function( event, ui ) {
			if (newtime !== undefined) {
				$spin.val(newtime)
				newtime = ""
			}
		}
	})
	$spin.focus()
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

function getEQUIP(pointing)
{
	var tableID = $(pointing).closest('table').attr('id'),
		book = ConsultsTbl(tableID)? gv.CONSULT : gv.BOOK,
		$row = $(pointing).closest('tr'),
		qn = $row.find("td")[QN].innerHTML

	if (qn) {
		fillEquipTable(book, $row, qn)
	}
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
	// TRIM excess spaces at begin, mid, end
	// remove html tags except <br>
	var HTMLTRIM		= /^(\s*<[^>]*>)*\s*|\s*(<[^>]*>\s*)*$/g
	var HTMLNOTBR		= /(<((?!br)[^>]+)>)/ig

	return $cell.length && $cell.html()
							.replace(HTMLTRIM, '')
							.replace(HTMLNOTBR, '')
}
