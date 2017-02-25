 
Date.prototype.MysqlDate = function () 
{	//Javascript Date Object to MySQL date (2014-05-11)
    var yyyy = this.getFullYear();
    var mm = this.getMonth()+1;
	mm = (mm < 10)? "0"+mm : ""+mm;
    var dd = this.getDate();
	dd = (dd < 10)? "0"+dd : ""+dd;
    return yyyy + "-" + mm + "-" + dd;
} 

String.prototype.thDate = function () 
{	//MySQL date (2014-05-11) to Thai date (11 พค. 2557) 
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
	return morrow.MysqlDate();
}

String.prototype.getAge = function (toDate)
{	//Calculate age at toDate (MySQL format) from MySQL birth date (2017-01-23)
	if (!toDate)
		return ""
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
	var agemonths = months? months + Math.floor(days / 15)  + " เดือน " : "";
	var agedays = days? days + " วัน" : "";

	return years? ageyears : months? agemonths : agedays;
}

function getSunday(date)	//get last Sunday in table view
{
	var today = date? new Date(date) : new Date();
	today.setDate(today.getDate() - today.getDay());
	return today.MysqlDate();
}

function getMonday(date)	//get last Monday 
{
	var today = date? new Date(date) : new Date();
	today.setDate(today.getDate() - ((today.getDay() + 6) % 7));	//make Monday=0, Sunday=6
	return today.MysqlDate();
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

function scrollUpDown()
{
	if ($("#tblcontainer").scrollTop() < 2)
	{
		fillupscroll(-1)
	}
	else if ($("#tbl").height() <= $("#tblcontainer").outerHeight() + $("#tblcontainer").scrollTop())
	{
		fillupscroll(+1)
	}
	$(".ui-resizable-e").css("height", $("#tbl").height())
}

function URIcomponent(qoute)
{
	qoute = qoute.replace(/\s+$/,'')
	qoute = qoute.replace(/\"/g, "&#34;")	// w3 org recommend use numeric character references to represent 
	qoute = qoute.replace(/\'/g, "&#39;")	// double quotes (&#34;) or (&quot); and single quotes (&#39;)
	qoute = qoute.replace(/\\/g, "\\\\")
	return encodeURIComponent(qoute)
}
