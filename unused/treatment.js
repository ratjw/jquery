
function treatment(pointing, qn, qbook)
{
	var allicds = document.getElementById('searchicd')
	var icdname = document.getElementById("icdname")
	var commonname = document.getElementById("commonname")
	var newicd = document.getElementById('newicd')
	var oldicd
	var subicd
	var subnicd
	var side
	var q

	pointing.id = "editmode"
	allicds.style.display = 'block'
	allicds.style.zIndex = '2'
	allicds.style.overflow = 'hidden'
	newicd.innerHTML = ""	//remove all newicd
	q = 0
	while ((q<qbook.length) && (qbook[q].qn != qn)) 
		q++
	if (q == qbook.length)
		return
	subicd = qbook[q].treatment
	if (pointing.innerHTML != "")
	{
		for (var i=0, j=0; i<subicd.length; i++)
		{
			if (!subicd[i].code)
				continue
			creatediv()
			subnicd = newicd.childNodes[j++].childNodes
			//subnicd
			//[0] = code
			//[1] = diagnosis / treatment
			//[2] = side R
			//[3] = side L
			//[4] = level
			//[5] = Del

			subnicd[0].innerHTML = subicd[i].code + " "

			subnicd[1].innerHTML = subicd[i].treatment? subicd[i].treatment +" " : ""
		
			side = subicd[i].side
			subnicd[2].style.color = (side == "R" || side == "B")? "black" : GRAY
			subnicd[3].style.color = (side == "L" || side == "B")? "black" : GRAY

			subnicd[4].value = (subicd[i].level)? subicd[i].level : "<remark>"
			if (subnicd[4].value.length > 10)
				subnicd[4].style.width = subnicd[4].value.length*7 +"px"
		}
	}
	if (oldicd=document.getElementById("oldicd"))
		allicds.removeChild(oldicd)
	oldicd = newicd.cloneNode(true)
	allicds.insertBefore(oldicd, newicd)
	oldicd.id = "oldicd"
	oldicd.style.display = 'none'
	document.getElementById("undermed").innerHTML = ""
	if (document.getElementById("oundermed"))
		document.getElementById("oundermed").innerHTML = ""


//	document.getElementById("newdxrx").disabled = true
	icdname.style.height = "auto"
	icdname.innerHTML = ""
	commonname.onkeyup = keyDownrx
	commonname.value = ""
	commonname.focus()

	var t;
	function keyDownrx()
	{
		if ( t )
			clearTimeout( t );
		t = setTimeout( "searchicd('treatment')", 500 );
	}
}

function creatediv()
{
	var icdi = document.getElementById("newicd")
	var divi = document.createElement("DIV")
	var spa1 = document.createElement("SPAN")
	var spa2 = document.createElement("SPAN")
	var spa3 = document.createElement("INPUT")
	var but1 = document.createElement("BUTTON")
	var but2 = document.createElement("BUTTON")
	var but3 = document.createElement("BUTTON")

	but1.onclick = function() { RLsubdiv(divi, "R") }
	but2.onclick = function() { RLsubdiv(divi, "L") }
	spa3.onclick = function() { clicklevel(this) }
	spa3.onkeyup = function() { editlevel(this) }
	but3.onclick = function() { delDxRx(divi) }
	but1.style.fontWeight = "bold"
	but2.style.fontWeight = "bold"
	but1.style.width = "25px"
	but2.style.width = "25px"
	spa3.style.width = "75px"
	but3.style.width = "55px"
	but1.style.height = "22px"
	but2.style.height = "22px"
	spa3.style.height = "22px"
	but3.style.height = "22px"
	but1.innerHTML = "R"
	but2.innerHTML = "L"
	but3.innerHTML = "Del"
	icdi.appendChild(divi)
	divi.appendChild(spa1)
	divi.appendChild(spa2)
	divi.appendChild(but1)
	divi.appendChild(but2)
	divi.appendChild(spa3)
	divi.appendChild(but3)
	but3.blur()
}

function RLsubdiv(sub, side)
{
	var right = sub.firstChild.nextSibling.nextSibling
	var left = right.nextSibling
	if (side == 'R')
		right.style.color = right.style.color == "black"? GRAY : "black"
	else if (side == 'L')
		left.style.color = left.style.color == "black"? GRAY : "black"
}

function delDxRx(divnum)
{
	var spa1 = divnum.firstChild
	var spa2 = spa1.nextSibling
	var last = divnum.lastChild

	if (last.innerHTML == "Del")
	{
		spa1.style.textDecoration="line-through"
		spa2.style.textDecoration="line-through"
		last.innerHTML = "Undel"
	}
	else
	{
		spa1.style.textDecoration="none"
		spa2.style.textDecoration="none"
		last.innerHTML = "Del"
	}
}

function clicklevel(level)
{
	if (level.value == "<remark>")
		level.value = ""
}

function editlevel(level)
{
	if (level.value.length > 10)
		level.style.width = level.value.length*7 +"px"
}

function shownwanted()
{
	var newicd = document.getElementById('newicd')
	var wanted = 0
	var i = 0 

	while (newicd.childNodes[i])
	{
		if (newicd.childNodes[i].lastChild.innerHTML == "Del")
			wanted++
		i++
	}
	return [i, wanted]
}

function listDxRx(code, txt, detail)
{
	var newicd = document.getElementById('newicd')
	var i = newicd.childNodes.length
	var nicd
	var subnicd

	creatediv()
	nicd = newicd.childNodes[i]
	subnicd = nicd.childNodes
	//[0] = code
	//[1] = diagnosis / treatment
	//[2] = side R
	//[3] = side L
	//[4] = level
	//[5] = Del
	subnicd[0].innerHTML = code + " "
	subnicd[1].innerHTML = txt
	subnicd[2].style.color = GRAY
	subnicd[3].style.color = GRAY
	subnicd[4].value = detail? detail : "<remark>"
	subnicd[5].innerHTML = "Del"
	if (subnicd[4].value.length > 10)
		subnicd[4].style.width = subnicd[4].value.length*7 +"px"
	document.getElementById('commonname').value = ""
}

function newdxrx()
{
	var sqlstring = ""
	var book = ""
	var codex = "0000"
	var namex = ""
	var mode
	var commonx = document.getElementById('commonname').value

	if (!confirm ("ท่านต้องการใช้ชื่อ '"+ commonx +"' ซึ่งไม่มีใน ICD"))	return
	commonx = commonx.replace(/^\s+/, '')
	commonx = commonx.replace(/ \s+/, ' ')
	if (commonx.length < 2)
		return false
	var cindex = $("#editmode").closest("td").index()
	if (cindex == DIAGNOSIS)
	{
		mode = "diagnosis"
		book = "icd10" 
	}
	else if (cindex == TREATMENT)
	{
		mode = "treatment"
		book = "icd9cm"
	}	
	sqlstring = "sqlnoResult=INSERT INTO " + book
	sqlstring += " (code, "+ mode +") VALUES "
	sqlstring += "('"+ codex + "', '"+ commonx + "');"

	Ajax(MYSQLIPHP, sqlstring, newdxrxcallback);

	return true

	function newdxrxcallback(response)
	{
		if (!response ||  response.indexOf("DBfailed") != -1)
			alert("Failed! new item entry\n\n" + response)
		else
			listDxRx(codex, commonx)
	}
}

function Rxdiff()
{
	var newicd = document.getElementById('newicd')
	var oldicd = document.getElementById('oldicd')
	var oicd = oldicd.childNodes
	var nicd = newicd.childNodes
	var i, j

	for (j=nicd.length-1; j>=0; j--) {
		if (nicd[j].lastChild.innerHTML == "Undel")
			newicd.removeChild(nicd[j])	//deleted item
	}
	if (!oicd.length || !nicd.length)
		return
	for (i=oicd.length-1; i>=0; i--) {
		for (j=nicd.length-1; j>=0; j--) {
			if (isequalcontent(oicd[i], nicd[j])) {
				//retain old icd, no new update
				oldicd.removeChild(oicd[i])
				newicd.removeChild(nicd[j])
				break
			}
			else if (oicd[i].childNodes[1].innerHTML ==
					nicd[j].childNodes[1].innerHTML) {
				//retain old icd with new update
				oldicd.removeChild(oicd[i])
				nicd[j].firstChild.innerHTML = "update"
				break
			}
		}
	}
}

function saveRx(point, qn, affirm)
{
	var newicd = document.getElementById('newicd')
	var oldicd = document.getElementById('oldicd')
	var undermed = document.getElementById('undermed')
	var sql = ""
	var oicd
	var suboicd
	var nicd
	var subnicd
	var i, j
	var temp
	var treat

	Rxdiff()
	oicd = oldicd.childNodes
	nicd = newicd.childNodes

	//old icd to deleted
	if (oicd.length)
	{
		j = 0
		sql = "SET @editor='"+ THISUSER +"';"
		sql += 'DELETE FROM qbookrx WHERE qn='+ qn
		sql += ' AND treatment IN ('
		for (i=0; i<oicd.length; i++)
		{
			if (j)
				sql += ','
			j++
			sql += '"'+ oicd[i].childNodes[1].innerHTML.replace(/\s+$/,'') +'"'
		}
		sql += ');'
	}

	//look for update
	if (nicd.length)
	{
		for (i=nicd.length-1; i>=0; i--)
		{
			subnicd = nicd[i].childNodes
			//[0] = code
			//[1] = diagnosis / treatment
			//[2] = side R
			//[3] = side L
			//[4] = level
			//[5] = Del
			treat = URIcomponent(subnicd[1].innerHTML)
			if (subnicd[0].innerHTML == 'update')
			{
				sql += 'UPDATE qbookrx SET side='
				if (subnicd[2].style.color == 'black' && subnicd[3].style.color == 'black')
					sql += '"B"'
				else if (subnicd[2].style.color == 'black')
					sql += '"R"'
				else if (subnicd[3].style.color == 'black')
					sql += '"L"'
				else
					sql += '""'
				sql += ', level="'
				temp = subnicd[4].value
				if (temp == '<remark>')
					temp = ''
				if (temp)
				{
					temp = temp.replace(/[ctls]\d/g, function(p) 
														{ return p.toUpperCase() })
					temp = URIcomponent(temp)
				}
				sql += temp +'", editor="'+ THISUSER + '"'
				sql += ' WHERE qn='+ qn +' AND treatment="'+ treat +'";'
				newicd.removeChild(nicd[i])
			}
		}
	}

	//remain to insert
	if (nicd.length)
	{
		j = 0
		sql += 'INSERT INTO qbookrx (qn, code, treatment, side, level, editor) VALUES '
		for (i=0; i<nicd.length; i++)
		{
			subnicd = nicd[i].childNodes
			//[0] = code
			//[1] = diagnosis / treatment
			//[2] = side R
			//[3] = side L
			//[4] = level
			//[5] = Del
			treat = URIcomponent(subnicd[1].innerHTML)
			if (j)
				sql += ','
			j++
			sql += '('+ qn
			sql += ', "'+ subnicd[0].innerHTML.replace(/\s+$/,'')
			sql += '", "'+ treat
			if (subnicd[2].style.color == 'black' && subnicd[3].style.color == 'black')
				sql += '", "B", "'
			else if (subnicd[2].style.color == 'black')
				sql += '", "R", "'
			else if (subnicd[3].style.color == 'black')
				sql += '", "L", "'
			else
				sql += '", "", "'
			temp = subnicd[4].value
			if (temp == '<remark>')
				temp = ''
			if (temp)
			{
				temp = temp.replace(/[ctls]\d/g, function(p) 
													{ return p.toUpperCase() })
				temp = URIcomponent(temp)
			}
			sql += temp +'","'+ THISUSER + '")'
		}
		sql += ';'
	}

	if (!sql)
		return
	if (affirm)
		if (!confirm("Save the change?"))
			return

	sql = "sqlReturnQbook="+ sql

	Ajax(MYSQLIPHP, sql, callbackrx);

	function callbackrx(response)
	{
		if (!response || response.indexOf("DBfailed") != -1)
			alert("Failed! update Treatment \n\n" + response)
		else
		{
			updateQBOOK(response)
			updateQBOOKFILL()
			if ($(point).closest("table").attr("id") == "queuetbl")
			{
				updateQWAITFILL($(point).parents('tr').children("td" ).eq(STAFFNAME).html())
				qbook = QWAITFILL
			}
			else
			{
				qbook = QBOOKFILL
			}
			for (q=0; q<qbook.length; q++)
				if (qbook[q].qn == qn)
					break
			point.innerHTML = rxstring(qbook, q)
		}
	}
}

function cancel()
{
	stopeditmode()
	document.getElementById('searchicd').style.display = ""
}

function oksaveDxRx()
{	//from onClick="oksaveDxRx()">Save All above items</button>
	saveDxRx(false)
	cancel()
}

function saveDxRx(affirm)
{	//from oksaveDxRx, hidepopup, hidepopupqueue
	var point = $("#editmode").get(0)
	var qn = $("#editmode").closest("tr").children("td").eq(QN).html()
	var cindex = $("#editmode").closest("td").index()
	if (cindex == DIAGNOSIS)
		saveDx(point, qn, affirm) 
	else if (cindex == TREATMENT)
		saveRx(point, qn, affirm)
}

function searchicd(diagtreat)
{
	var common = document.getElementById("commonname").value
	common = common.replace(/&nbsp;/g, "")	//IE uses "&nbsp;" for all space before "32"
	common = common.replace(/[\s\xa0]+/g, " ")	//Chrome uses "160" alternated with "32"
	if (common.length < 2)
	{
//		document.getElementById("newdxrx").disabled = true
		return
	}
	var commontrim = common.replace(/\s+$/, "");
	var sqlstring = "commons="+ commontrim +"&column="+ diagtreat

	Ajax(ICDPHP, sqlstring, icdback);

	function icdback(response)
	{
		if (!response || response.charAt(0) != "[")
		{
			alert("Failed! searching ICD \n" + response)
			hidepopup()
		}
		else
		{
			var icdcode
			if (!this.JSON)	//convert JSON string into JSON object
				icdcode = eval("("+ response +")");
			else
				icdcode = JSON.parse(response);
			var alldx = document.getElementById('searchicd')
			var icdname = document.getElementById("icdname")
			icdname.innerHTML = ""
			var divheight = $(window).height() - alldx.offsetHeight
			var each
			for (each=0; each<icdcode.length; each++)
				icdname.innerHTML += icdcode[each]
			if (icdname.offsetHeight > divheight)
				icdname.style.height = divheight + "px"
//			document.getElementById("newdxrx").disabled = icdcode.length? true : false
		}
	}
}
