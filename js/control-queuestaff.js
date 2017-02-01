function staffqueue(staffname)
{	//Display all cases of only one staff as popup menu
	var queuediv = document.getElementById("queuediv")
	var queuedivin = document.getElementById("queuedivin")
	var queuespan = document.getElementById("queuespan")
	var qtable = document.getElementById("queuetbl")
	var i, q
	var rowi = {}
	var winheight = $(window).height()
	var winwidth = $(window).width()
	var xpos = 0
	var ypos = 0

	document.getElementById("overlayqueue").style.display = ""
	updateQWAITFILL(staffname)
	queuespan.innerHTML = staffname || "Click to enter staffname"

	//delete previous qtable lest it accumulates
	while (qtable.rows[1])
		qtable.deleteRow(-1) 
	for (i=0,q=0; q < QWAITFILL.length; q++)
	{
		rowi = makenextrowqueue(qtable, ++i)
		filldataqueue(QWAITFILL, rowi, q)
	}
	if ((q==0) || (document.getElementById("movemode") && document.getElementById("movemode").className))
	{	//no patient in waiting list || movemode from main table
		rowi = makenextrowqueue(qtable, ++i)
		rowi.cells[QWAITNUM].innerHTML = i
		rowi.cells[QSINCE].innerHTML = new Date().MysqlDate().thDate()
		rowi.cells[QSTAFFNAME].innerHTML = staffname
	}
	document.getElementById("menudiv").style.display = ""	//close menu from FirstColumn
	queuediv.style.display = "block"
	queuediv.style.left = xpos +"px"
	queuediv.style.top = ypos + winheight*1/10 +"px"
	queuediv.style.height = ""	//delete queuediv height from previous changestaff
	queuedivin.style.height = ""	//delete queuedivin height from previous staffqueue
	if (queuedivin.offsetHeight > (winheight*8/10))
	{
		queuedivin.style.height = winheight*8/10 +"px"
		queuedivin.style.overflowX = "hidden"
		queuedivin.style.overflowY = "scroll"
	}
	else
	{
		queuedivin.style.height = ""
		queuedivin.style.overflowX = "hidden"
		queuedivin.style.overflowY = "hidden"
	}
	queuedivin.style.width = winwidth*9/10 +"px"
	queuediv.onclick = Qclicktable
	queuediv.onmousedown = dragHandler
}

function makenextrowqueue(table, i)
{	// i = the row to be made
	var cols = table.rows[0].cells.length
	var rowi
	var j = 0

	rowi = table.insertRow(i)
	while (j < cols)
		rowi.insertCell(j++)
	rowi.cells[QWAITNUM].style.textAlign = "center"
	rowi.cells[cols-1].style.display = "none"
	return rowi
}

function filldataqueue(book, rowi, q)
{
	rowi.cells[QWAITNUM].innerHTML = book[q].waitnum
	rowi.cells[QSINCE].innerHTML = book[q].opdate.thDate()
	rowi.cells[QSTAFFNAME].innerHTML = book[q].staffname
	rowi.cells[QHN].innerHTML = book[q].hn
	rowi.cells[QNAME].innerHTML = book[q].patientname
	rowi.cells[QAGE].innerHTML = book[q].dob.getAge()
	rowi.cells[QDIAGNOSIS].innerHTML = dxstring(book, q)
	rowi.cells[QTREATMENT].innerHTML = rxstring(book, q)
	rowi.cells[QTEL].innerHTML = book[q].tel
	rowi.cells[QQN].innerHTML = book[q].qn
}

function xqueue()
{
	document.getElementById("queuediv").style.display = ""
	document.getElementById("menudiv").style.display = ""
	stopeditmode()
}

function changestaff(that, staffname)
{
	var each, txt, tex
	var qdiv = document.getElementById("queuediv")
	var overlayq = document.getElementById("overlayqueue")
	var staffeach0, staffeach1

	overlayq.innerHTML = ""
	for (each=0; each<ALLLISTS.staff.length; each++)
	{
		staffeach0 = ALLLISTS.staff[each][0]
		staffeach1 = ALLLISTS.staff[each][1]
		if (staffeach1 == staffname)
			continue
		tex = "javascript:staffqueue('"+ staffeach0 +"', '"+ staffeach1 +"')"
		txt = '<a href="'+ tex +'">'+ staffeach1 +'</a>'
		overlayq.innerHTML += txt
	}
	overlayq.style.display = "block"
	overlayq.style.top = that.offsetTop + that.offsetHeight +"px"
	overlayq.style.left = that.offsetLeft +"px"
	if (qdiv.offsetHeight < overlayq.offsetHeight + 25)	//div head height = 25px
		qdiv.style.height = overlayq.offsetHeight + 25 +"px"
	stopeditmode()
}

function Qclicktable(event)
{
	event = event || window.event	//for IE

	//checkpoint#1 : click in editing area
	var pointing = whichElement(event)
	if (pointing.id == "editmode")
		return

	//checkpoint#2 : click on staffname to list others
	if (pointing.id == "queuespan")
		return		//return to changestaff

	//checkpoint#3 : click on other name to change
	if (pointing.nodeName == "A")
		return		//return to href link

	//checkpoint#4 : click on qcalendar
	if (checkCalendar(pointing))
		return		//return to qcalendar routine

	//checkpoint#5 : click on table header : dragHandler
	if (pointing.nodeName != 'TD')
	{	//close changestaff not close QFirstColumn overlayqueue
		var overlayq = document.getElementById("overlayqueue")
		if ((overlayq.style.display == "block") && 
			(overlayq.innerHTML.indexOf("staffqueue") != -1))
			overlayq.style.display = ""
		return
	}
	
	//checkpoint#6 : click TD not in editing area, disable elsewhere editing area
	if (document.getElementById("editmode"))	//td only one id is "editmode"
	{
		hidepopupqueue()
		stopeditmode()
		return
	}	
	var table = document.getElementById("queuetbl")
	var rindex = $(pointing).closest("tr").index()
	var cindex = pointing.cellIndex
	var rowmain = table.rows[rindex]
	var pointQnum = rowmain.cells[QWAITNUM].innerHTML
	var qn = rowmain.cells[QQN].innerHTML
	var movemode = document.getElementById("movemode")

	//checkpoint#7 : previously marked QN to move
	if (movemode)
	{
		movetoQwait(movemode, pointQnum)
		stopeditmode()
		return
	}

	//checkpoint#8 : click not in editing area, disable elsewhere editing area
	if (checkpopup(pointing))	//any popup other than pointing at
	{
		hidepopupqueue()
		stopeditmode()
		return
	}	

	//checkpoint#9 : click on blank row
	if (rowmain.cells[QQN].innerHTML == "")
	{
		if ((document.getElementById("queuespan").innerHTML == "staffname") || 
			(cindex != QWAITNUM && cindex != QHN && cindex != QNAME))
		{	//allow : fillSetTable, HNinput
			stopeditmode()
			window.focus()
			return
		}
	}

	//Qclicktable of each cell
	switch(cindex)
	{
		case QWAITNUM:
			Qtable(pointing, rindex)
			break
		case QSINCE:
			sinceCalendar(pointing, qn)
			break
		case QHN:
			HNinputqueue(pointing)
			break
		case QNAME:
//			NAMEinputqueue(pointing)
			break
		case QDIAGNOSIS:
			diagnosis(pointing, qn, QWAITFILL)
			break
		case QTREATMENT:
			treatment(pointing, qn, QWAITFILL)
			break
		case QTEL:
			qphone(document.getElementById("qteldiv"), pointing, qn)
			break
	}
	return
}

function Qtable(that, rownum)
{	//QFirstColumn
	var qdiv = document.getElementById("queuediv")
	var qdivin = document.getElementById("queuedivin")
	var table = document.getElementById("queuetbl")
	var tcell = table.rows[rownum].cells
	var casename = tcell[QNAME].innerHTML
	var queue = tcell[QQN].innerHTML
	var Set = new Array()
	var each
	var txt, tex
	var overlayq = document.getElementById("overlayqueue")

	casename = casename.substring(0, casename.indexOf(' '))
	Set[0] = queue? "เพิ่มก่อน case " + casename : ""
	Set[1] = queue? "เพิ่มหลัง case " + casename : ""
	Set[2] = queue? "ลบ case ผ่าตัด " + casename : ""
	Set[3] = queue? "Move case " + casename +" ไปคิวอื่น" : ""
	Set[4] = queue? "Move case " + casename +" ไปวันผ่าตัด" : ""
	Set[5] = queue? "PACS " + casename : ""
	Set[6] = queue? "LABs " + casename : ""
	overlayq.innerHTML = ""
	for (each=0; each<Set.length; each++)
	{
		tex = "javascript:QFirstColumn('"+ each +"','"+ rownum +"')"
		txt = '<a href="'+ tex +'">'+ Set[each] +'</a>'
		overlayq.innerHTML += txt
	}
	overlayq.style.display = "block"
	var top = that.offsetTop - qdivin.scrollTop
	var ohi = overlayq.offsetHeight
	if ((top + ohi) > qdiv.offsetHeight)
		top = top - ohi + that.offsetHeight
	if (top < 25)	//div head height = 25px
		top = 25
	overlayq.style.top = top +"px"
	overlayq.style.left = that.offsetLeft + that.offsetWidth +"px"
	if (qdiv.offsetHeight < overlayq.offsetHeight + 25)
		qdiv.style.height = overlayq.offsetHeight + 25 +"px"
	that.id = "editmode"
}

function QFirstColumn(saveval, rownum)
{
	var table = document.getElementById("queuetbl")
	var rowmain = table.rows[rownum]
	var qn = rowmain.cells[QQN].innerHTML
	var hn = rowmain.cells[QHN].innerHTML

	switch(saveval)
	{
		case "0":
		case "1":
			qaddrow(rowmain, saveval)
			return;
		case "2":
			if (qn)
				qdeletecase(rowmain, qn)
			break;
		case "3":
			qpremovecase(rowmain)
			return;
		case "4":
			qpremovetoOpDate(rowmain)
			return;
		case "5":
			if (hn)
				PACS(hn)
			break
		case "6":
			if (hn)
				getlab(hn)
			break
	}
}

function qaddrow(rowmain, saveval)
{
	stopeditmode()	//editmode of qFirstColumn Cell was started by Qtable
	if (rowmain.cells[QQN].innerHTML)
	{
		var table = document.getElementById("queuetbl")
		var i = rowmain.rowIndex
		var clone = rowmain.cloneNode(true)
		rowmain.parentNode.insertBefore(clone,rowmain)
		if (saveval == 0)	//rowmain was pushed by insertBefore
			rowmain = table.rows[i]	//go back to the clone-row
		for (i=i+1; i<table.rows.length; i++)	//rows after were added waitnum by 1
			table.rows[i].cells[QWAITNUM].innerHTML = parseInt(table.rows[i].cells[QWAITNUM].innerHTML) + 1
		rowmain.cells[QSINCE].innerHTML = new Date().MysqlDate().thDate()	//date of booking
		for (i=3; i<rowmain.cells.length; i++)
			rowmain.cells[i].innerHTML = ""
	}
	document.getElementById("overlayqueue").style.display = ""
	HNinput(rowmain.cells[QHN])
}

function qdeletecase(rowmain, qn)
{
	var waitnum = rowmain.cells[QWAITNUM].innerHTML
	var staffname = rowmain.cells[QSTAFFNAME].innerHTML
	var sql = "sqlReturnbook=UPDATE book SET waitnum=0 WHERE qn="+ qn +";"
	sql += "UPDATE book SET waitnum=waitnum"+ encodeURIComponent("-")
	sql += "1 WHERE waitnum>"+ waitnum +";"

	Ajax(MYSQLIPHP, sql, qcallbackdeleterow)

	function qcallbackdeleterow(response)
	{
		if (!response || response.indexOf("DBfailed") != -1)
			alert ("Delete & Refresh failed!\n" + response)
		else
			updateQBOOK(response);
			staffqueue(staffname)
	}
	stopeditmode()	//editmode of qFirstColumn Cell was started by Qtable
}

function qpremovecase(rowmain)
{
	stopeditmode()	//editmode of qFirstColumn was started by Qtable
	rowmain.id = "movemode"	//start "movemode" of the "row"
	document.getElementById("overlayqueue").style.display = ""
}

function qpremovetoOpDate(rowmain)
{
	var queuedivin = document.getElementById("queuedivin")
	var table = document.getElementById("queuetbl")

	stopeditmode()	//editmode of qFirstColumn was started by Qtable
	rowmain.id = "movemode"	//start "movemode" of the "row"
	document.getElementById("overlayqueue").style.display = ""
	for (var i=1; i<table.rows.length; i++)
	{
		table.rows[i].style.display = "none"
	}
	rowmain.style.display = ""
	queuedivin.style.height = ""
}

function movetoQwait(movemode, pointQnum)
{
	var fromtable = gettable(movemode)

	if (fromtable.id == "tbl")
	{
		movecaseQbookToQwait(movemode.cells[QN].innerHTML, pointQnum)
	}
	else if (fromtable.id == "queuetbl")
	{
		if ((movemode.cells[QWAITNUM].innerHTML != pointQnum))
		{	//to move must click not the same day
			movecaseQwaitToQwait(pointQnum)
		}
	}
}

function movecaseQwaitToQwait(WaitNumTo)
{
	var table = document.getElementById("queuetbl")
	var MVfrom = document.getElementById("movemode")
	var WNfrom = MVfrom.cells[QWAITNUM].innerHTML
	var QNfrom = MVfrom.cells[QQN].innerHTML
	var staffname = MVfrom.cells[QSTAFFNAME].innerHTML
	var sql = ""

	if (WNfrom == WaitNumTo)
	{
		stopeditmode()
		return
	}

	table.style.cursor = 'wait'
	sql = "functionName=movecaseQwaitToQwait"	//name of function as a variable in PHP
	sql += "&WNfrom="+ WNfrom
	sql += "&WaitNumTo="+ WaitNumTo
	sql += "&staffname="+ staffname
	sql += "&THISUSER="+ THISUSER
	sql += "&QNfrom="+ QNfrom

	Ajax(MYSQLIPHP, sql, qcallbackmove);

	function qcallbackmove(response)
	{
		if (!response || response.indexOf("DBfailed") != -1)
			alert ("Move failed!\n" + response)
		else
		{
			updateQBOOK(response);
			staffqueue(staffname)
			table.rows[WaitNumTo].scrollIntoView(false)
		}
		stopeditmode()
		table.style.cursor = 'default'
	}	
}

function movecaseQbookToQwait(QNfrom, pointQnum)
{
	var table = document.getElementById("queuetbl")
	var WNfrom = null
	var sql = ""
	var staffname = document.getElementById("queuespan").innerHTML

	table.style.cursor = 'wait'
	sql = "functionName=movecaseQbookToQwait"	//name of function as a variable in PHP
	sql += "&WaitNumTo="+ pointQnum
	sql += "&staffname="+ staffname
	sql += "&THISUSER="+ THISUSER
	sql += "&QNfrom="+ QNfrom

	Ajax(MYSQLIPHP, sql, qcallbackmove);

	function qcallbackmove(response)
	{
		if (!response || response.indexOf("DBfailed") != -1)
			alert ("Move failed!\n" + response)
		else
		{
			updateQBOOK(response);
			staffqueue(staffname)
			table.rows[pointQnum].scrollIntoView(false)
			refillall()
		}
		stopeditmode()
		table.style.cursor = 'default'
	}	
}

function HNinputqueue(pointing)
{
	var pointHNname

	if ((pointing.innerHTML == "") && (pointing.id != "editmode"))
	{
		pointing.id = "editmode"
		pointHNname = createinput(pointing)
		pointHNname.onkeyup = getByHNqueue
		pointHNname.focus()
	}
}

function getByHNqueue(e)
{
	var keycode = getkeycode(e)
	var namehn = document.getElementById("keyin")
	
	namehn.value = namehn.value.replace(/<br>/g, "")
	namehn.value = namehn.value.replace(/^\s+/g, "")
	namehn.value = namehn.value.replace(/  +/g, " ")
	if (keycode == 13)
	{
		var cells = $("#editmode").parents('tr').children("td" )
		var opdate = $(cells).eq(QOPDATE).html().numDate()	//convert Thai date to MySQL date
		var staffname = $(cells).eq(QSTAFFNAME).html();
		var waitnum = $(cells).eq(QWAITNUM).html();

		var sqlstring = "hn=" + namehn.value
		sqlstring += "&waitnum="+ waitnum
		sqlstring += "&opdate="+ opdate
		sqlstring += "&staffname="+ staffname
		sqlstring += "&username="+ THISUSER

		Ajax(GETNAMEHN, sqlstring, callbackgetByHNqueue)
		//AJAX-false to prevent repeated GETNAMEHN when press <enter>
	}

	function callbackgetByHNqueue(response)
	{
		if (!response || response.indexOf("initial_name") == -1)	//no patient
			alert("Error getnamehn : "+ response)
		else
		{
			if (response.charAt(0) == "{")
			{	//Only one patient
				var qname = JSON.parse(response);
				var name = qname.initial_name + qname.first_name +" "+ qname.last_name
				var cells = $("#editmode").parents('tr').children("td" )
				var opdate = $(cells).eq(OPDATE).html().numDate()	//convert Thai date to MySQL date
				var age = qname.dob.replace(/-/g,"/").getAge(opdate.replace(/-/g,"/"))
				$(cells).eq(QN).html(qname.qn);
				$(cells).eq(HN).html(qname.hn);
				$(cells).eq(NAME).html(name);
				$(cells).eq(AGE).html(age);
				var menu = document.getElementById("menudiv")
				menu.style.display = ""
				menu.style.height = ""
				menu.style.overflow = ""
				stopeditmode()

				Ajax(MYSQLIPHP, 'nosqlReturnbook', updateQBOOKQWAIT)	//To reload Qbook

				function updateQBOOKQWAIT(response)
				{
					if (!response || response.indexOf("DBfailed") != -1)
						alert("Failed! nosqlReturnbook" + response)
					else
					{
						updateQBOOK(response)
						if (staffname)
							updateQWAITFILL(staffname)
						else
							updateQBOOKFILL()
					}	//new case entry tbl has no staffname but queuetbl has staffname
				}
			}
		}
	}
}

function qphone(textbox, pointing, qn)
{
	var queuedivin = document.getElementById("queuedivin")
	var oldtxt = pointing.innerHTML
	var txtarea
	var txt
	var xpos
	var ypos

	pointing.id = "editmode"
	textbox.style.zIndex = "2"
	textbox.style.display = "block"
	if (textbox.id == "teldiv")
	{
		txtarea = document.getElementById("txtarea")
		xpos = pointing.offsetLeft - textbox.offsetWidth - Xscrolled()
		ypos = pointing.offsetTop - Yscrolled()
		if (ypos > $(window).height() - textbox.offsetHeight)
			ypos = $(window).height() - textbox.offsetHeight
		if (xpos < 0)
			xpos = 0
		if (ypos < 0)
			ypos = 0
	}
	else	//waiting list textbox.id == "qteldiv"
	{
		txtarea = document.getElementById("qtxtarea")
		if ((navigator.userAgent.indexOf("MSIE")+1) && 
			(!document.documentMode || (document.documentMode < 7)))
		{	//IE6 documentMode is undefined and not support position: fixed
			xpos = pointing.offsetLeft - textbox.offsetWidth - queuedivin.scrollLeft
			ypos = pointing.offsetTop - queuedivin.scrollTop
		}
		else
		{
			xpos = pointing.offsetLeft - textbox.offsetWidth - queuedivin.scrollLeft
			ypos = pointing.offsetTop - queuedivin.scrollTop
		}
		if (xpos < 0)
			xpos = 0
		if (ypos < 0)
			ypos = 0
	}
	textbox.style.top = ypos + 'px'
	textbox.style.left = xpos + 'px'
	txtarea.onkeyup = savetelnum
	txtarea.focus()
	txtarea.value = pointing.innerHTML

	function savetelnum(e)
	{
		keycode = getkeycode(e)
		if (keycode == 13)
		{
			e = e || window.event
			txtarea.value = txtarea.value.replace("\n", "")
			savetel(false)
			stopeditmode()
			textbox.style.display = ""
		}
	}

	savetel = function (affirm)
	{
		if (txtarea.value == pointing.innerHTML)
			return
		if (affirm)
			if (!confirm("Save the change?"))
				return
		txt = txtarea.value
		txt = txt.replace(/,(?! )/g, ", ")
		pointing.innerHTML = txt
		txt = txt.replace(/\"/g, "&#34;")	// w3 org recommend use numeric character references to represent 
		txt = txt.replace(/\'/g, "&#39;")	// double quotes (&#34;) or (&quot); and single quotes (&#39;)
		txt = txt.replace(/\\/g, "\\\\")
		txt = encodeURIComponent(txt)	//encode '&' keyed in
		var sqlstring = "sqlReturnbook=UPDATE book SET tel='"+ txt
		sqlstring += "', editor = '"+ THISUSER
		sqlstring += "' WHERE qn = " + qn +";"

		Ajax(MYSQLIPHP, sqlstring, callbacktel)
	}

	callbacktel = function (response)
	{
		if (!response || response.indexOf("DBfailed") != -1)
		{
			alert("DBfailed! update database \n\nRestore previous value \n\n" + response)
			pointing.innerHTML = oldtxt
		}
		else
		{
			updateQBOOK(response);
			updateQBOOKFILL()
		}
	}
}
