var GETNAMEHN		= "php/getnamehn.php";
var GETIPD			= "php/getipd.php";
var MYSQLIPHP		= "php/mysqli.php";
var CHECKPAC		= "php/checkpac.php";

var BOOK		= [];
var CONSULT		= [];
var TIMESTAMP	= "";
var TIMER		= "";
var THISUSER	= "";
var LARGESTDATE	= "9999-12-31";

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
var CASE		= 0;
var PATIENT		= 1;
var SDIAGNOSIS	= 2;
var STREATMENT	= 3;
var ADMISSION	= 4;
var FINAL		= 5;
var ADMIT		= 6;
var DISCHARGE	= 7;
var SQN			= 8;

//historytbl
var HEDITDATETIME	= 0;
var HOPDATE		= 1;
var HSTAFFNAME	= 2;	//used in undelete
var HHN			= 3;
var HPATIENT	= 4;
var HDIAGNOSIS	= 5;
var HTREATMENT	= 6;
var HCONTACT	= 7;
var HEDITOR		= 8;
var HQN			= 9;	//used in undelete

var EDITABLE 	= [HN, DIAGNOSIS, TREATMENT, CONTACT];
var SEDITABLE	= [SDIAGNOSIS, STREATMENT, ADMISSION, FINAL]

var NAMEOFDAYTHAI	= ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัส", "ศุกร์", "เสาร์"];
var DAYOFTHAINAME	= {"อาทิตย์":0, "จันทร์":1, "อังคาร":2, "พุธ":3, "พฤหัส":4, "ศุกร์":5, "เสาร์":6};

//use for row color
var NAMEOFDAYABBR	= ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

//use for 1st column color
var NAMEOFDAYFULL	= ["sunday", "monday", "tuesday", "wednesday", 
						"thursday", "friday", "saturday"];

var NUMMONTH	= {"มค.":"01","กพ.":"02","มีค.":"03","เมย.":"04","พค.":"05","มิย.":"06",
					"กค.":"07","สค.":"08","กย.":"09","ตค.":"10","พย.":"11","ธค.":"12"};

var TRIMHTML	= /^(\s*<[^>]*>)*\s*|\s*(<[^>]*>\s*)*$/g
var HTMLNOTBR	=/(<((?!br)[^>]+)>)/ig

var ISODATE			= /\b\d{4}\-(0?[1-9]|1[012])\-([012]?[1-9]|10|20|3[01])\b/
var THAIDATE	= /\b([012]?[1-9]|10|20|3[01])\/(0?[1-9]|1[012])\/\d{4}\b/
var SHORTDATE		= /\b([012]?[1-9]|10|20|3[01])\/(0?[1-9]|1[012])\/\d{2}\b/

var ISODATEG		= /\b\d{4}\-(0?[1-9]|1[012])\-([012]?[1-9]|10|20|3[01])\b/g
var THAIDATEG	= /\b([012]?[1-9]|10|20|3[01])\/(0?[1-9]|1[012])\/\d{4}\b/g
var SHORTDATEG	= /\b([012]?[1-9]|10|20|3[01])\/(0?[1-9]|1[012])\/\d{2}\b/g

var STAFF = ["อ.เอก", "อ.อัตถพร", "อ.สรยุทธ", "อ.วัฒนา", "อ.เกรียงศักดิ์", "อ.พีรพงศ์"];

var HOLIDAY = {
	"2017-02-11" : "url('pic/Magha.jpg')",
	"2017-02-13" : "url('pic/Maghasub.jpg')",	//หยุดชดเชยวันมาฆบูชา
	"2017-05-10" : "url('pic/Vesak.jpg')",
	"2017-05-12" : "url('pic/Ploughing.jpg')",
	"2017-07-08" : "url('pic/Asalha.jpg')",
	"2017-07-09" : "url('pic/Vassa.jpg')",
	"2017-07-10" : "url('pic/Asalhasub.jpg')",	//หยุดชดเชยวันอาสาฬหบูชา
	"2018-03-01" : "url('pic/Magha.jpg')",
	"2018-05-09" : "url('pic/Ploughing.jpg')",
	"2018-05-29" : "url('pic/Vesak.jpg')",
	"2018-07-27" : "url('pic/Asalha.jpg')",
	"2018-07-28" : "url('pic/Vassa.jpg')",
	"2019-02-19" : "url('pic/Magha.jpg')",		//วันมาฆบูชา
	"2019-05-13" : "url('pic/Ploughing.jpg')",	//วันพืชมงคล
	"2019-05-18" : "url('pic/Vesak.jpg')",		//วันวิสาขบูชา
	"2019-05-20" : "url('pic/Vesaksub.jpg')",	//หยุดชดเชยวันวิสาขบูชา
	"2019-07-16" : "url('pic/Asalha.jpg')",		//วันอาสาฬหบูชา
	"2019-07-17" : "url('pic/Vassa.jpg')"		//วันเข้าพรรษา
	}

var neuroSxOp = [
	/ACDF/, /ALIF/, /[Aa]nast/, /[Aa]pproa/, /[Aa]spirat/, /advance/,
	/[Bb]iop/, /[Bb]lock/, /[Bb]urr/, /[Bb]x/, /[Cc]lip/, 
	/[Dd]ecom/, /DBS/, /[Dd]rain/,
	/[Ee]ctomy/, /[Ee]ndo/, /ETS/, /ETV/, /EVD/, /[Ee]xcis/,
	/[Ff]ix/, /[Ff]usion/, /[Ii]nsert/, /[Ll]esion/, /[Ll]ysis/, 
	/MIDLIF/, /OLIF/, /[Oo]cclu/, /[Oo]p/, /ostom/, /otom/,
	/plast/, /PLF/, /PLIF/,
	/[Rr]emov/, /[Rr]epa/, /[Rr]evis/, /[Rr]obot/,
	/scope/, /[Ss]crew/, /[Ss]hunt/, /[Ss]tim/, /SNRB/, /TSP/,
	/TLIF/, /[Tt]rans/, /[Uu]ntether/
	]

var neuroMorbid = [
	/[Bb]rain death/, /[Bb]rain swelling/, /[Dd]elirium/, /[Dd]onor/, 
	/[Ll]eak/, /[Mm]orbid/, /[Ss]pastic/, /[Ss]eizure/, /DI/, 
	/[Pp]ost-op.*palsy/, /[Pp]ost-op.*paresis/, /[Pp]ost-op.*weakness/, 
	/[Pp]ost-op.*plegia/, /[Pp]ost-op.*gr [0123]/
	]
