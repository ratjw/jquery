
import { SPECIALTY } from "../model/const.js"

export function viewAddStaff()
{
  let $stafftbl = $("#stafftbl")
  let scbb = document.getElementById("scbb")

  SPECIALTY.forEach(function(each) {
    scbb.innerHTML += `<option value=${each}>${each}</option>`
  })

  clearval()
  $stafftbl.find('tr').slice(3).remove()

  $.each( STAFF, (i, item) => {
    $('#staffcells tr').clone()
      .appendTo($stafftbl.find('tbody'))
        .filldataStaff(i, item)
  });
}

jQuery.fn.extend({
  filldataStaff : function (i, q) {
    let cells = this[0].cells

	cells[0].innerHTML = `<a onclick="getval('${i}')">${q.staffname}</a>`
	cells[1].innerHTML = `<a onclick="getval('${i}')">${q.specialty}</a>`
	cells[2].innerHTML = `<a onclick="getval('${i}')">${q.startoncall}</a>`
  }
})

function getval(each)
{  
  let staff = STAFF
  document.getElementById("sname").value = staff[each].staffname;
  document.getElementById("scbb").value = staff[each].specialty;
  document.getElementById("sdate").value = staff[each].startoncall; 
  document.getElementById("shidden").value = staff[each].number;
}

function clearval()
{  
  document.getElementById("sname").value = ""
  document.getElementById("scbb").value = ""
  document.getElementById("sdate").value = ""
  document.getElementById("shidden").value = ""
}
