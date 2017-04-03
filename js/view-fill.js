
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
				rowi = makenextrow(i, date)	//insertRow
				
				madedate = date
			}
			date = date.nextdays(1)
			//make table head row before every Sunday
			if ((new Date(date).getDay())%7 == 0)
			{
				var clone = table.getElementsByTagName("TR")[0].cloneNode(true)
				rowi.parentNode.appendChild(clone, rowi)
 				i++
			}
		}
		i++
		rowi = makenextrow(i, date)	//insertRow
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
		rowi = makenextrow(i, date)	//insertRow
		
		date = date.nextdays(1)
		//make table head row before every Sunday
		if ((((new Date(date)).getDay())%7 == 0) &&
			(date < until))
		{
			var clone = table.getElementsByTagName("TR")[0].cloneNode(true)
			rowi.parentNode.appendChild(clone, rowi)
			i++
		}
	}
}

function refillall()
{
	var table = document.getElementById("tbl")
	var rows = table.rows
	var head = table.rows[0]
	var date = ""
	var madedate
	var start = $('#tbl tr:has("td"):first td').eq(OPDATE).html().numDate()
	var tlength = $('#tbl > tbody > tr').length

	date = start	//find this row in BOOK

	//q for rows in BOOK
	var q = 0
	while ((q < BOOK.length) && (BOOK[q].opdate < start)) {
		q++
	}	

	//i for rows in table with head as the first row
	var i = 1
	while (i < tlength)
	{
		if (q < BOOK.length) {
			while (date < BOOK[q].opdate)
			{	//step over each day that is not in QBOOK
				if (date != madedate)
				{
					//make a blank row for matched opday which is not already in the table
					fillOPDATE(rows[i], date)	//existing row
					i++
					if (i >= tlength)
						return
					
					madedate = date
				}
				date = date.nextdays(1)
				//make table head row before every Sunday
				if ((new Date(date).getDay())%7 == 0)
				{
					table.rows[i].innerHTML = table.getElementsByTagName("TR")[0].innerHTML
					i++
					if (i >= tlength)
						return
				}
			}
			fillOPDATE(rows[i], date)	//existing row
			filldata(BOOK[q], rows[i])
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
				table.rows[i].innerHTML = table.getElementsByTagName("TR")[0].innerHTML
				i++
				if (i >= tlength)
					return
			}

			//make a blank row
			fillOPDATE(rows[i], date)	//existing row
			i++
		}
	}
	sortable()
}

function makenextrow(i, date)
{
	var tbody = document.getElementById("tbl").getElementsByTagName("TBODY")[0]
	var cols = tbody.rows[0].cells.length
	var datatitle = document.getElementById("datatitle")
	var row = datatitle.cloneNode(true)
	row.id = ""
	var rowi = tbody.appendChild(row)

	rowi.cells[OPDATE].innerHTML = date.thDate()
	rowi.cells[OPDATE].className = NAMEOFDAYABBR[(new Date(date)).getDay()]
	rowi.className = NAMEOFDAYFULL[(new Date(date)).getDay()]
	rowi.style.backgroundImage = holiday(date)
	return rowi
}

function fillOPDATE(rowi, date)
{
	var datatitle = document.getElementById("datatitle")
	for (var j = 0; j < rowi.cells.length; j++)
		rowi.cells[j].innerHTML = datatitle.cells[j].innerHTML
//	rowi.innerHTML = ""
//	rowi.innerHTML = datatitle.innerHTML
	rowi.cells[OPDATE].innerHTML = date.thDate()
	rowi.cells[OPDATE].className = NAMEOFDAYABBR[(new Date(date)).getDay()]
	rowi.className = NAMEOFDAYFULL[(new Date(date)).getDay()]
	rowi.style.backgroundImage = holiday(date)
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

function staffqueue(staffname)
{
	var todate = new Date().mysqlDate()
	var scrolled = $("#queuecontainer").scrollTop()

	$('#titlename').html(staffname)
	
	//delete previous queuetbl lest it accumulates
	$('#queuetbl tr').slice(1).remove()

	$.each( BOOK, function() {	// each == this
		if (( this.staffname == staffname ) && this.opdate >= todate) {
			$('#qdatatitle tr').clone()
				.appendTo($('#queuetbl'))
					.filldataQueue(this)
		}
	});

	$("#queuecontainer").scrollTop(scrolled)

	sortable()
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
				$('#qdatatitle tr').clone()
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

	sortable()
}

jQuery.fn.extend({
	filldataQueue : function(bookq) {
		var rowcell = this[0].cells
		rowcell[OPDATE].innerHTML = bookq.opdate.thDate()
		rowcell[SINCE].innerHTML = bookq.qsince.thDate().slice(0,-4)
		rowcell[STAFFNAME].innerHTML = bookq.staffname
		rowcell[HN].innerHTML = bookq.hn
		rowcell[NAME].innerHTML = bookq.patient
		rowcell[AGE].innerHTML = bookq.dob? bookq.dob.getAge(bookq.opdate) : ""
		rowcell[DIAGNOSIS].innerHTML = bookq.diagnosis
		rowcell[TREATMENT].innerHTML = bookq.treatment
		rowcell[TEL].innerHTML = bookq.tel
		rowcell[QN].innerHTML = bookq.qn
	}
})

function refillthis(tableID, cellindex, qn)
{
	var table = document.getElementById(tableID)

	var i = 1
	while (table.rows[i].cells[QN].innerHTML != qn)
	{
		i++
		if (i >= table.rows.length)
			return
	}

	var q = 0
	while (BOOK[q].qn != qn)
	{
		q++
		if (q >= BOOK.length)
			return
	}

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
			rowcell[AGE].innerHTML = bookq.dob? bookq.dob.getAge(bookq.opdate) : ""
			break
		case DIAGNOSIS:
			rowcell[DIAGNOSIS].innerHTML = bookq.diagnosis
			break
		case TREATMENT:
			rowcell[TREATMENT].innerHTML = bookq.treatment
			break
		case TEL:
			rowcell[TEL].innerHTML = bookq.tel
			break
	}
}

function SplitPane()
{
	var tohead = findVisibleHead('#tbl')

	$("#titlecontainer").show()
	$("#tblcontainer").css("width", "60%")
	$("#titlecontainer").css("width", "40%")

	scrollanimate("#tblcontainer", "#tbl", tohead)
}

function closequeue()
{
	var tohead = findVisibleHead('#tbl')
	
	$("#titlecontainer").hide()
	$("#tblcontainer").css("width", "100%")
	$("#titlecontainer").css("width", "0%")

	scrollanimate("#tblcontainer", "#tbl", tohead)
}

function findVisibleHead(table)
{
	var tohead

	$.each($(table + ' tr:has(th)'), function(i, tr) {
		tohead = tr
		return ($(tohead).offset().top < 0)
	})
	return tohead
}

function scrollanimate(container, table, tohead)
{
	if (tohead.offsetTop < 300)
		return
	if (tohead.offsetTop + $(container).height() < $(table).height())
	{
		$(container).scrollTop(tohead.offsetTop - 300)
		$(container).animate({
			scrollTop: $(container).scrollTop() + 300
		}, 500);
	}
	else
		$(container).scrollTop(tohead.offsetTop)
}

function holiday(date)
{
	var monthdate = date.substring(5)
	var dayofweek = (new Date(date)).getDay()
	var holidayname = ""

	for (var key in HOLIDAY) 
	{
		if (key == date)
			return HOLIDAY[key]	//matched a holiday
		if (key > date)
			break		//not a listed holiday
						//either a fixed or a compensation holiday
	}
	switch (monthdate)
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
