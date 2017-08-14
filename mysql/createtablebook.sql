
DROP TABLE IF EXISTS book;

CREATE TABLE `book` (
	`waitnum` double DEFAULT 1,
	`opdate` date,
	`oproom` varchar(10) NOT NULL DEFAULT '',
	`optime` varchar(10) NOT NULL DEFAULT '',
	`staffname` varchar(255) NOT NULL DEFAULT '',
	`hn` varchar(10) NOT NULL DEFAULT '',
	`patient` varchar(255) NOT NULL DEFAULT '',
	`dob` date DEFAULT NULL,
	`gender` varchar(1) NOT NULL DEFAULT '',
	`diagnosis` varchar(3000) NOT NULL DEFAULT '',
	`treatment` varchar(3000) NOT NULL DEFAULT '',
	`admission` varchar(5000) NOT NULL DEFAULT '', 
	`final` varchar(5000) NOT NULL DEFAULT '', 
	`equipment` varchar(2000) NOT NULL DEFAULT '',
	`contact` varchar(3000) NOT NULL DEFAULT '',
	`admit` date, 
	`discharge` date, 
	`qn` int(10) unsigned NOT NULL AUTO_INCREMENT,
	`editor` varchar(10) NOT NULL DEFAULT '',
	PRIMARY KEY (`qn`),
	KEY `opdate` (`opdate`),
	KEY `hn` (`hn`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;
