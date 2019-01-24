
export function clearSelection()
{
  $('.selected').removeClass('selected lastselected');
  disableOneRowMenu()
  disableExcelLINE()
}

export function disableOneRowMenu()
{
	let ids = ["#addrow", "#postpone", "#moveCase", "#history", "#delete"]

	ids.forEach(function(each) {
		$(each).addClass("disabled")
	})
}

function disableExcelLINE()
{
	$("#EXCEL").addClass("disabled")
	$("#LINE").addClass("disabled")
}
