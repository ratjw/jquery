
function fillupstart()		
{	//Display all cases in each day of 5 weeks
	if (BOOK.length == 0)
		BOOK.push({"opdate" : getSunday()})
	fillall()

	//scroll to today
	var today = new Date().MysqlDate().thDate()
	var thishead = $("tr:contains(" + today + ")").eq(0).prevAll(":has(th)").first()
	$('html, body').animate({
		scrollTop: thishead.offset().top
	}, 500);
	DragDrop()
}

function filluprefill()
{ 	//from refillall which is called from :
	//updatingback, callbackmove
	//Start at the same begindate and same scrollTop
//	var topscroll = $("#tblcontainer").scrollTop()

	fillall()
//	$("#tblcontainer").scrollTop(topscroll)
	DragDrop()
}

function fillall()
{
	var i, k, q
	var rowi = {}
	var date = ""
	var madedate

	date = BOOK[0].opdate
	
	//delete previous queuetbl lest it accumulates
	$('#tbl tr').slice(1).remove()

	//i for rows in table
	i=0

	//q for rows in BOOK
	for (q=0; q < BOOK.length; q++)
	{	
		while (date < BOOK[q].opdate)
		{	//step over each day that is not in QBOOK
			if (date != madedate)
			{
				//make a blank row for matched opday which is not already in the table
				i++
				rowi = makenextrow(i, date, 'tbl')
				
				madedate = date
			}
			date = date.nextdays(1)
			//make table head row before every Sunday
			if ((new Date(date).getDay())%7 == 0)
			{
				$('#tbl tbody').append($('#tbl tr:first').clone())
 				i++
			}
		}
		i++
		rowi = makenextrow(i, date, 'tbl')
		filldata(BOOK[q], rowi)
		madedate = date
	}
	//fill until 1 year from now
	var nextyear = new Date().getFullYear() + 1
	var month = new Date().getMonth()
	var todate = new Date().getDate()
	
	until = (new Date(nextyear, month, todate)).MysqlDate()
	date = date.nextdays(1)
	while (date < until)
	{
		//make a blank row
		i++
		rowi = makenextrow(i, date, 'tbl')
		
		date = date.nextdays(1)
		//make table head row before every Sunday
		if (((new Date(date)).getDay())%7 == 0)
		{
			$('#tbl tbody').append($('#tbl tr:first').clone())
			i++
		}
	}
}

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
