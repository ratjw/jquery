
function fillupstart()		
{	//Display all cases in each day of 5 weeks
	var book = getBOOK()
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
	var thishead = $("tr:contains(" + today + ")").eq(0).prevAll(":has(th)").first()
	$('#tblcontainer').animate({
		scrollTop: thishead.offset().top
	}, 300);
}

function fillForScrub()
{
	var table = document.getElementById("tbl")
	var start = new Date().ISOdate()
	var until = start.nextdays(6)
	var book = getBOOK()

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
	for (q; q < book.length; q++)
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
	var book = getBOOK()
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
	while (i < tlength)		//make blank rows till the end of existing table
	{
		if (q < book.length) {
			//step over each day that is not in book
			while (date < book[q].opdate)
			{
				if (date !== madedate)
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
				if ((new Date(date).getDay())%7 === 0)
				{
					if (rows[i].cells[OPDATE].nodeName !== "TH") {
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
			if (i >= tlength)
				return
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
				if (i >= tlength)
					return
			}

			//make a blank row
			fillrowdate(rows, i, date)	//existing row
			fillblank(rows[i])
			i++
			if (i >= tlength)
				return
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
	var book = getBOOK()
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

function refillAnotherTableCell(tableID, cellindex, qn)
{
	var rowi
	$.each($("#" + tableID + " tr:has(td)"), function() {
		rowi = this
		return (this.cells[QN].innerHTML !== qn);
	})
	if (rowi.cells[QN].innerHTML !== qn) {
		return
	}

	var book = getBOOK()	//Consults cases have no link to others
	var bookq = getBOOKrowByQN(book, qn)
	if (!bookq) {
		return
	}

	var cells = rowi.cells

	switch(cellindex)
	{
		case ROOMTIME:
			cells[ROOMTIME].innerHTML = (bookq.oproom? bookq.oproom : "")
				+ (bookq.optime? "<br>" + bookq.optime : "")
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
	if (isPACS()) {
		cells[HN].className = "pacs"
	}
	cells[NAME].innerHTML = bookq.patient
		+ (bookq.dob? ("<br>อายุ " + bookq.dob.getAge(bookq.opdate)) : "")
	cells[NAME].className = bookq.hn? "camera" : ""
	cells[DIAGNOSIS].innerHTML = bookq.diagnosis
	cells[TREATMENT].innerHTML = bookq.treatment
	cells[CONTACT].innerHTML = bookq.contact
	cells[QN].innerHTML = bookq.qn
}

function staffqueue(staffname)
{
	var todate = new Date().ISOdate()
	var scrolled = $("#queuecontainer").scrollTop()
	var book = getBOOK()
	var consult = getCONSULT()

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
	var book = getBOOK()
	var consult = getCONSULT()

	if (staffname === "Consults") {
		//render as fillall
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
		if (isPACS()) {
			cells[HN].className = "pacs"
		}
		cells[NAME].innerHTML = bookq.patient
			+ (bookq.dob? ("<br>อายุ " + putAgeOpdate(bookq.dob, bookq.opdate)) : "")
		cells[NAME].className = bookq.hn? "camera" : ""
		cells[DIAGNOSIS].innerHTML = bookq.diagnosis
		cells[TREATMENT].innerHTML = bookq.treatment
		cells[CONTACT].innerHTML = bookq.contact
		cells[QN].innerHTML = bookq.qn
		this[0].title = bookq.waitnum
		addColor(this, bookq.opdate)	//alternate day color
		//tr[0] has className "ui-sortable-handle", so first case has no className 
	}
})
