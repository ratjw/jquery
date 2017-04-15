function clicktable(clickedCell)
{
	savePreviouscell()
	storePresentcell(clickedCell)
}

function keyin(event)
{
	var keycode = event.which || window.event.keyCode
	var table = '#' + $('#editcell').data("tableID")
	var editable = EDITABLE
	var pointing = $($("#editcell").data("editCell"))
	var thiscell

	if (keycode == 9)
	{
		$('#menu').hide();
		$('#stafflist').hide();
		savePreviouscell()
		if (event.shiftKey) {
			thiscell = findPrevcell(event, editable, pointing)
			if ((thiscell.cellIndex == HN) && (thiscell.innerHTML != "")) {
				thiscell = findPrevcell(event, editable, thiscell)
			}
		} else {
			thiscell = findNextcell(event, table, editable, pointing)
			if ((thiscell.cellIndex == HN) && (thiscell.innerHTML != "")) {
				thiscell = findNextcell(event, table, editable, thiscell)
			}
		}
		if (thiscell) {
			storePresentcell(thiscell)
		} else {
			resetEditcell()
			window.focus()
		}
		event.preventDefault()
		return false
	}
	else if (keycode == 13)
	{
		$('#menu').hide();
		$('#stafflist').hide();
		if (event.shiftKey || event.ctrlKey) {
			return
		}
		savePreviouscell()
		thiscell = findNextRow(event, table, editable)
		if ((thiscell.cellIndex == HN) && (thiscell.innerHTML != "")) {
			thiscell = findNextcell(event, table, editable, pointing)
		}
		if (thiscell) {
			storePresentcell(thiscell)
		} else {
			resetEditcell()
			window.focus()
		}
		event.preventDefault()
		return false
	}
	else if (keycode == 27)
	{
		$('#menu').hide();
		$('#stafflist').hide();
		resetEditcell()
		window.focus()
		event.preventDefault()
		return false
	}
}

function savePreviouscell() 
{
	if (!$("#editcell").data("editCell"))
		return

	var trimHTML = /^(\s*<[^>]*>)*\s*|\s*(<[^>]*>\s*)*$/g
	var content = $("#editcell").html().replace(trimHTML, '')
	var HTMLnotBR =/(<((?!br)[^>]+)>)/ig
	content = $("#editcell").html().replace(HTMLnotBR, '')

	if (content == $("#editcell").data("content"))
		return

	switch($("#editcell").data("cellIndex"))
	{
		case OPDATE:
			break
		case STAFFNAME:
			saveContent("staffname", content)	//column name in MYSQL
			break
		case HN:
			saveHNinput("hn", content)
			break
		case NAME:
		case AGE:
			break
		case DIAGNOSIS:
			saveContent("diagnosis", content)
			break
		case TREATMENT:
			saveContent("treatment", content)
			break
		case CONTACT:
			saveContent("contact", content)
			break
	}
}

function saveContent(column, content)	//column name in MYSQL
{
	var tableID = $("#editcell").data("tableID")
	var cellindex = $("#editcell").data("cellIndex")
	var rowcell = $($("#editcell").data("editRow")).children("td")
	var opdate = rowcell.eq(OPDATE).html().numDate()
	var staffname = rowcell.eq(STAFFNAME).html()
	var qn = rowcell.eq(QN).html()
	var sqlstring
	var since

	if (!qn)
		since = new Date().mysqlDate()

	$($("#editcell").data("editCell")).html(content)	//just for show instantly

	content = URIcomponent(content)			//take care of white space, double qoute, 
											//single qoute, and back slash
	if (qn)
	{
		sqlstring = "sqlReturnbook=UPDATE book SET "
		sqlstring += column +" = '"+ content
		sqlstring += "', editor='"+ THISUSER
		sqlstring += "' WHERE qn = "+ qn +";"
	}
	else
	{
		sqlstring = "sqlReturnbook=INSERT INTO book ("
		sqlstring += "since, opdate, "+ column +", editor) VALUES ('"
		sqlstring += since +"', '"+ opdate +"', '"+ content +"', '"+ THISUSER +"');"
	}

	Ajax(MYSQLIPHP, sqlstring, callbacksaveContent);

	function callbacksaveContent(response)
	{
		if (!response || response.indexOf("DBfailed") != -1)
		{
			alert("Failed! update database \n\n" + response)
			$($("#editcell").data("editCell")).html($("#editcell").data("content"))
			//return to previous content
		}
		else
		{
			updateBOOK(response);
			if (tableID == 'tbl') {
				if (!qn) {
					var Newqn = findNewqn(opdate)
					var editedRow = $($("#editcell").data("editRow"))
					editedRow.children().eq(QN).html(Newqn)
				}
				if (($("#titlecontainer").css('display') == 'block') && 
					($('#titlename').html() == staffname))

					refillanother('queuetbl', cellindex, qn)
			}
			else
				refillanother('tbl', cellindex, qn)
		}
	}
}

function saveHNinput(hn, content)
{
	var tableID = $("#editcell").data("tableID")
	var cellindex = $("#editcell").data("cellIndex")
	var rowcell = $($("#editcell").data("editRow")).children("td")
	var opdate = rowcell.eq(OPDATE).html().numDate()
	var staffname = rowcell.eq(STAFFNAME).html()
	var patient = rowcell.eq(NAME).html()
	var qn = rowcell.eq(QN).html()
	var since

	$($("#editcell").data("editCell")).html(content)

	content = content.replace(/<br>/g, "")
	content = content.replace(/^\s+/g, "")

	if (content.length != 7)
		return
	if (!qn)
		since = new Date().mysqlDate()

	var sqlstring = "hn=" + content
	sqlstring += "&since="+ since
	sqlstring += "&opdate="+ opdate
	sqlstring += "&qn="+ qn
	sqlstring += "&username="+ THISUSER

	Ajax(GETNAMEHN, sqlstring, callbackgetByHN)

	function callbackgetByHN(response)
	{
		if ((!response) || (response.indexOf("patient") == -1) || (response.indexOf("{") == -1)) 
		{
			alert(response)
			$($("#editcell").data("editCell")).html($("#editcell").data("content"))
			//return to previous content
		}
		else 
		{
			updateBOOK(response)
			if (tableID == 'tbl') {
				if (!qn) {
					var Newqn = findNewqn(opdate)
					var prevEditRow = $($("#editcell").data("editRow"))
					prevEditRow.children().eq(QN).html(Newqn)
				}
				if (($("#titlecontainer").css('display') == 'block') && 
					($('#titlename').html() == staffname))

					refillanother('queuetbl', cellindex, qn)
			}
			else
				refillanother('tbl', cellindex, qn)
		}
	}
}

function findNewqn(opdate)
{
	var q = 0
	while (BOOK[q].opdate != opdate)
	{
		q++
		if (q >= BOOK.length)
			return ""
	}

	var qn = BOOK[q].qn
	while (q < BOOK.length && BOOK[q].opdate == opdate) {
		q++
		if (BOOK[q].qn > qn) {
			qn = BOOK[q].qn
		}
	}
	return qn
}

function storePresentcell(pointing)
{
	var rindex = $(pointing).closest("tr").index()
	var cindex = $(pointing).closest("td").index()

	switch(cindex)
	{
		case OPDATE:
			resetEditcell()
			editcell(pointing)
			var content = window.getComputedStyle(pointing,':before').content
			content = content.replace(/\"/g, "")
			$("#editcell").html(content + pointing.innerHTML)
			fillSetTable(rindex, pointing)
			break
		case STAFFNAME:
			editcell(pointing)
			saveDataPoint("#editcell", pointing)
			stafflist(pointing)
			break
		case HN:
			if (!pointing.innerHTML) {
				editcell(pointing)
				saveDataPoint("#editcell", pointing)
				break
			}
		case NAME:
		case AGE:
			resetEditcell()
			break
		case DIAGNOSIS:
		case TREATMENT:
		case CONTACT:		//store content in "data" of editcell
			editcell(pointing)
			saveDataPoint("#editcell", pointing)
			break
	}
}

function editcell(pointing)
{
	$("#editcell").css({
		height: $(pointing).height() + "px",
		width: $(pointing).width() + "px",
		fontSize: $(pointing).css("fontSize")
	})

	$("#editcell").appendTo($(pointing).closest('div'))
	$("#editcell").focus()
	reposition("#editcell", "center", "center", pointing)
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
	$(me).position({
		my: mypos,
		at: atpos,
		of: target
	}).show()
}

function saveDataPoint(editcell, pointing)
{
	var tableID = $(pointing).closest('table').attr('id')
	var rowIndex = $(pointing).closest('tr').index()
	var cellIndex = $(pointing).index()

	$(editcell).data("editCell", "#"+ tableID +" tr:eq("+ rowIndex +") td:eq("+ cellIndex +")")
	$(editcell).data("editRow", "#"+ tableID +" tr:eq("+ rowIndex +")")
	$(editcell).data("tableID", tableID)
	$(editcell).data("rowIndex", rowIndex)
	$(editcell).data("cellIndex", cellIndex)
	$(editcell).data("content", pointing.innerHTML)
	$(editcell).html(pointing.innerHTML)
}

function resetEditcell()
{
	var editcell = '#editcell'
	$(editcell).data("editCell", "")
	$(editcell).data("editRow", "")
	$(editcell).data("tableID", "")
	$(editcell).data("rowIndex", "")
	$(editcell).data("cellIndex", "")
	$(editcell).data("content", "")
	$(editcell).html("")
	$(editcell).hide()
}

function findPrevcell(event, editable, pointing) 
{
	var prevcell = pointing
	var column = prevcell.index()

	if ((column = editable[($.inArray(column, editable) - 1)]))
	{
		prevcell = prevcell.parent().children().eq(column)
	}
	else
	{
		if (prevcell.parent().index() > 1)
		{	//go to prev row last editable
			do {
				prevcell = prevcell.parent().prev("tr").children().eq(editable[editable.length-1])
			}
			while ((prevcell.get(0).nodeName == "TH")	//THEAD row
				|| (!prevcell.is(':visible')))			//invisible due to colspan
		}
		else
		{	//#tbl tr:1 td:1
			event.preventDefault()
			return false
		}
	}

	return prevcell.get(0)
}

function findNextcell(event, table, editable, pointing) 
{
	var nextcell = pointing
	var column = nextcell.index()
	var lastrow = $(table + ' tr:last-child').index()

	if ((column = editable[($.inArray(column, editable) + 1)]))
	{
		nextcell = nextcell.parent().children().eq(column)
	}
	else
	{
		if (nextcell.parent().index() < lastrow)
		{	//go to next row first editable
			do {
				if (!((nextcell = $(nextcell).parent().next("tr").children().eq(editable[0])))) {
					event.preventDefault()
					return false
				}
			}
			while ((nextcell.get(0).nodeName == "TH")	//THEAD row
				|| (!nextcell.is(':visible')))			//invisible due to colspan
		}
		else
		{	//#tbl tr:last-child td:last-child
			event.preventDefault()
			return false
		}
	}

	return nextcell.get(0)
}

function findNextRow(event, table, editable, pointing) 
{
	var nextcell = pointing
	var lastrow = $(table + ' tr:last-child').index()

	if (nextcell.parent().index() < lastrow)
	{	//go to next row first editable
		do {
			if (!((nextcell = $(nextcell).parent().next("tr").children().eq(editable[0])))) {
				event.preventDefault()
				return false	
			}
		}
		while ((nextcell.get(0).nodeName == "TH")	//TH row
			|| (!nextcell.is(':visible')))			//invisible due to colspan
	}
	else
	{	//#tbl tr:last-child td:last-child
		event.preventDefault()
		return false
	}

	return nextcell.get(0)
}
