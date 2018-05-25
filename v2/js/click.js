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

	if (column === OPROOM) {
		newcontent = newcontent + $("#spin").val()
	}
	if (column === CASENUM) {
		var num = $("#spin").val(),
			time = $("#time").val()

		newcontent = num + (time ? ("<br>" + time) : "")
	}

	if (!pointed || (oldcontent === newcontent)) {
		return false
	}

	switch(column)
	{
		case OPDATE:
			return false
		case OPROOM:
			return saveRoom(pointed, newcontent)
		case CASENUM:
			return saveCaseNum(pointed, oldcontent, num, time)
		case STAFFNAME:
			return false
		case HN:
			return saveHN(pointed, "hn", newcontent)
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

function saveRoom(pointed, newcontent)
{
	var tableID = $(pointed).closest("table").attr("id"),
		$row = $(pointed).closest("tr"),
		$cell = $row.find("td"),
		opdateth = $cell.eq(OPDATE).html(),
		opdate = getOpdate(opdateth),
		oproom = $cell.eq(OPROOM).html(),
		casenum = $cell.eq(CASENUM).html(),
		qn = $cell.eq(QN).html(),
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
//			scrolltoThisCase(qn)
			// re-render editcell for keyin cell only
			var newpoint = $('#editcell').data("pointing")
			if (newpoint.cellIndex > PATIENT) {
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
		opdateth = $cells.eq(OPDATE).html(),
		opdate = getOpdate(opdateth),
		oproom = $cells.eq(OPROOM).html(),
		qn = $cells.eq(QN).html(),
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
			+  "optime='" + ((time === "00.00") ? "" : time)
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
			// in case it jumped out of field
			scrolltoThisCase(qn)
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
	var cellindex = pointed.cellIndex
	var tableID = $(pointed).closest("table").attr("id")
	var $row = $(pointed).closest('tr')
	var $cells = $row.children("td")
	var opdateth = $cells.eq(OPDATE).html()
	var opdate = getOpdate(opdateth)
	var oproom = $cells.eq(OPROOM).html()
	var casenum = $cells.eq(CASENUM).html()
	var staffname = $cells.eq(STAFFNAME).html()
	var qn = $cells.eq(QN).html()
	var oldcontent = $("#editcell").data("oldcontent")
	var titlename = $('#titlename').html()

	var sql = "sqlReturnbook=UPDATE book SET "
	sql += column + "='" + content
	sql += "',editor='"+ gv.user
	sql += "' WHERE qn="+ qn +";"

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
				// If Staffqueue is showing, 
				// 1. if staffname that match titlename was changed to another staff
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
	var cellindex = pointed.cellIndex
	var tableID = $(pointed).closest("table").attr("id")
	var $row = $(pointed).closest('tr')
	var $cells = $row.children("td")
	var opdateth = $cells.eq(OPDATE).html()
	var opdate = getOpdate(opdateth)
	var oproom = $cells.eq(OPROOM).html() || null
	var casenum = $cells.eq(CASENUM).html() || null
	var staffname = $cells.eq(STAFFNAME).html()
	var qn = $cells.eq(QN).html()
	var oldcontent = $("#editcell").data("oldcontent")
	var titlename = $('#titlename').html()

	// new case, calculate waitnum
	var waitnum = calcWaitnum(opdateth, $row.prev(), $row.next())
	// store waitnum in row title
	$row[0].title = waitnum

	if ((tableID === "queuetbl") && (column !== "staffname")) {
		var sql = "sqlReturnbook=INSERT INTO book ("
		sql += "waitnum, opdate, oproom, casenum, staffname, "+ column +", editor) VALUES ("
		sql += waitnum + ", '" + opdate +"', " + oproom +"," + casenum + ", '"
		sql += staffname + "', '"+ content +"', '"+ gv.user +"');"
	} else {
		var sql = "sqlReturnbook=INSERT INTO book ("
		sql += "waitnum, opdate, oproom, casenum, "+ column +", editor) VALUES ("
		sql += waitnum + ", '" + opdate +"'," + oproom +"," + casenum
		sql += ", '"+ content +"', '"+ gv.user +"');"
	}

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
			$cells.eq(QN).html(qn)

			if (tableID === 'tbl') {
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

function saveHN(pointed, hn, content)
{
	var tableID = $(pointed).closest("table").attr("id"),
		$row = $(pointed).closest('tr'),
		$cells = $row.children("td"),
		cellindex = pointed.cellIndex,
		opdateth = $cells.eq(OPDATE).html(),
		opdate = getOpdate(opdateth),
		oproom = $cells.eq(OPROOM).html(),
		casenum = $cells.eq(CASENUM).html(),
		staffname = $cells.eq(STAFFNAME).html(),
		qn = $cells.eq(QN).html(),
		oldcontent = $("#editcell").data("oldcontent"),
		waitnum, sql

	if (content.length !== 7) {
		pointed.innerHTML = ""
		return false
	} else {
		pointed.innerHTML = content
	}

	// if new case, calculate waitnum
	// store waitnum in row title
	if (!qn) {
		waitnum = calcWaitnum(opdateth, $row.prev(), $row.next())
		$row[0].title = waitnum	
		sql = "hn=" + content
		sql += "&waitnum="+ waitnum
		sql += "&opdate="+ opdate
		sql += "&oproom="+ oproom
		sql += "&casenum="+ casenum
		if (tableID === "queuetbl") {
			sql += "&staffname="+ staffname
		}
		sql += "&qn="+ qn
		sql += "&editor="+ gv.user
	} else {
		sql = "hn=" + content
		sql += "&opdate="+ opdate
		sql += "&qn="+ qn
		sql += "&editor="+ gv.user
	}

	Ajax(GETNAMEHN, sql, callbackgetByHN)

	return true

	function callbackgetByHN(response)
	{
		if (/BOOK/.test(response)) {
			updateBOOK(response)

			var book = (ConsultsTbl(tableID))? gv.CONSULT : gv.BOOK

			// New case input
			if (!qn) {
				qn = getMaxQN(book)
				$cells.eq(QN).html(qn)
			}

			var bookq = getBOOKrowByQN(book, qn)
			if (gv.isPACS) {
				$cells.eq(HN).addClass("pacs")
			}
			$cells.eq(PATIENT).addClass("camera")

			// old case patient
			$cells.eq(OPROOM).html(bookq.oproom || "")
			$cells.eq(CASENUM).html(putCasenumTime(bookq))
			$cells.eq(STAFFNAME).html(bookq.staffname)
			$cells.eq(PATIENT).html(putNameAge(bookq))
			$cells.eq(DIAGNOSIS).html(bookq.diagnosis)
			$cells.eq(TREATMENT).html(bookq.treatment)
			$cells.eq(CONTACT).html(bookq.contact)

			// Both cases remote effect -> refill corresponding cell
			// no need to refillall main table because new case row was already there
			// Consults cases are not shown in main table
			if (tableID === 'tbl') {
				if (isSplited() && isStaffname(staffname)) {
					refillAnotherTableCell('queuetbl', cellindex, qn)
				}
			} else {
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
			Alert("saveHN", response)
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
			cells[CASENUM].innerHTML = putCasenumTime(bookq)
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
			getOPDATE(pointing)
			break
		case OPROOM:
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
		case PATIENT:
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
		html = '<input id="spin">'

	// no case
	if ( !$(pointing).siblings(":last").html() ) { return }

	createEditcell(pointing)
	if ($editcell.css("height") < "60px") {
		$editcell.css("height", 60)
	}
	$editcell.css("width", 55)
	$editcell.html(html)

	$("#spin").val(val)
	$("#spin").spinner({
		min: 0,
		max: 99,
		step: 1
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
		html = '<input id="spin"><input id="time">'

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

	$spin = $("#spin")
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
		start: function( event, ui ) {
			if (!$time.val()) {
				$time.val(9.5)
			}
		},
		spin: function( event, ui ) {
			ortime = decimalToTime(ui.value)
		},
		stop: function( event, ui ) {
			if (ortime) {
				$time.val(ortime)
				ortime = ""	
			}
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
			var staffname = ui.item.text()
			var tableID = $pointing.closest("table").attr("id")
			var $row = $pointing.closest('tr')
			var $cells = $row.children("td")
			var opdate = getOpdate($cells.eq(OPDATE).html())
			var qn = $cells.eq(QN).html()

			// change staff oncall when there is no case
			if (pointing.innerHTML && !qn) {
				changeOncall(pointing, opdate, staffname)
			} else {
				saveContent(pointing, "staffname", staffname)
			}
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

function changeOncall(pointing, opdate, staffname)
{
	var sql = "sqlReturnData=UPDATE staff SET "
			+ "staffoncall= '" + staffname
			+ "' WHERE dateoncall='" + opdate
			+ "';SELECT * FROM staff ORDER BY number;"

	Ajax(MYSQLIPHP, sql, callbackchangeOncall);

	function callbackchangeOncall(response)
	{
		if (/neurosurgery/.test(response)) {
			pointing.innerHTML = htmlwrap(staffname)
			gv.STAFF = JSON.parse(response)
		} else {
			Alert("changeOncall", response)
		}
	}
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
	var hn = $(pointing).closest('tr').children("td").eq(HN).html()
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
			qn = $row.find("td").eq(QN).html()
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
	context = window.getComputedStyle(pointing,':before').content
	context = context.replace(/\"/g, "")
	context = context + pointing.innerHTML
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
	var context = getText($pointing)

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
	var TRIMHTML		= /^(\s*<[^>]*>)*\s*|\s*(<[^>]*>\s*)*$/g
	var HTMLNOTBR		= /(<((?!br)[^>]+)>)/ig

	return $cell.html()
			.replace(TRIMHTML, '')
			.replace(HTMLNOTBR, '')
}
