
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
	$('#tblcontainer').animate({
		scrollTop: thishead.offset().top
	}, 300);
}

function fillall(start)
{
	var table = document.getElementById("tbl")
	var tbody = document.getElementById("tblbody")
	var rows = table.rows
	var head = table.rows[0]
	var date
	var madedate

	date = start

	//q for rows in BOOK
	var q = 0
	while ((q < BOOK.length) && (BOOK[q].opdate < start)) {
		q++
	}	

	//i for rows in table (with head as the first row)
	var i = 0
	for (q; q < BOOK.length; q++)
	{	
		if (BOOK[q].opdate == LARGESTDATE) {
			break
		}
		while (date < BOOK[q].opdate)
		{	//step over each day that is not in QBOOK
			if (date != madedate)
			{
				//make a blank row for each day which is not in BOOK
				makenextrow(date)	//insertRow
				i++
				
				madedate = date
			}
			date = date.nextdays(1)
			//make table head row before every Sunday
			if ((new Date(date).getDay())%7 == 0)
			{
				var clone = head.cloneNode(true)
				tbody.appendChild(clone)
 				i++
			}
		}
		makenextrow(date)	//insertRow
		i++
		filldata(BOOK[q], rows[i])
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
		makenextrow(date)	//insertRow
		i++
		
		date = date.nextdays(1)
		//make table head row before every Sunday
		if ((((new Date(date)).getDay())%7 == 0) &&
			(date < until))
		{
			var clone = head.cloneNode(true)
			tbody.appendChild(clone)
			i++
		}
	}
}

function refillall()
{
	var table = document.getElementById("tbl")
	var tbody = document.getElementById("tblbody")
	var rows = table.rows
	var head = table.rows[0]
	var date
	var madedate
	var start = $('#tbl tr:has("td"):first td').eq(OPDATE).html().numDate()
	var tlength = $('#tbl > tbody > tr').length

	date = start	//find this row in BOOK

	//q for rows in BOOK
	var q = 0
	while ((q < BOOK.length) && (BOOK[q].opdate < start)) {
		q++
	}	

	//i for rows in table (with head as the first row)
	var i = 1
	while (i < tlength)		//make blank rows till the end of existing table
	{
		if (BOOK[q].opdate == LARGESTDATE) {
			break
		}
		if (q < BOOK.length) {
			while (date < BOOK[q].opdate)
			{	//step over each day that is not in QBOOK
				if (date != madedate)
				{
					fillrowdate(rows, i, date)	//existing row
					fillblank(rows[i])	//clear a row for the day not in BOOK
					i++
					if (i >= tlength)
						return
					
					madedate = date
				}
				date = date.nextdays(1)
				//make table head row before every Sunday
				if ((new Date(date).getDay())%7 == 0)
				{
					if (rows[i].cells[OPDATE].nodeName != "TH") {
						var rowh = head.cloneNode(true)
						tbody.replaceChild(rowh, rows[i])
					}

					i++
					if (i >= tlength)
						return
				}
			}
			fillrowdate(rows, i, date)	//existing row
			filldata(BOOK[q], rows[i])	//fill a row for the day in BOOK
			madedate = date
			i++
			q++
		}
		else
		{
			date = date.nextdays(1)

			//make table head row before every Sunday
			if (((new Date(date)).getDay())%7 == 0)
			{
				if (rows[i].cells[OPDATE].nodeName != "TH") {
					var rowh = head.cloneNode(true)
					tbody.replaceChild(rowh, rows[i])
				}

				i++
				if (i >= tlength)
					return
			}

			//make a blank row
			fillrowdate(rows, i, date)	//existing row
			fillblank(rows[i])
			i++
		}
	}
}

function makenextrow(date)	//create and decorate new row
{
	var tbody = document.getElementById("tblbody")
	var tblrowcell = document.getElementById("tblrowcell")
	var row = tblrowcell.rows[0].cloneNode(true)
	var rowi = tbody.appendChild(row)

	rowi.cells[OPDATE].innerHTML = date.thDate()
	rowi.cells[OPDATE].className = NAMEOFDAYABBR[(new Date(date)).getDay()]
	rowi.cells[DIAGNOSIS].style.backgroundImage = holiday(date)
	rowi.className = NAMEOFDAYFULL[(new Date(date)).getDay()]
}

function fillrowdate(rows, i, date)	//renew and decorate existing row
{
	var tblrowcell = document.getElementById("tblrowcell")
	if (rows[i].cells[OPDATE].nodeName != "TD") {
		var row = tblrowcell.rows[0].cloneNode(true)
		rows[i].parentNode.replaceChild(row, rows[i])
	}
	rows[i].cells[OPDATE].innerHTML = date.thDate()
	rows[i].cells[OPDATE].className = NAMEOFDAYABBR[(new Date(date)).getDay()]
	rows[i].cells[DIAGNOSIS].style.backgroundImage = holiday(date)
	rows[i].className = NAMEOFDAYFULL[(new Date(date)).getDay()]
}

function fillblank(rowi)
{
	rowi.cells[STAFFNAME].innerHTML = ""
	rowi.cells[HN].innerHTML = ""
	rowi.cells[NAME].innerHTML = ""
	rowi.cells[AGE].innerHTML = ""
	rowi.cells[DIAGNOSIS].innerHTML = ""
	rowi.cells[TREATMENT].innerHTML = ""
	rowi.cells[CONTACT].innerHTML = ""
	rowi.cells[QN].innerHTML = ""
}

function filldata(bookq, rowi)		//bookq = BOOK[q]
{
	rowi.cells[STAFFNAME].innerHTML = bookq.staffname
	rowi.cells[HN].innerHTML = bookq.hn
	rowi.cells[NAME].innerHTML = bookq.patient
	rowi.cells[AGE].innerHTML = bookq.dob? bookq.dob.getAge(bookq.opdate) : ""
	rowi.cells[DIAGNOSIS].innerHTML = bookq.diagnosis
	rowi.cells[TREATMENT].innerHTML = bookq.treatment
	rowi.cells[CONTACT].innerHTML = bookq.contact
	rowi.cells[QN].innerHTML = bookq.qn
	rowi.title = bookq.waitnum
}

function staffqueue(staffname)
{
	var todate = new Date().mysqlDate()
	var scrolled = $("#queuecontainer").scrollTop()

	$('#titlename').html(staffname)
	
	//delete previous queuetbl lest it accumulates
	$('#queuetbl tr').slice(1).remove()

	$.each( BOOK, function() {	// each == this
		if (( this.staffname == staffname ) && this.opdate >= todate) {
			$('#queuerowcell tr').clone()
				.appendTo($('#queuetbl'))
					.filldataQueue(this)
		}
	});

	$("#queuecontainer").scrollTop(scrolled)
}

function refillstaffqueue()
{
	var todate = new Date().mysqlDate()
	var i = 0
	var staffname = $('#titlename').html()

	$.each( BOOK, function(q, each) {	// each == this
		if ((this.opdate >= todate) && (this.staffname == staffname)) {
			i++
			if (i >= $('#queuetbl tr').length) {
				$('#queuerowcell tr').clone()
					.appendTo($('#queuetbl'))
						.filldataQueue(this)
			} else {
				$('#queuetbl tr').eq(i)
					.filldataQueue(this)
			}
		}
	})

	if (i < ($('#queuetbl tr').length - 1))
		$('#queuetbl tr').slice(i+1).remove()
}

jQuery.fn.extend({
	filldataQueue : function(bookq) {
		var rowcell = this[0].cells
		rowcell[OPDATE].className = NAMEOFDAYABBR[(new Date(bookq.opdate)).getDay()]
		rowcell[OPDATE].innerHTML = putOpdate(bookq.opdate)
		rowcell[STAFFNAME].innerHTML = bookq.staffname
		rowcell[HN].innerHTML = bookq.hn
		rowcell[NAME].innerHTML = bookq.patient
		rowcell[AGE].innerHTML = putAgeOpdate(bookq.dob, bookq.opdate)
		rowcell[DIAGNOSIS].innerHTML = bookq.diagnosis
		rowcell[TREATMENT].innerHTML = bookq.treatment
		rowcell[CONTACT].innerHTML = bookq.contact
		rowcell[QN].innerHTML = bookq.qn
		this[0].title = bookq.waitnum
		addColor(this, bookq.opdate)
		//tr[0] has className "ui-sortable-handle", so first case has no className 
	}
})

function refillanother(tableID, cellindex, qn)
{
	var table = document.getElementById(tableID)

	var i = findTablerow(table, qn)
	if ( !i ) { return }

	var q = findBOOKrow(qn)
	if ( !q ) { return }

	var rowcell = table.rows[i].cells
	var bookq = BOOK[q]

	switch(cellindex)
	{
		case STAFFNAME:
			rowcell[STAFFNAME].innerHTML = bookq.staffname
			break
		case HN:
			rowcell[HN].innerHTML = bookq.hn
			rowcell[NAME].innerHTML = bookq.patient
			rowcell[AGE].innerHTML = (bookq.opdate != LARGESTDATE)
				? (bookq.dob? bookq.dob.getAge(bookq.opdate) : "")
				: ""
			break
		case DIAGNOSIS:
			rowcell[DIAGNOSIS].innerHTML = bookq.diagnosis
			break
		case TREATMENT:
			rowcell[TREATMENT].innerHTML = bookq.treatment
			break
		case CONTACT:
			rowcell[CONTACT].innerHTML = bookq.contact
			break
	}
}
