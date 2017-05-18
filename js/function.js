 
Date.prototype.mysqlDate = function () 
{	//Javascript Date Object to MySQL date (2014-05-11)
    var yyyy = this.getFullYear();
    var mm = this.getMonth()+1;
	mm = (mm < 10)? "0"+mm : ""+mm;
    var dd = this.getDate();
	dd = (dd < 10)? "0"+dd : ""+dd;
    return yyyy + "-" + mm + "-" + dd;
} 

String.prototype.hyphenDateparse = function () 
{
	if ((ISODATE.test(this))				//yyyy-mm-dd
		|| (HYPHENYYYYDATE.test(this))		//dd-mm-yyyy
		|| (HYPHENYYDATE.test(this))) {	//dd-mm-yy
		return true
	} else {
		return false
	}
}

String.prototype.slashDateparse = function () 
{
	if ((SLASHYYYYDATE.test(this)) ||		//dd/mm/yyyy
		(SLASHYYDATE.test(this))) {		//dd/mm/yy
		return true
	} else {
		return false
	}
}

String.prototype.toISOdate = function () 
{	//change dd-mm-yy, dd-mm-yyyy to yyyy-mm-dd
	//change dd/mm/yy, dd/mm/yyyy to yyyy-mm-dd
	if (!this) {
		return this
	}
	if (this.hyphenDateparse()) {
		var date = this.split("-")
	}
	else if (this.slashDateparse()) {
		var date = this.split("/")
	}
	else {
		return this
	}

	var yyyy = new Date().getFullYear()
	if (date[0].length == 4) {	//assume yyyy-mm-dd, yyyy/mm/dd
		if (Number(date[0]) > yyyy + 300) {	//assume Buddhist year
			date[0] = date[0] - 543
		}

		return (date.join("-"))

	} else {	//assume dd-mm-yy, dd-mm-yyyy, dd/mm/yy, dd/mm/yyyy
		if (date[2].length == 2) {	//assume Buddhist year
			date[2] = "25" + date[2]
			date[2] = date[2] - 543
		}
		else if (date[2].length == 4) {
			if (Number(date[2]) > yyyy + 300) {	//assume Buddhist year
				date[2] = date[2] - 543
			}
		}

		return (date[2] + "-" + date[1] + "-" + date[0])
	}
} 

String.prototype.thDate = function () 
{	//MySQL date (2014-05-11) to Thai date (11 พค. 2557) 
	if (this < '1900-01-01')
		return this
	var yyyy = parseInt(this.substr(0, 4)) + 543;
	var mm = this.substr(5, 2);
	for (ThMonth in NUMMONTH)
		if (NUMMONTH[ThMonth] == mm) 
			break;
	return (this.substr(8, 2) +' '+ ThMonth + yyyy);
} 

String.prototype.numDate = function () 
{	//Thai date (11 พค. 2557) to MySQL date (2014-05-11)
    var mm = this.substring(this.indexOf(" ")+1, this.length-4);
    var yyyy = parseInt(this.substr(this.length-4)) - 543;
    return yyyy +"-"+ NUMMONTH[mm] +"-"+ this.substr(0, 2);
} 

String.prototype.nextdays = function (days)
{	//MySQL date to be added or substract by days
	var morrow = new Date(this);
	morrow.setDate(morrow.getDate()+days);
	return morrow.mysqlDate();
}

String.prototype.getAge = function (toDate)
{	//Calculate age at toDate (MySQL format) from MySQL birth date (2017-01-23)
	if (!toDate || this <= '1900-01-01')
		return this
	var birth = new Date(this);
	var today = new Date(toDate);

	if (today.getTime() - birth.getTime() < 0)
		return "wrong date"

	var ayear = today.getFullYear();
	var amonth = today.getMonth();
	var adate = today.getDate();
	var byear = birth.getFullYear();
	var bmonth = birth.getMonth();
	var bdate = birth.getDate();

	var days = adate - bdate;
	var months = amonth - bmonth;
	var years = ayear - byear;
	if (days < 0)
	{
		months -= 1
		days = new Date(byear, bmonth+1, 0).getDate() + days;
	}
	if (months < 0)
	{
		years -= 1
		months += 12
	}

	var ageyears = years? years + Math.floor(months / 6)  + " ปี " : "";
	var agemonths = months? months + Math.floor(days / 15)  + " ด." : "";
	var agedays = days? days + " ว." : "";

	return years? ageyears : months? agemonths : agedays;
}

function getOpdate(date)
{
	if (date === undefined) { return date }
	if ((date === "") || (date === LARGESTDATE)) {
		return LARGESTDATE
	} else {
		return date.numDate()
	}
}

function putOpdate(date)
{
	if (date === undefined) { return date }
	if ((date === "") || (date === LARGESTDATE)) {
		return ""
	} else {
		return date.thDate()
	}
}

function putAgeOpdate(dob, date)
{
	if (!date || !dob || (date === LARGESTDATE)) {
		return ""
	} else {
		return dob.getAge(date)
	}
}

function regexDate(str)
{
	var iso = str.match((ISODATEG))
	var ful = str.match((HYPHENYYYYDATEG))
	var hal = str.match((HYPHENYYDATEG))
	var full = str.match((SLASHYYYYDATEG))
	var half = str.match((SLASHYYDATEG))

	var arr = []

	if (iso) {
		arr = arr.concat(iso)
	}
	if (ful) {
		arr = arr.concat(ful)
	}
	if (hal) {
		arr = arr.concat(hal)
	}
	if (full) {
		arr = arr.concat(full)
	}
	if (half) {
		arr = arr.concat(half)
	}
	return arr
}

function dateDiff(from, to)	//assume mm/dd/yy(yy) or yyyy-mm-dd
{
	var timeDiff = new Date(to) - new Date(from)
	return Math.ceil(timeDiff / (1000 * 60 * 60 * 24))
}

function getSunday(date)	//get Sunday in the same week
{
	var today = date? new Date(date) : new Date();
	today.setDate(today.getDate() - today.getDay());
	return today.mysqlDate();
}

function Ajax(url, params, callback)
{
	var xmlHttp = new XMLHttpRequest();
	xmlHttp.open("GET", url+"?"+encodeURI(params), true);
	xmlHttp.onreadystatechange = function() 
	{
		if(xmlHttp.readyState == 4)
			callback(xmlHttp.responseText);
	}
	xmlHttp.send(null);
}

function URIcomponent(qoute)
{
	if (qoute) {
		qoute = qoute.replace(/\s+$/,'')
		qoute = qoute.replace(/\"/g, "&#34;")	// double quotes ((&#34;) or (&quot))
		qoute = qoute.replace(/\'/g, "&#39;")	// and single quotes (&#39;)
		qoute = qoute.replace(/\\/g, "\\\\")
		qoute = encodeURIComponent(qoute)
	}
	return qoute
}

function findTablerow(table, qn)
{
	var i = 1
	while ((i < table.rows.length) && (table.rows[i].cells[QN].innerHTML != qn)) {
		i++
	}
	if (i < table.rows.length) {
		return i
	} else {
		return null
	}
}

function findBOOKrow(qn)
{  
	var q = 0
	while ((q < BOOK.length) && (BOOK[q].qn != qn)) {
		q++
	}
	if (q < BOOK.length) {
		return q
	} else {
		return null
	}
}

function findNewRowBOOK(opdate)	//find new row (max. qn)
{
	var q = 0
	while (BOOK[q].opdate != opdate)
	{
		q++
		if (q >= BOOK.length)
			return ""
	}

	var qn = Number(BOOK[q].qn)
	var newq = q
	q++
	while (q < BOOK.length && BOOK[q].opdate == opdate) {
		if (Number(BOOK[q].qn) > qn) {
			qn = Number(BOOK[q].qn)
			newq = q
		}
		q++
	}
	return newq
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

function calculateWaitnum($row, opdate)
{
	var prevWaitNum = $row.prev()[0]
	var nextWaitNum = $row.next()[0]
	if (prevWaitNum) {
		prevWaitNum = Number(prevWaitNum.title)
	}
	if (nextWaitNum) {
		nextWaitNum = Number(nextWaitNum.title)
	}
	var $prevRowCell = $row.prev().children("td")
	var $nextRowCell = $row.next().children("td")
	var prevOpdate = getOpdate($prevRowCell.eq(OPDATE).html())
	var nextOpdate = getOpdate($nextRowCell.eq(OPDATE).html())

	if (prevOpdate != opdate && opdate != nextOpdate) {
		return 1
	}
	else if (prevOpdate == opdate && opdate != nextOpdate) {
		return prevWaitNum + 1
	}
	else if (prevOpdate != opdate && opdate == nextOpdate) {
		return nextWaitNum? (nextWaitNum / 2) : 1
	}
	else if (prevOpdate == opdate && opdate == nextOpdate) {
		return nextWaitNum? ((prevWaitNum + nextWaitNum) / 2) : (prevWaitNum + 1)
	}
}

function findPrevcell(event, editable, pointing) 
{
	var $prevcell = $(pointing)
	var column = $prevcell.index()

	if ((column = editable[($.inArray(column, editable) - 1)]))
	{
		$prevcell = $prevcell.parent().children().eq(column)
	}
	else
	{
		do {
			if ($prevcell.parent().index() > 1)
			{	//go to prev row last editable
				$prevcell = $prevcell.parent().prev("tr").children().eq(editable[editable.length-1])
			}
			else
			{	//#tbl tr:1 td:1
				event.preventDefault()
				return false
			}
		}
		while (($prevcell.get(0).nodeName == "TH")	//THEAD row
			|| (!$prevcell.is(':visible')))			//invisible due to colspan
	}

	return $prevcell.get(0)
}

function findNextcell(event, editable, pointing) 
{
	var $nextcell = $(pointing)
	var column = $nextcell.index()

	if ((column = editable[($.inArray(column, editable) + 1)]))
	{
		$nextcell = $nextcell.parent().children().eq(column)
	}
	else
	{
		do {//go to next row first editable
			$nextcell = $($nextcell).parent().next("tr").children().eq(editable[0])
			if (!($nextcell.length)) {
				event.preventDefault()
				return false
			}
		}
		while ((!$nextcell.is(':visible'))	//invisible due to colspan
			|| ($nextcell.get(0).nodeName == "TH"))	//TH row
	}

	return $nextcell.get(0)
}

function findNextRow(event, editable, pointing) 
{
	var $nextcell = $(pointing)

	//go to next row first editable
	do {
		$nextcell = $nextcell.parent().next("tr").children().eq(editable[0])
		if (!($nextcell.length)) {
			event.preventDefault()
			return false	
		}
	}
	while ((!$nextcell.is(':visible'))	//invisible due to colspan
		|| ($nextcell.get(0).nodeName == "TH"))	//TH row

	return $nextcell.get(0)
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
	case "07-28":
		holidayname = "url('pic/King10.jpg')"
		break
	case "07-29":
	case "07-30":
		if (dayofweek == 1)
			holidayname = "url('pic/King10sub.jpg')"
		break
	case "08-12":
		holidayname = "url('pic/Queen.jpg')"
		break
	case "08-13":
	case "08-14":
		if (dayofweek == 1)
			holidayname = "url('pic/Queensub.jpg')"
		break
	case "10-13":
		holidayname = "url('pic/King09.jpg')"
		break
	case "10-14":
	case "10-15":
		if (dayofweek == 1)
			holidayname = "url('pic/King09sub.jpg')"
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
		holidayname = "url('pic/King9.jpg')"
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
