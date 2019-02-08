
import { htmlStafflist } from "../view/html.js"
import { sqlDoadddata, sqlDoupdatedata, sqlDodeletedata } from "../model/sqlDoadddata.js"
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

export function doadddata()
{
  sqlDoadddata().then(response => {
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
  sqlDoupdatedata().then(response => {
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
  sqlDodeletedata().then(response => {
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
