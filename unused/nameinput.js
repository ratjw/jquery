
function NAMEinput(pointing)
{
	var pointHNname

	if ((pointing.innerHTML == "") && (pointing.id != "editmode"))
	{
		pointing.id = "editmode"
		pointHNname = createinput(pointing)
		pointHNname.onkeyup = getByName
		pointHNname.focus()
	}
}

function getByName(e)
{
	var keycode = getkeycode(e)
	var namehn = document.getElementById("keyin")

	namehn.value = namehn.value.replace(/<br>/g, "")
	namehn.value = namehn.value.replace(/^\s+/g, "")
	namehn.value = namehn.value.replace(/  +/g, " ")
	if (keycode == 13)
	{
		var editpoint = document.getElementById("editmode")
		var opdate = getCellHTML(editpoint, OPDATE)

		var sqlstring = "hn="+ namehn.value
		sqlstring += "&opdate="+ opdate
		sqlstring += "&username="+ THISUSER

		Ajax(GETNAMEHN, sqlstring, callbackgetByName)
		//AJAX-false to prevent repeated GETNAMEHN when press <enter>
	}

	selectname = function (selector)
	{	//reset menudiv style
		var menu = document.getElementById("menudiv")
		menu.style.top = ""
		menu.style.left = ""
		menu.style.right = ""
		menu.style.bottom = ""
		menu.style.margin = ""
		menu.style.height = ""
		menu.style.overflow = ""
		menu.style.display = ""
		menu.innerHTML = ""
		var sqlstring = "select="+ selector
		sqlstring += "&opdate="+ opdate
		sqlstring += "&username="+ THISUSER

		Ajax(GETNAMEHN, sqlstring, callbackgetByName);
	}

	function callbackgetByName(response)
	{
		if (!response || response.indexOf("initial_name") == -1)	//no patient
			alert("Error getnamehn : "+ response)
		else
		{
			if (response.charAt(0) == "{")
			{	//Only one patient
				var qname = JSON.parse(response)	//convert JSON string into JSON object
				var name = qname.initial_name + qname.first_name +" "+ qname.last_name
				var cells = $(pointing).parents('tr').children("td" )
				var opdate = $(cells).eq(OPDATE).html().numDate()	//convert Thai date to MySQL date
				var age = qname.dob.replace(/-/g,"/").getAge(opdate.replace(/-/g,"/"))
				$(cells).eq(QN).html(qname.qn);
				$(cells).eq(HN).html(qname.hn);
				$(cells).eq(NAME).html(name);
				$(cells).eq(AGE).html(age);
				var menu = document.getElementById("menudiv")
				menu.style.display = ""
				menu.style.height = ""
				menu.style.overflow = ""
				stopeditmode()

				Ajax(MYSQLIPHP, 'nosqlReturnbook', updateQBOOKByName)	//To reload Qbook

				function updateQBOOKByName(response)
				{
					if (!response || response.indexOf("DBfailed") != -1)
						alert("Failed! nosqlReturnbook" + response)
					else
					{
						updateQBOOK(response)
						if (staffname)
							updateQWAITFILL(staffname)
						else
							updateQBOOKFILL()
					}	//new case entry tbl has no staffname but queuetbl has staffname
				}
			}
			else if (response.charAt(0) == "[")
			{	//Many patients
	 			var menu = document.getElementById("menudiv")
				menu.style.height = ""
				menu.style.width = ""
				menu.style.overflowY = ""
				menu.style.display = 'block'
	 			menu.innerHTML = ""
	 			var menuget = JSON.parse(response);
				var each
				for (each=0; each<menuget.length; each++)
				{
					if (!menuget[each].initial_name.length)
						continue	//Lost patient record
	 				var menuitem = menuget[each].hn+" : "+menuget[each].initial_name
					menuitem += menuget[each].first_name+" "+menuget[each].last_name+" : "
					menuitem += menuget[each].dob
					var jsonstr
					if (!this.JSON)	//convert JSON object into JSON string
						jsonstr = JSON.stringify(menuget[each])
					var anchor = document.createElement("a")
	 				anchor.href = "javascript:selectname('"+ jsonstr +"')"
					anchor.appendChild(document.createTextNode(menuitem))
					anchor.appendChild(document.createElement("br"))
					menu.appendChild(anchor)
				}
				if (menu.offsetHeight > ($(window).height() * 3 / 4))
				{
					menu.style.height = ($(window).height() * 3 / 4) + 'px'
					menu.style.overflowY = "scroll"
				}
				menu.style.top = "50%"
				menu.style.left = "50%"
				menu.style.marginTop = - menu.offsetHeight/2 +'px'	//set to a negative number 1/2 of your height
				menu.style.marginLeft = - menu.offsetWidth/2 +'px'	//set to a negative number 1/2 of your width
				menu.style.zIndex = "2"
			}
			return false
		}
	}
}

function NAMEinputqueue(pointing)
{
	var pointHNname

	if ((pointing.innerHTML == "") && (pointing.id != "editmode"))
	{
		pointing.id = "editmode"
		pointHNname = createinput(pointing)
		pointHNname.onkeyup = getByNAMEqueue
		pointHNname.focus()
	}
}

function getByNAMEqueue(e)
{
	var keycode = getkeycode(e)
	var namehn = document.getElementById("keyin")
	var waitnum, opdate, staffname, qn
	var tcellQN, tcellHN, tcellNAME, tcellAGE

	namehn.value = namehn.value.replace(/<br>/g, "")
	namehn.value = namehn.value.replace(/^\s+/g, "")
	namehn.value = namehn.value.replace(/  +/g, " ")
	if (keycode == 13)
	{
		var cells = $("#editmode").parents('tr').children("td" )
		var opdate = $(cells).eq(OPDATE).html().numDate()	//convert Thai date to MySQL date
		var staffname = $(cells).eq(STAFFNAME).html();
		var waitnum = $(cells).eq(QWAITNUM).html();
		var qn = $(cells).eq(QN).html();
		var sqlstring = "hn=" + namehn.value
		sqlstring += "&waitnum="+ waitnum
		sqlstring += "&opdate="+ opdate
		sqlstring += "&staffname="+ staffname
		sqlstring += "&qn="+ qn
		sqlstring += "&username="+ THISUSER

		Ajax(GETNAMEHN, sqlstring, callbackgetByNAMEqueue)
		//AJAX-false to prevent repeated GETNAMEHN when press <enter>
	}

	selectnamequeue = function (selector)
	{	//reset menudiv style
		var menu = document.getElementById("menudiv")
		menu.style.top = ""
		menu.style.left = ""
		menu.style.right = ""
		menu.style.bottom = ""
		menu.style.margin = ""
		menu.style.height = ""
		menu.style.overflow = ""
		menu.style.display = ""
		menu.innerHTML = ""
		var sqlstring = "select="+ selector
		sqlstring += "&opdate="+ opdate
		sqlstring += "&username="+ THISUSER

		Ajax(GETNAMEHN, sqlstring, callbackgetByNAMEqueue);
	}

	function callbackgetByNAMEqueue(response)
	{
		if (!response || response.indexOf("initial_name") == -1)	//no patient
			alert("Error getnamehn : "+ response)
		else
		{
			if (response.charAt(0) == "{")
			{	//Only one patient
				var qname = JSON.parse(response);
				var name = qname.initial_name + qname.first_name +" "+ qname.last_name
				var cells = $("#editmode").parents('tr').children("td" )
				var opdate = $(cells).eq(OPDATE).html().numDate()	//convert Thai date to MySQL date
				var age = qname.dob.replace(/-/g,"/").getAge(opdate.replace(/-/g,"/"))
				$(cells).eq(QN).html(qname.qn);
				$(cells).eq(HN).html(qname.hn);
				$(cells).eq(NAME).html(name);
				$(cells).eq(AGE).html(age);
				var menu = document.getElementById("menudiv")
				menu.style.display = ""
				menu.style.height = ""
				menu.style.overflow = ""
				stopeditmode()

				Ajax(MYSQLIPHP, 'nosqlReturnbook', updateQBOOKQWAIT)	//To reload Qbook

				function updateQBOOKQWAIT(response)
				{
					if (!response || response.indexOf("DBfailed") != -1)
						alert("Failed! nosqlReturnbook" + response)
					else
					{
						updateQBOOK(response)
						if (staffname)
							updateQWAITFILL(staffname)
						else
							updateQBOOKFILL()
					}	//new case entry tbl has no staffname but queuetbl has staffname
				}
			}
			else if (response.charAt(0) == "[")
			{	//Many patients
	 			var menu = document.getElementById("menudiv")
				menu.style.height = ""
				menu.style.width = ""
				menu.style.overflowY = ""
				menu.style.display = 'block'
	 			menu.innerHTML = ""
	 			var menuget
				if (!this.JSON)	//convert JSON string into JSON object
					menuget = eval("("+ response +")");
				else
					menuget = JSON.parse(response);
				var each
				for (each=0; each<menuget.length; each++)
				{
					if (!menuget[each].initial_name.length)
						continue	//Lost patient record
	 				var menuitem = menuget[each].hn+" : "+menuget[each].initial_name
					menuitem += menuget[each].first_name+" "+menuget[each].last_name+" : "
					menuitem += menuget[each].dob
					var jsonstr
					if (!this.JSON)	//convert JSON object into JSON string
						jsonstr = JSON.stringify(menuget[each])
					var anch = document.createElement("a")
	 				anch.href = "javascript:selectnamequeue('"+ jsonstr +"')"
					anch.appendChild(document.createTextNode(menuitem))
					anch.appendChild(document.createElement("br"))
					menu.appendChild(anch)
				}
				if (menu.offsetHeight > ($(window).height() * 3 / 4))
				{
					menu.style.height = ($(window).height() * 3 / 4) + 'px'
					menu.style.overflowY = "scroll"
				}
				menu.style.top = "50%"
				menu.style.left = "50%"
				menu.style.marginTop = - menu.offsetHeight/2 +'px'	//set to a negative number 1/2 of your height
				menu.style.marginLeft = - menu.offsetWidth/2 +'px'	//set to a negative number 1/2 of your width
				menu.style.zIndex = "2"
			}
			return false
		}
	}
}
