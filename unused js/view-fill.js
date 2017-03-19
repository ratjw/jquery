
function fillupstart()		
{	//Display all cases in each day of 5 weeks
	if (BOOK.length == 0)
		BOOK.push({"opdate" : getSunday()})
	setTopDate(getSunday())
	setRequire(7)
	fillnew()
	$("#tblcontainer").scrollTop(3)
	DragDrop()
}

function filluprefill()
{ 	//from refillall which is called from :
	//updatingback, callbackmove
	//Start at the same begindate and same scrollTop
	var topscroll = $("#tblcontainer").scrollTop()

	setRequire(null)
	fillnew()
	$("#tblcontainer").scrollTop(topscroll)
	DragDrop()
}

function fillupscroll(direction)
{
	fillext(direction)
	DragDrop()
}

function fillext(di)
{
	var begindate
	var	i
	var table = document.getElementById("tbl")

	if (di == -1)
	{
		begindate = getTopDate()
		if ((BOOK[0]) &&
			(begindate < BOOK[0].opdate) && 
			(begindate <= getSunday()))
			return		//being in the beginning of BOOK
		begindate = begindate.nextdays(di*7)
		setTopDate(begindate)

		$('#tbl tbody').prepend($('#tbl tr:first').clone())
		fill(0)

		//scroll to the old "tr:has(th)"
		$("#tblcontainer").scrollTop($("#tbl tr:has(th)").eq(1).offset().top)
	}
	else if (di == +1)
	{
		$('#tbl tbody').append($('#tbl tr:first').clone())
		fill(table.rows.length-1)
	}
}

(function ()
{
	//making static variables
	var tableTopDate
	var numweeks	//number of weeks in "tbl" made by fill function
	var Require		//number of weeks in "tbl" required by caller

	setRequire = function (number)
	{
		if (number)
			Require = number
		else
			Require = numweeks
	}

	getTopDate = function ()
	{
		return tableTopDate
	}

	setTopDate = function (TopDate)
	{
		tableTopDate = TopDate
	}

	fillnew = function ()
	{
		$('#tbl tr').slice(1).remove()
		numweeks = 0
		fill(0)
		while (numweeks < Require)
		{
			$('#tbl tbody').append($('#tbl tr:first').clone())
			fill($('#tbl tr').length-1)
		}
	}

	fill = function (at)	//at = where to fill : 0=top, >0=bottom
	{
		var i, q, rowi, rundate, lastday, madedate;

		begindate = at? tableTopDate.nextdays(numweeks*7) : tableTopDate
		numweeks++
		
		//Find OPDATE of FIRSTROW from the start of BOOK
		q = 0
		while (BOOK[q] && (BOOK[q].opdate < begindate))
			q++

		rundate = begindate
		lastday = rundate.nextdays(7);		//Display 7 days
		i = at
		while (rundate < lastday)
		{
			while (q < BOOK.length && rundate == BOOK[q].opdate)
			{
				i++
				rowi = makenextrow(i, rundate, 'tbl')
				madedate = rundate
				filldata(BOOK[q], rowi)
				q++
			}
			if (rundate != madedate)
			{
				i++
				rowi = makenextrow(i, rundate, 'tbl')
				madedate = rundate
			}
			rundate = rundate.nextdays(1)
		}
	}
})()

function makenextrow(i, date, tableID)
{	// i = the row to be made
	var table = document.getElementById(tableID)
	var rowi
	var datatitle = document.getElementById("datatitle")

	rowi = table.insertRow(i)
	table.rows[i].innerHTML = datatitle.innerHTML
	rowi.cells[OPDATE].innerHTML = date.thDate()
	rowi.cells[OPDATE].className = NAMEOFDAYABBR[(new Date(date)).getDay()]
	rowi.className = NAMEOFDAYFULL[(new Date(date)).getDay()]
	rowi.style.backgroundImage = holiday(date)
	return rowi
}

function filldata(bookq, rowi)		//bookq = book[q]
{
	rowi.cells[STAFFNAME].innerHTML = bookq.staffname? bookq.staffname : ""
	rowi.cells[HN].innerHTML = bookq.hn? bookq.hn : ""
	rowi.cells[NAME].innerHTML = bookq.patient? bookq.patient : ""
	rowi.cells[AGE].innerHTML = bookq.dob? bookq.dob.getAge(bookq.opdate) : ""
	rowi.cells[DIAGNOSIS].innerHTML = bookq.diagnosis? bookq.diagnosis : ""
	rowi.cells[TREATMENT].innerHTML = bookq.treatment? bookq.treatment : ""
	rowi.cells[TEL].innerHTML = bookq.tel? bookq.tel : ""
	rowi.cells[QN].innerHTML = bookq.qn
}

function fillselect(tableID, opdate)		
{
	var table = document.getElementById(tableID)

	var q = 0
	while (q < BOOK.length && (BOOK[q].opdate < opdate))
		q++	//seek opdate in BOOK
	var i = 0
	while (opdate != table.rows[i].cells[OPDATE].innerHTML.numDate())
		i++	//seek opdate in main table
	while ((q < BOOK.length) && (opdate == BOOK[q].opdate))
	{	//refill only that opdate cases
		filldata(BOOK[q], table.rows[i])
		q++
		i++
	}
}

function addnewrow(rowmain)
{
	if (rowmain.cells[QN].innerHTML)	//not empty
	{
		var table = document.getElementById("tbl")
		var clone = rowmain.cloneNode(true)	//cloneNode is faster than innerHTML
		var i = rowmain.rowIndex
		while (table.rows[i].cells[OPDATE].innerHTML == table.rows[i-1].cells[OPDATE].innerHTML)
			i--		
		rowmain.parentNode.insertBefore(clone,rowmain)
		rowmain.cells[0].id = ""
		for (i=1; i<rowmain.cells.length; i++)
			rowmain.cells[i].innerHTML = ""	
		DragDrop()
	}
}

function deletecase(rowmain, qn)
{
	//not actually delete the case but set waitnum=NULL
	var sql = "sqlReturnbook=UPDATE book SET waitnum=NULL WHERE qn="+ qn +";"

	Ajax(MYSQLIPHP, sql, callbackdeleterow)

	function callbackdeleterow(response)
	{
		if (!response || response.indexOf("DBfailed") != -1)
			alert ("Delete & Refresh failed!\n" + response)
		else
		{
			updateBOOK(response);
			filluprefill()
		}
	}
}

function deleteblankrow(rowmain)
{
	var table = document.getElementById("tbl")
	rowmain.parentNode.removeChild(rowmain)
}
