
import { EQUIPSHEET, RECORDSHEET } from "../model/const.js"
import { staffqueue } from "../view/fill.js"
import { STAFF } from "../util/variables.js"

// stafflist for enter name in Staff column
// staffmenu for dropdown sub-menu
export function htmlStafflist() {
  let stafflist = '',
      staffmenu = ''
  STAFF.forEach(each => {
    stafflist += `<li><div>${each.staffname}</div></li>`
    staffmenu += `<li><a class="clickStaff ${each.staffname}">
                 <span>${each.staffname}</span></a></li>`
  })
  staffmenu += `<li><a class="clickStaff Consults"><span>Consults</span></a></li>`
  document.getElementById("stafflist").innerHTML = stafflist
  document.getElementById("staffmenu").innerHTML = staffmenu

  document.querySelectorAll(".clickStaff").forEach(function(item) {
	item.onclick = function() {
		let staffname = item.className.split(" ")[1]
		staffqueue(staffname)
	}
  })
}

export function htmlEquipment()
{
  let equip = "", type = "", width = "", name = "", id = "", label = ""

  EQUIPSHEET.forEach(function(item) {
    type = item[0]
    width = item[1]
    name = item[2]
    id = item[3]
    label = item[4]
    if (type === "divbegin") {
	  equip += `<div title="${name}">`
    } else if (type === "divend") {
	  equip += `</div>`
    } else if (type === "span") {
	  equip += `<span class="w${width}" id="${id}">${label}</span>`
    } else if (type === "spanInSpan") {
	  equip += `<span class="w${width}">${label}<span id="${id}"></span></span>`
	} else if (type === "br") {
	  equip += `<br>`
	} else if (type === "radio" || type === "checkbox") {
	  equip += `<span class="w${width}">
                  <input type="${type}" name="${name}" id="${id}">
                  <label for="${id}">${label}</label>
                </span>`
	} else if (type === "text") {
	  equip += `<span>
                  <input type="${type}" class="${name}" id="${id}" placeholder="${label}">
                </span>`
	} else if (type === "textarea") {
	  equip += `<span>
                  <textarea id="${id}" placeholder="${label}"></textarea>
                </span>`
	}
  })

  document.getElementById("dialogEquip").innerHTML = equip
}

// name is the column in Mysql
// title is the value except Readmission and Reoperation
export function htmldivRecord()
{
  let record = "",
      labelwidth = "",
      inputwidth = "",
	  type = "",
	  name = "",
	  title = "",
	  label = ""

  RECORDSHEET.forEach(function(item) {
    let labelwidth = item[0],
        inputwidth = item[1],
        type = item[2],
        name = item[3],
        title = item[4],
        label = item[5],
        min = item[6] || "",
        max = item[7] || ""

    if (labelwidth === "br") {
	  record += `<br>`
    } else if (labelwidth === "hr") {
	  record += `<hr>`
    } else if (type === "number") {
	  record += `<label class="w${labelwidth}">
				   <span>${label}</span>
				   <input class="w${inputwidth}" type="${type}" name="${name}"\
				     title="${title}" value="" min="${min}" max="${max}">
				 </label>`
	} else {
	  record += `<label class="w${labelwidth}">
				   <input class="w${inputwidth}" type="${type}" name="${name}"\
				     title="${title}" value="${title}">
				   <span style="right:${inputwidth}px">${label}</span>
				 </label>`
	}
  })

  document.querySelector("#profileRecord .divRecord").innerHTML = record
}
