function diagnosis(pointing, qn, qbook)
{
	var allicds = document.getElementById('searchicd')
	var icdname = document.getElementById("icdname")
	var commonname = document.getElementById("commonname")
	var newicd = document.getElementById('newicd')
	var oldicd = document.getElementById('oldicd')
	var undermed = document.getElementById("undermed")
	var oundermed = document.getElementById("oundermed")
	var subicd
	var subnicd
	var list
	var olist
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
	subicd = qbook[q].diagnosis
	showUnderMed(subicd)
	if (pointing.innerHTML != "")
	{
		for (var i=0,j=0; i<subicd.length; i++)
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

			subnicd[1].innerHTML = subicd[i].diagnosis? subicd[i].diagnosis +" " : ""
		
			side = subicd[i].side
			subnicd[2].style.color = (side == "R" || side == "B")? "black" : "#D3D3D3"
			subnicd[3].style.color = (side == "L" || side == "B")? "black" : "#D3D3D3"

			subnicd[4].value = (subicd[i].level)? subicd[i].level : "<remark>"
			if (subnicd[4].value.length > 10)
				subnicd[4].style.width = subnicd[4].value.length*7 +"px"
		}
	}
	oldicd.innerHTML = newicd.innerHTML
	oundermed.innerHTML = undermed.innerHTML
//	document.getElementById("newdxrx").disabled = true
	icdname.innerHTML = ""
	commonname.onkeyup = keyDowndx
	commonname.value = ""
	commonname.focus()

	var t;
	function keyDowndx()
	{
		if ( t )
			clearTimeout( t );
		t = setTimeout( "searchicd('diagnosis')", 500);
	}
}

function showUnderMed(subicd)
{
	var list = []
	var each
	var width
	var label
	var undermed = document.getElementById("undermed")
	var diagnosis = ""

	undermed.innerHTML = ""
	for (each=0; each<MEDLIST.length; each++)
	{
		switch(each)
		{
			case 0:
				undermed.appendChild(createspan("Underlying"))
				width = "55px"
				break
			case 4:
				width = "90px"
				break
			case 5:
				width = "55px"
				break
			case 6:
				undermed.appendChild(createspan("Precaution"))
				width = "110px"
				break
			case 8:
				undermed.appendChild(createspan("Anti-clot"))
				break
			case 10:
				undermed.appendChild(createspan("แพ้ยา"))
				break
			case 11:
				width = "140px"
				break
			case 12:
				width = "120px"
		}
		list[each] = document.createElement("span")
		list[each].onclick = function () { checkmed(this) }
		list[each].title = each
		list[each].style.width = width
		list[each].innerHTML = MEDLIST[each][2]
		label = document.createElement("label")
		label.appendChild(list[each])
		undermed.appendChild(label)
	}
	undermed.appendChild(document.createElement("hr"))

	if (!subicd)
		return
	for (each=0; each<list.length; each++)
	{
		for (var i=0; i<subicd.length; i++)
		{
			if (MEDLIST[each][0] == subicd[i].diagnosis)
			{
				list[each].style.backgroundColor = RED
				list[each].innerHTML = MEDLIST[each][0]
			}
			else if (MEDLIST[each][1] == subicd[i].diagnosis)
			{
				list[each].style.backgroundColor = GREEN
				list[each].innerHTML = MEDLIST[each][1]
			}
		}
	}
}

function createspan(item)
{
	undermed.appendChild(document.createElement("br"))
	var span = document.createElement("span")
	span.style.width = "90px"
	span.innerHTML = item
	return span
}

function checkmed(list)
{
	switch (list.style.backgroundColor)
	{
		case RED:
			list.innerHTML =  MEDLIST[list.title][2]
			list.style.backgroundColor = ""
			break
		case GREEN:
			list.innerHTML =  MEDLIST[list.title][0]
			list.style.backgroundColor = RED
			break
		case "":
			list.innerHTML =  MEDLIST[list.title][1]
			list.style.backgroundColor = GREEN
	}
}

function number(color)
{
	if (color == RED)
		return 0
	if (color == GREEN)
		return 1
}

function Dxdiff()
{
	var newicd = document.getElementById('newicd')
	var oldicd = document.getElementById('oldicd')
	var oicd = oldicd.childNodes
	var nicd = newicd.childNodes
	var i, j

	for (j=nicd.length-1; j>=0; j--) 
	{
		if (nicd[j].lastChild.innerHTML == "Undel")
			newicd.removeChild(nicd[j])	//deleted item
	}
	if (!oicd.length || !nicd.length)
		return
	for (i=oicd.length-1; i>=0; i--) 
	{
		for (j=nicd.length-1; j>=0; j--) 
		{
			if (isequalcontent(oicd[i], nicd[j])) 
			{
				//retain old icd, no new update
				oldicd.removeChild(oicd[i])
				newicd.removeChild(nicd[j])
				break
			}
			else if (oicd[i].childNodes[1].innerHTML ==
					nicd[j].childNodes[1].innerHTML) 
			{
				//retain old icd with new update
				oldicd.removeChild(oicd[i])
				nicd[j].firstChild.innerHTML = "update"
				break
			}
		}
	}
}

function saveDx(point, qn, affirm)
{
	var newicd = document.getElementById('newicd')
	var oldicd = document.getElementById('oldicd')
	var undermed = document.getElementById('undermed')
	var oundermed = document.getElementById('oundermed')
	var list = undermed.getElementsByTagName("span")
	var olist = oundermed.getElementsByTagName("span")
	var sql = ""
	var oicd
	var suboicd
	var nicd
	var subnicd
	var i, j
	var temp
	var otemp

	Dxdiff()
	oicd = oldicd.childNodes
	nicd = newicd.childNodes

	//old icd to deleted
	if (oicd.length)
	{
		j = 0
		sql = "SET @editor='"+ THISUSER +"';"
		sql += 'DELETE FROM qbookdx WHERE qn='+ qn
		sql += ' AND diagnosis IN ('
		for (i=0; i<oicd.length; i++)
		{
			if (j)
				sql += ','
			j++
			sql += '"'+ oicd[i].childNodes[1].innerHTML.replace(/\s+$/,'') +'"'
		}
		sql += ');'
	}

	//look new icd for update
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
			if (subnicd[0].innerHTML == 'update')
			{
				sql += 'UPDATE qbookdx SET side='
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
				sql += ' WHERE qn='+ qn
				temp = URIcomponent(subnicd[1].innerHTML)
				sql += ' AND diagnosis="'+ temp +'";'
				newicd.removeChild(nicd[i])
			}
		}
	}

	//remain new icd to insert
	if (nicd.length)
	{
		j = 0
		sql += 'INSERT INTO qbookdx (qn, code, diagnosis, side, level, editor) VALUES '
		for (i=0; i<nicd.length; i++)
		{
			subnicd = nicd[i].childNodes
			//[0] = code
			//[1] = diagnosis / treatment
			//[2] = side R
			//[3] = side L
			//[4] = level
			//[5] = Del
			temp = URIcomponent(subnicd[1].innerHTML)
			if (j)
				sql += ','
			j++
			sql += '('+ qn
			sql += ', "'+ subnicd[0].innerHTML.replace(/\s+$/,'')
			sql += '", "'+ temp
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

	//underlying medical disease part
	for (i=0; i<olist.length; i++) 
	{
		//ignore unchanged undermed
		if ( olist[i].style.backgroundColor == list[i].style.backgroundColor)
		{
			continue
		}

		//indeterminate new undermed is old undermed to deleted
		else if (list[i].style.backgroundColor == "")
		{
			sql += "SET @editor='"+ THISUSER +"';"
			sql += 'DELETE FROM qbookdx WHERE qn='+ qn
			sql += ' AND diagnosis="'+ MEDLIST[olist[i].title][number(olist[i].style.backgroundColor)] +'";'
		}

		//indeterminate old undermed is new undermed to insert
		else if (olist[i].style.backgroundColor == "")
		{
			temp = URIcomponent(MEDLIST[list[i].title][number(list[i].style.backgroundColor)])
			sql += 'INSERT INTO qbookdx (qn, code, diagnosis, side, level, editor) VALUES '
			sql += '('+ qn							//queue number
			sql += ', "", "'+ temp					//code, diagnosis
			sql += '", "", "","'+ THISUSER + '");'	//side, remark, editor
		}

		//otherwise is undermed to update
		else
		{
			temp = URIcomponent(MEDLIST[list[i].title][number(list[i].style.backgroundColor)])
			otemp = URIcomponent(MEDLIST[olist[i].title][number(olist[i].style.backgroundColor)])
			sql += 'UPDATE qbookdx SET diagnosis="'+ temp
			sql += '", editor="'+ THISUSER
			sql += '" WHERE qn='+ qn
			sql += ' AND diagnosis="'+ otemp +'";'
		}
	}

	if (!sql)
		return
	if (affirm)
		if (!confirm("Save the change?"))
			return

	sql = "sqlReturnQbook="+ sql

	Ajax(MYSQLIPHP, sql, callbackdx);

	function callbackdx(response)
	{
		if (!response || response.indexOf("DBfailed") != -1)
			alert("Failed! update Diagnosis \n\n" + response)
		else
		{
			updateQBOOK(response)
			updateQBOOKFILL()
			if ($(point).closest("table").attr("id") == "queuetbl")
			{
				updateQWAITFILL($(point).closest("tr").children("td" ).eq(STAFFNAME).html())
				qbook = QWAITFILL
			}
			else
			{
				qbook = QBOOKFILL
			}
			for (q=0; q<qbook.length; q++)
				if (qbook[q].qn == qn)
					break
			point.innerHTML = dxstring(qbook, q)
		}
	}
}
