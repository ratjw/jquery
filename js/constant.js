//Actually these are constants but older browsers do not support const
var STAFF 		= [	"อ.เอก",
					"อ.อัตถพร", 
					"อ.สรยุทธ", 
					"อ.วัฒนา", 
					"อ.เกรียงศักดิ์", 
					"อ.พีรพงศ์"
				];

var GETIPD		= "php/getipd.php";
var GETNAMEHN	= "php/getnamehn.php";
var MYSQLIPHP	= "php/mysqli.php";

//tbl, queuetbl
var OPDATE		= 0;
var ROOMTIME	= 1;
var STAFFNAME	= 2;
var HN			= 3;
var NAME		= 4;
var DIAGNOSIS	= 5;
var TREATMENT	= 6;
var CONTACT		= 7;
var QN			= 8;

//servicetbl
var STCASENUM	= 0;
var STHN		= 1;
var STNAME		= 2;
var STDIAGNOSIS	= 3;
var STTREATMENT	= 4;
var STADMISSION	= 5;
var STFINAL		= 6;
var STADMIT		= 7;
var STDISCHARGE	= 8;
var STQN		= 9;

//use for row color
var NAMEOFDAYABBR	= ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

//use for 1st column color
var NAMEOFDAYFULL	= ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

var THAIMONTH		= ["มค.", "กพ.", "มีค.", "เมย.", "พค.", "มิย.", "กค.", "สค.", "กย.", "ตค.", "พย.", "ธค."];

var LARGESTDATE		= "9999-12-31";

//====================================================================================================

var globalvar = {
	"BOOK": [],
	"CONSULT": [],
	"user": "",
	"timestamp": "",
	"uploadWindow": null,
	"timer": {},
	"idleCounter": 0,
	"mobile": false,
	"isPACS": true
}

if (/Android|webOS|iPhone|iPad|BlackBerry|IEMobile/i.test(navigator.userAgent)) {
	globalvar.mobile = true
	globalvar.isPACS = false
}
