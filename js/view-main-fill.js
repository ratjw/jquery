
function fillupstart()		
{	//Display all cases in each day of 5 weeks
	if (BOOK.length == 0)
		BOOK.push({"opdate" : getSunday()})

	var start = new Date()
	start = new Date(start.getFullYear(), start.getMonth()-3).mysqlDate()
	start = getSunday(start)

	fillall(start)

	//scroll to today
	var today = new Date().mysqlDate().thDate()
	var thishead = $("tr:contains(" + today + ")").eq(0).prevAll(":has(th)").first()
	$('html, body').animate({
		scrollTop: thishead.offset().top
	}, 300);
	DragDrop()
}

function fillall(start)
{
	var i = k = q = 0
	var rowi = {}
	var date = ""
	var madedate

	date = start
	while ((q < BOOK.length) && (BOOK[q].opdate < start)) {
		q++
	}	

	//delete previous queuetbl lest it accumulates
	$('#tbl tr').slice(1).remove()

	//i for rows in table
	//q for rows in BOOK
	for (q; q < BOOK.length; q++)
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
	var until = (new Date(nextyear, month, todate)).mysqlDate()

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

function refillall()
{
	var table = document.getElementById("tbl")
	var rowi = {}
	var date = ""
	var madedate
	var start = $('#tbl > tbody > tr:not(:has("th")):first > td').eq(OPDATE).html().numDate()
	var tlength = $('#tbl > tbody > tr').length

	date = start	//find this row in BOOK

	//q for rows in BOOK
	var q = 0
	while ((q < BOOK.length) && (BOOK[q].opdate < start)) {
		q++
	}	

	//i for rows in table
	var i = 0
	while (i < tlength - 2)	//i++ before loop back
	{
		if (q < BOOK.length) {
			while (date < BOOK[q].opdate)
			{	//step over each day that is not in QBOOK
				if (date != madedate)
				{
					//make a blank row for matched opday which is not already in the table
					i++
					rowi = makenextrowRefill(i, date, 'tbl')
					
					madedate = date
				}
				date = date.nextdays(1)
				//make table head row before every Sunday
				if ((new Date(date).getDay())%7 == 0)
				{
					if (table.rows[i].cells[0].nodeName != "TH") {
						i++
						table.rows[i].innerHTML = $('#tbl tr:first').html()
					}
				}
			}
			i++
			rowi = makenextrowRefill(i, date, 'tbl')
			filldata(BOOK[q], rowi)
			madedate = date
			q++
		}
		else
		{
			date = date.nextdays(1)
			//make a blank row
			i++
			rowi = makenextrowRefill(i, date, 'tbl')
			
			date = date.nextdays(1)
			//make table head row before every Sunday
			if (((new Date(date)).getDay())%7 == 0)
			{
				if (table.rows[i].cells[0].nodeName != "TH") {
					i++
					table.rows[i].innerHTML = $('#tbl tr:first').html()
				}
			}
		}
	}
}

function makenextrow(i, date, tableID)
{	// i = the row to be made
	var table = document.getElementById(tableID)
	var datatitle = document.getElementById("datatitle")
	var rowi

	rowi = table.insertRow(i)
	table.rows[i].innerHTML = datatitle.innerHTML
	rowi.cells[OPDATE].innerHTML = date.thDate()
	rowi.cells[OPDATE].className = NAMEOFDAYABBR[(new Date(date)).getDay()]
	rowi.className = NAMEOFDAYFULL[(new Date(date)).getDay()]
	rowi.style.backgroundImage = holiday(date)
	return rowi
}

function makenextrowRefill(i, date, tableID)
{	// i = the row to be made
	var table = document.getElementById(tableID)
	var datatitle = document.getElementById("datatitle")
	var rowi = table.rows[i]

	if (rowi.cells[0].nodeName == "TH") {
		rowi.innerHTML = datatitle.innerHTML
	}
	rowi.cells[OPDATE].innerHTML = date.thDate()
	rowi.cells[OPDATE].className = NAMEOFDAYABBR[(new Date(date)).getDay()]
	rowi.className = NAMEOFDAYFULL[(new Date(date)).getDay()]
	rowi.style.backgroundImage = holiday(date)
	return rowi
}

function filldata(bookq, rowi)		//bookq = BOOK[q]
{
	rowi.cells[STAFFNAME].innerHTML = bookq.staffname
	rowi.cells[HN].innerHTML = bookq.hn
	rowi.cells[NAME].innerHTML = bookq.patient
	rowi.cells[AGE].innerHTML = bookq.dob? bookq.dob.getAge(bookq.opdate) : ""
	rowi.cells[DIAGNOSIS].innerHTML = bookq.diagnosis
	rowi.cells[TREATMENT].innerHTML = bookq.treatment
	rowi.cells[TEL].innerHTML = bookq.tel
	rowi.cells[QN].innerHTML = bookq.qn
}

function fillthisDay(opdate)		
{	//previous rows and present rows must be equal
	var table = document.getElementById("tbl")

	var q = 0	//seek opdate in BOOK
	while (q < BOOK.length && (BOOK[q].opdate < opdate))
		q++

	var i = 0	//seek opdate in #tbl
	while (opdate != table.rows[i].cells[OPDATE].innerHTML.numDate())
		i++

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

function deleteCase(rowmain, opdate, qn)
{
	if (!qn)
	{
		if (checkblank(opdate))		//blank row with this opdate case in another row
			$(rowmain).remove()		//delete blank row
		return
	}

//	$('#tbl').after($('#delete'))
	$('#delete').show()
	$('#delete').position( {
		my: "left center",
		at: "left center",
		of: $(rowmain)
	})
	$('#del').click(function() {
		doDeleteCase()
	})

	function doDeleteCase() 
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
				deleteRow(rowmain, opdate)
			}
		}
		$('#delete').hide()
	}
}

function closeDel() 
{
	$('#delete').hide()
}

function deleteRow(rowmain, opdate)
{
	var prevDate = $(rowmain).prev().children().eq(OPDATE).html()
	var nextDate = $(rowmain).next().children().eq(OPDATE).html()

	if (prevDate)	//avoid "undefined" error message
		prevDate = prevDate.numDate()

	if (nextDate)
		nextDate = nextDate.numDate()

	if ((prevDate == opdate) ||
		(nextDate == opdate))
	{
		$(rowmain).remove()
	} else {
		$(rowmain).children().eq(OPDATE).siblings().html("")
	}
}
