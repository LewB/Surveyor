/************************************************************
 * FILE NAME: admin.js
 * AUTHOR: ALB
 * USAGE: Included in admin.html
 * FUNCTIONAL DESCRIPTION:
 * This File supports admin.html
 *-----------------------------------------------------------
 * MODIFICATION HISTORY:
 *  02-21-2015 Created ALB
 *************************************************************
 */
//************************************************************
// GLOBAL AREA
//------------------------------------------------------------
// Constants

// Variables
var g_xmlhttp;
var g_user = "";
var g_logkey = "";
var g_urlSearch = "";
//**************************************************************
//
//
// *** BEGIN AJAX - HTTP REQUEST PROCESSING CODE ***
//
// Uses Global Variable: var g_xmlhttp;
function loadXMLDoc(mode, url, pstr, cbfunc)
{
    // AJAX code for IE7+, Firefox, Chrome, Opera, Safari
    g_xmlhttp = new XMLHttpRequest();
    // IE < IE7 no go.
    g_xmlhttp.onreadystatechange = cbfunc;
    g_xmlhttp.open(mode, url, true);
    g_xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    if (mode == "POST")
    {
        g_xmlhttp.send(pstr);
    }
    else // It is "GET"
    {
        g_xmlhttp.send();
    }
}
//
// Use Global variable g_xmlhttp for function access to HTTP response
// *** END AJAX - HTTP REQUEST PROCESSING CODE ***
//
// parse a URL search component into DICT object
function parse_url(purl)
{
	// Parse the URL
    var qd = {};
    // "substr(1)" skips the starting "?" in the url.
    purl.substr(1).split("&").forEach(function(item)
    { (item.split("=")[0] in qd) ? qd[item.split("=")[0]].push(item.split("=")[1]) : 
            qd[item.split("=")[0]] = [item.split("=")[1],];
    });
    return(qd);
}
// Check a login status (synchronous)
function check_login(chk_lid, chk_url, resFunc)
{
    var status = false;
    var chk_user;
    var chk_key;

    if ( chk_url && chk_url != null && chk_url != "" )
    {
	    //alert("CHK_URL: " + chk_url);
	    var durl = decodeURIComponent(chk_url);
	    var urld = parse_url(durl);
	    // Decrypt ID and LOGKEY from Decoded URL string
	    var dlks = "";
	    dlks = String(urld["ID"]);
	    chk_user = crypto("D", dlks, "FoxyBuns");
	    dlks = String(urld["LK"]);
	    chk_key = crypto("D", dlks, "HoundMix");
   	}
   	else
   	{
   		if ( chk_lid && chk_lid != null && chk_lid != "" )
   		{
   			chk_user = chk_lid;
   			chk_key = null;
   		}
   		else
   		{
   			alert("Must have user or URL or Both!");
   			return;
   		}
   	}
   	//alert("CHK_USER: " + chk_user);
    // Check the Database for Matching User LOGKEYS (SYNC REQUEST)
    loadXMLDoc("POST", "/cgi-bin/rsp_loadone.py", "LOGID=" + chk_user,
    	function()
	    {
	        if (g_xmlhttp.readyState == 4 && g_xmlhttp.status == 200)
	        {
	        	// "readystate" MUST always get to this status eventually!
	        	// If it does not, the passed resFunc() will never be called,
	        	// but that's okay - the document will just never load fully.
	        	var retsts = false;
	            //alert("HTTPresp: " + g_xmlhttp.responseText);
	            if (g_xmlhttp.responseText != "")
	            {
	                
                	var pJSON = JSON.parse(g_xmlhttp.responseText);
	                if (pJSON.length)
	                {
	                    g_user = String(pJSON[0].ID);
	                    var db_key = String(pJSON[0].LOGKEY);
	                    //alert("MY LOGKEY: " + chk_key + " vs DB LOGKEY: " + db_key);
	                    if ( chk_key == null )
	                    {
	                    	g_logkey = db_key;
	                    	retsts = true;
	                    }
           				else if ( chk_key == db_key )
           				{
	                        // KEYS MATCH
	                        //alert("KEYS MATCH: " + chk_key + " vs DB LOGKEY: " + db_key);
	                        g_logkey = db_key;
	                        g_urlSearch = chk_url;
	                        retsts = true;
	                   	}
	                }
	            }
	            // Call the passed function with the processed status
	            resFunc(retsts);
	    	}
    	}, true); // THIS IS AN ASYNCHRONOUS HTTP REQUEST
	//End of LoadXMLDoc() Function Call
}
// Log Designated User Out of System
function user_logout(uid)
{
	var pstr = "LOGID=" + hexercize(uid) + "&MODE=LOGOUT";
		
	loadXMLDoc("POST", "/cgi-bin/rsp_admin.py", pstr, function()
    {
        // HTTP GET REQUEST ASYNCHRONOUS CALLBACK FUNCTION
        //alert("<STATE: " + g_xmlhttp.readyState + " STATUS: " + g_xmlhttp.status + " RESP: " + g_xmlhttp.responseText + ">");
        if (g_xmlhttp.readyState == 4 && g_xmlhttp.status == 200)
        {
            //alert("HTTPresp: " + g_xmlhttp.responseText);
            if (g_xmlhttp.responseText == "OK\n")
            {
                // Call successful response function here
                return(true);
            }
            else
            {
                // GOT A PROCESSING ERROR
                return(false);
            }
        }
    });
    return(true);
}
// Convert text string to hex
function hexercize(pwstr)
{
    var scrstr = "";
    for (var i in pwstr) {
        scrstr += "%" + pwstr[i].charCodeAt(0).toString(16);
    }
    return(scrstr);
}
// Set Status Area DOM Div Inner HTML to message
function setStatus(msg, div)
{
	if (!div)
	{
		div = "stsDiv";
	}
    document.getElementById(div).innerHTML = msg;
}
// En/De/Crypt text string
function crypto(mode, pwstr, key) {
    var dstr;
    var crypstr = "";
    
    // Build Key
    var crypkey = key;
    var klen = key.length;
    for (var i = 40; i < 127; i++)
    {
        if (i != 61)
        {
            var cpch = String.fromCharCode(i);
            if (klen)
            {
                if (key.indexOf(cpch) < 0)
                {
                    crypkey += cpch;
                }
                else
                {
                    klen--;
                }
            }
            else
            {
                crypkey += cpch;
            }
        }
    }
    // Encrypt or Decrypt String
    
    dstr = pwstr;
    crypstr = "";
    //alert("DSTR: " + dstr + " LEN: " + dstr.length);
    for (var i = 0; i < dstr.length; i++)
    {
        cpch = "";
        if ( mode == "E") // Encrypt
        {
            cpch = crypkey.charAt(dstr.charCodeAt(i)-40);
        }
        else if (mode == "D") // Decrypt
        {
            //var x = dstr.charAt(i);
            //var y = crypkey.indexOf(x) + 40;
            //alert("X: " + x + " Y: " + y);
            cpch = String.fromCharCode( (crypkey.indexOf( dstr.charAt(i) ) + 40) );
            //alert("CPCH: " + cpch);
        }
        crypstr += cpch;
        //alert("STR: " + crypstr);
    }
    
    return(crypstr);
}