
function fillupstart()
{	//Display all cases in each day of 5 weeks
	var table = document.getElementById("tbl")
	var today = new Date()

	// Find the 1st of last month
	var start = new Date(today.getFullYear(), today.getMonth()-1).ISOdate()

	//fill until 1 year from now
	var nextyear = today.getFullYear() + 2
	var month = today.getMonth()
	var date = today.getDate()
	var until = (new Date(nextyear, month, date)).ISOdate()
	var book = gv.BOOK
	if (book.length === 0) { book.push({"opdate" : today.ISOdate()}) }

	fillall(book, table, start, until)

	//scroll to todate
	var todate = today.ISOdate().thDate()
	var thishead = $("#tbl tr:contains(" + todate + ")").eq(0)
	$('#tblcontainer').animate({
		scrollTop: thishead.offset().top
	}, 300);
}

function fillForScrub()
{
	var table = document.getElementById("tbl")
	var start = new Date().ISOdate()
	var until = start.nextdays(6)
	var book = gv.BOOK

	fillall(book, table, start, until)
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

	book = book.slice(0, k)

	//i for rows in table (with head as the first row)
	var i = 0
	var booklength = book.length
	for (q; q < booklength; q++)
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

function refillall()
{
	var book = gv.BOOK
	var table = document.getElementById("tbl")
	var tbody = table.getElementsByTagName("tbody")[0]
	var rows = table.rows
	var tlen = rows.length
	var head = rows[0]
	var start = $('#tbl tr:has("td"):first td').eq(OPDATE).html().numDate()
	var date = start
	var madedate
	var q = findStartRowInBOOK(book, start)			//Start row in BOOK
	var k = findStartRowInBOOK(book, LARGESTDATE)	//Stop row in BOOK

	book = book.slice(0, k)

	//i for rows in table (with head as the first row)
	var i = 1
	var booklength = book.length
	while (i < tlen)		//make blank rows till the end of existing table
	{
		if (q < booklength) {
			//step over each day that is not in book
			while (date < book[q].opdate)
			{
				if (date !== madedate)
				{
					fillrowdate(rows[i], date)	//existing row
					fillblank(rows[i])	//clear a row for the day not in book
					i++
					if (i >= tlen) {
						return
					}
					
					madedate = date
				}
				date = date.nextdays(1)
				//make table head row before every Monday
				if ((new Date(date).getDay())%7 === 1)
				{
					if (rows[i].cells[OPDATE].nodeName !== "TH") {
						var rowh = head.cloneNode(true)
						tbody.replaceChild(rowh, rows[i])
					}

					i++
					if (i >= tlen) {
						return
					}
				}
			}
			fillrowdate(rows[i], date)	//existing row
			filldata(book[q], rows[i])	//fill a row for the day in book
			madedate = date
			i++
			if (i >= tlen) {
				return
			}
			q++
		}
		else
		{
			date = date.nextdays(1)

			//make table head row before every Monday
			if (((new Date(date)).getDay())%7 === 1)
			{
				if (rows[i].cells[OPDATE].nodeName !== "TH") {
					var rowh = head.cloneNode(true)
					tbody.replaceChild(rowh, rows[i])
				}

				i++
				if (i >= tlen) {
					return
				}
			}

			//make a blank row
			fillrowdate(rows[i], date)	//existing row
			fillblank(rows[i])
			i++
			if (i >= tlen) {
				return
			}
		}
	}
}

// main table (#tbl) only
// others would refill entire table
function refillOneDay(opdate)
{
	var book = gv.BOOK,
		opdateth = putOpdate(opdate),
		opdateBOOKrows = getBOOKrowsByDate(book, opdate),
		$opdateTblRows = getTableRowsByDate(opdateth),
		bookRows = opdateBOOKrows.length,
		tblRows = $opdateTblRows.length,
		$cells, staff

	if (!tblRows) {
		createThisdateTableRow(opdate, opdateth)
		$opdateTblRows = getTableRowsByDate(opdateth)
		tblRows = $opdateTblRows.length
	}

	if (!bookRows) {
		while ($opdateTblRows.length > 1) {
			$opdateTblRows.eq(0).remove()
			$opdateTblRows = getTableRowsByDate(opdateth)
		}
		$opdateTblRows.attr("title", "")
		$opdateTblRows.prop("class", dayName(NAMEOFDAYFULL, opdate))
		$cells = $opdateTblRows.eq(0).children("td")
		$cells.eq(OPDATE).siblings().html("")
		$cells.eq(OPDATE).prop("class", dayName(NAMEOFDAYABBR, opdate))
		$cells.eq(STAFFNAME).html(showStaffOnCall(opdate))
		$cells.eq(HN).removeClass("pacs")
		$cells.eq(NAME).removeClass("camera")
		$cells.eq(DIAGNOSIS).css("backgroundImage", holiday(opdate))
	} else {
		if (tblRows > bookRows) {
			while ($opdateTblRows.length > bookRows) {
				$opdateTblRows.eq(0).remove()
				$opdateTblRows = getTableRowsByDate(opdateth)
			}
		}
		else if (tblRows < bookRows) {
			while ($opdateTblRows.length < bookRows) {
				$opdateTblRows.eq(0).clone().insertAfter($opdateTblRows.eq(0))
				$opdateTblRows = getTableRowsByDate(opdateth)
			}
		}
		$.each(opdateBOOKrows, function(key, val) {
			fillrowdate($opdateTblRows[key], this.opdate)
			filldata(this, $opdateTblRows[key])
			staff = $opdateTblRows[key].cells[STAFFNAME].innerHTML
			// on call <p style..>staffname</p>
			if (staff && /<p[^>]*>([^<]*)<\/p>/.test(staff)) {
				$opdateTblRows[key].cells[STAFFNAME].innerHTML = ""
			}
		})
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

//renew and decorate existing row
function fillrowdate(rowi, date)
{
	var tblcells = document.getElementById("tblcells")

	if (rowi.cells[OPDATE].nodeName !== "TD") {
		var row = tblcells.rows[0].cloneNode(true)
		rowi.parentNode.replaceChild(row, rowi)
		rowi = row
	}
	rowi.className = dayName(NAMEOFDAYFULL, date)
	rowi.cells[OPDATE].innerHTML = date.thDate()
	rowi.cells[OPDATE].className = dayName(NAMEOFDAYABBR, date)
	rowi.cells[DIAGNOSIS].style.backgroundImage = holiday(date)
}

function dayName(DAYNAME, date)
{
	return DAYNAME[(new Date(date)).getDay()]
}

function fillblank(rowi)
{
	var cells = rowi.cells
	cells[ROOM].innerHTML = ""
	cells[CASENUM].innerHTML = ""
	cells[STAFFNAME].innerHTML = ""
	cells[HN].innerHTML = ""
	cells[HN].className = ""
	cells[NAME].innerHTML = ""
	cells[NAME].className = ""
	cells[DIAGNOSIS].innerHTML = ""
	cells[TREATMENT].innerHTML = ""
	cells[NOTE].innerHTML = ""
	cells[QN].innerHTML = ""
}

function filldata(bookq, rowi)
{
	var cells = rowi.cells

	rowi.title = bookq.waitnum
	if (bookq.hn && gv.isPACS) {
		cells[HN].className = "pacs"
	}
	cells[NAME].className = bookq.patient? "camera" : ""

	cells[ROOM].innerHTML = bookq.oproom
	cells[CASENUM].innerHTML = putCasenumTime(bookq)
	cells[STAFFNAME].innerHTML = bookq.staffname
	cells[HN].innerHTML = bookq.hn
	cells[NAME].innerHTML = putNameAge(bookq)
	cells[DIAGNOSIS].innerHTML = bookq.diagnosis
	cells[TREATMENT].innerHTML = bookq.treatment
	cells[NOTE].innerHTML = bookq.contact
	cells[QN].innerHTML = bookq.qn
}

function staffqueue(staffname)
{
	var today = new Date()
	var todate = today.ISOdate()
	var scrolled = $("#queuecontainer").scrollTop()
	var book = gv.BOOK
	var consult = gv.CONSULT

	if (!isSplited()) {
		splitPane()
	}
	$('#titlename').html(staffname)
	
	//delete previous queuetbl lest it accumulates
	$('#queuetbl tr').slice(1).remove()

	//Consults cases are not in BOOK
	if (staffname === "Consults") {
		if (consult.length === 0)
			consult.push({"opdate" : getSunday()})

		var table = document.getElementById("queuetbl")
		var start = (new Date((today).getFullYear(), (today).getMonth() - 1, 1)).ISOdate()

		fillall(consult, table, start, todate)

		var queueh = $("#queuetbl").height()
		$("#queuecontainer").scrollTop(queueh)
	} else {
		$.each( book, function() {
			if (( this.staffname === staffname ) && this.opdate >= todate) {
				$('#tblcells tr').clone()
					.appendTo($('#queuetbl'))
						.filldataQueue(this)
			}
		});

		$("#queuecontainer").scrollTop(scrolled)
	}
}

function refillstaffqueue()
{
	var today = new Date()
	var todate = today.ISOdate()
	var staffname = $('#titlename').html()
	var book = gv.BOOK
	var consult = gv.CONSULT

	if ($('#queuetbl'))
	if (staffname === "Consults") {
		//Consults table is rendered same as fillall
		$('#queuetbl tr').slice(1).remove()
		if (consult.length === 0)
			consult.push({"opdate" : getSunday()})

		var table = document.getElementById("queuetbl")
		var start = (new Date((today).getFullYear(), (today).getMonth() - 1, 1)).ISOdate()

		fillall(consult, table, start, todate)
	} else {
		//render as staffqueue
		var i = 0
		$.each( book, function(q, each) {
			if ((this.opdate >= todate) && (this.staffname === staffname)) {
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
		if  (bookq.opdate === LARGESTDATE) {
			cells[OPDATE].className = ""
		} else {
			cells[OPDATE].className = dayName(NAMEOFDAYABBR, bookq.opdate)
		}
		cells[OPDATE].innerHTML = putOpdate(bookq.opdate)
		cells[ROOM].innerHTML = bookq.oproom
		cells[CASENUM].innerHTML = putCasenumTime(bookq)
		cells[STAFFNAME].innerHTML = bookq.staffname
		cells[HN].innerHTML = bookq.hn
		cells[HN].className = (bookq.hn && gv.isPACS)? "pacs" : ""
		cells[NAME].innerHTML = putNameAge(bookq)
		cells[NAME].className = bookq.patient? "camera" : ""
		cells[DIAGNOSIS].innerHTML = bookq.diagnosis
		cells[TREATMENT].innerHTML = bookq.treatment
		cells[NOTE].innerHTML = bookq.contact
		cells[QN].innerHTML = bookq.qn
		this[0].title = bookq.waitnum
		addColor(this, bookq.opdate)
	}
})

function putCasenumTime(bookq)
{
	return (bookq.casenum || "") + (bookq.optime? ("<br>" + bookq.optime) : "")
}

function putNameAge(bookq)
{
	return bookq.patient
		+ (bookq.dob? ("<br>อายุ " + putAgeOpdate(bookq.dob, bookq.opdate)) : "")
}

function addColor($this, bookqOpdate) 
{
	var predate = $this.prev().children("td").eq(OPDATE).html(),
		prevdate = (predate? predate.numDate() : ""),
		prevIsOdd = function() {
			return $this.prev().prop("class").indexOf("odd") >= 0
		},
		samePrevDate = function() {
			return bookqOpdate === prevdate
		}
	// clear colored NAMEOFDAYFULL row that is moved to non-color opdate
	$this.prop("class", "")
	if ((!samePrevDate && !prevIsOdd()) || (samePrevDate && prevIsOdd())) {
		$this.addClass("odd")
	}
	// In LARGESTDATE, prevdate = "" but bookqOpdate = LARGESTDATE
	// So LARGESTDATE cases are !samePrevDate, thus has alternate colors
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
	var HOLIDAY = {
		"2018-03-01" : "url('css/pic/Magha.png')",
		"2018-05-09" : "url('css/pic/Ploughing.png')",
		"2018-05-29" : "url('css/pic/Vesak.png')",
		"2018-07-27" : "url('css/pic/Asalha.png')",
		"2018-07-28" : "url('css/pic/Vassa.png')",
		"2019-02-19" : "url('css/pic/Magha.png')",		//วันมาฆบูชา
		"2019-05-13" : "url('css/pic/Ploughing.png')",	//วันพืชมงคล
		"2019-05-18" : "url('css/pic/Vesak.png')",		//วันวิสาขบูชา
		"2019-05-20" : "url('css/pic/Vesaksub.png')",	//หยุดชดเชยวันวิสาขบูชา
		"2019-07-16" : "url('css/pic/Asalha.png')",		//วันอาสาฬหบูชา
		"2019-07-17" : "url('css/pic/Vassa.png')"		//วันเข้าพรรษา
		}
	var monthdate = date.substring(5)
	var dayofweek = (new Date(date)).getDay()
	var holidayname = ""
	var Mon = (dayofweek === 1)
	var Tue = (dayofweek === 2)
	var Wed = (dayofweek === 3)

	for (var key in HOLIDAY) 
	{
		if (key === date)
			return HOLIDAY[key]
		if (key > date)
			//Not a listed holiday. Neither a fixed nor a compensation holiday
			break
	}
	switch (monthdate)
	{
	case "12-31":
		holidayname = "url('css/pic/Yearend.png')"
		break
	case "01-01":
		holidayname = "url('css/pic/Newyear.png')"
		break
	case "01-02":
		if (Mon || Tue)
			holidayname = "url('css/pic/Yearendsub.png')"
		break
	case "01-03":
		if (Mon || Tue)
			holidayname = "url('css/pic/Newyearsub.png')"
		break
	case "04-06":
		holidayname = "url('css/pic/Chakri.png')"
		break
	case "04-07":
	case "04-08":
		if (Mon)
			holidayname = "url('css/pic/Chakrisub.png')"
		break
	case "04-13":
	case "04-14":
	case "04-15":
		holidayname = "url('css/pic/Songkran.png')"
		break
	case "04-16":
	case "04-17":
		if (Mon || Tue || Wed)
			holidayname = "url('css/pic/Songkransub.png')"
		break
	case "07-28":
		holidayname = "url('css/pic/King10.png')"
		break
	case "07-29":
	case "07-30":
		if (Mon)
			holidayname = "url('css/pic/King10sub.png')"
		break
	case "08-12":
		holidayname = "url('css/pic/Queen.png')"
		break
	case "08-13":
	case "08-14":
		if (Mon)
			holidayname = "url('css/pic/Queensub.png')"
		break
	case "10-13":
		holidayname = "url('css/pic/King09.png')"
		break
	case "10-14":
	case "10-15":
		if (Mon)
			holidayname = "url('css/pic/King09sub.png')"
		break
	case "10-23":
		holidayname = "url('css/pic/Piya.png')"
		break
	case "10-24":
	case "10-25":
		if (Mon)
			holidayname = "url('css/pic/Piyasub.png')"
		break
	case "12-05":
		holidayname = "url('css/pic/King9.png')"
		break
	case "12-06":
	case "12-07":
		if (Mon)
			holidayname = "url('css/pic/Kingsub.png')"
		break
	case "12-10":
		holidayname = "url('css/pic/Constitution.png')"
		break
	case "12-11":
	case "12-12":
		if (Mon)
			holidayname = "url('css/pic/Constitutionsub.png')"
		break
	}
	return holidayname
}
