
function findq()
{
	var finddiv = document.getElementById("finddiv")
	var findstr = document.getElementById("findstr")
	document.getElementById("findstr").onkeyup = function (e) { keyfind(e) }
	document.getElementById("close").onclick = function() { stopfindmode() }
	document.getElementById("notfound").style.display = "none"
	finddiv.style.display = "block"
	findstr.focus()
	if (findstr.value)
		getstring()

	var t;
	function keyfind(e) 
	{
		var keyin = getkeycode(e)
		if (keyin == 27)
			finddiv.style.display = ""
		else
		{	//delay search between key strokes
			if ( t )
				clearTimeout( t );
			t = setTimeout( "getstring()", 500);
		}
	}
}

function getstring()
{
	var table = document.getElementById("tbl")
	var cols = table.rows[0].cells.length
	var day = ""
	var i, j, q, qnext, qprevious, max = 0
	var count = []
	var what = []
	var where = []
	var qbookfind = []
	var findwhat = []
	var nextweek
	var lastweek
	var yscroll

	document.getElementById("previous").onclick = function() { show(-1) }
	document.getElementById("next").onclick = function() { show(+1) }
	document.getElementById("notfound").style.display = "none"
	findwhat = getwhat()
	if (findwhat == "" || findwhat == null)
	{
		decolorfindrow()
		removehilite()
		return
	}
	for (i=0; i<findwhat.length; i++)
	{	//remove single letter
		for (j=0; j<findwhat[i].length; j++)
		{
			if (findwhat[i][j].length < 2)
				findwhat[i].splice(j, 1)
		}
	}
	if (findwhat == "" || findwhat == null)
	{
		decolorfindrow()
		removehilite()
		return
	}
	getstring.findwhat = findwhat
	for (i=0; i<findwhat.length; i++)	//map
	{
		qbookfind[i] = []
		for (j=0; j<findwhat[i].length; j++)	//map
		{
			what = new RegExp(findwhat[i][j], "i")
			qbookfind[i][j] = []
			for (q=0; q<QBOOKFILL.length; q++)
			{
				qbookfind[i][j][q] = {}
				where = qbookfind[i][j][q]
				where.staffname = (what.test(QBOOKFILL[q].staffname))? 1 : 0
				where.hn = (what.test(QBOOKFILL[q].hn))? 1 : 0
				where.patientname = (what.test(QBOOKFILL[q].patientname))? 1 : 0
				where.age = (what.test(QBOOKFILL[q].dob))? 1 : 0
				where.diagnosis = finddxstring(what, QBOOKFILL[q].diagnosis)
				where.treatment = findrxstring(what, QBOOKFILL[q].treatment)
				where.equip = findeqstring(what, QBOOKFILL[q].equip)
				where.tel = (what.test(QBOOKFILL[q].tel))? 1 : 0
			}
		}
	}
	for (q=0; q<QBOOKFILL.length; q++)	//reduce
    {
		count[q] = 0
		for (i=0; i<findwhat.length; i++)
		{
			for (j=0; j<findwhat[i].length; j++)
			{
				where = qbookfind[i][j][q]
				if (where.staffname || where.hn || where.patientname || where.age || 
					where.diagnosis || where.treatment || where.equip || where.tel)
					count[q] ++
			}
		}
	}
	max = Math.max.apply(Math, count)
	if (max == 0)
	{
		document.getElementById("notfound").style.display = ""
		decolorfindrow()
		removehilite()
		return
	}
	yscroll = Yscrolled()
	q = 0
	i = 1
	while (table.rows[i].offsetTop < yscroll)
		i++
	day = table.rows[i].cells[OPDATE].innerHTML.numDate()
	while ((QBOOKFILL[q].opdate < day) && (q < QBOOKFILL.length-1 ))
		q++		//find q of first row in QBOOKFILL, length-1 ends at last q if not found
	qnext = q
	qprevious = q - 1
	k = 1		//search next/previous one week alternatively 
	while ((q >= 0) && (q < QBOOKFILL.length))
	{
		nextweek = day.nextdays(7*k)
		q = qnext
		while ((q < QBOOKFILL.length) && (QBOOKFILL[q].opdate < nextweek))
		{
			if (count[q] == max)
			{
				prehilite(QBOOKFILL, q)
				return
			}
			q++
		}
		qnext = q
		if (qprevious < 0)
		{
			k++
			continue
		}
		lastweek = day.nextdays(-7*k)
		q = qprevious
		while ((q >= 0) && (QBOOKFILL[q].opdate >= lastweek))
		{
			if (count[q] == max)
			{
				prehilite(QBOOKFILL, q)
				return
			}
			q--
		}
		qprevious = q
		q = 0
		k++		//search after next week / before previous week
	}

	function show(di)
	{
		var qq = q		//q is outside show() used as static variable

		document.getElementById("notfound").style.display = "none"
		qq += di
		while ((qq >= 0) && (qq < QBOOKFILL.length))
		{
			if (count[qq] == max)
			{
				q = qq
				i = document.getElementById("findrow").rowIndex
				decolorfindrow()
				while (i && (i < table.rows.length) && 
					(table.rows[i].cells[QN].innerHTML != QBOOKFILL[q].qn))
					i += di
				if (i && (i < table.rows.length))
				{
					table.rows[i].id = "findrow"
					scrolltoview(table.rows[i], table.rows[i])
				}
				else if (STATE[0] == "FILLUP")
				{
					fillupfind(QBOOKFILL[q])	//display the specific week
					hiliteshowdi(di, QBOOKFILL[q].qn)
				}
				return
			}
			qq += di
		}
		if ((qq < 0) || (qq == QBOOKFILL.length))
			document.getElementById("notfound").style.display = ""
	}
}

function getwhat()
{
	var findwhat = document.getElementById("findstr").value.match(/\S+/g)
	var find = []
	var n

	if (!findwhat)
		return null
	n = findwhat.length
	for (var i=0; i<n; i++)
	{
		find[i] = []
		for (var j=0; j<n-i; j++)
		{
			find[i][j] = []
			for (var k=0; k<=i; k++)
			{
				find[i][j].push(findwhat[k+j])
			}
			find[i][j] = find[i][j].join(" ")
		}
	}
	return find
}

function finddxstring(what, where)
{
	var i
	if (!where)	
		return 0
	for (i=0; i<where.length; i++)
	{
		if (where[i].code && what.test(where[i].code))
			return 1
		if (where[i].diagnosis && what.test(where[i].diagnosis))
			return 1
		if (where[i].side && what.test(where[i].side))
			return 1
		if (where[i].level && what.test(where[i].level))
			return 1
	}
	return 0
}

function findrxstring(what, where)
{
	var i
	if (!where)	
		return 0
	for (i=0; i<where.length; i++)
	{
		if (where[i].code && what.test(where[i].code))
			return 1
		if (where[i].treatment && what.test(where[i].treatment))
			return 1
		if (where[i].side && what.test(where[i].side))
			return 1
		if (where[i].level && what.test(where[i].level))
			return 1
	}
	return 0
}

function findeqstring(what, where)
{
	var i
	if (!where)	
		return 0
	for (i=0; i<where.length; i++)
	{
		if (where[i].code && what.test(where[i].code))
			return 1
		if (where[i].patientname && what.test(where[i].patientname))
			return 1
	}
	return 0
}

function prehilite(book, q)
{
	var table = document.getElementById("tbl")
	var cols = table.rows[0].cells.length
	var jday, i, qq

	if (STATE[0] == "FILLUP")
	{
		i = table.rows.length - 1
		while (i && (table.rows[i].cells[QN].innerHTML != book[q].qn))
			i--
		if (i == 0)
		{
			fillupfind(book[q])	//display the specific week
			hilite(book[q].qn)
			return
		}
	}
	decolorfindrow()
	removehilite()
	hilite(book[q].qn)
}

function hilitefillext()	//from fillext when scroll up/down
{
	var table = document.getElementById("tbl")
	var i, j, k
	var findwhat = getstring.findwhat

	if (!findwhat)
		return
	k = 0
	for (i=0; i<findwhat.length; i++)
	{
		for (j=0; j<findwhat[i].length; j++)
		{
			k++
			doSearch(findwhat[i][j], COLOROFFIND[k%7])
		}
	}
	window.scrollTo(0, Yscrolled())
}

function hiliteupdatefill(qn)	//from updatefill which is called from : updatingback, 
{					//callbacktel, callbackselect, callbackdeleterow, callbackmove
	var table = document.getElementById("tbl")
	var i, j, k
	var findwhat = getstring.findwhat

	if (!findwhat)
		return
	i = table.rows.length - 1
	while (i && (table.rows[i].cells[QN].innerHTML != qn))
		i--
	if (i == 0)
		return
	table.rows[i].id = "findrow"
	k = 0
	for (i=0; i<findwhat.length; i++)
	{
		for (j=0; j<findwhat[i].length; j++)
		{
			k++
			doSearch(findwhat[i][j], COLOROFFIND[k%7])
		}
	}
	window.scrollTo(0, Yscrolled())
}

function hiliteshowdi(di, qn)	//only from show(di)
{
	var table = document.getElementById("tbl")
	var i, j, k
	var findwhat = getstring.findwhat
	var findpos

	if (!findwhat)
		return
	i = table.rows.length - 1
	while (i && (table.rows[i].cells[QN].innerHTML != qn))
		i--
	if (i == 0)
		return
	findpos = table.rows[i]
	findpos.id = "findrow"
	k = 0
	for (i=0; i<findwhat.length; i++)
	{
		for (j=0; j<findwhat[i].length; j++)
		{
			k++
			doSearch(findwhat[i][j], COLOROFFIND[k%7])
		}
	}
	if (di == -1)
	{
		i = 1
		while ((i < table.rows.length) && (table.rows[i].cells[OPDATE].nodeName != "TH"))
			i++
		window.scrollTo(0, table.rows[i].offsetTop)
	}
	if (di == +1)
		window.scrollTo(0, 0)
	scrolltoview(findpos, findpos)
}

function hilite(qn)	//only from prehilite
{
	var table = document.getElementById("tbl")
	var i, j, k
	var findstr = document.getElementById("findstr")
	var findwhat = getstring.findwhat
	var scrollpos

	if (findwhat == null || qn == null)
		return
	i = table.rows.length - 1
	while (i && (table.rows[i].cells[QN].innerHTML != qn))
		i--
	if (i == 0)
		return
	table.rows[i].id = "findrow"
	scrollpos = table.rows[i]
	scrolltoview(scrollpos, scrollpos)
	k = 0
	for (i=0; i<findwhat.length; i++)
	{
		for (j=0; j<findwhat[i].length; j++)
		{
			k++
			doSearch(findwhat[i][j], COLOROFFIND[k%7])
		}
	}
	window.scrollTo(0, Yscrolled())
	scrolltoview(scrollpos, scrollpos)
	findstr.focus()
}

function doSearch(qtext, qcolor) {
	var table = document.getElementById("tbl")
	var qrange = [STAFFNAME, HN, NAME, AGE, DIAGNOSIS, TREATMENT, TEL]
    var range, hiliteSpan, hiliteTextNode;

	if (window.find && window.getSelection) {
        var sel = window.getSelection();
        sel.collapse(table.rows[1], 0);
        while (window.find(qtext)) {
			if (qrange.indexOf(sel.focusNode.rowIndex)+1 &&
				sel.focusNode.parentNode.nodeName != "TH") {
				// Get the selection range
				range = sel.getRangeAt(0);

				// Create the highlight element
				hiliteSpan = document.createElement("span");
				hiliteSpan.style.backgroundColor = qcolor;
		
				hiliteTextNode = document.createTextNode(range.toString());
				hiliteSpan.appendChild(hiliteTextNode);
				
				// Replace the selection range content
				range.deleteContents();
				range.insertNode(hiliteSpan);
				
				// Move the selection immediately after the inserted node so that
				// window.find continues from the correct place
				range.setStartAfter(hiliteSpan);
				range.collapse(true);
				sel.removeAllRanges();
				sel.addRange(range);
			}
		}
		document.onkeydown = ""
	} else if (document.body.createTextRange) {
		var textRange = document.body.createTextRange();
		while (textRange.findText(qtext)) {
			if (qrange.indexOf(textRange.parentElement.rowIndex)+1 && 
				textRange.parentElement.nodeName != "TH")
				textRange.execCommand("BackColor", false, qcolor);
			textRange.collapse(false);
		}
	}
}

function stopfindmode()
{
	document.getElementById("finddiv").style.display = ""	//decolor find row
	decolorfindrow()
	removehilite()
}

function decolorfindrow()
{
	if (document.getElementById("findrow"))
		document.getElementById("findrow").id = ""
}

function removehilite()
{
	var table = document.getElementById("tbl")
	var span = /<\//
	var rowi
	var i

	for (i=1; i<table.rows.length; i++)
	{
		rowi = table.rows[i]
		if (span.test(rowi.cells[STAFFNAME].innerHTML))
			rowi.cells[STAFFNAME].innerHTML = rowi.cells[STAFFNAME].innerHTML.replace(/<[^>]*>/g, "")
		if (span.test(rowi.cells[HN].innerHTML))
			rowi.cells[HN].innerHTML = rowi.cells[HN].innerHTML.replace(/<[^>]*>/g, "")
		if (span.test(rowi.cells[NAME].innerHTML))
			rowi.cells[NAME].innerHTML = rowi.cells[NAME].innerHTML.replace(/<[^>]*>/g, "")
		if (span.test(rowi.cells[AGE].innerHTML))
			rowi.cells[AGE].innerHTML = rowi.cells[AGE].innerHTML.replace(/<[^>]*>/g, "")
		if (span.test(rowi.cells[DIAGNOSIS].innerHTML))
			rowi.cells[DIAGNOSIS].innerHTML = rowi.cells[DIAGNOSIS].innerHTML.replace(/<[^>]*>/g, "")
		if (span.test(rowi.cells[TREATMENT].innerHTML))
			rowi.cells[TREATMENT].innerHTML = rowi.cells[TREATMENT].innerHTML.replace(/<[^>]*>/g, "")
		if (span.test(rowi.cells[TEL].innerHTML))
			rowi.cells[TEL].innerHTML = rowi.cells[TEL].innerHTML.replace(/<[^>]*>/g, "")
	}
}
