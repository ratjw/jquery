 
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

function isequalcontent(firstnode, secondnode) 
{
	if (firstnode.innerHTML || secondnode.innerHTML)
		if (firstnode.innerHTML !== secondnode.innerHTML)
			return false
	if (firstnode.value || secondnode.value)
		if (firstnode.value !== secondnode.value)
			return false
	var len = firstnode.childNodes.length + 1;
	while (len -= 1)
	{
		if (firstnode.childNodes[len - 1].innerHTML || secondnode.childNodes[len - 1].innerHTML)
			if (firstnode.childNodes[len - 1].innerHTML !== secondnode.childNodes[len - 1].innerHTML)
				return false
		if (firstnode.childNodes[len - 1].value || secondnode.childNodes[len - 1].value)
			if (firstnode.childNodes[len - 1].value !== secondnode.childNodes[len - 1].value)
				return false
	}
	return true
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

function whichElement(e)
{
	var targ;
	if (!e)
		var e=window.event;
	if (e.target)
		targ=e.target;
	else
		targ=e.srcElement;
	return targ;
}

function getkeycode(e)
{
	if (window.event)
		return window.event.keyCode;
	else if (e) 
		return e.which;
	else 
		return false;
}

function Xscrolled()
{
	var scrolled
	if (window.pageXOffset == undefined)
	{
		scrolled = document.documentElement.scrollLeft || document.body.scrollLeft 
	}
	else
		scrolled = window.pageXOffset
	return scrolled
}

function Yscrolled()
{
	var scrolled
	var table = document.getElementById("tbl")
	if (window.pageYOffset == undefined)
	{
		scrolled = table.scrollTop
	}
	else
		scrolled = window.pageYOffset
	return scrolled
}

function scrollview(table, dateclicked)
{
	var i, j, q
	var trow = table.rows
	var tlen = table.rows.length

	i = 1	//top row
	while ((i < tlen) && (trow[i].cells[OPDATE].innerHTML.numDate() != dateclicked))
		i++
	if (i == tlen)
		i--
	j = i + 1	//bottom row
	while ((j < tlen) && (trow[j].cells[OPDATE].innerHTML.numDate() == dateclicked))
		j++
	j--
	scrolltoview(trow[i], trow[j])
}

function scrolltoview(highpos, lowpos)
{
	var recthigh, rectlow
	var find = document.getElementById("finddiv")
	
	recthigh = highpos.getBoundingClientRect()
	rectlow = lowpos.getBoundingClientRect()
	if (rectlow.bottom > $(window).height())
	{
		scrollanimation(rectlow.bottom - $(window).height() + Yscrolled(), 1250)
	}
	else if (find.style.display == "block")
	{
		high = find.offsetTop + find.offsetHeight
		if (recthigh.top < high)
		{
			scrollanimation(recthigh.top - high + Yscrolled(), 1250)
		}
	}
	else if (recthigh.top < 0)
	{
		scrollanimation(recthigh.top + Yscrolled(), 1250)
	}
}

function scrollanimation(to, duration) 
{
	var start = Yscrolled();
	var	change = to - start;
	var	currentTime = 0;
	var	increment = 20;

	duration = Math.abs(change) < 100? 100 : 
		Math.abs(change) > duration? duration : Math.abs(change)
	//duration should not be too low to let Math.easeInOutQuad complete its cycle
	var animateScroll = function(){        
		currentTime += increment;
		var val = Math.easeInOutQuad(currentTime, start, change, duration);
		document.documentElement.scrollTop = val
		document.documentElement.scrollTop? "" : document.body.scrollTop = val;
		if(currentTime < duration) {
			setTimeout(animateScroll, increment);
		}
	};
	animateScroll();
}

Math.easeInOutQuad = function (t, b, c, d) {
	t /= d/2;
	if (t < 1) return c/2*t*t + b;
	t--;
	return -c/2 * (t*(t-2) - 1) + b;
};

function stopEditmode()
{
	while (document.getElementById("editcell"))
		document.getElementById("editcell").id = ""
//	while (document.getElementById("movemode"))
//		document.getElementById("movemode").id = ""
//	while (document.getElementById("copymode"))
//		document.getElementById("copymode").id = ""
}

function popup(pointing)
{
	var xpos, ypos, xscr, yscr
	var xscroll = Xscrolled()
	var yscroll = Yscrolled()
	var menu = document.getElementById("menudiv")

	menu.style.width = ""
	menu.style.display = 'block'
	menu.style.height = ""
	menu.style.overflowY = ""
	xscr = $(window).width()
	yscr = $(window).height()
	xpos = pointing.offsetLeft + pointing.offsetWidth - xscroll
	ypos = pointing.offsetTop - yscroll
	if (xpos > xscr - menu.offsetWidth)
		xpos = pointing.offsetLeft - xscroll - menu.offsetWidth
	if (ypos > yscr - menu.offsetHeight)
		ypos = yscr - menu.offsetHeight
	if (xpos < 0)
		xpos = 0
	if (ypos < 0)
		ypos = 0
	menu.style.top = ypos + 'px'
	menu.style.left = xpos + 'px'
}

function hidePopup()
{
	var div = $("body").children("div")
	for (var i=0; i<div.length; i++)
		if ($(div[i]).css("display") == "block")
			$(div[i]).fadeOut()
}

function hidePopupqueue()
{
	var edit = document.getElementById("editmode")
	if (edit)
	{
		if (edit.cellIndex == QHN)
			edit.innerHTML = ""		//This also kills "INPUT"
		else if (edit.cellIndex == QNAME)
			edit.innerHTML = ""		//This also kills "INPUT"
		else if (edit.cellIndex == QTEL)
			savetel(true)
		else if (document.getElementById('searchicd').style.display == 'block')
			saveDxRx(true)
		edit.id = ""
	}
	var div = $("body").children("div")
	for (var i=0; i<div.length; i++)
		if ((div[i].id != "queuediv") && ($(div[i]).css("display") == "block"))
			$(div[i]).fadeOut();
}
/*
$(".element")
	.draggable()
	.click(function(){
		if ( $(this).is('.ui-draggable-dragging') ) {
			return;
		}
	// click action here
	});
*/
function dragHandler(event)
{
	var dragXoffset = 0;	// How much we've moved the element on the horozontal
	var dragYoffset = 0;	// How much we've moved the element on the verticle

	var event = event || window.event;	//for old ie
	var pointing = whichElement(event)
	if (pointing.nodeName == 'TD')
		return
	if ((pointing.id == 'queuedivin') || (pointing.id == 'calendarin') || 
		(pointing.id == 'qcalendarin'))
	{
		return	//bypass no "mouseup" event bug when click on scroll bar
	}
	var container = $(pointing).parentsUntil("body").eq(-1).get(0)	//getOuterMostNode(pointing);
	dragXoffset = event.clientX - container.offsetLeft;
	dragYoffset = event.clientY - container.offsetTop;
	document.onmouseup = clickHandler	//works when mousedown within 100 ms

	var timer = setInterval(function(){ 
		clearInterval(timer); 
		container.style.cursor = 'move';
		document.onmousemove = moveHandler;
		document.onmouseup = cleanup;
	}, 100);


	function moveHandler(event)
	{
		event = event || window.event;	//for old ie
		if (event.button <= 1)
		{
			container.style.left=event.clientX-dragXoffset+'px';
			container.style.top=event.clientY-dragYoffset+'px';
		}
	}

	function clickHandler()
	{	//for close overlay menu
		clearInterval(timer); 
		document.getElementById("overlay").style.display = "none"
		cleanup()
	}

	function cleanup()
	{
		document.onmousemove = null;
		document.onmouseup = null;
		container.style.cursor = "default";
	}
}

function URIcomponent(qoute)
{
	qoute = qoute.replace(/\s+$/,'')
	qoute = qoute.replace(/\"/g, "&#34;")	// w3 org recommend use numeric character references to represent 
	qoute = qoute.replace(/\'/g, "&#39;")	// double quotes (&#34;) or (&quot); and single quotes (&#39;)
	qoute = qoute.replace(/\\/g, "\\\\")
	return encodeURIComponent(qoute)
}
