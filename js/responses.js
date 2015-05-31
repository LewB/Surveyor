/************************************************************
 * FILE NAME: responses.js
 * AUTHOR: ALB
 * USAGE: Included in responses.html
 * FUNCTIONAL DESCRIPTION:
 * This File supports responses.html
 **************************************************************
 * MODIFICATION HISTORY:
 * 05-30-2015 Created ALB
 * 05-31-2015 ALB Added encrypted login check for viewing of
 *                survey responses from HOME page.
 *************************************************************
 */
//CHECK FOR VALID LOGIN
function initResp()
{
	check_login("url", location.search, resp_initDoc);
	// admin_initDoc() will be called asynchronously by HTTPRequest
	// after it Returns from processing the login check, the
	// function will be called with 'result' as the parameter.
	// IMPORTANT: Nothing stops DOC flow before next event loop
}
// Init Document
function resp_initDoc(result)
{
	if ( result == true )
	{
		// True: Keys Match - Go ahead and Initialize the Doc
		// SET LISTENER FOR HOME NAVIGATION BUTTON
		document.getElementById("svyCodeBtn").addEventListener("click", function(e) {
			e.preventDefault();
			document.getElementById("svyCodeDiv").style.display = "none";
	    	view_responses();
		});
        document.getElementById("svyUser").innerHTML = g_user;
        resp_setup();
	}
	else
	{
		// False: Keys DON'T Match - Stale or Unauthorized User
		alert("You Are Not Logged In or Your Login Timed Out.");
	}
}
// INITIALIZE DOM ELEMENTS
function resp_setup()
{
	pstr = "SVOWNER=" + g_user;
	loadXMLDoc("POST", "../cgi-bin/rsp_surveycodes.py", pstr, function()
    {
        // HTTP GET REQUEST ASYNCHRONOUS CALLBACK FUNCTION
        if (g_xmlhttp.readyState == 4 && g_xmlhttp.status == 200)
        {
            //alert("HTTPresp: " + g_xmlhttp.responseText);
            if (g_xmlhttp.responseText[0] != "E")
            {
            	var selm = document.getElementById("svySelect");
            	var pJSON = JSON.parse(g_xmlhttp.responseText);
                for (var i = 0; i < pJSON.length; i++)
                {
                	//alert("Got a JSON Row for: " + pJSON[i].SH_CODE);
                	var opt = document.createElement("option");
	            	opt.text = pJSON[i].SH_CODE;
	            	opt.value = opt.text;
	            	selm.options.add(opt);
                }
            }
        }
    });
}
// HANDLER FUNCTION FOR LOGIN BUTTON ONCLICK EVENT ACTION
//Check Responses
function view_responses()
{
	if (!g_user)
	{
		return;
	}
	// Get the Survey Code to Display
	
	// Build Survey Header Data Table
	var selm = document.getElementById("svySelect");
	var i = selm.selectedIndex;
    var pstr = "SURVEY=" + selm.options[i].value;
    
    //alert("Call rsp_display: " + pstr);
    loadXMLDoc("POST", "/cgi-bin/rsp_display.py", pstr, function()
    {
        // HTTP GET REQUEST ASYNCHRONOUS CALLBACK FUNCTION
        if (g_xmlhttp.readyState == 4 && g_xmlhttp.status == 200)
        {
            //alert("HTTPresp: " + g_xmlhttp.responseText);
            if (g_xmlhttp.responseText != "")
            {
                //dwin.document.write(g_xmlhttp.responseText);
            	//alert("RSP: " + g_xmlhttp.responseText);
            	document.getElementById("svyDisplayDiv").innerHTML = g_xmlhttp.responseText;
            }
            else
            {
                // GOT A PROCESSING ERROR
            	var hstr = "<br><h2>No Survey Response Found!</h2>";
            	hstr += "<br><em>*** DISPLAY COMPLETE ***</em>";
            	hstr += "<br><br>&nbsp&nbsp&nbsp&nbsp";
            	hstr += "<button onclick=\x22window.close()\x22>OK</button>";
            	document.getElementById("svyDisplayDiv").innerHTML = hstr;
            }
        }
    });
}
