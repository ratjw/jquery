
function fillupstart()		
{	//Display all cases in each day of 5 weeks
	STATE[0] = "FILLUP"
	STATE[1] = getSunday()
	if (BOOK.length == 0)
		BOOK.push({"opdate" : getSunday()})
	BOOKFILL = BOOK	//also begin BOOKFILL
	fillnew()
	DragDrop()
}

function fillupnormal()
{	//from selecting firstcolumn menu change STATE to fillup from fillday or fillstaff

	STATE[0] = "FILLUP"
	BOOKFILL = BOOK	//changed to fillup from fillday or fillstaff
	fillnew()
	DragDrop()
}

function filluprefill()
{ 	//from refillall which is called from :
	//updatingback, callbackmove
	//use current STATE : update inside the table
	//Start at the same begindate and same scrollTop
	var topscroll = document.body.scrollTop

	updateBOOKFILL()
	fillnew()
	document.body.scrollTop = topscroll
	DragDrop()
}

function fillupscroll(direction)
{
	fillext(direction)
//	hilitefillext()
	DragDrop()
}

function fillext(di, event)
{
	var begindate
	var	i
	var table = document.getElementById("tbl")

	if (di == -1)
	{
		begindate = STATE[1]
		if ((BOOKFILL[0]) &&
			(begindate < BOOKFILL[0].opdate) && 
			(begindate <= getSunday()))
			return		//being in the beginning of BOOKFILL
		begindate = begindate.nextdays(di*7)
		STATE[1] = begindate

		makeheader(0)
		fill(0)

		//count rows hidden on top of the screen
		i = 1
		while (table.rows[i].cells[0].tagName != "TH")
			i++
		document.body.scrollTop = table.rows[i].offsetTop
		document.body.scrollTop? "" : document.documentElement.scrollTop = 
			table.rows[i].offsetTop - Yscrolled()		//IE7,8,9
	}
	else if (di == +1)
	{
		makeheader()
		fill(table.rows.length-1)
	}
}

function fillnew()
{
	var num = 0
	var table = document.getElementById("tbl")

	//delete previous table to fresh start every time
	while (table.rows[1])
		table.deleteRow(-1) 

	refill()
	fill(0)
	while (num++ <= STARTFILLUP)
		fillext(+1)
}

function refill()
{
	//making numweeks a static variable
	//numweeks is number of weeks in the table as seen by fill function
	var numweeks = 0

	fill = function (at)	//at = where to fill : 0=top, >0=bottom
	{
		var i, q, rowi, rundate, lastday, makedate;
		var table = document.getElementById("tbl")

		var begindate = at? STATE[1].nextdays(numweeks*7) : STATE[1]
		numweeks++
		
		//Find OPDATE of FIRSTROW from the start of BOOKFILL
		q = 0
		while (BOOKFILL[q] && (BOOKFILL[q].opdate < begindate))
			q++

		rundate = begindate
		lastday = rundate.nextdays(7);		//Display 7 days
		i = at
		while (rundate < lastday)
		{
			while (q < BOOKFILL.length && rundate == BOOKFILL[q].opdate)
			{
				i++
				rowi = makenextrow(i, rundate)
				makedate = rundate
				filldata(BOOKFILL, rowi, q)
				q++
			}
			if (rundate != makedate)
			{
				i++
				rowi = makenextrow(i, rundate)
				makedate = rundate
			}
			rundate = rundate.nextdays(1)
		}
	}
}

function fillday()
{	//Display only one day of each week
	var table = document.getElementById("tbl")
	var i, k, q
	var rowi = {}
	var date = ""
	var opday = STATE[1]
	var makedate
	var temp = BOOKFILL

	//make virtual BOOK of only this day
	BOOKFILL = []
	for (q=0; q < BOOK.length; q++)
	{
		k = (new Date(BOOK[q].opdate)).getDay()
		if (k == opday)
			BOOKFILL.push(BOOK[q])
	}
	if (BOOKFILL.length == 0)
	{
		BOOKFILL = temp
		$("#alert").text("ไม่มี case วัน" + NAMEOFDAYTHAI[STATE[1]]);
		$("#alert").fadeIn();
		return
	}
	STATE[0] = "FILLDAY"

	//delete previous table to fresh start every time
	while (table.rows[1])
		table.deleteRow(-1) 

	date = BOOK[0].opdate	//Beginning of entire original BOOK
	k = (new Date(date)).getDay()

	//i for number of rows in growing table
	i=0

	//q for walking on BOOKFILL rows
	for (q=0; q < BOOKFILL.length; q++)
	{	
		while (date < BOOKFILL[q].opdate)
		{	//step over each day that is not in BOOKFILL
			if (date != makedate)
			{
				if (k%7 == opday)
				{	//make a blank row for matched opday which is not already in the table
					i++
					rowi = makenextrow(i, date)
				}
				makedate = date
			}
			date = date.nextdays(1)
			k++	// = (new Date(date)).getDay()
			if (k%7 == 0 && table.rows.length != 1)
			{	//make table head row before every Sunday
				makeheader()
 				i++
			}
		}
		i++
		rowi = makenextrow(i, date)
		makedate = date
		filldata(BOOKFILL, rowi, q)
	}
	q = i+5		//make extra 5 rows
	while (i < q)
	{
		if (date != makedate)
		{
			if (k%7 == opday)
			{	//make a blank row for matched opday which is not already in the table
				i++
				rowi = makenextrow(i, date)
			}
			makedate = date
		}
		date = date.nextdays(1)
		k++// = (new Date(date)).getDay()
		if (k%7 == 0)
		{	//make table head row before every Sunday
			makeheader()
			i++
		}
	}
 	DragDrop()
}

function fillstaff()
{	//Display all cases of only one staff (staffname is in STATE)
	var table = document.getElementById("tbl")
	var i, k, q
	var rowi = {}
	var date = ""
	var makedate
	var opday = [0,0,0,0,0,0,0]

	STATE[0] = "FILLSTAFF"

	//make temp BOOK of only this staff
	BOOKFILL = []
	for (q=0; q < BOOK.length; q++)
		if (BOOK[q].staffname == STATE[1])
			BOOKFILL.push(BOOK[q])

	//determine opday of this staff
	for (q=0; q < BOOKFILL.length; q++)
		opday[(new Date(BOOKFILL[q].opdate)).getDay()]++
	opday = opday.indexOf(Math.max.apply(null, opday))

	//delete previous table to fresh start every time
	while (table.rows[1])
		table.deleteRow(-1) 

	date = BOOK[0].opdate	//entire original BOOK
	k = (new Date(date)).getDay()
	for (i=0,q=0; q < BOOKFILL.length; q++)
	{
		while (date < BOOKFILL[q].opdate)
		{
			if (date != makedate)
			{
				if (k%7 == opday)
				{	//make a blank row for matched opday which is not already in the table
					i++
					rowi = makenextrow(i, date)
				}
				makedate = date
			}
			date = date.nextdays(1)
			k++// = (new Date(date)).getDay()
			if (k%7 == 0 && table.rows.length != 1)
			{	//make table head row before every Sunday
				makeheader()
				i++
			}
		}
		i++
		rowi = makenextrow(i, date)
		makedate = date
		filldata(BOOKFILL, rowi, q)
	}
	q = i
	while (i < q+6)
	{
		if (date != makedate)
		{
			if (k%7 == opday)
			{	//make a blank row for matched opday which is not already in the table
				i++
				rowi = makenextrow(i, date)
			}
			makedate = date
		}
		date = date.nextdays(1)
		k++// = (new Date(date)).getDay()
		if (k%7 == 0)
		{	//make table head row before every Sunday
			makeheader()
			i++
		}
	}
	DragDrop()
}

function makeheader(at)
{
	var table = document.getElementById("tbl")
	var tbody = table.getElementsByTagName("tbody")[0]
	var trow = table.getElementsByTagName("tr")[0]
	var thead = trow.cloneNode(true)

	if (at == 0)
		tbody.insertBefore(thead, trow)
	else
		tbody.appendChild(thead)
}

function makenextrow(i, date)
{	// i = the row to be made
	var table = document.getElementById("tbl")
	var rowi
	var j = 0
	var datatitle = document.getElementById("datatitle")

	rowi = table.insertRow(i)
	table.rows[i].innerHTML = datatitle.innerHTML
	rowi.cells[OPDATE].innerHTML = date.thDate()
	rowi.cells[OPDATE].className = NAMEOFDAYABBR[(new Date(date)).getDay()]
	rowi.className = NAMEOFDAYFULL[(new Date(date)).getDay()]
	rowi.style.backgroundImage = holiday(date)
	return rowi
}

function filldata(book, rowi, q)
{
	rowi.cells[STAFFNAME].innerHTML = book[q].staffname? book[q].staffname : ""
	rowi.cells[HN].innerHTML = book[q].hn? book[q].hn : ""
	rowi.cells[NAME].innerHTML = book[q].patient? book[q].patient : ""
	rowi.cells[AGE].innerHTML = book[q].dob? book[q].dob.getAge(book[q].opdate) : ""
	rowi.cells[DIAGNOSIS].innerHTML = book[q].diagnosis? book[q].diagnosis : ""
	rowi.cells[TREATMENT].innerHTML = book[q].treatment? book[q].treatment : ""
	rowi.cells[TEL].innerHTML = book[q].tel? book[q].tel : ""
	rowi.cells[QN].innerHTML = book[q].qn
}

function filldeleterow(rowmain)		
{
	for (var j=1; j<rowmain.cells.length; j++)
		rowmain.cells[j].innerHTML = ""
}

function fillselect(opdate)		
{
	var table = document.getElementById("tbl")

	var q = 0
	while (q < BOOKFILL.length && (BOOKFILL[q].opdate < opdate))
		q++	//seek opdate in BOOKFILL
	var i = 0
	while (table.rows[i].cells[OPDATE].innerHTML.numDate() != opdate)
		i++	//seek opdate in main table
	while ((q < BOOKFILL.length) && (opdate == BOOKFILL[q].opdate))
	{	//refill only that opdate cases
		filldata(BOOKFILL, table.rows[i], q)
		q++
		i++
	}
}
