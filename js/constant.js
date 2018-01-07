//Actually these are constants but older browsers do not support const
var GETIPD		= "php/getipd.php";
var GETNAMEHN	= "php/getnamehn.php";
var MYSQLIPHP	= "php/mysqli.php";

//tbl, queuetbl
var OPDATE		= 0;
var ROOM		= 1;
var NUM			= 2;
var STAFFNAME	= 3;
var HN			= 4;
var NAME		= 5;
var DIAGNOSIS	= 6;
var TREATMENT	= 7;
var CONTACT		= 8;
var QN			= 9;

//servicetbl
var CASENUMSERVICE		= 0;
var HNSERVICE			= 1;
var NAMESERVICE			= 2;
var DIAGNOSISSERVICE	= 3;
var TREATMENTSERVICE	= 4;
var ADMISSIONSERVICE	= 5;
var FINALSERVICE		= 6;
var ADMITSERVICE		= 7;
var DISCHARGESERVICE	= 8;
var QNSERVICE			= 9;

// NAMEOFDAYABBR for row color
// NAMEOFDAYFULL for 1st column color
var NAMEOFDAYABBR	= ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
var NAMEOFDAYFULL	= ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
var THAIMONTH		= ["มค.", "กพ.", "มีค.", "เมย.", "พค.", "มิย.", "กค.", "สค.", "กย.", "ตค.", "พย.", "ธค."];
var LARGESTDATE		= "9999-12-31";

//====================================================================================================

var gv = {
	BOOK: [],
	CONSULT: [],
	STAFF: [],
	user: "",
	timestamp: "",
	uploadWindow: null,
	timer: {},
	idleCounter: 0,
	mobile: false,
	isPACS: true
}

if (/Android|webOS|iPhone|iPad|BlackBerry|IEMobile/i.test(navigator.userAgent)) {
	gv.mobile = true
	gv.isPACS = false
}
