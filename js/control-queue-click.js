function Qclicktable(clickedCell)
{
	if (clickedCell.id == "editcell")
		return

	$("#editcell").hide()
	$(".ui-menu").hide()

	if  (clickedCell.nodeName != "TD")
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
		if ($("#editcell").data("cellIndex") == QOPDATE)
			$(".ui-menu").hide()

		$("#editcell").hide()	//just do nothing
		window.focus()
		event.preventDefault()
		return false
	}
}

function savePreviouscellQueue() 
{
	if ((!$("#editcell").data("location")) ||
		($("#editcell").data('tableID') != 'queuetbl'))
	{
		return
	}

	var content = $("#editcell").html().replace(/^(\s*<br\s*\/?>)*\s*|\s*(<br\s*\/?>\s*)*$/g, '')
	if (content == $("#editcell").data("content"))
		return

	switch($("#editcell").data("cellIndex"))
	{
		case QOPDATE:
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
	var rowtr = $($("#editcell").data("tableRow"))
	var rowcell = rowtr.children("td")
	var qsince = rowcell.eq(QOPDATE).html().numDate()	//already new Date() in new row
	var opdate = rowcell.eq(QOPDATE).html().numDate()	//already new Date() in new row
	var qn = rowcell.eq(QQN).html()
	var staffname = $( "#titlename" ).html()
	var sqlstring, prevqn

	$($("#editcell").data("location")).html(content)	//just for show instantly

	content = URIcomponent(content)			//encodes white space, double qoute, 
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
		sqlstring += "qsince, opdate, staffname, "
		sqlstring += column +", editor) VALUES ('"
		sqlstring += qsince +"', '"+ opdate +"', '"+ staffname +"', '"
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
			staffqueue(staffname)
		}
	}
}

function saveHNinputQueue(hn, content)
{
	var rowtr = $($("#editcell").data("tableRow"))
	var rowcell = rowtr.children("td")
	var qsince = rowcell.eq(QOPDATE).html().numDate()	//already new Date() in new row
	var opdate = rowcell.eq(QOPDATE).html().numDate()	//already new Date() in new row
	var patient = rowcell.eq(QNAME).html()
	var qn = rowcell.eq(QQN).html()
	var staffname = $( "#titlename" ).html()
	var sqlstring, prevqn

	if (patient)
	{
		$("#editcell").hide()	//just do nothing
		return
	}

	$($("#editcell").data("location")).html(content)	//just for show instantly

	content = content.replace(/<br>/g, "")
	content = content.replace(/^\s+/g, "")

	if (content.length != 7)
		return

	sqlstring = "hn=" + content
	sqlstring += "&qsince="+ qsince		//already new Date() in new row
	sqlstring += "&opdate="+ opdate
	sqlstring += "&staffname="+ staffname
	sqlstring += "&qn="+ qn
	sqlstring += "&username="+ THISUSER

	Ajax(GETNAMEHN, sqlstring, callbackgetByHNqueue)
	//AJAX-false to prevent repeated GETNAMEHN when press <enter>

	function callbackgetByHNqueue(response)
	{
		if ((!response) || (response.indexOf("patient") == -1) || (response.indexOf("{") == -1))
			alert(response)
		else if (response.indexOf("{") != -1)
		{	//Only one patient
			updateBOOK(response)
			staffqueue(staffname)
		}
	}
}

function findwaitnumQ(qn)
{  
	var waitnum
	$(BOOK).each(function() {
		waitnum = this.waitnum
		return (this.qn != qn)
	})
	return Number(waitnum)
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
		case QOPDATE:
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
			$("#editcell").data("content", pointing.innerHTML)
			$(".ui-menu").hide()
			break
	}
}

function findPrevcellQueue(event) 
{
	var prevcell = $($("#editcell").data("location"))
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
	var nextcell = $($("#editcell").data("location"))
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
