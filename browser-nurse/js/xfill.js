
function fillupstart()
{	//Display all cases in each day of 5 weeks
	// Find the 1st of last month
	// fill until 2 year from now
	var	table = document.getElementById("tbl"),
		today = new Date(),
		start = new Date(today.setDate(today.getDate() - 77)).ISOdate(),
		today = new Date(),
		until = new Date(today.setDate(today.getDate() + 10)).ISOdate(),
		today = new Date(),
		todate = today.ISOdate(),
		todateth = todate.thDate(),
		book = gv.BOOK

	if (book.length === 0) { book.push({"opdate" : todate}) }
	
	fillall(book, table, start, until)

	//scroll to today
	var thishead = $("#tbl tr:contains(" + todateth + ")").eq(0)
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
	var q = findStartRowInBOOK(book, start)
	var k = findStartRowInBOOK(book, LARGESTDATE)

	// get rid of cases with unspecified opdate
	// Consult cases and new start have no LARGESTDATE, so k = -1
	if (k >= 0) {
		book = book.slice(0, k)
	}

	//i for rows in table (with head as the first row)
	var i = 0
	var blen = book.length
	for (q; q < blen; q++)
	{	
		//step over each day that is not in QBOOK
		while (date < book[q].opdate)
		{
			if (date !== madedate)
			{
				//make a blank row for each day which is not in book
				makenextrow(table, date)	//insertRow
				i++
				
				madedate = date
			}
			date = date.nextdays(1)
			if (date > until) {
				return
			}

			//make table head row before every Monday
			if ((new Date(date).getDay())%7 === 1)
			{
				var clone = head.cloneNode(true)
				tbody.appendChild(clone)
 				i++
			}
		}
		makenextrow(table, date)
		i++
		filldata(book[q], rows[i])
		madedate = date
	}

	while (date < until)
	{
		date = date.nextdays(1)

		//make table head row before every Monday
		if (((new Date(date)).getDay())%7 === 1)
		{
			var clone = head.cloneNode(true)
			tbody.appendChild(clone)
		}
		//make a blank row
		makenextrow(table, date)	//insertRow
	}
}

//create and decorate new row
function makenextrow(table, date)
{
	var tbody = table.getElementsByTagName("tbody")[0]
	var tblcells = document.getElementById("tblcells")
	var row = tblcells.rows[0].cloneNode(true)
	var rowi = tbody.appendChild(row)

	rowi.cells[OPDATE].innerHTML = date.thDate()
	rowi.cells[OPDATE].className = dayName(NAMEOFDAYABBR, date)
	rowi.cells[DIAGNOSIS].style.backgroundImage = holiday(date)
	rowi.className = dayName(NAMEOFDAYFULL, date)
}

function dayName(DAYNAME, date)
{
	return DAYNAME[(new Date(date)).getDay()]
}

function fillblank(rowi)
{
	var cells = rowi.cells
	cells[THEATRE].innerHTML = ""
	cells[OPROOM].innerHTML = ""
	cells[OPTIME].innerHTML = ""
	cells[CASENUM].innerHTML = ""
	cells[STAFFNAME].innerHTML = ""
	cells[HN].innerHTML = ""
	cells[HN].className = ""
	cells[PATIENT].innerHTML = ""
	cells[PATIENT].className = ""
	cells[DIAGNOSIS].innerHTML = ""
	cells[TREATMENT].innerHTML = ""
	cells[EQUIPMENT].innerHTML = ""
	cells[CONTACT].innerHTML = ""
	cells[QN].innerHTML = ""
}

function filldata(bookq, rowi)
{
	var cells = rowi.cells

	rowi.title = bookq.waitnum

	cells[THEATRE].innerHTML = bookq.theatre
	cells[OPROOM].innerHTML = bookq.oproom || ""
	cells[OPTIME].innerHTML = bookq.optime
	cells[CASENUM].innerHTML = bookq.casenum || ""
	cells[STAFFNAME].innerHTML = bookq.staffname
	cells[HN].innerHTML = bookq.hn
	cells[PATIENT].innerHTML = putNameAge(bookq)
	cells[DIAGNOSIS].innerHTML = bookq.diagnosis
	cells[TREATMENT].innerHTML = bookq.treatment
	cells[EQUIPMENT].innerHTML = showEquip(bookq.equipment)
	cells[CONTACT].innerHTML = bookq.contact
	cells[QN].innerHTML = bookq.qn
}

function putNameAge(bookq)
{
	return bookq.patient
		+ (bookq.dob? ("<br>อายุ " + putAgeOpdate(bookq.dob, bookq.opdate)) : "")
}
 
Date.prototype.ISOdate = function () 
{	// Javascript Date Object to MySQL date (2014-05-11)
    var yyyy = this.getFullYear();
    var mm = this.getMonth()+1;
	mm = (mm < 10)? "0"+mm : ""+mm;
    var dd = this.getDate();
	dd = (dd < 10)? "0"+dd : ""+dd;
    return yyyy + "-" + mm + "-" + dd;
} 

String.prototype.nextdays = function (days)
{	// ISOdate to be added or substract by days
	var morrow = new Date(this);
	morrow.setDate(morrow.getDate()+days);
	return morrow.ISOdate();
}

function findStartRowInBOOK(book, opdate)
{
	var q = 0
	while ((q < book.length) && (book[q].opdate < opdate)) {
		q++
	}
	return (q < book.length)? q : -1
}

function holiday(date)
{
	var	monthdate = date.substring(5),
		dayofweek = (new Date(date)).getDay(),
		holidayname = "",
		Mon = (dayofweek === 1),
		Tue = (dayofweek === 2),
		Wed = (dayofweek === 3),
		holiday = $.grep(gv.HOLIDAY, function(day) {
			return day.holidate === date
		})[0]

	if (date === LARGESTDATE) { return }
	if (holiday) {
		return "url('css/pic/holiday/" + holiday.dayname + ".png')"
	}

	switch (monthdate)
	{
	case "12-31":
		holidayname = "Yearend"
		break
	case "01-01":
		holidayname = "Newyear"
		break
	case "01-02":
		if (Mon || Tue)
			holidayname = "Yearendsub"
		break
	case "01-03":
		if (Mon || Tue)
			holidayname = "Newyearsub"
		break
	case "04-06":
		holidayname = "Chakri"
		break
	case "04-07":
	case "04-08":
		if (Mon)
			holidayname = "Chakrisub"
		break
	case "04-13":
	case "04-14":
	case "04-15":
		holidayname = "Songkran"
		break
	case "04-16":
	case "04-17":
		if (Mon || Tue || Wed)
			holidayname = "Songkransub"
		break
	case "07-28":
		holidayname = "King10"
		break
	case "07-29":
	case "07-30":
		if (Mon)
			holidayname = "King10sub"
		break
	case "08-12":
		holidayname = "Queen"
		break
	case "08-13":
	case "08-14":
		if (Mon)
			holidayname = "Queensub"
		break
	case "10-13":
		holidayname = "King09"
		break
	case "10-14":
	case "10-15":
		if (Mon)
			holidayname = "King09sub"
		break
	case "10-23":
		holidayname = "Piya"
		break
	case "10-24":
	case "10-25":
		if (Mon)
			holidayname = "Piyasub"
		break
	case "12-05":
		holidayname = "King9"
		break
	case "12-06":
	case "12-07":
		if (Mon)
			holidayname = "King9sub"
		break
	case "12-10":
		holidayname = "Constitution"
		break
	case "12-11":
	case "12-12":
		if (Mon)
			holidayname = "Constitutionsub"
		break
	}
	return "url('css/pic/holiday/" + holidayname +".png')"
}
