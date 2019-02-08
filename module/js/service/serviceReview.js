
import { winWidth, winHeight } from "../util/util.js"
import { oneMonth } from "./oneMonth.js"

export function setClickService()
{
  document.getElementById("clickserviceReview").onclick = serviceReview
}

// Includes all serviced cases, operated or not (consulted)
// Then count complications and morbid/mortal
// Button click Export to Excel
// PHP Getipd retrieves admit/discharge dates
function serviceReview() {
  let  $dialogService = $("#dialogService"),
    $monthpicker = $("#monthpicker"),
    $monthstart = $("#monthstart"),
    selectedYear = new Date().getFullYear(),
    BuddhistYear = Number(selectedYear) + 543

  $("#servicehead").hide()
  $("#servicetbl").hide()
  $("#exportService").hide()
  $("#reportService").hide()
  $(".divRecord").hide()
  
  $dialogService.dialog({
    title: "Service Neurosurgery",
    closeOnEscape: true,
    closeText: "Save and Close",
    modal: true,
    width: winWidth(95),
    height: winHeight(95)
  })

  $monthpicker.show()
  $monthpicker.datepicker({
    altField: $monthstart,
    altFormat: "yy-mm-dd",
    autoSize: true,
    dateFormat: "MM yy",
    monthNames: [ "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", 
            "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม" ],
    yearSuffix: new Date().getFullYear() +  543,
    onChangeMonthYear: function (year, month, inst) {
      $(this).datepicker("setDate", new Date(inst.selectedYear, inst.selectedMonth, 1))
      inst.settings.yearSuffix = inst.selectedYear + 543
    },
    beforeShow: function (input, obj) {
      $(".ui-datepicker-calendar").hide()
    }
  }).datepicker("setDate", new Date(new Date().getFullYear(), new Date().getMonth(), 1))

  $dialogService.off("click").on("click", ".ui-datepicker-title", function() {
    oneMonth($monthstart.val())
  })
}
