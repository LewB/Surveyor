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
                // Set the Survey Title
                hstr = "<div class=\x22TitleClass\x22>" + pJSON.HEADER[0].SH_NAME + "</div>";
                hstr += "<div class=\x22DescClass\x22>" + pJSON.HEADER[0].SH_DESC + "</div>";
                document.getElementById("svyTitle").innerHTML = hstr;
                // Set the Survey Body Questions
                var html = [];
                for (var i = 0; i < pJSON.BODY.length; i++)
                {
                    r = pJSON.BODY[i];
                    // Build the DOM HTML Code
                    switch (r.SB_TYPE)
                    {
                    case "default":
                    case "H_Radio":
                        //hstr = "<form name=\x22d" + i + "\x22>";
                        hstr = "<form class=\x22svyFormOpen\x22>";
                        hstr += "<span class=\x22srvItmTitle\x22>" + r.SB_DESC + "</span><br>";
                        hstr += "<input type=HIDDEN name=\x22SUBJECT\x22 value=\x22" + r.SB_TITLE + "\x22>";
                        hstr += "<span class=\x22srvItmLabel\x22>" + r.SB_LABEL + "</span>&nbsp";
                        var r_min;
                        var r_max;
                        (r.SB_MIN < 1) ? r_min = 1 : r_min = r.SB_MIN;
                        (r.SB_MAX > 10) ? r_max = 10 : r_max = r.SB_MAX;
                        if (r_min <= r_max ) // safety precaution - check upon data entry
                        {
                            for (var j = r.SB_MIN; j <= r.SB_MAX; j++)
                            {
                                hstr += j + "<input type=RADIO name=\x22RATING\x22 value=" + j + ">&nbsp";
                            }
                        }
                        hstr += "<button onclick=\x22post_it(this);return(false);\x22>Submit</button>";
                        hstr += "&nbsp&nbsp<output name=\x22STATUS\x22 class=\x22svyPostedTxt\x22 value=\x22Ready\x22>Ready</output>";
                        hstr += "<input type=HIDDEN name=\x22SURVEY\x22 value=\x22" + lscd + "\x22>";
                        hstr += "</form><br>";
                        html.push(hstr);
                        break;
                    default:
                    }
                }
                // Clear Code Input DOM div
                document.getElementById("svyCodeDiv").innerHTML = "";
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
function post_it(dbtn)
{
    var form = dbtn.parentNode;
    var addl = "";
    var pstr = "";
    var el_sts = form.elements["STATUS"];

    for (var i=0;i<form.elements.length;i++)
    {
        var el = form.elements[i];
        addl = "";
        if (el.name == "SUBJECT") {addl = "F";}
        if (el.name == "RATING")
        {
            el.disabled = true;
            //alert("CHK: " + el.checked + " VAL: " + el.value);
            if (el.checked) {addl = "Y";}
        }
        //alert("NAME: " + el.name);
        if (el.name == "STATUS") {el.value = "Pending";}
        if (el.name == "SURVEY") {addl = "Y";}
        if (addl)
        {
            if (addl != "F")
            {
                pstr += "&";
            }
            pstr += el.name + "=" + el.value;
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