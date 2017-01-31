function getlab(hn) 
{ 
	Ajax(GETLABDATA, "hn="+ hn, callbackgetlab);

	function callbackgetlab(response)
	{
		var menu = document.getElementById("menudiv")
		menu.innerHTML = response
		menu.style.display = "block";
		menu.style.top = "0px"
		if (menu.offsetHeight > $(window).height())
			menu.style.height = $(window).height() - 100 +"px"
		else
			menu.style.height = "auto"
		menu.style.overflowY = ""
	}
} 

function labresult(laburl)
{
	if (laburl.indexOf(".htm") == -1)
	{
		document.getElementById("labiframediv").style.display = "none"
		document.getElementById("labiframe").style.display = "none"
		document.getElementById("labtext").style.display = "block"
		document.getElementById("labtext").value = laburl
	}
	else
	{
/*
		document.getElementById("labiframediv").style.display = "block"
		document.getElementById("labtext").style.display = "none"
		open(laburl)
*/
		if (/surgery.rama/.test(location.hostname))
		{
			Ajax("php/getlabproxy.php", "laburl="+ laburl, callbackgetlabproxy)

			function callbackgetlabproxy(response)
			{
				document.getElementById("labiframediv").style.display = "none"
				document.getElementById("labiframe").style.display = "none"
				document.getElementById("labtext").style.display = "block"
				document.getElementById("labtext").value = response
			}
		}
		else
		{
			document.getElementById("labiframediv").style.display = "block"
			document.getElementById("labiframe").style.display = "block"
			document.getElementById("labtext").style.display = "none"
			document.getElementById("labiframe").src = laburl
		}
	}
}

function labclose()
{
	document.getElementById("menudiv").style.display = ""
	stopeditmode()
}
