/**
 * @file
 * Converting XML input data into valid JSON format.
 *
 * This is a recursive traveller for XML tree.
 *
 * Modified open basic open code originally by Stefan Goessner.
 */

 /**
 * Main function to convert XML -> JSON.
 *
 * @param string/object $xml
 *   containing well-formed XML tree.
 * @param string $tab
 *   containing a separator to format JSON pretty.
 * @param boolean $juststring
 *   containing a flag to ask back JSON object/string.
 *
 * @return JSON object/string
 *   representation of XML in JSON format.
 */
function xml2json(xml, tab, juststring) {
  var X = {
    toObj: function(xml) {
      var o = {};
      // Element node.
      if (xml.nodeType == 1) {
        // Element with attributes.
        if (xml.attributes.length) {
          for (var i = 0; i < xml.attributes.length; i++) {
            o["@" + xml.attributes[i].nodeName] = (xml.attributes[i].nodeValue ||
              "").toString();
          }
        }
        // Element has child nodes.
        if (xml.firstChild) {
          var textChild = 0,
            cdataChild = 0,
            hasElementChild = false;
          for (var n = xml.firstChild; n; n = n.nextSibling) {
            if (n.nodeType == 1) {
              hasElementChild = true;
            }
            // Non-whitespace text.
            else if (n.nodeType == 3 && n.nodeValue.match(
                /[^ \f\n\r\t\v]/)) {
              textChild++;
              // CDATA section node.
            }
            else if (n.nodeType == 4) {
              cdataChild++;
            }
          }
          if (hasElementChild) {
            // Structured element with evtl. a single text or/and cdata node.
            if (textChild < 2 && cdataChild < 2) {
              X.removeWhite(xml);
              for (var n = xml.firstChild; n; n = n.nextSibling) {
                // Text node.
                if (n.nodeType == 3) {
                  o["#text"] = X.escape(n.nodeValue);
                  // CDATA node.
                }
                else if (n.nodeType == 4) {
                  o["#cdata"] = X.escape(n.nodeValue);
                  // Multiple occurrence of element.
                }
                else if (o[n.nodeName]) {
                  if (o[n.nodeName] instanceof Array) {
                    o[n.nodeName][o[n.nodeName].length] = X.toObj(n);
                  }
                  else {
                    o[n.nodeName] = [o[n.nodeName], X.toObj(n)];
                  }
                }
                // First occurrence of element.
                else {
                  o[n.nodeName] = X.toObj(n);
                }
              }
            }
            else {
              // Mixed content.
              if (!xml.attributes.length) {
                o = X.escape(X.innerXml(xml));
              }
              else {
                o["#text"] = X.escape(X.innerXml(xml));
              }
            }
          }
          // Pure text.
          else if (textChild) {
            if (!xml.attributes.length) {
              o = X.escape(X.innerXml(xml));
            }
            else {
              o["#text"] = X.escape(X.innerXml(xml));
            }
          }
          // CDATA.
          else if (cdataChild) {
            if (cdataChild > 1) {
              o = X.escape(X.innerXml(xml));
            }
            else {
              for (var n = xml.firstChild; n; n = n.nextSibling) {
                o["#cdata"] = X.escape(n.nodeValue);
              }
            }
          }
        }
        if (!xml.attributes.length && !xml.firstChild) {
          o = null;
        }
        // START.
        if (o == "0") {
          o = 0;
        }
        else if (o == "true") {
          o = true;
        }
        else if (o == "false") {
          o = false;
        }
        else if (typeof(o) == 'string') {
          if (+o) {
            o = +o;
          }
        }
        // END.
      }
      // Document.node.
      else if (xml.nodeType == 9) {
        o = X.toObj(xml.documentElement);
      }
      else {
        alert("unhandled node type: " + xml.nodeType);
      }
      return o;
    },
    toJson: function(o, name, ind) {
      var inelement = false;
      var json = name ? ("\"" + name + "\"") : "";
      if (name == "element" || + name || name == "0") {
        json = "";
      }

      if (o instanceof Array) {
        // Debug: xtrace.push(typeof(o)); .
        for (var i = 0, n = o.length; i < n; i++) {
          if (typeof o[i] != "function") {
            o[i] = X.toJson(o[i], "", ind + "\t");
          }
        }
        if (name != "values") {
          json += "[" + (o.length > 1 ? ("\n" + ind + "\t" + o.join(",\n" +
            ind + "\t") + "\n" + ind) : o.join("")) + "]";
        }
        else {
          json += (o.length > 1 ? ("\n" + ind + "\t" + o.join(",\n" + ind +
            "\t") + "\n" + ind) : o.join(""));
        }
        if (name == "element") {
          outofelement = true;
        }
        // xtrace.pop();
      }
      else if (o == null) {
        json += (name && ":") + "null";
      }
      else if (typeof(o) == "object") {
        if (o.element) {
          if (name == 'values') {
            o = o.element;
          }
        }
        var noelements = true;
        var arr = [];
        for (var m in o) {
          if (typeof o[m] != "function") {
            arr[arr.length] = X.toJson(o[m], m, ind + "\t");
          }
          if (m == "element") {
            noelements = false;
          }
        }
        // Case of array object.
        if (name == "values" || name == "root") {
          json += (name ? ":[" : "[") + (arr.length > 1 ? ("\n" + ind +
            "\t" + arr.join(",\n" + ind + "\t") + "\n" + ind) : arr.join(
            "")) + "]";
        }
        else {
          if (!outofelement || noelements) {
            // Numeric index cases.
            if (+name || name == "0" || name == "element") {
              json += "{";
            }
            else {
              json += (name ? ":{" : "{");
            }
          }
          json += (arr.length > 1 ? ("\n" + ind + "\t" + arr.join(",\n" +
            ind + "\t") + "\n" + ind) : arr.join(""));
          if (!outofelement || noelements) {
            json += "}";
            outofelement = false;
          }
        }
        // xtrace.pop();
      }
      else if (typeof(o) == "string") {
        json += (name && ":") + "\"" + o.toString() + "\"";
      }
      else {
        json += (name && ":") + o.toString();
      }
      return json;
    },
    innerXml: function(node) {
      var s = ""
      if ("innerHTML" in node) {
        s = node.innerHTML;
      }
      else {
        var asXml = function(n) {
          var s = "";
          if (n.nodeType == 1) {
            s += "<" + n.nodeName;
            for (var i = 0; i < n.attributes.length; i++) {
              s += " " + n.attributes[i].nodeName + "=\"" + (n.attributes[
                i].nodeValue || "").toString() + "\"";
            }
            if (n.firstChild) {
              s += ">";
              for (var c = n.firstChild; c; c = c.nextSibling) {
                s += asXml(c);
              }
              s += "</" + n.nodeName + ">";
            }
            else {
              s += "/>";
            }
          }
          else if (n.nodeType == 3) {
            s += n.nodeValue;
          }
          else if (n.nodeType == 4) {
            s += "<![CDATA[" + n.nodeValue + "]]>";
          }
          return s;
        };
        for (var c = node.firstChild; c; c = c.nextSibling) {
          s += asXml(c);
        }
      }
      return s;
    },
    escape: function(txt) {
      return txt.replace(/[\\]/g, "\\\\")
        .replace(/[\"]/g, '\\"')
        .replace(/[\n]/g, '\\n')
        .replace(/[\r]/g, '\\r');
    },
    removeWhite: function(e) {
      e.normalize();
      for (var n = e.firstChild; n;) {
        // Text node.
        if (n.nodeType == 3) {
          // Pure whitespace text node.
          if (!n.nodeValue.match(/[^ \f\n\r\t\v]/)) {
            var nxt = n.nextSibling;
            e.removeChild(n);
            n = nxt;
          }
          else {
            n = n.nextSibling;
          }
        }
        // Element node.
        else if (n.nodeType == 1) {
          X.removeWhite(n);
          n = n.nextSibling;
        }
        // Any other node.
        else {
          n = n.nextSibling;
        }
      }
      return e;
    }
  };
  var outofelement = false;
  // Debug: var xtrace = new Array(); .
  if (typeof xml == "string") {
    xml = str2XML(xml);
  }

  // Document node.
  if (xml.nodeType == 9) {
    xml = xml.documentElement;
  }
  var json = X.toJson(X.toObj(X.removeWhite(xml)), xml.nodeName, "\t");
  var data = "{\n" + tab + (tab ? json.replace(/\t/g, tab) : json.replace(
    /\t|\n/g, "")) + "\n}";

  // Turn txt type into real JS object.
  data = jQuery.parseJSON(data);

  data = data.root;
  // Data nested in [[  ... ]] array.
  if (data[0].length) {
    data = data[0];
  }

  if (juststring) {
    return JSON.stringify(data);
  }
  else {
    return data;
  }
}

/**
 * Convert legal string of XML into object with browser.
 *
 * @param string $cells
 *   containing XML tree in string.
 *
 * @return object
 *   same XML tree in object form.
 */
function str2XML(cells) {

  if (window.DOMParser) {
    parser = new DOMParser();
    xmlDoc = parser.parseFromString(cells, "text/xml");
  }
  // Internet Explorer case.
  else {
    xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
    xmlDoc.async = false;
    xmlDoc.loadXML(cells);
  }
  return xmlDoc;
}

/**
 * Old approach (xml->json): using pattern matching rules.
 *
 * Unsupported & not used anymore.
 */
function buildXML(data) {

  // Debug: change next global & use console.
  var xmlDoc = 0;
  if (window.DOMParser) {
    parser = new DOMParser();
    xmlDoc = parser.parseFromString(data, "text/xml");
  }
  // Internet Explorer case.
  else {
    xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
    xmlDoc.async = false;
    xmlDoc.loadXML(data);
  }

  data = xml2json(xmlDoc, '  ');
  data = data.replace(/"element":/g, "");
  data = data.replace(/\{\[/g, "[");
  data = data.replace(/\]\}/g, "]");

  var forceArr = false;
  if (data.indexOf("\{\{") > 0) {
    data = data.replace(/\{\{/g, "{");
    data = data.replace(/\}\}/g, "}");
    forceArr = true;
  }
  data = jQuery.parseJSON(data);
  data = data['root'];

  if (forceArr) {
    return new Array(data);
  }
  return data;
}
