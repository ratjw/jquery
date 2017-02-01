
function fillupstart()		
{	//Display all cases in each day of 5 weeks
	STATE[0] = "FILLUP"
	STATE[1] = getSunday()
	if (QBOOK.length == 0)
		QBOOK.push({"opdate" : getSunday()})
	QBOOKFILL = QBOOK	//also begin QBOOKFILL
	fillnew()
}

function filluprefill()
{ 	//from refillall which is called from :
	//updatingback, callbackmove
	//use current STATE
	//Start at the same week : update inside the table

	STATE[0] = "FILLUP"
	updateQBOOKFILL()
	fillnew()
}

function fillupnormal()
{	//from selecting firstcolumn menu change STATE to fillup from fillday or fillstaff

	STATE[0] = "FILLUP"
	QBOOKFILL = QBOOK	//changed to fillup from fillday or fillstaff
	fillnew()
}

function fillupscroll(direction)
{
	STATE[0] = "FILLUP"
	fillext(direction)
//	hilitefillext()
}

function fillupfind(locationrow)
{	//from locating show(di), prehilite
	//locationrow = QBOOKFILL[q]

	STATE[0] = "FILLUP"
	STATE[1] = getSunday(locationrow.opdate)
	fillnew()
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
		
		//Find OPDATE of FIRSTROW from the start of QBOOKFILL
		q = 0
		while (QBOOKFILL[q] && (QBOOKFILL[q].opdate < begindate))
			q++

		rundate = begindate
		lastday = rundate.nextdays(7);		//Display 7 days
		i = at
		while (rundate < lastday)
		{
			while (q < QBOOKFILL.length && rundate == QBOOKFILL[q].opdate)
			{
				i++
				rowi = makenextrow(i, rundate)
				makedate = rundate
				filldata(QBOOKFILL, rowi, q)
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
		while (i > at)	//"at" is the thead row number
		{
			i = i-1
		}
	}
}

function fillext(di)
{
	var begindate
	var	i
	var table = document.getElementById("tbl")

	if (di == -1)
	{
		begindate = STATE[1]
		if ((QBOOKFILL[0]) &&
			(begindate < QBOOKFILL[0].opdate) && 
			(begindate <= getSunday()))
			return		//being in the beginning of QBOOKFILL
		begindate = begindate.nextdays(di*7)
		STATE[1] = begindate

		makeheader(0)
		fill(0)

		//count rows hidden on top of the screen
		i = 1
		while (table.rows[i].cells[0].tagName != "TH")
			i++
		document.body.scrollTop = table.rows[i].offsetTop - Yscrolled()		//Chrome, IE5, IE10++
		document.body.scrollTop? "" : document.documentElement.scrollTop = 
			table.rows[i].offsetTop - Yscrolled()		//IE7,8,9
	}
	else if (di == +1)
	{
		makeheader()
		fill(table.rows.length-1)
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
	var temp = QBOOKFILL

	//make virtual QBOOK of only this day
	QBOOKFILL = []
	for (q=0; q < QBOOK.length; q++)
	{
		k = QBOOK[q].opdate.mysqltojsdate().getDay()
		if (k == opday)
			QBOOKFILL.push(QBOOK[q])
	}
	if (QBOOKFILL.length == 0)
	{
		QBOOKFILL = temp
	$("#alert").text("ไม่มี case วัน" + NAMEOFDAYTHAI[STATE[1]]);
	$("#alert").fadeIn();
		return
	}
	STATE[0] = "FILLDAY"

	//delete previous table to fresh start every time
	while (table.rows[1])
		table.deleteRow(-1) 

	date = QBOOK[0].opdate	//Beginning of entire original QBOOK
	k = date.mysqltojsdate().getDay()

	//i for number of rows in growing table
	i=0

	//q for walking on QBOOKFILL rows
	for (q=0; q < QBOOKFILL.length; q++)
	{	
		while (date < QBOOKFILL[q].opdate)
		{	//step over each day that is not in QBOOKFILL
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
			k++	// = date.mysqltojsdate().getDay()
			if (k%7 == 0 && table.rows.length != 1)
			{	//make table head row before every Sunday
				makeheader()
 				i++
			}
		}
		i++
		rowi = makenextrow(i, date)
		makedate = date
		filldata(QBOOKFILL, rowi, q)
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
		k++// = date.mysqltojsdate().getDay()
		if (k%7 == 0)
		{	//make table head row before every Sunday
			makeheader()
			i++
		}
	}
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

	//make temp QBOOK of only this staff
	QBOOKFILL = []
	for (q=0; q < QBOOK.length; q++)
		if (QBOOK[q].staffname == STATE[1])
			QBOOKFILL.push(QBOOK[q])

	//determine opday of this staff
	for (q=0; q < QBOOKFILL.length; q++)
		opday[QBOOKFILL[q].opdate.mysqltojsdate().getDay()]++
	opday = opday.indexOf(Math.max.apply(null, opday))

	//delete previous table to fresh start every time
	while (table.rows[1])
		table.deleteRow(-1) 

	date = QBOOK[0].opdate	//entire original QBOOK
	k = date.mysqltojsdate().getDay()
	for (i=0,q=0; q < QBOOKFILL.length; q++)
	{
		while (date < QBOOKFILL[q].opdate)
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
			k++// = date.mysqltojsdate().getDay()
			if (k%7 == 0 && table.rows.length != 1)
			{	//make table head row before every Sunday
				makeheader()
				i++
			}
		}
		i++
		rowi = makenextrow(i, date)
		makedate = date
		filldata(QBOOKFILL, rowi, q)
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
		k++// = date.mysqltojsdate().getDay()
		if (k%7 == 0)
		{	//make table head row before every Sunday
			makeheader()
			i++
		}
	}
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
	rowi.cells[OPDATE].className = NAMEOFDAYABBR[date.mysqltojsdate().getDay()]
	rowi.className = NAMEOFDAYFULL[date.mysqltojsdate().getDay()]
	rowi.style.backgroundImage = holiday(date)
	return rowi
}

function filldata(book, rowi, q)
{
	rowi.cells[OPROOM].innerHTML = book[q].oproom? book[q].oproom : ""
	rowi.cells[OPTIME].innerHTML = book[q].optime? book[q].optime : ""
	rowi.cells[STAFFNAME].innerHTML = book[q].staffname? book[q].staffname : ""
	rowi.cells[HN].innerHTML = book[q].hn? book[q].hn : ""
	rowi.cells[NAME].innerHTML = book[q].patient? book[q].patient : ""
	rowi.cells[AGE].innerHTML = book[q].dob? book[q].dob.getAge(book[q].opdate) : ""
	rowi.cells[DIAGNOSIS].innerHTML = book[q].diagnosis? book[q].diagnosis : ""
	rowi.cells[TREATMENT].innerHTML = book[q].treatment? book[q].treatment : ""
	rowi.cells[TEL].innerHTML = book[q].tel? book[q].tel : ""
	rowi.cells[QN].innerHTML = book[q].qn
}

function filldeleterow(rowmain, opdate, qn)		
{
	for (var j=1; j<rowmain.cells.length; j++)	//delete "-3" from length-3
		rowmain.cells[j].innerHTML = ""
}

function fillselect(opdate)		
{
	var table = document.getElementById("tbl")

	var q = 0
	while (q < QBOOKFILL.length && (QBOOKFILL[q].opdate < opdate))
		q++	//seek opdate in QBOOKFILL
	var i = 0
	while (table.rows[i].cells[OPDATE].innerHTML.numDate() != opdate)
		i++	//seek opdate in main table
	while ((q < QBOOKFILL.length) && (opdate == QBOOKFILL[q].opdate))
	{	//refill only that opdate cases
		filldata(QBOOKFILL, table.rows[i], q)
		q++
		i++
	}
}

function holiday(day)
{
	var date = day.substring(5)
	var dayofweek = day.mysqltojsdate().getDay()
	var holidayname = ""

	for (var key in HOLIDAY) 
	{
		if (key == day)
			return HOLIDAY[key]
		if (key > day)
			break
	}
	switch (date)
	{
	case "12-31":
		holidayname = "url('pic/Yearend.jpg')"
		break
	case "01-01":
		holidayname = "url('pic/Newyear.jpg')"
		break
	case "01-02":
		if ((dayofweek == 1) || (dayofweek == 2))
			holidayname = "url('pic/Yearendsub.jpg')"
		break
	case "01-03":
		if ((dayofweek == 1) || (dayofweek == 2))
			holidayname = "url('pic/Newyearsub.jpg')"
		break
	case "04-06":
		holidayname = "url('pic/Chakri.jpg')"
		break
	case "04-07":
	case "04-08":
		if (dayofweek == 1)
			holidayname = "url('pic/Chakrisub.jpg')"
		break
	case "04-13":
	case "04-14":
	case "04-15":
		holidayname = "url('pic/Songkran.jpg')"
		break
	case "04-16":
	case "04-17":
		if (dayofweek && (dayofweek < 4))
			holidayname = "url('pic/Songkransub.jpg')"
		break
	case "05-05":
		holidayname = "url('pic/Coronation.jpg')"
		break
	case "05-06":
	case "05-07":
		if (dayofweek == 1)
			holidayname = "url('pic/Coronationsub.jpg')"
		break
	case "08-12":
		holidayname = "url('pic/Queen.jpg')"
		break
	case "08-13":
	case "08-14":
		if (dayofweek == 1)
			holidayname = "url('pic/Queensub.jpg')"
		break
	case "10-23":
		holidayname = "url('pic/Piya.jpg')"
		break
	case "10-24":
	case "10-25":
		if (dayofweek == 1)
			holidayname = "url('pic/Piyasub.jpg')"
		break
	case "12-05":
		holidayname = "url('pic/King.jpg')"
		break
	case "12-06":
	case "12-07":
		if (dayofweek == 1)
			holidayname = "url('pic/Kingsub.jpg')"
		break
	case "12-10":
		holidayname = "url('pic/Constitution.jpg')"
		break
	case "12-11":
	case "12-12":
		if (dayofweek == 1)
			holidayname = "url('pic/Constitutionsub.jpg')"
		break
	}
	return holidayname
}
