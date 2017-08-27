function clicktable(clickedCell)
{
	savePreviouscell()
	storePresentcell(clickedCell)
}

function keyin(event, keycode, pointing)
{
	var thiscell

	if (keycode == 27)	{
		$('#menu').hide();
		$('#stafflist').hide();
		clearEditcell()
		window.focus()
		event.preventDefault()
		return false
	}
	if (!pointing) {
		return
	}
	if (keycode == 9) {
		$('#menu').hide();
		$('#stafflist').hide();
		savePreviouscell()
		if (event.shiftKey) {
			thiscell = findPrevcell(event, EDITABLE, pointing)
			if ((thiscell.cellIndex == HN) && (thiscell.innerHTML != "")) {
				thiscell = findPrevcell(event, EDITABLE, $(thiscell))
			}
		} else {
			thiscell = findNextcell(event, EDITABLE, pointing)
			if ((thiscell.cellIndex == HN) && (thiscell.innerHTML != "")) {
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
	if (keycode == 13) {
		$('#menu').hide();
		$('#stafflist').hide();
		if (event.shiftKey || event.ctrlKey) {
			return
		}
		savePreviouscell()
		thiscell = findNextRow(event, EDITABLE, pointing)
		if ((thiscell.cellIndex == HN) && (thiscell.innerHTML != "")) {
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
}

function savePreviouscell() 
{
	var oldcontent = $("#editcell").data("oldcontent")
	var newcontent = getEditcellHtml()
	var editPoint = $("#editcell").data("pointing")
	if (editPoint && (oldcontent != newcontent)) {
		saveEditPointData(editPoint)
	}
}

function saveEditPointData(pointed)
{
	var content = ""
	switch(pointed.cellIndex)
	{
		case OPDATE:
			break
		case ROOMTIME:
			content = getEditcellHtml()		//all HTMLs were stripped off
			saveRoomTime(pointed, content)
			break
		case STAFFNAME:
			break
		case HN:
			content = getEditcellHtml()
			if (content.length == 7) {
				saveHN(pointed, "hn", content)
			}
			break
		case NAME:
			break
		case DIAGNOSIS:
			content = getEditcellHtml()
			saveContent(pointed, "diagnosis", content)
			break
		case TREATMENT:
			content = getEditcellHtml()
			saveContent(pointed, "treatment", content)
			break
		case CONTACT:
			content = getEditcellHtml()
			saveContent(pointed, "contact", content)
			break
	}
}
 
function getEditcellHtml()
{
	return $("#editcell").html()
			.replace(TRIMHTML, '')
			.replace(HTMLNOTBR, '')
}

function saveRoomTime(pointed, content)
{
	var oldcontent = $("#editcell").data("oldcontent")
	var waitnum = 1
	var tableID = $(pointed).closest("table").attr("id")
	if ((tableID == "queuetbl") && ($('#titlename').html() == "Consults")) {
		waitnum = -1		//negative waitnum in Consults cases
	}
	var $cells = $(pointed).closest('tr').children("td")
	var opdate = getOpdate($cells.eq(OPDATE).html())
	var qn = $cells.eq(QN).html()
	var oproom = $("#orroom").val()
	var optime = $("#ortime").val()
	if (!Number(oproom) || !Number(optime)) {
		return		//default value with "(...)"
	}
	var newcontent = content + oproom + "<br>" + optime
	if (oldcontent == newcontent) {
		return
	}
	oproom = content + oproom
	var sql
	if (qn) {
		sql = "sqlReturnbook=UPDATE book SET "
		sql += "oproom = '" + oproom + "', "
		sql += "optime = '" + optime + "', "
		sql += "editor = '" + THISUSER + "' WHERE qn="+ qn + ";"	
	} else {
		sql = "sqlReturnbook=INSERT INTO book ("
		sql += "waitnum, opdate, oproom, optime, editor) VALUES ("
		sql += waitnum + ", '" + opdate +"', '" + oproom +"', '" + optime
		sql += "', '"+ THISUSER +"');"
	}

	Ajax(MYSQLIPHP, sql, callbacksaveRoomTime)

	function callbacksaveRoomTime(response)
	{
		if (!response || response.indexOf("DBfailed") != -1) {
			alert ("fillRoomTime", response)
		} else {
			updateBOOK(response);
			if ($("#queuewrapper").css('display') == 'block') {
				refillstaffqueue()
			}
			refillall(BOOK)
			clearEditcell()
		}
	}
}

function saveContent(pointed, column, content)	//use only "pointed" to save data
{
	var tableID = $(pointed).closest("table").attr("id")
	var $row = $(pointed).closest('tr')
	var $cells = $row.children("td")
	var cellindex = pointed.cellIndex
	var opdate = getOpdate($cells.eq(OPDATE).html())
	var qn = $cells.eq(QN).html()
	var roomtime = $cells.eq(ROOMTIME).html()
	roomtime = roomtime? roomtime.split("<br>") : ""
	var oproom = roomtime[0]? roomtime[0] : ""
	var optime = roomtime[1]? roomtime[1] : ""
	var oldcontent = $("#editcell").data("oldcontent")
	var sql

	pointed.innerHTML = content	//just for show instantly

	content = URIcomponent(content)	//take care of white space, double qoute, 
									//single qoute, and back slash
	if (qn) {
		sql = "sqlReturnbook=UPDATE book SET "
		sql += column +" = '"+ content
		sql += "', editor='"+ THISUSER
		sql += "' WHERE qn = "+ qn +";"
	} else {	//if new case, calculate waitnum
		waitnum = calculateWaitnum(tableID, $row, opdate)
		$row[0].title = waitnum		//store waitnum in row title
		sql = "sqlReturnbook=INSERT INTO book ("
		sql += "waitnum, opdate, oproom, optime, "+ column +", editor) VALUES ("
		sql += waitnum + ", '" + opdate +"', '" + oproom +"', '" + optime
		sql += "', '"+ content +"', '"+ THISUSER +"');"
	}

	Ajax(MYSQLIPHP, sql, callbacksaveContent);

	function callbacksaveContent(response)
	{
 		if (!response || response.indexOf("BOOK") == -1)
		{
			alert("saveContent", response)
			pointed.innerHTML = oldcontent
			//return to previous content
		}
		else
		{
			updateBOOK(response)

			//fill qn of new case input in that row, either tbl or queuetbl
			if (!qn) {
				var book = BOOK
				if ((tableID == "queuetbl") && ($('#titlename').html() == "Consults")) {
					book = CONSULT		//do anything in Consults cases
				}
				var NewRow = findNewBOOKrow(book, opdate)
				$cells.eq(QN).html(book[NewRow].qn)
			}

			if (tableID == 'tbl') {	//is editing on tbl
				updateQueuetbl()
			} else {				//consults are not apparent on tbl
				if ($('#titlename').html() != "Consults") {
					updateTbl()
				}
			}
		}
	}

	function updateQueuetbl()
	{
		if ($("#queuewrapper").css('display') == 'block') {	//staffqueue showing
			var staffname = $('#titlename').html()
			if ((column == "staffname")
			&& ((oldcontent == staffname)
			|| (pointed.innerHTML == staffname))) {	//if input is this staffname
				//New case or change staffname from tbl, update all queuetbl
				//because there maybe one more row inserted
				refillstaffqueue()
			} else {	//input is not staffname, but on this staffname row
				if (staffname == $cells.eq(STAFFNAME).html()) {
					refillanother('queuetbl', cellindex, qn)
				}
			}
		}
	}

	function updateTbl()
	{
		if (qn) {	//is editing on existing row, just fill corresponding row
			refillanother('tbl', cellindex, qn)
		} else {
			refillall(BOOK)		//New case input from queuetbl, update tbl all
		}						//because there is one more row inserted
	}
}

function saveHN(pointed, hn, content)
{
	var tableID = $(pointed).closest("table").attr("id")
	var $row = $(pointed).closest('tr')
	var $cells = $row.children("td")
	var cellindex = pointed.cellIndex
	var opdate = getOpdate($cells.eq(OPDATE).html())
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
		sql += "&qn="+ qn
		sql += "&username="+ THISUSER
	} else {
		var sql = "hn=" + content
		sql += "&opdate="+ opdate
		sql += "&qn="+ qn
		sql += "&username="+ THISUSER
	}

	Ajax(GETNAMEHN, sql, callbackgetByHN)

	function callbackgetByHN(response)
	{
		if (!response || response.indexOf("BOOK") == -1)
		{
			alert("saveHN", response)
			pointed.innerHTML = oldcontent		//return to previous content
		} else {
			updateBOOK(response)

			var book = BOOK
			if ((tableID == "queuetbl") && ($('#titlename').html() == "Consults")) {
				book = CONSULT		//do anything in Consults cases
			}
			var NewRow = findNewBOOKrow(book, opdate)
			$cells.eq(QN).html(book[NewRow].qn)

			var bookq = book[NewRow]
			$cells.eq(ROOMTIME).html((bookq.oproom? bookq.oproom : "")
				+ (bookq.optime? "<br>" + bookq.optime : ""))
			$cells.eq(STAFFNAME).html(bookq.staffname)
			$cells.eq(NAME).html(bookq.patient 
				+ "<br>อายุ " + putAgeOpdate(bookq.dob, bookq.opdate))
			$cells.eq(DIAGNOSIS).html(bookq.diagnosis)
			$cells.eq(TREATMENT).html(bookq.treatment)
			$cells.eq(CONTACT).html(bookq.contact)
			if (!qn) {	//New case input
				$cells.eq(QN).html(book[NewRow].qn)
			}

			if (tableID == 'tbl') {
				if (($("#queuewrapper").css('display') == 'block') && 
					($('#titlename').html() == $cells.eq(STAFFNAME).html())) {
					//input is on this staffname row
					refillanother('queuetbl', cellindex, qn)
				}
			} else {	//no need to refillall because new case row was already in tbl
				if ($('#titlename').html() != "Consults") {//Consults cases are not shown in tbl
					refillanother('tbl', cellindex, qn)
				}
			}

			createEditcell($('#editcell').data("pointing"))
		}
	}
}

function storePresentcell(pointing)
{
	switch(pointing.cellIndex)
	{
		case OPDATE:
			createEditcellOpdate(pointing)
			fillSetTable(pointing)
			break
		case ROOMTIME:
			fillRoomTime(pointing)
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
				PACS(pointing.innerHTML)
			}
		case NAME:
			getHN = function () {
				return hn
			}
			clearEditcell()
			if (newWindow && !newWindow.closed) {
				newWindow.close();
			}
			newWindow = window.open("jQuery-File-Upload", "_blank")    
			var hn = $(pointing).closest('tr').children("td").eq(HN).html()
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
	var context = ""
	//to show Thai name of day in editcell div
	context = window.getComputedStyle(pointing,':before').content
	context = context.replace(/\"/g, "")
	context = context + pointing.innerHTML
	var $editcell = $("#editcell")
	$editcell.data("pointing", "")
	$editcell.html(context)
	showEditcell($editcell, $(pointing))
}

function createEditcellRoomtime(pointing)
{
	var $pointing = $(pointing)
	var $editcell = $("#editcell")
	$editcell.data("pointing", pointing)
	$editcell.data("oldcontent", pointing.innerHTML)
	$editcell.css({
		width: 77 + "px",
		fontSize: $pointing.css("fontSize")
	})
	$editcell.appendTo($pointing.closest('div'))
	reposition($editcell, "left center", "left center", $pointing)
}

function createEditcell(pointing)
{
	var $editcell = $("#editcell")
	$editcell.data("pointing", pointing)
	$editcell.data("oldcontent", pointing.innerHTML)
	$editcell.html(pointing.innerHTML)
	showEditcell($editcell, $(pointing))
	$editcell.focus()
}

function showEditcell($editcell, $pointing)
{
	$editcell.css({
		height: $pointing.height() + "px",
		width: $pointing.width() + "px",
		fontSize: $pointing.css("fontSize")
	})
	$editcell.appendTo($pointing.closest('div'))
	reposition($editcell, "center", "center", $pointing)
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
	$editcell.html("")
	$editcell.hide()
}
