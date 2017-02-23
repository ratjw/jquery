var GETLABDATA		= "php/getlabdata.php";
var GETNAMEHN		= "php/getnamehn.php";
var ICDPHP			= "php/icd.php";
var MYSQLIPHP		= "php/mysqli.php";
var MYSQL_ALLOR		= "php/mysql_allor.php";

var BOOK		= [];
var QWAIT		= [];
var STAFF		= [];
var THISUSER	= "";
var TIMESTAMP	= "";
var TIMER		= "";

var OPDATE		= 0;
var STAFFNAME	= 1;
var HN			= 2;
var NAME		= 3;
var AGE			= 4;
var DIAGNOSIS	= 5;
var TREATMENT	= 6;
var TEL			= 7;
var QN			= 8;
var EDITABLE 	= [STAFFNAME, HN, DIAGNOSIS, TREATMENT, TEL];

var QNUM		= 0;
var QSINCE		= 1;
var QHN			= 2;
var QNAME		= 3;
var QAGE		= 4;
var QDIAGNOSIS	= 5;
var QTREATMENT	= 6;
var QTEL		= 7;
var QQN			= 8;
var EDITQUEUE 	= [QHN, QDIAGNOSIS, QTREATMENT, QTEL];

var NAMEOFDAYTHAI	= ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัส", "ศุกร์", "เสาร์"];
var DAYOFTHAINAME	= {"อาทิตย์":0, "จันทร์":1, "อังคาร":2, "พุธ":3, "พฤหัส":4, "ศุกร์":5, "เสาร์":6};

//use for row color
var NAMEOFDAYABBR	= ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

//use for 1st column color
var NAMEOFDAYFULL	= ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

var NUMMONTH	= {"มค.":"01","กพ.":"02","มีค.":"03","เมย.":"04","พค.":"05","มิย.":"06",
					"กค.":"07","สค.":"08","กย.":"09","ตค.":"10","พย.":"11","ธค.":"12"};

var HOLIDAY = {
	"2015-01-02" : "url('pic/special.jpg')",	//วันหยุดพิเศษ
	"2015-03-04" : "url('pic/Magha.jpg')",		//วันมาฆบูชา
	"2015-05-13" : "url('pic/Ploughing.jpg')",	//วันพืชมงคล
	"2015-06-01" : "url('pic/Vesak.jpg')",		//วันวิสาขบูชา
	"2015-07-30" : "url('pic/Asalha.jpg')",		//วันอาสาฬหบูชา
	"2015-07-31" : "url('pic/Vassa.jpg')",		//วันเข้าพรรษา
	"2016-02-22" : "url('pic/Magha.jpg')",
	"2016-05-13" : "url('pic/Ploughing.jpg')",
	"2016-05-20" : "url('pic/Vesak.jpg')",
	"2016-07-19" : "url('pic/Asalha.jpg')",
	"2016-07-20" : "url('pic/Vassa.jpg')",
	"2017-02-11" : "url('pic/Magha.jpg')",
	"2017-02-13" : "url('pic/Maghasub.jpg')",	//หยุดชดเชยวันมาฆบูชา
	"2017-05-09" : "url('pic/Ploughing.jpg')",
	"2017-05-10" : "url('pic/Vesak.jpg')",
	"2017-07-08" : "url('pic/Asalha.jpg')",
	"2017-07-09" : "url('pic/Vassa.jpg')",
	"2017-07-10" : "url('pic/Asalhasub.jpg')",
	"2017-07-11" : "url('pic/Vassasub.jpg')",	//หยุดชดเชยวันเข้าพรรษา,	
	"2018-03-01" : "url('pic/Magha.jpg')",
	"2018-05-09" : "url('pic/Ploughing.jpg')",
	"2018-05-29" : "url('pic/Vesak.jpg')",
	"2018-07-27" : "url('pic/Asalha.jpg')",
	"2018-07-28" : "url('pic/Vassa.jpg')",
	"2018-07-30" : "url('pic/Vassasub.jpg')",
	"2019-02-19" : "url('pic/Magha.jpg')",
	"2019-05-13" : "url('pic/Ploughing.jpg')",
	"2019-05-18" : "url('pic/Vesak.jpg')",
	"2019-05-20" : "url('pic/Vesaksub.jpg')",
	"2019-07-16" : "url('pic/Asalha.jpg')",
	"2019-07-17" : "url('pic/Vassa.jpg')"
	}
