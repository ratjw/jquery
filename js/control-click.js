function clicktable(clickedCell)
{
	if (clickedCell.id == "editcell")
		return

	if  (clickedCell.nodeName != "TD") {
		$("#editcell").hide()
		return	
	}

	savePreviouscell()
	storePresentcell(clickedCell)
}

function editing(event)
{
	var keycode = event.which || window.event.keyCode
	var thiscell

	if (keycode == 9)
	{
		closemenu()
		savePreviouscell()
		if (event.shiftKey)
			thiscell = findPrevcell(event)
		else
			thiscell = findNextcell(event)
		if (thiscell) {
			storePresentcell(thiscell)
		} else {
			$("#editcell").hide()
			window.focus()
		}
		event.preventDefault()
		return false
	}
	else if (keycode == 13)
	{
		closemenu()
		if (event.shiftKey || event.ctrlKey) {
			return
		}
		savePreviouscell()
		thiscell = findNextHN(event)
		if (thiscell) {
			storePresentcell(thiscell)
		} else {
			$("#editcell").hide()
			window.focus()
		}
		event.preventDefault()
		return false
	}
	else if (keycode == 27)
	{
		closemenu()
		$("#editcell").hide()
		window.focus()
		event.preventDefault()
		return false
	}
}

function closemenu()
{
	$('#menu').hide();
	$('#queuemenu').hide();
	$('#stafflist').hide();
}

function savePreviouscell() 
{
	if (!$("#editcell").data("location"))
		return

	var trimBR = /^(\s*<br\s*\/?>)*\s*|\s*(<br\s*\/?>\s*)*$/g
	var content = $("#editcell").html().replace(trimBR, '')
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
		case TEL:
			saveContent("tel", content)
			break
	}
}

function saveContent(column, content)	//column name in MYSQL
{
	var tableID = $("#editcell").data("tableID")
	var cellindex = $("#editcell").data("cellIndex")
	var rowcell = $($("#editcell").data("tableRow")).children("td")
	var opdate = rowcell.eq(OPDATE).html().numDate()
	var staffname = rowcell.eq(STAFFNAME).html()
	var qn = rowcell.eq(QN).html()
	var sqlstring
	var qsince

	if (!qn)
		qsince = new Date().mysqlDate()

	$($("#editcell").data("location")).html(content)	//just for show instantly

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
		sqlstring += "qsince, opdate, "+ column +", editor) VALUES ('"
		sqlstring += qsince +"', '"+ opdate +"', '"+ content +"', '"+ THISUSER +"');"
	}

	Ajax(MYSQLIPHP, sqlstring, callbacksaveContent);

	function callbacksaveContent(response)
	{
		if (!response || response.indexOf("DBfailed") != -1)
		{
			alert("Failed! update database \n\n" + response)
		}
		else
		{
			updateBOOK(response);
			if (tableID == 'tbl') {
				if (($("#titlecontainer").css('display') == 'block') && 
					($('#titlename').html() == staffname))

					refillthis('queuetbl', cellindex, qn)
			}
			else
				refillthis('tbl', cellindex, qn)
		}
	}
}

function saveHNinput(hn, content)
{
	var tableID = $("#editcell").data("tableID")
	var cellindex = $("#editcell").data("cellIndex")
	var rowcell = $($("#editcell").data("tableRow")).children("td")
	var opdate = rowcell.eq(OPDATE).html().numDate()
	var staffname = rowcell.eq(STAFFNAME).html()
	var patient = rowcell.eq(NAME).html()
	var qn = rowcell.eq(QN).html()
	var qsince

	if (patient)
	{
		$("#editcell").hide()	//just do nothing
		return
	}

	$($("#editcell").data("location")).html(content)

	content = content.replace(/<br>/g, "")
	content = content.replace(/^\s+/g, "")

	if (content.length != 7)
		return
	if (!qn)
		qsince = new Date().mysqlDate()

	var sqlstring = "hn=" + content
	sqlstring += "&qsince="+ qsince
	sqlstring += "&opdate="+ opdate
	sqlstring += "&qn="+ qn
	sqlstring += "&username="+ THISUSER

	Ajax(GETNAMEHN, sqlstring, callbackgetByHN)

	function callbackgetByHN(response)
	{
		if ((!response) || (response.indexOf("patient") == -1) || (response.indexOf("{") == -1))
			alert(response)
		else 
		{
			updateBOOK(response)
			if (tableID == 'tbl') {
				if (($("#titlecontainer").css('display') == 'block') && 
					($('#titlename').html() == staffname))

					refillthis('queuetbl', cellindex, qn)
			}
			else
				refillthis('tbl', cellindex, qn)
		}
	}
}

function storePresentcell(pointing)
{  
	var rindex = $(pointing).closest("tr").index()
	var cindex = $(pointing).closest("td").index()

	switch(cindex)
	{
		case OPDATE:
			editcell(pointing)
			fillSetTable(rindex, pointing)
			break
		case STAFFNAME:
			editcell(pointing)
			$("#editcell").data("content", pointing.innerHTML)
			stafflist(pointing)
			break
		case NAME:
		case AGE:
			$("#editcell").hide()
			break
		case HN:
		case DIAGNOSIS:
		case TREATMENT:
		case TEL:		//store content in "data" of editcell
			editcell(pointing)
			$("#editcell").data("content", pointing.innerHTML)
			break
	}
}

function editcell(pointing)
{
	var editcell = "#editcell"
	saveDataPoint(editcell, pointing)
	positioning(editcell, pointing)
	$(editcell).show()
	$(editcell).focus()
}

function saveDataPoint(editcell, pointing)
{
	var tableID = $(pointing).closest('table').attr('id')
	var rowIndex = $(pointing).closest('tr').index()
	var cellIndex = $(pointing).index()

	$(editcell).data("location", "#"+ tableID +" tr:eq("+ rowIndex +") td:eq("+ cellIndex +")")
	$(editcell).data("tableRow", "#"+ tableID +" tr:eq("+ rowIndex +")")
	$(editcell).data("tableID", tableID)
	$(editcell).data("rowIndex", rowIndex)
	$(editcell).data("cellIndex", cellIndex)
	$(editcell).html($(pointing).html())
}

function positioning(editcell, pointing)
{
	var pos = $(pointing).position()

	$(editcell).css({
		top: pos.top + "px",
		left: pos.left + "px",
		height: $(pointing).height() + "px",
		width: $(pointing).width() + "px",
		fontSize: $(pointing).css("fontSize"),
	})
}

function findPrevcell(event) 
{
	var prevcell = $($("#editcell").data("location"))
	var column = prevcell.index()

	if (column = EDITABLE[($.inArray(column, EDITABLE) - 1)])
	{
		prevcell = $(prevcell).parent().children().eq(column)
	}
	else
	{
		if ($(prevcell).parent().index() > 1)
		{	//go to prev row last editable
			do {
				prevcell = $(prevcell).parent().prev("tr").children().eq(EDITABLE[EDITABLE.length-1])
			}
			while ($(prevcell).get(0).nodeName == "TH")	//THEAD row
		}
		else
		{	//#tbl tr:1 td:1
			event.preventDefault()
			return false
		}
	}

	return $(prevcell).get(0)
}

function findNextcell(event) 
{
	var nextcell = $($("#editcell").data("location"))
	var column = nextcell.index()
	var lastrow = $('#tbl tr:last-child').index()

	if (column = EDITABLE[($.inArray(column, EDITABLE) + 1)])
	{
		nextcell = $(nextcell).parent().children().eq(column)
	}
	else
	{
		if ($(nextcell).parent().index() < lastrow)
		{	//go to next row first editable
			do {
				if (!(nextcell = $(nextcell).parent().next("tr").children().eq(EDITABLE[0]))) {
					event.preventDefault()
					return false
				}
			}
			while ($(nextcell).get(0).nodeName == "TH")	//THEAD row
		}
		else
		{	//#tbl tr:last-child td:last-child
			event.preventDefault()
			return false
		}
	}

	return $(nextcell).get(0)
}

function findNextHN(event) 
{
	var nextcell = $($("#editcell").data("location"))
	var lastrow = $('#tbl tr:last-child').index()

	if ($(nextcell).parent().index() < lastrow)
	{	//go to next row first editable
		do {
			if (!(nextcell = $(nextcell).parent().next("tr").children().eq(EDITABLE[0]))) {
				event.preventDefault()
				return false	
			}
		}
		while ($(nextcell).get(0).nodeName == "TH")	//THEAD row
	}
	else
	{	//#tbl tr:last-child td:last-child
		event.preventDefault()
		return false
	}

	return $(nextcell).get(0)
}
