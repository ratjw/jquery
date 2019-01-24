
import { htmlStafflist } from "../view/html.js"
import { fetchDoadddata, fetchDoupdatedata, fetchDodeletedata } from "../model/search.js"
import { updateBOOK, setSTAFF } from "../util/variables.js"
import { Alert } from "../util/util.js"
import { viewAddStaff } from "../view/viewAddStaff.js"
import { fillConsults } from "../view/fillConsults.js"

export function addStaff()
{
  $("#dialogStaff").dialog({
    title: "Subspecialty Staff",
    closeOnEscape: true,
    modal: true,
    show: 200,
    hide: 200,
    width: 600,
    height: 400
  })
  viewAddStaff()
}

export function doadddata()
{
	fetchDoadddata().then(response => {
		let hasData = function () {
			updateBOOK(response)
			showAddStaff(response)
		}

		typeof response === "object"
		? hasData()
		: Alert ("dodeletedata", response)
	})
}

export function doupdatedata()
{
  if (confirm("ต้องการแก้ไขข้อมูลนี้")) {
	fetchDoupdatedata().then(response => {
		let hasData = function () {
			updateBOOK(response)
			showAddStaff(response)
		}

		typeof response === "object"
		? hasData()
		: Alert ("dodeletedata", response)
	})
  }
} // end of function doupdatedata

export function dodeletedata()
{
  if (confirm("ต้องการลบข้อมูลนี้หรือไม่")) {
	fetchDodeletedata().then(response => {
		let hasData = function () {
			updateBOOK(response)
			showAddStaff(response)
		}

		typeof response === "object"
		? hasData()
		: Alert ("dodeletedata", response)
	})
  }
}

function showAddStaff(response)
{
	setSTAFF(response.STAFF)
	htmlStafflist()
	fillConsults()
	addStaff()
}
