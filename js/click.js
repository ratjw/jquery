function clicktable(clickedCell)
{
	savePreviouscell()
	storePresentcell(clickedCell)
}

function keyin(event)
{
	var keycode = event.which || window.event.keyCode
	var pointing = $("#editcell").data("pointing")
	var thiscell

	if (!pointing) {
		return
	}
		
	switch(keycode)
	{
		case 9:
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
				clearEditcellData("hide")
				window.focus()
			}
			break
		case 13:
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
				clearEditcellData("hide")
				window.focus()
			}
			break
		case 27:
			$('#menu').hide();
			$('#stafflist').hide();
			clearEditcellData("hide")
			window.focus()
			break
		default:
			return
	}
	event.preventDefault()
	return false
}

function savePreviouscell() 
{
	var editPoint = $("#editcell").data("pointing")
	if (!(editPoint) 
	|| (editPoint.innerHTML == getData())
	|| (editPoint.cellIndex == OPDATE)) {
		return
	}

	var content = ""
	switch($("#editcell").data("cellIndex"))
	{
		case OPDATE:
			break
		case STAFFNAME:
			content = getData()
			saveContent("staffname", content)
			break
		case HN:
			content = getData()
			if (content.length != 7) {
				return
			}
			saveHNinput("hn", content)
			break
		case NAME:
		case AGE:
			break
		case DIAGNOSIS:
			content = getData()
			saveContent("diagnosis", content)
			break
		case TREATMENT:
			content = getData()
			saveContent("treatment", content)
			break
		case CONTACT:
			content = getData()
			saveContent("contact", content)
			break
	}
}
 
function getData()
{
	return $("#editcell").html().replace(TRIMHTML, '').replace(HTMLNOTBR, '')
}

function saveContent(column, content)	//column name in MYSQL
{
	if (content == $("#editcell").data("content")) {
		return
	}
	var $rowcell = $($("#editcell").data("editRow")).children("td")
	var opdate = $rowcell.eq(OPDATE).html()
	if (!opdate) {
		opdate = LARGESTDATE
	} else {
		opdate = opdate.numDate()
	}
	var staffname = $rowcell.eq(STAFFNAME).html()
	var qn = $rowcell.eq(QN).html()
	var pointing = $("#editcell").data("pointing")
	var sql

	pointing.innerHTML = content	//just for show instantly

	if (content) {
		 content = URIcomponent(content)	//take care of white space, double qoute, 
	}										//single qoute, and back slash
	if (column == "staffname") {
		var waitnum = getWaitnum(opdate, staffname)
		$($("#editcell").data("editRow"))[0].title = waitnum
		if (qn) {
			sql = "sqlReturnbook=UPDATE book SET "
			sql += "waitnum = "+ waitnum + ", "
			sql += column +" = '"+ content
			sql += "', editor='"+ THISUSER
			sql += "' WHERE qn = "+ qn +";"
		} else {
			sql = "sqlReturnbook=INSERT INTO book ("
			sql += "waitnum, opdate, "+ column +", editor) VALUES ("
			sql += waitnum + ", '" + opdate +"', '"+ content +"', '"+ THISUSER +"');"
		}
	} else {
		if (qn) {
			sql = "sqlReturnbook=UPDATE book SET "
			sql += column +" = '"+ content
			sql += "', editor='"+ THISUSER
			sql += "' WHERE qn = "+ qn +";"
		} else {
			sql = "sqlReturnbook=INSERT INTO book ("
			sql += "opdate, "+ column +", editor) VALUES ('"
			sql += opdate +"', '"+ content +"', '"+ THISUSER +"');"
		}
	}

	Ajax(MYSQLIPHP, sql, callbacksaveContent);

	var tableID = $("#editcell").data("tableID")
	var cellindex = $("#editcell").data("cellIndex")
	var $updateCell = $($("#editcell").data("editRow")).children()
	var oldContent = $("#editcell").data("content")

	function callbacksaveContent(response)
	{
		if (!response || response.indexOf("DBfailed") != -1)
		{
			alert("Failed! update database \n\n" + response)
			pointing.innerHTML = oldContent
			//return to previous content
		}
		else
		{
			updateBOOK(response);
			if (!qn) {	//New case input
				var NewRow = findNewRowBOOK(opdate)
				$updateCell.eq(QN).html(BOOK[NewRow].qn)
			}

			if (tableID == 'tbl') {
				if ($("#titlecontainer").css('display') == 'block') {
					if ((column == "staffname")
					&& ($('#titlename').html() == pointing.innerHTML)) {
						refillstaffqueue()		//New case or change staffname from tbl
					} else {
						if ($('#titlename').html() == staffname) {
							refillanother('queuetbl', cellindex, qn)
						}
					}
				}
			} else {
				if (qn) {
					refillanother('tbl', cellindex, qn)
				} else {
					refillall()		//New case input from queuetbl
				}
			}
		}
	}
}

function saveHNinput(hn, content)
{
	var $rowcell = $($("#editcell").data("editRow")).children("td")
	var opdate = $rowcell.eq(OPDATE).html()
	if (!opdate) {
		opdate = LARGESTDATE
	} else {
		opdate = opdate.numDate()
	}
	var staffname = $rowcell.eq(STAFFNAME).html()
	var patient = $rowcell.eq(NAME).html()
	var qn = $rowcell.eq(QN).html()
	var pointing = $("#editcell").data("pointing")

	pointing.innerHTML = content

	content = content.replace(/<br>/g, "")
	content = content.replace(/^\s+/g, "")

	var sql = "hn=" + content
	sql += "&opdate="+ opdate
	sql += "&qn="+ qn
	sql += "&username="+ THISUSER

	Ajax(GETNAMEHN, sql, callbackgetByHN)

	var tableID = $("#editcell").data("tableID")
	var cellindex = $("#editcell").data("cellIndex")
	var $updateCell = $($("#editcell").data("editRow")).children()
	var oldContent = $("#editcell").data("content")

	function callbackgetByHN(response)
	{
		if ((!response) || (response.indexOf("patient") == -1) || (response.indexOf("{") == -1)) 
		{
			alert(response)
			pointing.innerHTML = oldContent		//return to previous content
		}
		else 
		{
			updateBOOK(response)

			var NewRow = findNewRowBOOK(opdate)
			var bookq = BOOK[NewRow]
			$updateCell.eq(NAME).html(bookq.patient)
			$updateCell.eq(AGE).html(putAgeOpdate(bookq.dob, bookq.opdate))
			if (!qn) {	//New case input
				$updateCell.eq(QN).html(BOOK[NewRow].qn)
			}

			if (tableID == 'tbl') {	//New case has no staffname
				if (($("#titlecontainer").css('display') == 'block') && 
					($('#titlename').html() == staffname)) {

					refillanother('queuetbl', cellindex, qn)
				}
			} else {	//New case row was already in tbl
				refillanother('tbl', cellindex, qn)
			}
		}
	}
}

function findNewRowBOOK(opdate)	//find new row (max. qn)
{
	var q = 0
	while (BOOK[q].opdate != opdate)
	{
		q++
		if (q >= BOOK.length)
			return ""
	}

	var qn = Number(BOOK[q].qn)
	var newq = q
	q++
	while (q < BOOK.length && BOOK[q].opdate == opdate) {
		if (Number(BOOK[q].qn) > qn) {
			qn = Number(BOOK[q].qn)
			newq = q
		}
		q++
	}
	return newq
}

function getWaitnum(opdate, staffname)
{
	var prevWaitNum = $($("#editcell").data("editRow")).prev()[0]
	var nextWaitNum = $($("#editcell").data("editRow")).next()[0]
	if (prevWaitNum) {
		prevWaitNum = Number(prevWaitNum.title)
	}
	if (nextWaitNum) {
		nextWaitNum = Number(nextWaitNum.title)
	}
	var prevRowCell = $($("#editcell").data("editRow")).prev().children("td")
	var nextRowCell = $($("#editcell").data("editRow")).next().children("td")
	var prevOpdate = getOpdate(prevRowCell.eq(OPDATE).html())
	var nextOpdate = getOpdate(nextRowCell.eq(OPDATE).html())
	var prevStaffname = prevRowCell.eq(STAFFNAME).html()
	var nextStaffname = nextRowCell.eq(STAFFNAME).html()

	if (prevOpdate != opdate && opdate != nextOpdate) {
		return 1
	}
	else if (prevOpdate == opdate && opdate != nextOpdate) {
		if (prevStaffname == staffname) {
			return prevWaitNum + 1
		} else {
			return 1
		}
	}
	else if (prevOpdate != opdate && opdate == nextOpdate) {
		if (staffname == nextStaffname) {
			return nextWaitNum / 2
		} else {
			return 1
		}
	}
	else if (prevOpdate == opdate && opdate == nextOpdate) {
		if (prevStaffname == staffname) {
			if (staffname == nextStaffname) {
				return (prevWaitNum + nextWaitNum) / 2
			} else {
				return prevWaitNum + 1
			}
		} else {
			if (staffname == nextStaffname) {
				return nextWaitNum / 2
			} else {
				return 1
			}
		}
	}
}

function storePresentcell(pointing)
{
	var rindex = pointing.parentNode.rowIndex
	var cindex = pointing.cellIndex
	var context = ""

	createEditcell(pointing)

	switch(cindex)
	{
		case OPDATE:
			clearEditcellData()
			if ($(pointing).closest('table').attr('id') == 'tbl') {
				context = window.getComputedStyle(pointing,':before').content
				context = context.replace(/\"/g, "")
			}
			context = context + pointing.innerHTML
			$("#editcell").html(context)
			$("#editcell").data("content", context)
			$("#editcell").data("pointing", pointing)
			fillSetTable(rindex, pointing)
			break
		case STAFFNAME:
			saveDataPoint("#editcell", pointing)
			stafflist(pointing)
			break
		case HN:
			if (!pointing.innerHTML) {
				saveDataPoint("#editcell", pointing)
				break
			}
		case NAME:
		case AGE:
			clearEditcellData("hide")
			break
		case DIAGNOSIS:
		case TREATMENT:
		case CONTACT:		//store content in "data" of editcell
			saveDataPoint("#editcell", pointing)
			break
	}
}

function createEditcell(pointing)
{
	$("#editcell").css({
		height: $(pointing).height() + "px",
		width: $(pointing).width() + "px",
		fontSize: $(pointing).css("fontSize")
	})

	$("#editcell").appendTo($(pointing).closest('div'))
	reposition("#editcell", "center", "center", pointing)
	$("#editcell").focus()
}

function reposition(me, mypos, atpos, target)
{
	$(me).position({
		my: mypos,
		at: atpos,
		of: target
	}).show()
	$(me).position({
		my: mypos,
		at: atpos,
		of: target
	}).show()
}

function saveDataPoint(editcell, pointing)
{
	var tableID = $(pointing).closest('table').attr('id')
	var rowIndex = pointing.parentNode.rowIndex
	var cellIndex = pointing.cellIndex

	$(editcell).data("tableID", tableID)
	$(editcell).data("rowIndex", rowIndex)
	$(editcell).data("cellIndex", cellIndex)
	$(editcell).data("editRow", "#"+ tableID +" tr:eq("+ rowIndex +")")
	$(editcell).data("pointing", pointing)
	$(editcell).data("content", pointing.innerHTML)
	$(editcell).html(pointing.innerHTML)
}

function clearEditcellData(display)
{
	var editcell = "#editcell"
	$(editcell).data("tableID", "")
	$(editcell).data("rowIndex", "")
	$(editcell).data("cellIndex", "")
	$(editcell).data("editRow", "")
	$(editcell).data("pointing", "")
	$(editcell).data("content", "")
	$(editcell).html("")
	if (display == "hide") {
		$(editcell).hide()
	}
}

function findPrevcell(event, editable, pointing) 
{
	var $prevcell = $(pointing)
	var column = $prevcell.index()

	if ((column = editable[($.inArray(column, editable) - 1)]))
	{
		$prevcell = $prevcell.parent().children().eq(column)
	}
	else
	{
		do {
			if ($prevcell.parent().index() > 1)
			{	//go to prev row last editable
				$prevcell = $prevcell.parent().prev("tr").children().eq(editable[editable.length-1])
			}
			else
			{	//#tbl tr:1 td:1
				event.preventDefault()
				return false
			}
		}
		while (($prevcell.get(0).nodeName == "TH")	//THEAD row
			|| (!$prevcell.is(':visible')))			//invisible due to colspan
	}

	return $prevcell.get(0)
}

function findNextcell(event, editable, pointing) 
{
	var $nextcell = $(pointing)
	var column = $nextcell.index()

	if ((column = editable[($.inArray(column, editable) + 1)]))
	{
		$nextcell = $nextcell.parent().children().eq(column)
	}
	else
	{
		do {//go to next row first editable
			$nextcell = $($nextcell).parent().next("tr").children().eq(editable[0])
			if (!($nextcell.length)) {
				event.preventDefault()
				return false
			}
		}
		while ((!$nextcell.is(':visible'))	//invisible due to colspan
			|| ($nextcell.get(0).nodeName == "TH"))	//TH row
	}

	return $nextcell.get(0)
}

function findNextRow(event, editable, pointing) 
{
	var $nextcell = $(pointing)

	//go to next row first editable
	do {
		$nextcell = $nextcell.parent().next("tr").children().eq(editable[0])
		if (!($nextcell.length)) {
			event.preventDefault()
			return false	
		}
	}
	while ((!$nextcell.is(':visible'))	//invisible due to colspan
		|| ($nextcell.get(0).nodeName == "TH"))	//TH row

	return $nextcell.get(0)
}
