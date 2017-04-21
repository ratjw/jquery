 
Date.prototype.mysqlDate = function () 
{	//Javascript Date Object to MySQL date (2014-05-11)
    var yyyy = this.getFullYear();
    var mm = this.getMonth()+1;
	mm = (mm < 10)? "0"+mm : ""+mm;
    var dd = this.getDate();
	dd = (dd < 10)? "0"+dd : ""+dd;
    return yyyy + "-" + mm + "-" + dd;
} 

String.prototype.mysqlDateparse = function () 
{	//check if valid MySQL date (2017-04-19)
	if (!this) {
		return false
	}
	var date = this.split("-")
	if (Number(date[0]) > 1900) {
		if (Number(date[1]) > 0) {
			if (Number(date[2]) > 0) {
				return true
			}
		}
	}
	return false
}

String.prototype.toISOdate = function () 
{	//change dd-mm-yy, dd-mm-yyyy to yyyy-mm-dd
	//change dd/mm/yy, dd/mm/yyyy to yyyy-mm-dd
	if (!this) {
		return this
	}
	if (/-/.test(this)) {
		var date = this.split("-")
	}
	else if (/\//.test(this)) {
		var date = this.split("/")
	}

	var yyyy = new Date().getFullYear()
	if (date[0].length == 4) {	//assume yyyy-mm-dd, yyyy/mm/dd
		if ((date[0] > yyyy + 300)) {	//assume Buddhist year
			date[0] = date[0] - 543
		}

		return (datejoin("-"))

	} else {	//assume dd-mm-yy, dd-mm-yyyy, dd/mm/yy, dd/mm/yyyy
		var BE = (yyyy + 543).substr(-2)
		if (date[2].length == 2) {
			if (date[2] >= 50) {	//49 => 2049, 50 => 1950 by browser
				date[2] = "25" + date[2]	//assume Buddhist year
				date[2] = date[2] - 543
			} else {
				if (date[2] >= 50) {	//49 => 2049, 50 => 1950 by browser
					date[2] = "25" + date[2]	//assume Buddhist year
					date[2] = date[2] - 543
				} else {
					date[2] = "20" + date[2]	//assume Christian year
				}
			}
		}
		else if (date[2].length == 4) {
			if ((date[0] > yyyy + 300)) {	//assume Buddhist year
				date[0] = date[0] - 543
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

function regexDate(str)
{
	var fullDate = /\b([012]?[1-9]|10|20|3[01])\/(0?[1-9]|1[012])\/\d{4}\b/g
	var halfDate = /\b([012]?[1-9]|10|20|3[01])\/(0?[1-9]|1[012])\/\d{2}\b/g

	var isoDate = /\b\d{4}\-(0?[1-9]|1[012])\-([012]?[1-9]|10|20|3[01])\b/g
	var fulDate = /\b([012]?[1-9]|10|20|3[01])\-(0?[1-9]|1[012])\-\d{4}\b/g
	var halDate = /\b([012]?[1-9]|10|20|3[01])\-(0?[1-9]|1[012])\-\d{2}\b/g

	var full = str.match(fullDate)
	var half = str.match(halfDate)

	var iso = str.match(isoDate)
	var ful = str.match(fulDate)
	var hal = str.match(halDate)

	var arr = []

	if (full) {
		arr = arr.concat(full)
	}
	if (half) {
		arr = arr.concat(half)
	}
	if (iso) {
		arr = arr.concat(iso)
	}
	if (ful) {
		arr = arr.concat(ful)
	}
	if (hal) {
		arr = arr.concat(hal)
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

function alert(message)
{
	$('#message').html(message)
	$("#alert").fadeIn();

	var div = $('#message')
	while (div.height() > div.parent().height() - 40) {	//-30 for header
		div.css('font-size', (parseInt(div.css('font-size')) - 1) + "px")
		if (parseInt(div.css('font-size')) < 8)
			break
	}
}

function closeAlert()
{
	$("#alert").hide();
}
