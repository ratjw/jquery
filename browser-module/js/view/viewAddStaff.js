
import { SPECIALTY } from "../model/const.js"
import { STAFF } from "../util/variables.js"

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

  $(".clickgetval").off("click").on("click", function() {
	  let num = this.closest("tr").title

	  getval(num)
  })
}

jQuery.fn.extend({
  filldataStaff : function (i, q) {
    let row = this[0]
	let cells = row.cells

	cells[0].innerHTML = `<a class="clickgetval">${q.staffname}</a>`
	cells[1].innerHTML = `<a class="clickgetval">${q.specialty}</a>`
	cells[2].innerHTML = `<a class="clickgetval">${q.startoncall}</a>`

	row.title = i
  }
})

function getval(each)
{  
  let staff = STAFF[each]
  document.getElementById("sname").value = staff.staffname;
  document.getElementById("scbb").value = staff.specialty;
  document.getElementById("sdate").value = staff.startoncall; 
  document.getElementById("shidden").value = staff.number;
}

function clearval()
{  
  document.getElementById("sname").value = ""
  document.getElementById("scbb").value = ""
  document.getElementById("sdate").value = ""
  document.getElementById("shidden").value = ""
}
