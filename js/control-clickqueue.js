function Qclicktable(clickedCell)
{
	if ((clickedCell.id == "editcell") || (clickedCell.nodeName != "TD"))
			return

	savePreviouscellQueue()
	storePresentcellQueue(clickedCell)
}

function editingqueue(event)
{
	var keycode = event.which || window.event.keyCode
	var thiscell

	if (keycode == 9)
	{
		savePreviouscellQueue()
		if (event.shiftKey)
			thiscell = findPrevcellQueue(event)
		else
			thiscell = findNextcellQueue(event)
		if (thiscell) {
			storePresentcellQueue(thiscell)
		} else {
			$("#editcell").hide()
			window.focus()
		}
		event.preventDefault()
		return false
	}
	else if (keycode == 13)
	{
		if (event.shiftKey || event.ctrlKey) {
			return
		}
		savePreviouscellQueue()
		thiscell = findNextcellQueue(event)
		if (thiscell) {
			storePresentcellQueue(thiscell)
		} else {
			$("#editcell").hide()
			window.focus()
		}
		event.preventDefault()
		return false
	}
	else if (keycode == 27)
	{
		if ($("#editcell").data("located").index() == QSINCE)
		{
			$(".ui-menu").hide()
		}
		else
		{
			$("#editcell").data("located").html($("#editcell").data("content"))
		}
		$("#editcell").hide()
		window.focus()
		event.preventDefault()
		return false
	}
}

function savePreviouscellQueue() 
{
	if (!$("#editcell").data("located"))
		return

	var content = $("#editcell").html()
	if ($("#editcell").data("located").index() == QHN)
		content = content.replace(/<br>/g, "")
	if (content == $("#editcell").data("content"))
		return

	$("#editcell").data("located").html(content)
	var editcindex = $("#editcell").data("located").index()

	switch(editcindex)
	{
		case QNUM:
			$(".ui-menu").hide()
		case QSINCE:
			break
		case QHN:
			saveHNinputQueue("hn", content)
			break
		case QNAME:
		case QAGE:
			break
		case QDIAGNOSIS:
			saveContentQueue("diagnosis", content)
			break
		case QTREATMENT:
			saveContentQueue("treatment", content)
			break
		case QTEL:
			saveContentQueue("tel", content)
			break
	}
}

function saveContentQueue(column, content)
{
	var row = $("#editcell").data("located").closest("tr")
	var rownum = row.index()
	var rowcell = row.children("td")
	var opdate = rowcell.eq(QSINCE).html().numDate()
	var qn = rowcell.eq(QQN).html()
	var staffname = $( "#titlename" ).html()
	var sqlstring
	var waitnum

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
		waitnum = findMAXwaitnum(staffname) + 1

		sqlstring = "sqlReturnbook=INSERT INTO book ("
		sqlstring += "waitnum, qsince, opdate, staffname, "+ column +", editor) VALUES ("
		sqlstring += waitnum +", '"+ qsince +"', '0000-00-00', '"+ staffname +"', '"
		sqlstring += content +"', '"+ THISUSER +"');"
	}

	Ajax(MYSQLIPHP, sqlstring, callbacksaveContentQueue);

	function callbacksaveContentQueue(response)
	{
		if (!response || response.indexOf("DBfailed") != -1)
		{
			alert("Failed! update database \n\n" + response)
			$("#editcell").hide()
		}
		else
		{
			updateBOOK(response);
			$("#editcell").data("located").html(content)
			fillselectQueue(rownum, rowcell, waitnum, qn)
			$("#editcell").data("content", "")
		}
	}
}

function findwaitnum(qn)	
{
	var q = 0
	while ((q < BOOK.length) && (BOOK[q].qn != qn))
		q++

	return BOOK[q].waitnum
}

function findQsince(qn)	
{
	var q = 0
	while ((q < BOOK.length) && (BOOK[q].qn != qn))
		q++

	return BOOK[q].qsince
}

function findwaitnumQ(qn)	
{
	var q = 0
	while ((q < QWAIT.length) && (QWAIT[q].qn != qn))
		q++

	return QWAIT[q].waitnum
}

function findQsinceQ(qn)	
{
	var q = 0
	while ((q < QWAIT.length) && (QWAIT[q].qn != qn))
		q++

	return QWAIT[q].qsince
}

function findMAXwaitnum(staffname)	//latest queue of a particular staff
{
	var waitnumB, waitnumQ

	var waitnumB = BOOK[0].waitnum
	for (var q = 1; q < BOOK.length; q++)
	{
		if (BOOK[q].staffname == staffname)
			waitnumB = Math.max(waitnumB, BOOK[q].waitnum)
	}

	if (QWAIT.length == 0)
	{
		if (waitnumB)
			return waitnumB
		else
			return 0
	}

	var waitnumQ = QWAIT[0].waitnum
	for (var q = 1; q < QWAIT.length; q++)
	{
		if (QWAIT[q].staffname == staffname)
			waitnumQ = Math.max(waitnumQ, QWAIT[q].waitnum)
	}

	if (waitnumB)
		return Math.max(waitnumB, waitnumQ)
	else 
		return waitnumQ
}

function saveHNinputQueue(hn, content)
{
	var rowtr = $("#editcell").data("located").closest("tr").children("td")
	var qsince = rowtr.eq(QSINCE).html().numDate()
	var patient = rowtr.eq(QNAME).html()
	var qn = rowtr.eq(QQN).html()
	var staffname = $( "#titlename" ).html()
	var sqlstring, waitnum

	if (patient)
	{
		$("#editcell").html($("#editcell").data("content"))
		return
	}

	content = content.replace(/<br>/g, "")
	content = content.replace(/^\s+/g, "")

	if (qn)
		waitnum = findwaitnumQ(qn)
	else
		waitnum = findMAXwaitnum(staffname) + 1

	sqlstring = "hn=" + content
	sqlstring += "&waitnum="+ waitnum
	sqlstring += "&qsince="+ qsince
	sqlstring += "&opdate=0000-00-00"
	sqlstring += "&staffname="+ staffname
	sqlstring += "&qn="+ qn
	sqlstring += "&username="+ THISUSER

	Ajax(GETNAMEHN, sqlstring, callbackgetByHNqueue)
	//AJAX-false to prevent repeated GETNAMEHN when press <enter>

	function callbackgetByHNqueue(response)
	{
		if (!response || response.indexOf("patient") == -1)	//no patient
			alert("Error getnamehn : "+ response)
		else if (response.indexOf("DBfailed") != -1)
			alert("Failed! book($mysqli)" + response)
		else if (response.indexOf("{") != -1)
		{	//Only one patient
			updateBOOK(response)
			staffqueue(staffname)
		}
	}
}

function storePresentcellQueue(pointing)
{  
	var cindex = $(pointing).closest("td").index()
	var rowtr = $(pointing).closest("tr")
	var rindex = $(rowtr).index()
	var qn = $(rowtr).children("td").eq(QQN).html()

	editcell(pointing)

	switch(cindex)
	{
		case QNUM:
			fillSetTableQueue(pointing)
			break
		case QSINCE:
		case QNAME:
		case QAGE:
			$("#editcell").hide() //disable self (uneditable cell)
			$(".ui-menu").hide()
			break
		case QHN:
		case QDIAGNOSIS:
		case QTREATMENT:
		case QTEL:		//store content in "data" of editcell
			$("#editcell").data("content", $(pointing).html())
			$(".ui-menu").hide()
			break
	}
}

function findPrevcellQueue(event) 
{
	var prevcell = $("#editcell").data("located")
	var column = prevcell.index()

	if (column = EDITQUEUE[($.inArray(column, EDITQUEUE) - 1)])
	{
		prevcell = $(prevcell).parent().children().eq(column)
	}
	else
	{
		if ($(prevcell).parent().index() > 1)
		{	//go to prev row last editable
			do {
				prevcell = $(prevcell).parent().prev("tr").children().eq(EDITQUEUE[EDITQUEUE.length-1])
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

function findNextcellQueue(event) 
{
	var nextcell = $("#editcell").data("located")
	var column = nextcell.index()
	var lastrow = $('#queuetbl tr:last-child').index()
	
	if (column = EDITQUEUE[($.inArray(column, EDITQUEUE) + 1)])
	{
		nextcell = $(nextcell).parent().children().eq(column)
	}
	else
	{
		if ($(nextcell).parent().index() < lastrow)
		{	//go to next row first editable
			do {
				nextcell = $(nextcell).parent().next("tr").children().eq(EDITQUEUE[0])
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
