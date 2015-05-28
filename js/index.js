/************************************************************
 * FILE NAME: index.js
 * AUTHOR: ALB
 * USAGE: Included in index.html
 * FUNCTIONAL DESCRIPTION:
 * This File supports index.html
 **************************************************************
 * MODIFICATION HISTORY:
 * 02-26-2015 Created ALB
 *************************************************************
 */
//************************************************************
// GLOBAL AREA
//------------------------------------------------------------
// Constants

// Variables
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
function initSurvey()
{
	document.getElementById("svyCodeBtn").addEventListener("click", function(){
    	load_survey();
	});
}
// HANDLER FUNCTION FOR LOGIN BUTTON ONCLICK EVENT ACTION
function load_survey()
{
    var lscd;
    // Get DOM element values for load survey operation
    lscd = document.getElementById("svyCodeInp").value;
    if (!lscd || lscd == "")
    {
        alert("ERROR: Must Specify A Valid Survey Code");
        document.getElementById("svyCodeInp").focus();
        return;
    }
    // Call asynchronous HTTP POST request to cgi program with DOM values and callback function
    var pstr = "SURVEY=" + lscd + "&SVPART=BOTH";
    loadXMLDoc("POST", "cgi-bin/rsp_loadsurvey.py", pstr, function()
    {
        // HTTP REQUEST CALLBACK FUNCTION
        if (g_xmlhttp.readyState == 4 && g_xmlhttp.status == 200)
        {
            //alert("RESP: " + g_xmlhttp.responseText);
            if (g_xmlhttp.responseText && g_xmlhttp.responseText != "")
            {
                // Request returns 2 Arrays of JSON Data Objects
                var pJSON = JSON.parse(g_xmlhttp.responseText);
                var hstr = "";
                // Set the Survey Title
                hstr = "<div class=\x22TitleClass\x22>" + pJSON.HEADER[0].SH_NAME + "</div>";
                hstr += "<br><div class=\x22DescClass\x22>" + pJSON.HEADER[0].SH_DESC + "</div><br>";
                document.getElementById("svyTitleDiv").innerHTML = hstr;
                // Set the Survey Body Questions
                var html = [];
                for (var i = 0; i < pJSON.BODY.length; i++)
                {
                    r = pJSON.BODY[i];
                    // Build the DOM HTML Code
                    hstr = "<form class=\x22svyFormOpen\x22>";
                    if (r.SB_DESC && r.SB_DESC != "None")
                    {
                    	hstr += "<span class=\x22svyItmTitle\x22>" + r.SB_DESC + "</span><br>";
                    }
                    hstr += "<input type=HIDDEN name=\x22SUBJECT\x22 value=\x22" + r.SB_TITLE + "\x22>";
                    //hstr += "<span class=\x22svyItmLabel\x22>" + r.SB_LABEL + "</span>";
                    switch (r.SB_TYPE)
                    {
                    case "Range": // Should Create a Horizontal 'Slider'
                    	hstr += "<fieldset class=\x22fs-RNG\x22><legend>" + r.SB_LABEL + "</legend>";
                        //hstr += "&nbsp";
                        var r_min;
                        var r_max;
                        var r_val;
                        (r.SB_MIN < 1) ? r_min = 1 : r_min = r.SB_MIN;
                        (r.SB_MAX > 10) ? r_max = 10 : r_max = r.SB_MAX;
                        if (r_min <= r_max ) // safety precaution - check upon data entry
                        {
                        	r_val = Math.round(r_min + ((r_max - r_min) / 2));
                            hstr += "&nbsp" + r_min + "&nbsp";
                            hstr += "<input type=RANGE id=\x22srng\x22 name=\x22RANGE\x22 min=\x22" + r_min + "\x22 max=\x22" + r_max + "\x22 ";
                            hstr += "value=" + r_val + " oninput=\x22rval.value=srng.value\x22 >";
                            hstr += "&nbsp" + r_max + "&nbsp";
                        }
                        hstr += "<br>[&nbsp<output id=\x22rval\x22>" + r_val + "</output>&nbsp]";
                        hstr += "</fieldset>";
                        hstr += "&nbsp&nbsp<button onclick=\x22post_it(this);return(false);\x22>Submit</button>";
                        hstr += "&nbsp&nbsp<output name=\x22STATUS\x22 class=\x22svyPostedTxt\x22 value=\x22Ready\x22>Ready</output>";
                        hstr += "<input type=HIDDEN name=\x22SURVEY\x22 value=\x22" + lscd + "\x22>";
                        hstr += "</form><br>";
                        html.push(hstr);
                        break;
                    case "V_Radio":
                    	hstr += "<br>";
                    	hstr += "<fieldset class=\x22fs-VRB\x22><legend>" + r.SB_LABEL + "</legend>";
                        var r_min;
                        var r_max;
                        (r.SB_MIN < 1) ? r_min = 1 : r_min = r.SB_MIN;
                        (r.SB_MAX > 10) ? r_max = 10 : r_max = r.SB_MAX;
                        if (r_min <= r_max ) // safety precaution - check upon data entry
                        {
                            for (var j = r.SB_MIN; j <= r.SB_MAX; j++)
                            {
                                if (j < 10 )
                               	{
                               		hstr += "&nbsp&nbsp";
                               	}
                                hstr += j + "&nbsp<input type=RADIO name=\x22RATING\x22 value=" + j + "><br>";
                            }
                        }
                        hstr += "</fieldset>";
                        hstr += "<br><br><button onclick=\x22post_it(this);return(false);\x22>Submit</button>";
                        hstr += "<br><br><output name=\x22STATUS\x22 class=\x22svyPostedTxt\x22 value=\x22Ready\x22>Ready</output>";
                        hstr += "<input type=HIDDEN name=\x22SURVEY\x22 value=\x22" + lscd + "\x22>";
                        hstr += "</form><br><br>";
                        html.push(hstr);
                    	break;
                    default: // case "H_Radio":"
                        hstr += "&nbsp";
                    	hstr += "<fieldset class=\x22fs-HRB\x22><legend>" + r.SB_LABEL + "</legend>";
                        var r_min;
                        var r_max;
                        (r.SB_MIN < 1) ? r_min = 1 : r_min = r.SB_MIN;
                        (r.SB_MAX > 10) ? r_max = 10 : r_max = r.SB_MAX;
                        if (r_min <= r_max ) // safety precaution - check upon data entry
                        {
                            for (var j = r.SB_MIN; j <= r.SB_MAX; j++)
                            {
                                hstr += j + "&nbsp<input type=RADIO name=\x22RATING\x22 value=" + j + ">&nbsp";
                            }
                        }
                        hstr += "</fieldset>";
                        hstr += "&nbsp&nbsp<button onclick=\x22post_it(this);return(false);\x22>Submit</button>";
                        hstr += "&nbsp&nbsp<output name=\x22STATUS\x22 class=\x22svyPostedTxt\x22 value=\x22Ready\x22>Ready</output>";
                        hstr += "<input type=HIDDEN name=\x22SURVEY\x22 value=\x22" + lscd + "\x22>";
                        hstr += "</form><br>";
                        html.push(hstr);
                    }
                }
                // Clear Code Input DOM div
                document.getElementById("svyCodeDiv").style.display = "none";
                // Insert Survey Body div HTML
                //alert("HTML: " + html.join("\n"));
                document.getElementById("svyBodyDiv").innerHTML = html.join("\n");
            }
            else
            {
                //alert("ERR-RESP: " + g_xmlhttp.responseText)
                alert("ERROR Loading Survey Data.");
            }
        }
    });
}
// SURVEY POST BUTTON EVENT HANDLER
function post_it(dbtn)
{
    var form = dbtn.parentNode;
    var addl = "";
    var pname = "";
    var pstr = "";
    var el_sts = form.elements["STATUS"];

    for (var i=0;i<form.elements.length;i++)
    {
        var el = form.elements[i];
        addl = "";
        pname = el.name;
        //alert("NAME: " + el.name);
        switch (el.name)
        {
        	case "SUBJECT":
        		 addl = "F";
        		 break;
        	case "RATING":
            	el.disabled = true;
            	//alert("CHK: " + el.checked + " VAL: " + el.value);
            	if (el.checked)
            	{
            		addl = "Y";
            	}
            	break;
        	case "RANGE":
        	 	pname = "RATING";
        	 	addl = "Y";
        	 	break;
        	case "STATUS":
        		el.value = "Pending";
        		break;
        	case "SURVEY":
        		addl = "Y";
        		break;
        	default:
        		break;
        }
        if (addl)
        {
            if (addl != "F")
            {
                pstr += "&";
            }
            pstr += pname + "=" + el.value;
        }
    }
    dbtn.disabled = true;
    //alert("FORM DATA:\n" + pstr);
    // Call asynchronous HTTP POST request to cgi program with DOM values and callback function
    loadXMLDoc("POST", "cgi-bin/rsp_post.py", pstr, function()
    {
        // HTTP REQUEST CALLBACK FUNCTION
        if (g_xmlhttp.readyState == 4 && g_xmlhttp.status == 200)
        {
            //alert("RESP: <" + g_xmlhttp.responseText + ">");
            if (g_xmlhttp.responseText && g_xmlhttp.responseText != "")
            {
                // Request returns POST Status Message
                if (g_xmlhttp.responseText.split(":")[0] == "OK\n")
                {
                    el_sts.value = "Posted";
                    form.className = "svyFormPosted";
                }
                else
                {
                    alert("Error Posting Response:\n\n" + g_xmlhttp.responseText.split(":")[1]  + ".");
                }
            }
        }
    });
    return(false);
}