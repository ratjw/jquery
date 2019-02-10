
import { DIAGNOSIS, THAIMONTH } from "../model/const.js"
import { numDate, putThdate } from "../util/date.js"
import { getTableRowsByDate } from "../util/rowsgetting.js"
import { HOLIDAY, setHOLIDAY } from "../util/updateBOOK.js"
import { holiday } from "../view/holiday.js"
import { sqlSaveHoliday, sqlDelHoliday } from "../model/sqlSaveHoliday.js"
import { Alert } from "../util/util.js"

const HOLIDAYENGTHAI = {
  "Magha": "วันมาฆบูชา",
  "Maghasub": "ชดเชยวันมาฆบูชา",
  "Ploughing": "วันพืชมงคล",
  "Ploughingsub": "ชดเชยวันพืชมงคล",
  "Vesak": "วันวิสาขบูชา",
  "Vesaksub": "ชดเชยวันวิสาขบูชา",
  "Asalha": "วันอาสาฬหบูชา",
  "Asalhasub": "ชดเชยวันอาสาฬหบูชา",
  "Vassa": "วันเข้าพรรษา",
  "Vassasub": "ชดเชยวันเข้าพรรษา",
  "special": "วันหยุดพิเศษ",
  "no": "ไม่หยุด"
}

export function inputHoliday()
{
  let  $dialogHoliday = $("#dialogHoliday"),
    $holidaytbl = $("#holidaytbl"),
    $holidateth = $("#holidateth"),
    $holidayname = $("#holidayname"),
    holidaylist = '<option style="display:none"></option>'

  fillHoliday($holidaytbl)
  $dialogHoliday.dialog({
    title: "Holiday",
    closeOnEscape: true,
    modal: true,
    show: 200,
    hide: 200,
    width: 350,
    height: 600,
    buttons: [{
      text: "Save",
      id: "buttonHoliday",
      click: function () {
        saveHoliday()
      }
    }],
    close: function() {
      let  $inputRow = $("#holidaytbl tr:has('input')")

      if ($inputRow.length) {
        holidayInputBack($inputRow)
      }
    }
  })

  let $buttonHoliday = $("#buttonHoliday")
  $buttonHoliday.hide()

  // select date by calendar
  $holidateth.datepicker({
    autoSize: true,
    dateFormat: "dd M yy",
    monthNames: [ "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", 
            "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม" ],
    // use Short names to be consistent with the month converted by numDate()
    monthNamesShort: THAIMONTH,
    yearSuffix: new Date().getFullYear() +  543,
    beforeShow: function (input, inst) {
      if (inst.selectedYear) {
        // prevent using Buddhist year from <input>
        $(this).datepicker("setDate",
          new Date(inst.currentYear, inst.currentMonth, inst.currentDay))
      } else {
        $(this).datepicker("setDate", new Date())
      }
      $holidateth.one("click", function() {
        if (input.value) {
          $holidateth.val(input.value.slice(0, -4) + (inst.selectedYear + 543))
        }
      })
    },
    onChangeMonthYear: function (year, month, inst) {
      $(this).datepicker("setDate",
        new Date(inst.selectedYear, inst.selectedMonth, inst.selectedDay))
      inst.settings.yearSuffix = inst.selectedYear + 543
      $holidateth.val($holidateth.val().slice(0, -4) + (inst.selectedYear + 543))
    },
    onSelect: function (input, inst) {
      $holidateth.val(input.slice(0, -4) + (inst.selectedYear + 543))
      if ($holidayname.val()) {
        $buttonHoliday.show()
      }
    }
  })

  // option holidays Eng: Thai
  $.each(HOLIDAYENGTHAI, function(key, val) {
    holidaylist += `<option value="${key}">${val}</option>`
  })
  $holidayname.html(holidaylist)
  $holidayname.change(function() {
    if ($holidateth.val()) {
      $buttonHoliday.show()
    }
  })
}

function fillHoliday($holidaytbl)
{
  $holidaytbl.find('tr').slice(1).remove()

  $.each( HOLIDAY, function(i) {
    $('#holidaycells tr').clone()
      .appendTo($holidaytbl.find('tbody'))
        .filldataHoliday(this)
  });
}

jQuery.fn.extend({
  filldataHoliday : function(q) {
    let  cells = this[0].cells

    cells[0].innerHTML = putThdate(q.holidate)
    cells[1].innerHTML = HOLIDAYENGTHAI[q.dayname]
  }
})

export function addHoliday()
{
  let  $dialogHoliday = $("#dialogHoliday"),
    $holidaytbl = $("#holidaytbl")

  // already has an <input> row
  if ($holidaytbl.find("input").length) { return }

  $holidaytbl.find("tbody")
    .append($("#holidayInput tr"))

  let  append = $holidaytbl.height(),
    height = $dialogHoliday.height()
  if (append > height) {
    $dialogHoliday.scrollTop(append - height)
  }
}

export function delHoliday(that)
{
  let  $row = $(that).closest("tr")

  if ($row.find("input").length) {
    holidayInputBack($row)
  } else {
    let  $cell = $row.find("td"),
      vdateth = $cell[0].innerHTML,
      vdate = numDate(vdateth),
      vname = $cell[1].innerHTML.replace(/<button.*$/, ""),
      rows = getTableRowsByDate('maintbl', vdate),
      holidayEng = getHolidayEng(vname)

    sqlDelHoliday(vdate, holidayEng).then(response => {
      let hasData = function () {
        setHOLIDAY(response)
        $(rows).each(function() {
          this.cells[DIAGNOSIS].style.backgroundImage = ""
        })
        $row.remove()
      }

      typeof response === "object"
      ? hasData()
      : Alert ("delHoliday", response)
    })
  }
}

function saveHoliday()
{
  let  vdateth = document.getElementById("holidateth").value,
    vdate = numDate(vdateth),
    vname = document.getElementById("holidayname").value,
    rows = getTableRowsByDate('maintbl', vdate)

  if (!vdate || !vname) { return }

  sqlSaveHoliday(vdate, vname).then(response => {
    let hasData = function () {
      setHOLIDAY(response)
      holidayInputBack($("#holidateth").closest("tr"))
      fillHoliday($("#holidaytbl"))
      $("#buttonHoliday").hide()
      $(rows).each(function() {
        this.cells[DIAGNOSIS].style.backgroundImage = holiday(vdate)
      })
    }

    typeof response === "object"
    ? hasData()
    : Alert ("saveHoliday", response)
  })
}

function getHolidayEng(vname) {
  return Object.keys(HOLIDAYENGTHAI).find(key => HOLIDAYENGTHAI[key] === vname)
}

// Have to move $inputRow back and forth because datepicker is sticked to #holidateth
function holidayInputBack($inputRow)
{
  $("#holidateth").val("")
  $("#holidayname").val("")
  $('#holidayInput tbody').append($inputRow)
}
