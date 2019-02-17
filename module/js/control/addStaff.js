
import { htmlStafflist } from "../view/html.js"
import { sqlDoAddStaff, sqlDoUpdateStaff, sqlDoDeleteStaff } from "../model/sqlDoAddStaff.js"
import { updateBOOK, setSTAFF } from "../util/updateBOOK.js"
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

export function doAddStaff()
{
  sqlDoAddStaff().then(response => {
    let hasData = function () {
      updateBOOK(response)
      showAddStaff(response)
    }

    typeof response === "object"
    ? hasData()
    : Alert ("doDeleteStaff", response)
  })
}

export function doUpdateStaff()
{
  if (confirm("ต้องการแก้ไขข้อมูลนี้")) {
  sqlDoUpdateStaff().then(response => {
    let hasData = function () {
      updateBOOK(response)
      showAddStaff(response)
    }

    typeof response === "object"
    ? hasData()
    : Alert ("doDeleteStaff", response)
  })
  }
} // end of function doUpdateStaff

export function doDeleteStaff()
{
  if (confirm("ต้องการลบข้อมูลนี้หรือไม่")) {
  sqlDoDeleteStaff().then(response => {
    let hasData = function () {
      updateBOOK(response)
      showAddStaff(response)
    }

    typeof response === "object"
    ? hasData()
    : Alert ("doDeleteStaff", response)
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
