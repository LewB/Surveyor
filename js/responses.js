/************************************************************
 * FILE NAME: responses.js
 * AUTHOR: ALB
 * USAGE: Included in responses.html
 * FUNCTIONAL DESCRIPTION:
 * This File supports responses.html
 **************************************************************
 * MODIFICATION HISTORY:
 * 05-30-2015 Created ALB
 *************************************************************
 */
//************************************************************
// GLOBAL AREA
//------------------------------------------------------------
// Constants

// Variables
var g_user;
var g_xmlhttp;
//**************************************************************
//
// *** BEGIN AJAX - HTTP REQUEST PROCESSING CODE ***
function loadXMLDoc(mode, url, pstr, cbfunc)
{
    // AJAX code for IE7+, Firefox, Chrome, Opera, Safari
    g_xmlhttp = new XMLHttpRequest();
    // IE < IE7 no go.
    g_xmlhttp.onreadystatechange = cbfunc;
    g_xmlhttp.open(mode, url, true);
    g_xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
    g_xmlhttp.send(pstr);
}
// Use Global variable g_xmlhttp for function access to HTTP response
// *** END AJAX - HTTP REQUEST PROCESSING CODE ***

// INITIALIZE DOM ELEMENTS
function initResp()
{
	document.getElementById("svyCodeBtn").addEventListener("click", function(e) {
		e.preventDefault();
		document.getElementById("svyCodeDiv").style.display = "none";
    	view_responses();
	});
	var cst = window.location.href;
	//Get user from window's url
	g_user = cst.split("?",2)[1];
	var pstr;
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
