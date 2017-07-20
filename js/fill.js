
function fillupstart()		
{	//Display all cases in each day of 5 weeks
	if (BOOK.length == 0)
		BOOK.push({"opdate" : getSunday()})

	var start = new Date()
	start = new Date(start.getFullYear(), start.getMonth()-3).ISOdate()
	start = getSunday(start)

	//fill until 1 year from now
	var nextyear = new Date().getFullYear() + 1
	var month = new Date().getMonth()
	var todate = new Date().getDate()
	var until = (new Date(nextyear, month, todate)).ISOdate()

	var table = document.getElementById("tbl")
	fillall(BOOK, table, start, until)

	//scroll to today
	var today = new Date().ISOdate().thDate()
	var thishead = $("tr:contains(" + today + ")").eq(0).prevAll(":has(th)").first()
	$('#tblcontainer').animate({
		scrollTop: thishead.offset().top
	}, 300);
}

function fillall(book, table, start, until)
{
	var tbody = table.getElementsByTagName("tbody")[0]
	var rows = table.rows
	var head = table.rows[0]
	var date = start
	var madedate

	//q for rows in book
	var q = findOpdateBOOKrow(book, date)

	//i for rows in table (with head as the first row)
	var i = 0
	for (q; q < book.length; q++)
	{	
		if (book[q].opdate == LARGESTDATE) {
			break
		}
		while (date < book[q].opdate)
		{	//step over each day that is not in QBOOK
			if (date != madedate)
			{
				//make a blank row for each day which is not in book
				makenextrow(table, date)	//insertRow
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
		makenextrow(table, date)	//insertRow
		i++
		filldata(book[q], rows[i])
		madedate = date
	}

	date = date.nextdays(1)
	while (date <= until)
	{
		//make a blank row
		makenextrow(table, date)	//insertRow
		i++
		
		date = date.nextdays(1)
		//make table head row before every Sunday
		if ((((new Date(date)).getDay())%7 == 0) &&
			(date <= until))
		{
			var clone = head.cloneNode(true)
			tbody.appendChild(clone)
			i++
		}
	}
}

function refillall(book)
{
	var table = document.getElementById("tbl")
	var tbody = table.getElementsByTagName("tbody")[0]
	var rows = table.rows
	var head = table.rows[0]
	var date
	var madedate
	var start = $('#tbl tr:has("td"):first td').eq(OPDATE).html().numDate()
	var tlength = $('#tbl > tbody > tr').length

	date = start	//find this row in book

	//q for rows in book
	var q = 0
	while ((q < book.length) && (book[q].opdate < start)) {
		q++
	}	

	//i for rows in table (with head as the first row)
	var i = 1
	while (i < tlength)		//make blank rows till the end of existing table
	{
		if (book[q].opdate == LARGESTDATE) {
			break
		}
		if (q < book.length) {
			while (date < book[q].opdate)
			{	//step over each day that is not in book
				if (date != madedate)
				{
					fillrowdate(rows, i, date)	//existing row
					fillblank(rows[i])	//clear a row for the day not in book
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
			filldata(book[q], rows[i])	//fill a row for the day in book
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

function makenextrow(table, date)	//create and decorate new row
{
	var tbody = table.getElementsByTagName("tbody")[0]
	var tblcells = document.getElementById("tblcells")
	var row = tblcells.rows[0].cloneNode(true)
	var rowi = tbody.appendChild(row)

	rowi.cells[OPDATE].innerHTML = date.thDate()
	rowi.cells[OPDATE].className = NAMEOFDAYABBR[(new Date(date)).getDay()]
	rowi.cells[DIAGNOSIS].style.backgroundImage = holiday(date)
	rowi.className = NAMEOFDAYFULL[(new Date(date)).getDay()]
}

function fillrowdate(rows, i, date)	//renew and decorate existing row
{
	var tblcells = document.getElementById("tblcells")

	if (rows[i].cells[OPDATE].nodeName != "TD") {
		var row = tblcells.rows[0].cloneNode(true)
		rows[i].parentNode.replaceChild(row, rows[i])
	}
	rows[i].cells[OPDATE].innerHTML = date.thDate()
	rows[i].cells[OPDATE].className = NAMEOFDAYABBR[(new Date(date)).getDay()]
	rows[i].cells[DIAGNOSIS].style.backgroundImage = holiday(date)
	rows[i].className = NAMEOFDAYFULL[(new Date(date)).getDay()]
}

function fillblank(rowi)
{
	var cells = rowi.cells
	cells[ROOMTIME].innerHTML = ""
	cells[STAFFNAME].innerHTML = ""
	cells[HN].innerHTML = ""
	cells[NAME].innerHTML = ""
	cells[DIAGNOSIS].innerHTML = ""
	cells[TREATMENT].innerHTML = ""
	cells[CONTACT].innerHTML = ""
	cells[QN].innerHTML = ""
}

function filldata(bookq, rowi)		//bookq = book[q]
{
	var cells = rowi.cells
	cells[ROOMTIME].innerHTML = (bookq.oproom? bookq.oproom : "")
		+ (bookq.optime? "<br>" + bookq.optime : "")
	cells[STAFFNAME].innerHTML = bookq.staffname
	cells[HN].innerHTML = bookq.hn
	cells[NAME].innerHTML = bookq.patient
		+ (bookq.dob? ("<br>อายุ " + bookq.dob.getAge(bookq.opdate)) : "")
	cells[DIAGNOSIS].innerHTML = bookq.diagnosis
	cells[TREATMENT].innerHTML = bookq.treatment
	cells[CONTACT].innerHTML = bookq.contact
	cells[QN].innerHTML = bookq.qn
	title = bookq.waitnum
}

function staffqueue(staffname)
{
	var todate = new Date().ISOdate()
	var scrolled = $("#queuecontainer").scrollTop()

	$('#titlename').html(staffname)
	
	//delete previous queuetbl lest it accumulates
	$('#queuetbl tr').slice(1).remove()

	if (staffname == "Consults") {
		if (CONSULT.length == 0)
			CONSULT.push({"opdate" : getSunday()})

		var table = document.getElementById("queuetbl")
		var start = (new Date((new Date()).getFullYear(), (new Date()).getMonth() - 1, 1)).ISOdate()

		fillall(CONSULT, table, start, todate)
	} else {
		$.each( BOOK, function() {	// each == this
			if (( this.staffname == staffname ) && this.opdate >= todate) {
				$('#tblcells tr').clone()
					.appendTo($('#queuetbl'))
						.filldataQueue(this)
			}
		});
	}

	$("#queuecontainer").scrollTop(scrolled)
}

function refillstaffqueue()
{
	var todate = new Date().ISOdate()
	var staffname = $('#titlename').html()

	if (staffname == "Consults") {
		$('#queuetbl tr').slice(1).remove()
		if (CONSULT.length == 0)
			CONSULT.push({"opdate" : getSunday()})

		var table = document.getElementById("queuetbl")
		var start = (new Date((new Date()).getFullYear(), (new Date()).getMonth() - 1, 1)).ISOdate()

		fillall(CONSULT, table, start, todate)
	} else {
		var i = 0
		$.each( BOOK, function(q, each) {	// each == this
			if ((this.opdate >= todate) && (this.staffname == staffname)) {
				i++
				if (i >= $('#queuetbl tr').length) {
					$('#tblcells tr').clone()
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
}

jQuery.fn.extend({
	filldataQueue : function(bookq) {
		var cells = this[0].cells
		if  (bookq.opdate == LARGESTDATE) {
			cells[OPDATE].className = ""
		} else {
			cells[OPDATE].className = NAMEOFDAYABBR[(new Date(bookq.opdate)).getDay()]
		}
		cells[OPDATE].innerHTML = putOpdate(bookq.opdate)
		cells[ROOMTIME].innerHTML = (bookq.oproom? bookq.oproom : "")
			+ (bookq.optime? "<br>" + bookq.optime : "")
		cells[STAFFNAME].innerHTML = bookq.staffname
		cells[HN].innerHTML = bookq.hn
		cells[NAME].innerHTML = bookq.patient
			+ (bookq.dob? ("<br>อายุ " + putAgeOpdate(bookq.dob, bookq.opdate)) : "")
		cells[DIAGNOSIS].innerHTML = bookq.diagnosis
		cells[TREATMENT].innerHTML = bookq.treatment
		cells[CONTACT].innerHTML = bookq.contact
		cells[QN].innerHTML = bookq.qn
		this[0].title = bookq.waitnum
		addColor(this, bookq.opdate)
		//tr[0] has className "ui-sortable-handle", so first case has no className 
	}
})

function refillanother(tableID, cellindex, qn)
{
	var book = BOOK		//not include CONSULT
	var i = findTablerow(tableID, qn)
	if ( !i ) { return }

	var q = findBOOKrow(book, qn)
	if ( !q ) { return }

	var cells = document.getElementById(tableID).rows[i].cells
	var bookq = book[q]

	switch(cellindex)
	{
		case ROOMTIME:
			cells[ROOMTIME].innerHTML = bookq.oproom + "<br>" + bookq.optime
			break
		case STAFFNAME:
			cells[STAFFNAME].innerHTML = bookq.staffname
			break
		case HN:
			cells[HN].innerHTML = bookq.hn
			cells[NAME].innerHTML = bookq.patient
				+ "<br>อายุ " + (bookq.dob? bookq.dob.getAge(bookq.opdate) : "")
			break
		case DIAGNOSIS:
			cells[DIAGNOSIS].innerHTML = bookq.diagnosis
			break
		case TREATMENT:
			cells[TREATMENT].innerHTML = bookq.treatment
			break
		case CONTACT:
			cells[CONTACT].innerHTML = bookq.contact
			break
	}
}
