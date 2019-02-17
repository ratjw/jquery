
import { addStaff, doAddStaff, doUpdateStaff, doDeleteStaff } from "./addStaff.js"

import { inputHoliday, addHoliday, delHoliday } from "./inputHoliday.js"

export function setClickSetting()
{
  let onclick = {
    "clickaddStaff": addStaff,
    "clicksetHoliday": inputHoliday,
    "clickdoAddStaff": doAddStaff,
    "clickdoUpdateStaff": doUpdateStaff,
    "clickdoDeleteStaff": doDeleteStaff,
    "addholiday": addHoliday
  }

  $.each(onclick, function(key, val) {
    document.getElementById(key).onclick= val
  })

  document.querySelectorAll(".delholiday").forEach(function(item) {
    item.addEventListener("click", function() {
      delHoliday(this)
    })
  })
}
