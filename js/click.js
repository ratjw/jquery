function clicktable(clickedCell)
{
	savePreviouscell()
	storePresentcell(clickedCell)
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
		savePreviouscell()
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
			storePresentcell(thiscell)
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
		savePreviouscell()
		thiscell = findNextRow(event, EDITABLE, pointing)
		if ((thiscell.cellIndex === HN) && (thiscell.innerHTML !== "")) {
			thiscell = findNextcell(event, EDITABLE, $(thiscell))
		}
		if (thiscell) {
			storePresentcell(thiscell)
		} else {
			clearEditcell()
			window.focus()
		}
		event.preventDefault()
		return false
	}
	//no keyin on date
	if (pointing.cellIndex === 0) {
		event.preventDefault()
		return false
	}
}

function savePreviouscell() 
{
	var oldcontent = $("#editcell").data("oldcontent")
	var newcontent = getEditcellHtml()
	var pointed = $("#editcell").data("pointing")
	if (!pointed || (oldcontent === newcontent)) {
		return false
	}
	var content = ""
	switch(pointed.cellIndex)
	{
		case OPDATE:
			return false
		case ROOMTIME:
			content = getEditcellHtml()		//all HTMLs were stripped off
			return saveRoomTime(pointed, content)
		case STAFFNAME:
			return false
		case HN:
			content = getEditcellHtml()
			if (content.length === 7) {
				saveHN(pointed, "hn", content)
				return true
			}
			return false
		case NAME:
			return false
		case DIAGNOSIS:
			content = getEditcellHtml()
			saveContent(pointed, "diagnosis", content)
			return true
		case TREATMENT:
			content = getEditcellHtml()
			saveContent(pointed, "treatment", content)
			return true
		case CONTACT:
			content = getEditcellHtml()
			saveContent(pointed, "contact", content)
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

function saveRoomTime(pointed, content)
{
	var oldcontent = $("#editcell").data("oldcontent")
	var waitnum = 1
	var tableID = $(pointed).closest("table").attr("id")
	if ((tableID === "queuetbl") && ($('#titlename').html() === "Consults")) {
		waitnum = -1		//negative waitnum in Consults cases
	}
	var $cells = $(pointed).closest('tr').children("td")
	var opdate = getOpdate($cells.eq(OPDATE).html())
	var qn = $cells.eq(QN).html()
	var oproom = $("#orroom").val()
	var optime = $("#ortime").val()
	if (!Number(oproom) || !Number(optime)) {
		return false		//default value (...) isNaN
	}
	var newcontent = content + oproom + "<br>" + optime
	if (oldcontent === newcontent) {
		return false
	}
	oproom = content + oproom
	var sql
	if (qn) {
		sql = "sqlReturnbook=UPDATE book SET "
		sql += "oproom = '" + oproom + "', "
		sql += "optime = '" + optime + "', "
		sql += "editor = '" + globalvar.user + "' WHERE qn="+ qn + ";"	
	} else {
		sql = "sqlReturnbook=INSERT INTO book ("
		sql += "waitnum, opdate, oproom, optime, editor) VALUES ("
		sql += waitnum + ", '" + opdate +"', '" + oproom +"', '" + optime
		sql += "', '"+ globalvar.user +"');"
	}

	Ajax(MYSQLIPHP, sql, callbacksaveRoomTime)

	return true

	function callbacksaveRoomTime(response)
	{
		if (/BOOK/.test(response)) {
			updateBOOK(response);
			if ($("#queuewrapper").css('display') === 'block') {
				refillstaffqueue()
			}
			refillOneDay(opdate)
			clearEditcell()
		} else {
			alert ("saveRoomTime", response)
		}
	}
}

function saveContent(pointed, column, content)	//use only "pointed" to save data
{
	var cellindex = pointed.cellIndex
	var tableID = $(pointed).closest("table").attr("id")
	var $row = $(pointed).closest('tr')
	var $cells = $row.children("td")
	var opdate = getOpdate($cells.eq(OPDATE).html())
	var staffname = $cells.eq(STAFFNAME).html()
	var qn = $cells.eq(QN).html()
	var roomtime = $cells.eq(ROOMTIME).html()
	roomtime = roomtime? roomtime.split("<br>") : ""
	var oproom = roomtime[0]? roomtime[0] : ""
	var optime = roomtime[1]? roomtime[1] : ""
	var oldcontent = $("#editcell").data("oldcontent")
	var staffnamequeue = $('#titlename').html()

	pointed.innerHTML = content	//just for show instantly

	content = URIcomponent(content)	//take care of white space, double qoute, 
									//single qoute, and back slash
	if (qn) {
		saveContentQN(pointed, column, content, qn, oldcontent, tableID, staffnamequeue, staffname, cellindex)
	} else {
		saveContentNoQN(pointed, column, content, oldcontent, opdate, oproom, optime, $row, $cells, tableID, staffnamequeue, staffname)
	}
}

function saveContentQN(pointed, column, content, qn, oldcontent, tableID, staffnamequeue, staffname, cellindex)
{
	var sql = "sqlReturnbook=UPDATE book SET "
	sql += column +" = '"+ content
	sql += "', editor='"+ globalvar.user
	sql += "' WHERE qn = "+ qn +";"

	Ajax(MYSQLIPHP, sql, callbacksaveContentQN);

	function callbacksaveContentQN(response)
	{
		if (/BOOK/.test(response)) {
			updateBOOK(response)
			if (tableID === 'tbl') {
				//Remote effect from editing on tbl to queuetbl
				//Staffqueue is showing
				if ($("#queuewrapper").css('display') === 'block') {
					if ((oldcontent === staffnamequeue)					//this staffnamequeue was changed to another staff
						|| (pointed.innerHTML === staffnamequeue)) {	//change to this staffnamequeue
						//New case or change to/from this staffname, update all queuetbl
						refillstaffqueue()
					} else {	//input is not staffname, but on this staffnamequeue row
						if (staffnamequeue === staffname) {
							refillAnotherTableCell('queuetbl', cellindex, qn)
						}
					}
				}
			} else {
				//staffname has been changed
				if (column === "staffname") {
					refillstaffqueue()
				}
				//consults are not apparent on tbl, no remote effect from editing on queuetbl
				if ($('#titlename').html() !== "Consults") {
					//Remote effect from editing on queuetbl to tbl
					//fill corresponding row
					refillAnotherTableCell('tbl', cellindex, qn)
				}
			}
		} else {
			alert("saveContentQN", response)
			pointed.innerHTML = oldcontent
			//return to previous content
		}
	}
}

function saveContentNoQN(pointed, column, content, oldcontent, opdate, oproom, optime, $row, $cells, tableID, staffnamequeue, staffname)
{
	//new case, calculate waitnum
	waitnum = calculateWaitnum(tableID, $row, opdate)
	//store waitnum in row title
	$row[0].title = waitnum

	if ((tableID === "queuetbl") && (column !== "staffname")) {
		var sql = "sqlReturnbook=INSERT INTO book ("
		sql += "waitnum, opdate, oproom, optime, staffname, "+ column +", editor) VALUES ("
		sql += waitnum + ", '" + opdate +"', '" + oproom +"', '" + optime + "', '"
		sql += staffname + "', '"+ content +"', '"+ globalvar.user +"');"
	} else {
		var sql = "sqlReturnbook=INSERT INTO book ("
		sql += "waitnum, opdate, oproom, optime, "+ column +", editor) VALUES ("
		sql += waitnum + ", '" + opdate +"', '" + oproom +"', '" + optime
		sql += "', '"+ content +"', '"+ globalvar.user +"');"
	}

	Ajax(MYSQLIPHP, sql, callbacksaveContentNoQN);

	function callbacksaveContentNoQN(response)
	{
		if (/BOOK/.test(response)) {
			updateBOOK(response)

			//find and fill qn of new case input in that row, either tbl or queuetbl
			var book = globalvar.BOOK
			if ((tableID === "queuetbl") && ($('#titlename').html() === "Consults")) {
				book = globalvar.CONSULT
			}
			var qn = Math.max.apply(Math, $.map(book, function(bookq, i){
						return bookq.qn
					}))
			$cells.eq(QN).html(qn)

			if (tableID === 'tbl') {
				//Remote effect from editing on tbl to queuetbl
				//Staffqueue is showing
				if ($("#queuewrapper").css('display') === 'block') {
					//Create new case to this staffname
					if (pointed.innerHTML === staffnamequeue) {
						refillstaffqueue()
					}
				}
			} else {
				//staffname has been changed
				if (column === "staffname") {
					refillstaffqueue()
				}
				//consults are not apparent on tbl
				if ($('#titlename').html() !== "Consults") {
					//Remote effect from editing on queuetbl to tbl
					//Add new case to tbl, not just refillAnotherTableCell
					refillOneDay(opdate)
				}
			}
		} else {
			alert("saveContentNoQN", response)
			pointed.innerHTML = oldcontent
			//return to previous content
		}
	}
}

function saveHN(pointed, hn, content)
{
	var tableID = $(pointed).closest("table").attr("id")
	var $row = $(pointed).closest('tr')
	var $cells = $row.children("td")
	var cellindex = pointed.cellIndex
	var opdate = getOpdate($cells.eq(OPDATE).html())
	var staffname = $cells.eq(STAFFNAME).html()
	var qn = $cells.eq(QN).html()
	var roomtime = $cells.eq(ROOMTIME).html()
	roomtime = roomtime? roomtime.split("<br>") : ""
	var oproom = roomtime[0]? roomtime[0] : ""
	var optime = roomtime[1]? roomtime[1] : ""
	var oldcontent = $("#editcell").data("oldcontent")

	pointed.innerHTML = content

	if (!qn) {	//if new case, calculate waitnum
		waitnum = calculateWaitnum(tableID, $row, opdate)
		$row[0].title = waitnum		//store waitnum in row title
		var sql = "hn=" + content
		sql += "&waitnum="+ waitnum
		sql += "&opdate="+ opdate
		sql += "&oproom="+ oproom
		sql += "&optime="+ optime
		if (tableID === "queuetbl") {
			sql += "&staffname="+ staffname
		}
		sql += "&qn="+ qn
		sql += "&username="+ globalvar.user
	} else {
		var sql = "hn=" + content
		sql += "&opdate="+ opdate
		sql += "&qn="+ qn
		sql += "&username="+ globalvar.user
	}

	Ajax(GETNAMEHN, sql, callbackgetByHN)

	function callbackgetByHN(response)
	{
		if (/BOOK/.test(response)) {
			updateBOOK(response)

			var book = globalvar.BOOK
			if ((tableID === "queuetbl") && ($('#titlename').html() === "Consults")) {
				book = globalvar.CONSULT
			}
			var qn = Math.max.apply(Math, $.map(book, function(row, i){
					return row.qn
				}))
			qn = String(qn)
			$cells.eq(QN).html(qn)
			var bookq
			$.each(book, function() {
				bookq = this
				return this.qn !== qn
			})
			$cells.eq(ROOMTIME).html((bookq.oproom? bookq.oproom : "")
				+ (bookq.optime? "<br>" + bookq.optime : ""))
			$cells.eq(STAFFNAME).html(bookq.staffname)
			if (globalvar.isPACS) {
				$cells.eq(HN).addClass("pacs")
			}
			$cells.eq(NAME).html(bookq.patient 
				+ "<br>อายุ " + putAgeOpdate(bookq.dob, bookq.opdate))
			$cells.eq(NAME).addClass("camera")
			$cells.eq(DIAGNOSIS).html(bookq.diagnosis)
			$cells.eq(TREATMENT).html(bookq.treatment)
			$cells.eq(CONTACT).html(bookq.contact)
			if (!qn) {	//New case input
				$cells.eq(QN).html(book[NewRow].qn)
			}

			if (tableID === 'tbl') {
				if (($("#queuewrapper").css('display') === 'block') && 
					($('#titlename').html() === $cells.eq(STAFFNAME).html())) {
					//input is on this staffname row
					refillAnotherTableCell('queuetbl', cellindex, qn)
				}
			} else {	//no need to refill tbl because new case row was already there
				if ($('#titlename').html() !== "Consults") {//Consults cases are not shown in tbl
					refillAnotherTableCell('tbl', cellindex, qn)
				}
			}

			createEditcell($('#editcell').data("pointing"))
		} else {
			alert("saveHN", response)
			pointed.innerHTML = oldcontent		//return to previous content
		}
	}
}

function storePresentcell(pointing)
{
	switch(pointing.cellIndex)
	{
		case OPDATE:
			createEditcellOpdate(pointing)
			mainMenu(pointing)
			break
		case ROOMTIME:
			getRoomTime(pointing)
			createEditcellRoomtime(pointing)
			break
		case STAFFNAME:
			createEditcell(pointing)
			stafflist(pointing)
			break
		case HN:
			if (!pointing.innerHTML) {
				createEditcell(pointing)
				break
			} else {
				clearEditcell()
				if (globalvar.isPACS) {
					PACS(pointing.innerHTML)
				}
			}
			break
		case NAME:
			var hn = $(pointing).closest('tr').children("td").eq(HN).html()
			var patient = pointing.innerHTML

			clearEditcell()
			if (hn) {
				if (globalvar.uploadWindow && !globalvar.uploadWindow.closed) {
					globalvar.uploadWindow.close();
				}
				globalvar.uploadWindow = window.open("jQuery-File-Upload", "_blank")    
				globalvar.uploadWindow.hnName = {"hn": hn, "patient": patient}
				//hnName is a pre-defined variable in child window (jQuery-File-Upload)
			}
			break
		case DIAGNOSIS:
		case TREATMENT:
		case CONTACT:
			createEditcell(pointing)
			break
	}
}

function createEditcellOpdate(pointing)
{
	var $editcell = $("#editcell")
	var $pointing = $(pointing)
	var height = $pointing.height() + "px"
	var width = $pointing.width() + "px"
	var context = ""
	//to show Thai name of day in editcell div
	context = window.getComputedStyle(pointing,':before').content
	context = context.replace(/\"/g, "")
	context = context + pointing.innerHTML
	$editcell.html(context)
	editcellData($editcell, pointing, context)
	showEditcell($editcell, $pointing, height, width)
}

function createEditcellRoomtime(pointing)
{
	var $editcell = $("#editcell")
	var $pointing = $(pointing)
	var height = ""
	var width = 77 + "px"
	var context = pointing.innerHTML
	editcellData($editcell, pointing, context)
	showEditcell($editcell, $pointing, height, width)
}

function createEditcell(pointing)
{
	var $editcell = $("#editcell")
	var $pointing = $(pointing)
	var height = $pointing.height() + "px"
	var width = $pointing.width() + "px"
	var context = pointing.innerHTML
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
}	//Don't know why have to repeat 2 times

function clearEditcell()
{
	var $editcell = $("#editcell")
	$editcell.data("pointing", "")
	$editcell.data("oldcontent", "")
	$editcell.html("")
	$editcell.hide()
}
