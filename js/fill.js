
function fillupstart()		
{	//Display all cases in each day of 5 weeks
	var book = globalvar.BOOK
	if (book.length === 0)
		book.push({"opdate" : getSunday()})

	var start = new Date()
	start = new Date(start.getFullYear(), start.getMonth()-1).ISOdate()
	start = getSunday(start)				//1st of last month

	//fill until 1 year from now
	var nextyear = new Date().getFullYear() + 1
	var month = new Date().getMonth()
	var todate = new Date().getDate()
	var until = (new Date(nextyear, month, todate)).ISOdate()

	var table = document.getElementById("tbl")
	fillall(book, table, start, until)

	//scroll to today
	var today = new Date().ISOdate().thDate()
	var thishead = $("tr:contains(" + today + ")").eq(0)
	$('#tblcontainer').animate({
		scrollTop: thishead.offset().top
	}, 300);
}

function fillForScrub()
{
	var table = document.getElementById("tbl")
	var start = new Date().ISOdate()
	var until = start.nextdays(6)
	var book = globalvar.BOOK

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

			//make table head row before every Sunday
			if ((new Date(date).getDay())%7 === 0)
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

		//make table head row before every Sunday
		if (((new Date(date)).getDay())%7 === 0)
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
	var book = globalvar.BOOK
	var table = document.getElementById("tbl")
	var tbody = table.getElementsByTagName("tbody")[0]
	var rows = table.rows
	var tlength = rows.length
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
	while (i < tlength)		//make blank rows till the end of existing table
	{
		if (q < booklength) {
			//step over each day that is not in book
			while (date < book[q].opdate)
			{
				if (date !== madedate)
				{
					fillrowdate(rows, i, date)	//existing row
					fillblank(rows[i])	//clear a row for the day not in book
					i++
					if (i >= tlength) {
						return
					}
					
					madedate = date
				}
				date = date.nextdays(1)
				//make table head row before every Sunday
				if ((new Date(date).getDay())%7 === 0)
				{
					if (rows[i].cells[OPDATE].nodeName !== "TH") {
						var rowh = head.cloneNode(true)
						tbody.replaceChild(rowh, rows[i])
					}

					i++
					if (i >= tlength) {
						return
					}
				}
			}
			fillrowdate(rows, i, date)	//existing row
			filldata(book[q], rows[i])	//fill a row for the day in book
			madedate = date
			i++
			if (i >= tlength) {
				return
			}
			q++
		}
		else
		{
			date = date.nextdays(1)

			//make table head row before every Sunday
			if (((new Date(date)).getDay())%7 === 0)
			{
				if (rows[i].cells[OPDATE].nodeName !== "TH") {
					var rowh = head.cloneNode(true)
					tbody.replaceChild(rowh, rows[i])
				}

				i++
				if (i >= tlength) {
					return
				}
			}

			//make a blank row
			fillrowdate(rows, i, date)	//existing row
			fillblank(rows[i])
			i++
			if (i >= tlength) {
				return
			}
		}
	}
}

function refillOneDay(opdate)
{
	var getOpdateRows = function (opdate) {
		var opdateth = opdate.thDate()
			return $('#tbl tr').filter(function() {
					return $(this).find("td").eq(OPDATE).html() === opdateth;
				}).closest("tr")
		}
	var book = globalvar.BOOK
	var opdateBOOKrows = book.filter(function(row) {
			return (row.opdate === opdate);
		})
	var $opdateTblRows = getOpdateRows(opdate)
	var bookRows = opdateBOOKrows.length
	var tblRows = $opdateTblRows.length

	if (!tblRows) {
		return		//Out of tbl range
	}
	if (!bookRows) {
		while ($opdateTblRows.length > 1) {
			$opdateTblRows.eq(0).remove()
			$opdateTblRows = getOpdateRows(opdate)
		}
		$opdateTblRows.children("td").eq(OPDATE).siblings().html("")
		$opdateTblRows.children("td").eq(HN).removeClass("pacs")
		$opdateTblRows.children("td").eq(NAME).removeClass("camera")
		$opdateTblRows.attr("title", "")
	} else {
		if (tblRows > bookRows) {
			while ($opdateTblRows.length > bookRows) {
				$opdateTblRows.eq(0).remove()
				$opdateTblRows = getOpdateRows(opdate)
			}
		}
		else if (tblRows < bookRows) {
			while ($opdateTblRows.length < bookRows) {
				$opdateTblRows.eq(0).clone().insertAfter($opdateTblRows.eq(0))
				$opdateTblRows = getOpdateRows(opdate)
			}
		}
		$.each(opdateBOOKrows, function(key, val) {
			filldata(this, $opdateTblRows[key])
		})
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

	if (rows[i].cells[OPDATE].nodeName !== "TD") {
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
	cells[HN].className = ""
	cells[NAME].innerHTML = ""
	cells[NAME].className = ""
	cells[DIAGNOSIS].innerHTML = ""
	cells[TREATMENT].innerHTML = ""
	cells[CONTACT].innerHTML = ""
	cells[QN].innerHTML = ""
}

function filldata(bookq, rowi)		//bookq = book[q]
{
	var cells = rowi.cells
	rowi.title = bookq.waitnum
	cells[ROOMTIME].innerHTML = (bookq.oproom? bookq.oproom : "")
		+ (bookq.optime? "<br>" + bookq.optime : "")
	cells[STAFFNAME].innerHTML = bookq.staffname
	cells[HN].innerHTML = bookq.hn
	if (bookq.hn && globalvar.isPACS) {
		cells[HN].className = "pacs"
	}
	cells[NAME].innerHTML = bookq.patient
		+ (bookq.dob? ("<br>อายุ " + bookq.dob.getAge(bookq.opdate)) : "")
	cells[NAME].className = bookq.patient? "camera" : ""
	cells[DIAGNOSIS].innerHTML = bookq.diagnosis
	cells[TREATMENT].innerHTML = bookq.treatment
	cells[CONTACT].innerHTML = bookq.contact
	cells[QN].innerHTML = bookq.qn
}

function staffqueue(staffname)
{
	var todate = new Date().ISOdate()
	var scrolled = $("#queuecontainer").scrollTop()
	var book = globalvar.BOOK
	var consult = globalvar.CONSULT

	$('#titlename').html(staffname)
	
	//delete previous queuetbl lest it accumulates
	$('#queuetbl tr').slice(1).remove()

	if (staffname === "Consults") {		//Consults cases are not in BOOK
		if (consult.length === 0)
			consult.push({"opdate" : getSunday()})

		var table = document.getElementById("queuetbl")
		var start = (new Date((new Date()).getFullYear(), (new Date()).getMonth() - 1, 1)).ISOdate()

		fillall(consult, table, start, todate)
	} else {
		$.each( book, function() {	// each === this
			if (( this.staffname === staffname ) && this.opdate >= todate) {
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
	var book = globalvar.BOOK
	var consult = globalvar.CONSULT

	if (staffname === "Consults") {
		//Consults table is rendered same as fillall
		$('#queuetbl tr').slice(1).remove()
		if (consult.length === 0)
			consult.push({"opdate" : getSunday()})

		var table = document.getElementById("queuetbl")
		var start = (new Date((new Date()).getFullYear(), (new Date()).getMonth() - 1, 1)).ISOdate()

		fillall(consult, table, start, todate)
	} else {
		//render as staffqueue
		var i = 0
		$.each( book, function(q, each) {	// each === this
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
			cells[OPDATE].className = NAMEOFDAYABBR[(new Date(bookq.opdate)).getDay()]
		}
		cells[OPDATE].innerHTML = putOpdate(bookq.opdate)
		cells[ROOMTIME].innerHTML = (bookq.oproom? bookq.oproom : "")
			+ (bookq.optime? "<br>" + bookq.optime : "")
		cells[STAFFNAME].innerHTML = bookq.staffname
		cells[HN].innerHTML = bookq.hn
		cells[HN].className = (bookq.hn && globalvar.isPACS)? "pacs" : ""
		cells[NAME].innerHTML = bookq.patient
			+ (bookq.dob? ("<br>อายุ " + putAgeOpdate(bookq.dob, bookq.opdate)) : "")
		cells[NAME].className = bookq.patient? "camera" : ""
		cells[DIAGNOSIS].innerHTML = bookq.diagnosis
		cells[TREATMENT].innerHTML = bookq.treatment
		cells[CONTACT].innerHTML = bookq.contact
		cells[QN].innerHTML = bookq.qn
		this[0].title = bookq.waitnum
		addColor(this, bookq.opdate)
	}
})

function addColor($this, bookqOpdate) 
{
	var prevdate = $this.prev().children("td").eq(OPDATE).html()
	prevdate = prevdate? prevdate.numDate() : ""
	//In LARGESTDATE, prevdate = "" but bookqOpdate = LARGESTDATE
	//So LARGESTDATE cases has alternate colors
	if (((bookqOpdate !== prevdate) && ($this.prev()[0].className.indexOf("odd") < 0))
	|| ((bookqOpdate === prevdate) && ($this.prev()[0].className.indexOf("odd") >= 0))) {
		$this.addClass("odd")
	} else {
		$this.removeClass("odd")	//clear colored row that is moved to non-color opdate
	}
}
 
Date.prototype.ISOdate = function () 
{	//Javascript Date Object to MySQL date (2014-05-11)
    var yyyy = this.getFullYear();
    var mm = this.getMonth()+1;
	mm = (mm < 10)? "0"+mm : ""+mm;
    var dd = this.getDate();
	dd = (dd < 10)? "0"+dd : ""+dd;
    return yyyy + "-" + mm + "-" + dd;
} 

String.prototype.nextdays = function (days)
{	//MySQL date to be added or substract by days
	var morrow = new Date(this);
	morrow.setDate(morrow.getDate()+days);
	return morrow.ISOdate();
}

function getSunday(date)	//get Sunday in the same week
{
	var today = date? new Date(date) : new Date();
	today.setDate(today.getDate() - today.getDay());
	return today.ISOdate();
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
		"2018-03-01" : "url('css/pic/Magha.jpg')",
		"2018-05-09" : "url('css/pic/Ploughing.jpg')",
		"2018-05-29" : "url('css/pic/Vesak.jpg')",
		"2018-07-27" : "url('css/pic/Asalha.jpg')",
		"2018-07-28" : "url('css/pic/Vassa.jpg')",
		"2019-02-19" : "url('css/pic/Magha.jpg')",		//วันมาฆบูชา
		"2019-05-13" : "url('css/pic/Ploughing.jpg')",	//วันพืชมงคล
		"2019-05-18" : "url('css/pic/Vesak.jpg')",		//วันวิสาขบูชา
		"2019-05-20" : "url('css/pic/Vesaksub.jpg')",	//หยุดชดเชยวันวิสาขบูชา
		"2019-07-16" : "url('css/pic/Asalha.jpg')",		//วันอาสาฬหบูชา
		"2019-07-17" : "url('css/pic/Vassa.jpg')"		//วันเข้าพรรษา
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
			return HOLIDAY[key]	//matched a holiday
		if (key > date)
			break		//Not a listed holiday. Neither a fixed nor a compensation holiday
	}
	switch (monthdate)
	{
	case "12-31":
		holidayname = "url('css/pic/Yearend.jpg')"
		break
	case "01-01":
		holidayname = "url('css/pic/Newyear.jpg')"
		break
	case "01-02":
		if (Mon || Tue)
			holidayname = "url('css/pic/Yearendsub.jpg')"
		break
	case "01-03":
		if (Mon || Tue)
			holidayname = "url('css/pic/Newyearsub.jpg')"
		break
	case "04-06":
		holidayname = "url('css/pic/Chakri.jpg')"
		break
	case "04-07":
	case "04-08":
		if (Mon)
			holidayname = "url('css/pic/Chakrisub.jpg')"
		break
	case "04-13":
	case "04-14":
	case "04-15":
		holidayname = "url('css/pic/Songkran.jpg')"
		break
	case "04-16":
	case "04-17":
		if (Mon || Tue || Wed)
			holidayname = "url('css/pic/Songkransub.jpg')"
		break
	case "07-28":
		holidayname = "url('css/pic/King10.jpg')"
		break
	case "07-29":
	case "07-30":
		if (Mon)
			holidayname = "url('css/pic/King10sub.jpg')"
		break
	case "08-12":
		holidayname = "url('css/pic/Queen.jpg')"
		break
	case "08-13":
	case "08-14":
		if (Mon)
			holidayname = "url('css/pic/Queensub.jpg')"
		break
	case "10-13":
		holidayname = "url('css/pic/King09.jpg')"
		break
	case "10-14":
	case "10-15":
		if (Mon)
			holidayname = "url('css/pic/King09sub.jpg')"
		break
	case "10-23":
		holidayname = "url('css/pic/Piya.jpg')"
		break
	case "10-24":
	case "10-25":
		if (Mon)
			holidayname = "url('css/pic/Piyasub.jpg')"
		break
	case "12-05":
		holidayname = "url('css/pic/King9.jpg')"
		break
	case "12-06":
	case "12-07":
		if (Mon)
			holidayname = "url('css/pic/Kingsub.jpg')"
		break
	case "12-10":
		holidayname = "url('css/pic/Constitution.jpg')"
		break
	case "12-11":
	case "12-12":
		if (Mon)
			holidayname = "url('css/pic/Constitutionsub.jpg')"
		break
	}
	return holidayname
}
