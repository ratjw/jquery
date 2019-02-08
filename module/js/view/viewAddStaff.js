
import { STAFF } from "../util/updateBOOK.js"

const SPECIALTY = [
  "breast",
  "cvt",
  "general",
  "hepatobiliary",
  "neurosurgery",
  "pediatrics",
  "plastic",
  "trauma",
  "urology",
  "vascular"
]

const STAFFPROFILE = {
  sname: "staffname",
  specialty: "specialty",
  soncall: "startoncall",
  snumber: "number"
}

export function viewAddStaff()
{
  let $stafftbl = $("#stafftbl")
  let specialty = document.getElementById("specialty")

  SPECIALTY.forEach(function(each) {
    specialty.innerHTML += `<option value=${each}>${each}</option>`
  })

  clearval()
  $stafftbl.find('tr').slice(3).remove()

  $.each( STAFF, (i, item) => {
    $('#staffcells tr').clone()
      .appendTo($stafftbl.find('tbody'))
        .filldataStaff(i, item)
  });

  $(".clickgetval").off("click").on("click", function() {
    getval(this.title)
  })
}

jQuery.fn.extend({
  filldataStaff : function (i, q) {
    let row = this[0]
  let cells = row.cells

  row.title = i
  row.className = "clickgetval"

  cells[0].innerHTML = q.staffname
  cells[1].innerHTML = q.specialty
  cells[2].innerHTML = q.startoncall
  }
})

function getval(each)
{  
  let staff = STAFF[each]

  Object.entries(STAFFPROFILE).forEach(([key, val]) => {
    document.getElementById(key).value = staff[val];
  })
}

function clearval()
{  
  Object.entries(STAFFPROFILE).forEach(([key, val]) => {
    document.getElementById(key).value = "";
  })
}
