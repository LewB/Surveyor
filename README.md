# SURVEYOR
## A simple survey system designed for an internal LAN

## DESCRIPTION
Surveyor is written in javascript and python (v2), taking advantage of python's built-in CGI-HTTP server
(although it should work with any http server) and SQLite3 Database as well as its native CGI and JSON
library functions. It allows a Survey creator user to login and create surveys that are later run by survey
users. Each survey when started creates its own SQLite3 database in the '/data' directory under the http
server root. To take a survey, the survey user just enters the URL of the server in a web browser (HTML5
capable) which will run the 'index.html' file in the http server's root directory and the user will be
prompted for the survey code (which is also the name of the survey response database) that they wish to use.
The survey will appear in the same web page and the responses to the survey are stored in the database with
the name ('TITLE') of the item and a time stamp and the value of the item. Current item type choices are:

* Horizontal radio button list (default)
* Vertical radio button list (better for mobile devices)
* Min-Max range slider bar with value display (basic - no webkit)

Once a survey item's value is selected, it can be posted individually, so the
entire survey is not posted at the same time. This allows each item to be
tabulated as it is being reviewed on line. It works this way because the
main use of this tool was intended to be for school performance ratings,
where each individual performance is rated and posted as it is performed
not only as one final post at the end of all peroformances. There is a function
for the survey creator to view the survey in realtime as results are added to
the database (just by manually refreshing the survey display page - could be
possibly be some functional enhancement here).

There is not much security built in, except for password protected login and
the detection of login status of a survey creator. Currently any survey creator
(or admin) can change any other survey creator's password and email. The database
is also wide open, anyone with an SQLite3 database browser or the SQL command line
tools can change anything in the database.

## COMPONENTS

### StartWebServer.bat
Starts the built in Python CGI Webserver. Modify the file to use whatever
platform and http server you want. Currently set to listen on port 8000.

### index.html
The main default html file in the http root directory. Should be loaded
when the http server's address and port number are accessed by a contemporary
web browser. As in:

http://127.0.0.1:8000 (if running on a local machine)

or

http://192.168.1.7:8000 (if running on remote machine with IP: 192.168.1.7)

THIS COMPONENT REQUIRES (in http root):
* js/index.js
* css/index.css
* data/rsp-survey.db
* cgi-bin/rsp_survey.py
* cgi-bin/rsp_post.py

This file will prompt the user for a survey code (which should be sent to the prospective
user along with the URL to the survey user). When the survey code is entered and it matches
an existing survey, the system will display all the survey questions to be answered at once.
As each question is answered by selecting it's options, the reponse to each question is submitted
as it is answered so that it can be immediatedly added to the response database and tabulated.

All the responses to the survey can be viewed as they are being posted by the survey users by the
survey creator using the "View Response Data" selection from the main login HOME page.

### html/login.html

THIS COMPONENT REQUIRES (in http root):
* js/common_lib.js
	* cgi-bin/rsp_loadone.py
	* cgi-bin/rsp_admin.py
* js/login.js
* css/login.css
* data/rsp-admin.db (will be created automatically by the system)
* cgi-bin/rsp_login.py

The main navigation HOME window from which all survey creation, management, and
display functions are performed. Once successfully logged in, the user can then
selectively call:

* "View Response Data" (/html/responses.html)
* "Setup Surveys" (/html/survey.html)
* "Admin Users" (html/admin.html)
* "Log Out" (Logs user out - removes login status from admin database)

When an admin user logs in, their entry in the admin database is updated with a timestamp.
The timestamp, along with their login name are saved in the system as their credentials to
verify that they are a currently logged in user. This login credential is encrypted and encoded
then passed from page to page in the URL for each page in "window.location.search". A logged in
user can only be logged out by using the "Log Out" button, or having the timestamp removed from
the user's entry in the admin database. So there are no cookies used in the system, and the
URL can be hijacked to compromise the system, but it would have to be visually copied or captured
from transmitted http packet data.

### html/admin.html

THIS COMPONENT REQUIRES (in http root):
* js/common_lib.js
	* cgi-bin/rsp_loadone.py
	* cgi-bin/rsp_admin.py
* js/admin.js
* css/admin.css
* data/rsp-admin.db (will be created automatically by the system)
* cgi-bin/rsp_admin.py
* cgi-bin/rsp_loadusers.py

The Admin page in which admin users and their login credentials are created and maintained.
The "email" field is currently not used, but in the future it could be used to notify the
admin user that a survey has started, and/or that it has completed.

### html/survey.html

THIS COMPONENT REQUIRES (in http root):
* js/common_lib.js
	* cgi-bin/rsp_loadone.py
	* cgi-bin/rsp_admin.py
* js/survey.js
* css/survey.css
* data/rsp-admin.db (will be created automatically by the system)
* data/rsp-survey.db (will be created automatically by the system)
* cgi-bin/rsp_loadsurvey.py

This page allows currently logged in admin users to create and maintain
surveys and survey options in the survey definition database. The fields
that describe the look and operation of the survey are defined here.

### html/responses.html

THIS COMPONENT REQUIRES (in http root):
* js/common_lib.js
	* cgi-bin/rsp_loadone.py
	* cgi-bin/rsp_admin.py
* js/responses.js
* css/responses.css
* data/rsp-admin.db (will be created automatically by the system)
* data/rsp-survey.db (will be created automatically by the system)
* cgi-bin/rsp_surveycode.py
* cgi-bin/rsp_display.py

This page opens in a new browser window and allows an admin user to view
the responses to a survey that are currently held in the survey response
database for each survey that the admin user has created. The responses
are grouped by the "Title" field and tabulated for a total amount and
response average.
