JavaScript Indexer v1.15.01 (04 Mar 2003) readme file
Copyright (c) 2002, 2003 Iuliu <http://www.iuliu.as.ro>

PLEASE CAREFULLY READ THIS LICENSE AGREEMENT:
============================================================================
This software is provided 'as-is', without any express or implied warranty. 
In no event will the author(s) be held liable for any damages arising from the use of this software. 

You may not use the software for any commercial, business, governmental or institutional
purpose of any kind ("Noncommercial Purposes"). 
You may alter it and redistribute it freely, subject to the following restrictions:

1. The origin of this software must not be misrepresented; you must not claim that you wrote the 
original software. If you use this software in a product, an acknowledgment in the product documentation 
would be appreciated but is not required.

2. Altered source versions must be plainly marked as such, and must not be misrepresented as being the 
original software.

3. This notice may not be removed or altered from any source distribution.

4. You may not receive any direct or indirect compensation for the distribution or use of this software.
============================================================================


INTRODUCTION:
JavaScript Indexer is a console utility which creates javascript search engines.
It creates a js file. The js file must be linked to the html file.
See the samples in the samples directory.

Description:
On servers which don't admit server-side scripts (PHP/ASP/etc..) if you wish to add a search engine you have 2 options: 
-To use a dedicated external engine. 
-Or to use a script that runs on client side.
The second option has the advantage that you can use the search engine offline (on html help, tutorials, etc..). 
JavaScripts cannot search through directories on the server, so you must make a file which contain a 
database with the words you like to be searched for. 
I made a console program (JavaScript Indexer) which scans a specified directory and all subdirectories for 
"*.htm*" and "*.txt" files and automatically indexes the web site, creating a database on a js file.
It writes the search function into the same file. So all you have to do is to add few lines to the web page and 
you have your search engine running. 
These lines are: 

Add this line in the HEAD section of the html (just after <HEAD>): 

<script language="JavaScript" type="text/javascript" SRC="search.js"></script>
 
And these lines where you want to add the input box: 

<form name="JF1" action="javascript:FND(document.JF1.JT1.value)">
<input type="text" name="JT1" size=25>
<input type="submit" value="Search!">
</form>  


You can paste this code into your page. 

IMPORTANT:
If you use a non english alphabet then modify the meta tag in the head of default.inc.

The ".js" file is the file created by the program. 
This file must be added on server. 


Requirements and compatibility:
Microsoft Windows 9x, Me, 2000, XP for jsind.exe
The script theoretically works with these browsers:
Internet Explorer 4 to 6
Netscape Navigator 4 to 7
But the the reality is different. It was tested with these browsers:

Browser            Version Compatibility Same window New window Multiframe 
Internet Explorer  6.0     100%          Yes         Yes        Yes 
Internet Explorer  5.0     95%           Yes         Yes        Yes
Internet Explorer  3.0     0%            No          No         No 
Opera              7.0     95%           Yes         Yes        Yes  
Mozilla            1.2.1   95%           Yes         Yes        Yes 
Netscape Navigator 7.01    95%           Yes         Yes        Yes 
Netscape Navigator 6.1     95%           Yes         Yes        Yes 
Netscape Navigator 4.51    0%            No          No         No 


Performance:
The main drawback is that the program is slow with big files. A 150k file containing a big table is processed
 in up to 20 seconds. 
In return the script runs faster with fewer big files. A database of 550 pages and 3.5MB is searched in 
approx. 40-60 seconds. An average web site is searched in maximum 5-10 seconds. 
For small sites (smaller then 25 pages) and low speed connections this engine is faster then a PHP/ASP version
 because the database is loaded with the page and the engine generates the result on the client browser. 
The search speed is processor power dependent. The information above is obtained on my old AMD K6-2@500MHz. 
On a faster PC the search speed is greater. 


Customization:
You can customize the look of the generated result page by editing the default.inc 
which comes with the program or by creating another inc file and by editing the jsind.ini. 


License:
This program is FREEWARE. 


Known bugs:
-In single frame page if you include a search box in the search result page (see default.inc)
in some bizarre cases not fully explained yet an error occurs and the initial page is displayed.
Test in your case to see if this error occurs if you decide to use this particular case.
-In IE6 and multiframe page you must press twice the "Go Back" link to work.
-If the page contains tag in tag (<< >>) or unclosed tags in some rare cases jsind.exe may hang-up.
-The WholeWordsOnly don't always work correctly.

To do (in the next versions):
-Split results page
-Javascript Indexer Controller - a GUI control program

Revision History:

What's new in v1.15.01 (04 Mar 2003)
-Small bugfix around php files skipp (Thanks to Wok)
-License Agreement has changed (sorry!)

What's new in v1.15 (17 Feb 2003):
-New input box
-Multilingual. Now available in English, French, Rumanian. If you do a new translation
please send to me to add in the program (see jsind.ini).
-New options in the ini file (see jsind.ini) (Thanks to Mikael):
	IndexTitleOnly
	WholeWordsOnly
-Unicode problem maybe solved
-A "GoTOP" improvement

What's new in v1.13.02 (30 Jan 2003):
-Special characters < , > and " replaced with their code on the searched word bug fix.

What's new in v1.13 (26 Jan 2003):
-New option in the ini file (see jsind.ini):
	MinCharsToSearch
-Some useless parts of the script removed.

What's new in v1.12:
-Special characters < and > replaced with their code on the searched word.

What's new in v1.11:
-New options in the ini file (see jsind.ini):
	ShowTopInformations
	ShowTopURL
	DateFormat
	ShowGoBack
	ShowGoTop
	MaxPhraseLength
	ElseMaxLength
	MaxPages
	MinFileSize
	MaxFileSize
	The js file is now specified in the ini file
-Now you can use double quotes in inc files
-Now the searched word is passed as argument to the search function.
This is more natural and increases the modularity for future improvements.
-Bug fixed: now the tags in text files are removed too.
-security improved. If a PHP or ASP script is detected in a html page then this page is skipped.
-Some other bugs fixed

What's new in v1.1:
-Ini file added. Now you can change some settings on the ini file:
	*Show information: Number of result, URL, Size, Date in any combination.
	*Quotes per result
	*Result table width
	*Target frame:
		is the target window which will display the results. It can be the same window, 
		a new window or another frame.
		-"this" will show results in the same window.
		-"blank" will open a new window.
		-The name of another frame will generate the results in that frame.
	*path to inc file
		IncFile is the header of the page generated by the script. This can be edited in order to
		change colors and fonts to integrate in your site.
		With jsind.exe comes and default.inc. You cannot generate a script without this file 
		or other inc file.
	*To scan for html or txt files.

-Some changes to the database and script
-Some bugs fixed

v1.0 initial release.


Usage:
jsind.exe <Main_Directory> <Web_Root>

Example:
jsind.exe c:\webpages http://www.iuliu.as.ro

"Main_Directory" 
is the directory on your hard drive containing html files to be indexed.
The content should be identical with the real web site.
If the path contains spaces, it should be surrounded by double quotes.
For relative path "." can be used.

"Web_Root"
is the root of the pages on the web. Can't contain spaces.
if you need to have a local path you can write "file:///c:/yourpath"
or for relative path "." can be used.
