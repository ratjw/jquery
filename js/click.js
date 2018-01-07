function clicktable(clickedCell)
{
	savePreviousCell()
	storePresentCell(clickedCell)
}

function keyin(event, keycode, pointing)
{
	var EDITABLE = [HN, DIAGNOSIS, TREATMENT, CONTACT];
	var thiscell

	if (keycode === 27)	{
		pointing.innerHTML = $("#editcell").data("oldcontent")
		$('#menu').hide();
		$('#stafflist').hide();
		clearEditcell()
		window.focus()
		event.preventDefault()
		return false
	}
	if (keycode === 9) {
		$('#menu').hide();
		$('#stafflist').hide();
		savePreviousCell()
		if (event.shiftKey) {
			thiscell = findPrevcell(event, EDITABLE, pointing)
			if ((thiscell.cellIndex === HN) && (thiscell.innerHTML !== "")) {
				thiscell = findPrevcell(event, EDITABLE, $(thiscell))
			}
		} else {
			thiscell = findNextcell(event, EDITABLE, pointing)
			if ((thiscell.cellIndex === HN) && (thiscell.innerHTML !== "")) {
				thiscell = findNextcell(event, EDITABLE, $(thiscell))
			}
		}
		if (thiscell) {
			storePresentCell(thiscell)
		} else {
			clearEditcell()
			window.focus()
		}
		event.preventDefault()
		return false
	}
	if (keycode === 13) {
		$('#menu').hide();
		$('#stafflist').hide();
		if (event.shiftKey || event.ctrlKey) {
			return
		}
		savePreviousCell()
		thiscell = findNextRow(event, EDITABLE, pointing)
		if ((thiscell.cellIndex === HN) && (thiscell.innerHTML !== "")) {
			thiscell = findNextcell(event, EDITABLE, $(thiscell))
		}
		if (thiscell) {
			storePresentCell(thiscell)
		} else {
			clearEditcell()
			window.focus()
		}
		event.preventDefault()
		return false
	}
	// no keyin on date
	if (pointing.cellIndex === 0) {
		event.preventDefault()
		return false
	}
}

function savePreviousCell() 
{
	var oldcontent = $("#editcell").data("oldcontent")
	var newcontent = getEditcellHtml()
	var pointed = $("#editcell").data("pointing")
	var column = pointed && pointed.cellIndex

	if (column === ROOM || column === NUM) {
		newcontent = newcontent + $("#spin").val()
	}
	if (!pointed || (oldcontent === newcontent)) {
		return false
	}
	switch(column)
	{
		case OPDATE:
			return false
		case ROOM:
			saveRoom(pointed, newcontent)
			return true
		case NUM:
			saveCaseNum(pointed, newcontent)
			return true
		case STAFFNAME:
			return false
		case HN:
			if (newcontent.length === 7) {
				saveHN(pointed, "hn", newcontent)
				return true
			}
			return false
		case NAME:
			return false
		case DIAGNOSIS:
			saveContent(pointed, "diagnosis", newcontent)
			return true
		case TREATMENT:
			saveContent(pointed, "treatment", newcontent)
			return true
		case CONTACT:
			saveContent(pointed, "contact", newcontent)
			return true
	}
}
 
function getEditcellHtml()
{
	var TRIMHTML		= /^(\s*<[^>]*>)*\s*|\s*(<[^>]*>\s*)*$/g
	var HTMLNOTBR		= /(<((?!br)[^>]+)>)/ig

	return $("#editcell").html()
			.replace(TRIMHTML, '')
			.replace(HTMLNOTBR, '')
}

function saveRoom(pointed, newcontent)
{
	var tableID = $(pointed).closest("table").attr("id"),
		$row = $(pointed).closest("tr"),
		$cell = $row.find("td"),
		opdateth = $cell.eq(OPDATE).html(),
		opdate = getOpdate(opdateth),
		oproom = $cell.eq(ROOM).html(),
		qn = $cell.eq(QN).html(),
		allSameDate = allOldCases = allNewCases = [],
		casenum, index,
		sql = ""

	if (oproom) {
		allOldCases = sameDateRoomTableQN(opdateth, oproom)
		index = allOldCases.indexOf(qn)
		allOldCases.splice(index, 1)

		for (var i=0; i<allOldCases.length; i++) {
			sql += sqlCaseNum(i + 1, allOldCases[i])
		}
	}

	if (newcontent.match(/\d+/)[0] === "0") {
		sql += sqlNewRoom("", "", qn)
	} else {
		allNewCases = sameDateRoomTableQN(opdateth, newcontent)
		allNewCases.push(qn)

		for (var i=0; i<allNewCases.length; i++) {
			if (allNewCases[i] === qn) {
				sql += sqlNewRoom(newcontent, i + 1, qn)
			} else {
				sql += sqlCaseNum(i + 1, allNewCases[i])
			}
		}
	}

	if (!sql) { return }
	sql = "sqlReturnbook=" + sql

	Ajax(MYSQLIPHP, sql, callbackSaveRoom)

	function callbackSaveRoom(response)
	{
		if (/BOOK/.test(response)) {
			updateBOOK(response)
			refillOneDay(opdate)
			if (isSplited() && (isStaffname(staffname) || isConsults())) {
				refillstaffqueue()
			}
			scrolltoThisCase(qn)
			// re-render editcell for keyin cell only
			var newpoint = $('#editcell').data("pointing")
			if (newpoint.cellIndex > NAME) {
				createEditcell(newpoint)
			}
		} else {
			alert ("saveRoom", response)
		}
		clearEditcell()
	}
}

function sqlNewRoom(oproom, casenum, qn)
{
	return "UPDATE book SET "
		+  "oproom='" + oproom
		+  "',casenum='" + casenum
		+  "',editor='" + gv.user
		+  "' WHERE qn="+ qn + ";"
}

function saveCaseNum(pointed, newcontent)
{
	var tableID = $(pointed).closest("table").attr("id"),
		$row = $(pointed).closest("tr"),
		cells = $row.find("td"),
		opdateth = cells.eq(OPDATE).html(),
		opdate = getOpdate(opdateth),
		oproom = cells.eq(ROOM).html(),
		qn = cells.eq(QN).html(),
		index,
		sql = "",

	allCases = sameDateRoomTableQN(opdateth, oproom)
	index = allCases.indexOf(qn)
	allCases.splice(index, 1)

	if (newcontent === "0") {
		allCases.push(qn)
	} else {
		allCases.splice(newcontent - 1, 0, qn)
	}

	for (var i=0; i<allCases.length; i++) {
		sql += sqlCaseNum(i + 1, allCases[i])
	}

	if (!sql) { return }
	sql = "sqlReturnbook=" + sql

	Ajax(MYSQLIPHP, sql, callbackCaseNum)

	function callbackCaseNum(response)
	{
		if (/BOOK/.test(response)) {
			updateBOOK(response)
			refillOneDay(opdate)
			if (isSplited() && (isStaffname(staffname) || isConsults())) {
				refillstaffqueue()
			}
			scrolltoThisCase(qn)
			// re-render editcell for keyin cell only
			var newpoint = $('#editcell').data("pointing")
			if (newpoint.cellIndex > NAME) {
				createEditcell(newpoint)
			}
		} else {
			alert ("saveCaseNum", response)
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
	content = URIcomponent(content)

	if (qn) {
		saveContentQN(pointed, column, content)
	} else {
		saveContentNoQN(pointed, column, content)
	}
}

function saveContentQN(pointed, column, content)
{
	var cellindex = pointed.cellIndex
	var tableID = $(pointed).closest("table").attr("id")
	var $row = $(pointed).closest('tr')
	var $cells = $row.children("td")
	var opdateth = $cells.eq(OPDATE).html()
	var opdate = getOpdate(opdateth)
	var oproom = $cells.eq(ROOM).html()
	var casenum = $cells.eq(NUM).html()
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
			if (newpoint.cellIndex > NAME) {
				createEditcell(newpoint)
			}
		} else {
			alert("saveContentQN", response)
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
	var oproom = $cells.eq(ROOM).html()
	var casenum = $cells.eq(NUM).html()
	var staffname = $cells.eq(STAFFNAME).html()
	var qn = $cells.eq(QN).html()
	var oldcontent = $("#editcell").data("oldcontent")
	var titlename = $('#titlename').html()

	// new case, calculate waitnum
	var waitnum = calculateWaitnum(tableID, $row, opdateth)
	// store waitnum in row title
	$row[0].title = waitnum

	if ((tableID === "queuetbl") && (column !== "staffname")) {
		var sql = "sqlReturnbook=INSERT INTO book ("
		sql += "waitnum, opdate, oproom, casenum, staffname, "+ column +", editor) VALUES ("
		sql += waitnum + ", '" + opdate +"', '" + oproom +"', '" + casenum + "', '"
		sql += staffname + "', '"+ content +"', '"+ gv.user +"');"
	} else {
		var sql = "sqlReturnbook=INSERT INTO book ("
		sql += "waitnum, opdate, oproom, casenum, "+ column +", editor) VALUES ("
		sql += waitnum + ", '" + opdate +"', '" + oproom +"', '" + casenum
		sql += "', '"+ content +"', '"+ gv.user +"');"
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
			alert("saveContentNoQN", response)
			pointed.innerHTML = oldcontent
			// return to previous content
		}
	}
}

function saveHN(pointed, hn, content)
{
	var tableID = $(pointed).closest("table").attr("id")
	var $row = $(pointed).closest('tr')
	var $cells = $row.children("td")
	var cellindex = pointed.cellIndex
	var opdateth = $cells.eq(OPDATE).html()
	var opdate = getOpdate(opdateth)
	var oproom = $cells.eq(ROOM).html()
	var casenum = $cells.eq(NUM).html()
	var staffname = $cells.eq(STAFFNAME).html()
	var qn = $cells.eq(QN).html()
	var oldcontent = $("#editcell").data("oldcontent")

	pointed.innerHTML = content

	if (!qn) {	// if new case, calculate waitnum
		var waitnum = calculateWaitnum(tableID, $row, opdateth)
		$row[0].title = waitnum		// store waitnum in row title
		var sql = "hn=" + content
		sql += "&waitnum="+ waitnum
		sql += "&opdate="+ opdate
		sql += "&oproom="+ oproom
		sql += "&casenum="+ casenum
		if (tableID === "queuetbl") {
			sql += "&staffname="+ staffname
		}
		sql += "&qn="+ qn
		sql += "&username="+ gv.user
	} else {
		var sql = "hn=" + content
		sql += "&opdate="+ opdate
		sql += "&qn="+ qn
		sql += "&username="+ gv.user
	}

	Ajax(GETNAMEHN, sql, callbackgetByHN)

	function callbackgetByHN(response)
	{
		if (/BOOK/.test(response)) {
			updateBOOK(response)

			var book = (ConsultsTbl(tableID))? gv.CONSULT : gv.BOOK

			if (!qn) {	// New case input
				qn = Math.max.apply(Math, $.map(book, function(row, i){
						return row.qn
					}))
				qn = String(qn)
				$cells.eq(QN).html(qn)
			}

			var bookq
			$.each(book, function() {
				bookq = this
				return this.qn !== qn
			})
			$cells.eq(ROOM).html(bookq.optime)
			$cells.eq(NUM).html(bookq.casenum)
			$cells.eq(STAFFNAME).html(bookq.staffname)
			$cells.eq(STAFFNAME).html("")
			if (gv.isPACS) {
				$cells.eq(HN).addClass("pacs")
			}
			$cells.eq(NAME).html(putNameAge(bookq))
			$cells.eq(NAME).addClass("camera")
			$cells.eq(DIAGNOSIS).html(bookq.diagnosis)
			$cells.eq(TREATMENT).html(bookq.treatment)
			$cells.eq(CONTACT).html(bookq.contact)

			// Both cases remote effect -> refill corresponding cell
			// no need to refill main table because new case row was already there
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
			if (newpoint.cellIndex > NAME) {
				createEditcell(newpoint)
			}
		} else {
			alert("saveHN", response)
			pointed.innerHTML = oldcontent
			// return to previous content
		}
	}
}

function refillAnotherTableCell(tableID, cellindex, qn)
{
	var rowi
	$.each($("#" + tableID + " tr:has(td)"), function() {
		rowi = this
		return (this.cells[QN].innerHTML !== qn);
	})
	if (rowi.cells[QN].innerHTML !== qn) {
		return
	}

	// No consults cases involved
	var book = gv.BOOK
	var bookq = getBOOKrowByQN(book, qn)
	if (!bookq) {
		return
	}

	var cells = rowi.cells

	switch(cellindex)
	{
		case ROOM:
			cells[ROOM].innerHTML = bookq.oproom
			break
		case NUM:
			cells[NUM].innerHTML = bookq.casenum
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

function storePresentCell(pointing)
{
	switch(pointing.cellIndex)
	{
		case OPDATE:
			createEditcellOpdate(pointing)
			mainMenu(pointing)
			break
		case ROOM:
			createEditcell(pointing)
			getRoomNum(pointing, pointing.cellIndex)
			break
		case NUM:
			if ( !$(pointing).prev().html() ) { return }
			createEditcell(pointing)
			getRoomNum(pointing, pointing.cellIndex)
			break
		case STAFFNAME:
			createEditcell(pointing)
			stafflist(pointing)
			break
		case HN:
			getHN(pointing)
			break
		case NAME:
			getName(pointing)
			break
		case DIAGNOSIS:
		case TREATMENT:
		case CONTACT:
			createEditcell(pointing)
			break
	}
}

function getRoomNum(pointing, index)
{
	var ORSURG = "XSU"
	var ORROOM = "4"
	var CASENUM	= "1"
	var content = pointing.innerHTML
	var $editcell = $("#editcell")
	var val = 0
	var html = ""

	if (index === ROOM) {
		var room = content && content.match(/\d+/)
			val = room? room[0] : ORROOM
		var theatre = content && content.match(/\D+/)
			theatre = theatre? theatre[0] : ORSURG
		html = theatre + '<input id="spin">'
	}
	else if (index === NUM) {
		val = content || CASENUM
		html = '<input id="spin">'
	}

	if ($editcell.css("height") < "50px") {
		$editcell.css("height", 60)
	}
	$editcell.css("width", 55)
	$editcell.html(html)
	$("#spin").val(val)
	$("#spin").spinner({
		min: 0,
		max: 100,
		step: 1
	});
}

function stafflist(pointing)
{
	var $stafflist = $("#stafflist")
	var width = $stafflist.outerWidth()

	$stafflist.menu({
		select: function( event, ui ) {
			var staffname = ui.item.text()
			var tableID = $(pointing).closest("table").attr("id")
			var $row = $(pointing).closest('tr')
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

	$stafflist.appendTo($(pointing).closest('div'))
	reposition($stafflist, "left top", "left bottom", pointing)
	menustyle($stafflist, pointing, width)

	// repeat reposition to make it show on first click
	reposition($stafflist, "left top", "left bottom", pointing)
}

function changeOncall(pointing, opdate, staffname)
{
	var sql = "sqlReturnCONSULT=UPDATE book SET "
			+ "staffname= '" + staffname
			+ "', editor='" + gv.user
			+ "' WHERE waitnum=0 AND opdate='" + opdate + "';"

	Ajax(MYSQLIPHP, sql, callbackchangeOncall);

	function callbackchangeOncall(response)
	{
		if (response === "success") {
			pointing.innerHTML = htmlwrap(staffname)
		} else {
			alert("changeOncall", response)
		}
	}
}

function getHN(pointing) {
	if (pointing.innerHTML) {
		clearEditcell()
		if (gv.isPACS) { PACS(pointing.innerHTML) }
	} else {
		createEditcell(pointing)
	}
}

function getName(pointing) {
	var hn = $(pointing).closest('tr').children("td").eq(HN).html()
	var patient = pointing.innerHTML
	var upload = gv.uploadWindow

	clearEditcell()
	if (hn) {
		if (upload && !upload.closed) {
			upload.close();
		}
		upload = gv.uploadWindow = window.open("jQuery-File-Upload", "_blank")
		upload.hnName = {"hn": hn, "patient": patient}
		// hnName is a pre-defined variable in child window (jQuery-File-Upload)
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
	var context = $.trim(pointing.innerHTML)
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

function reposition($me, mypos, atpos, target, within)
{
	$me.position({
		my: mypos,
		at: atpos,
		of: target,
		within: within
	}).show()
	$me.position({
		my: mypos,
		at: atpos,
		of: target,
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
