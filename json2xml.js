/**
 * @file
 * Converting JSON input data into valid XML format.
 *
 * Modified open basic code by Stefan Goessner.
 */

/**
 * Main function to convert JSON obj/string -> XML obj/string.
 *
 * @param string/object $data
 *   containing JSON data for a chart.
 * @param string $tab
 *   containing a letter of separator for output string.
 * @param boolean $juststring
 *   containing a flag to ask output in string format.
 *
 * @return object/string
 *   suitable XML for a chart.
 */
function json22xml(data, tab, juststring) {
  // Create tree of xml with its valid root.
  var cells = '';
  if (!data.length) {
    cells = cells + '<element>\n' + json2xml(data, tab) + '\n</element>';
  }
  else {
    for (i = 0; i < data.length; i++) {
      cells = cells + '<element>\n' + json2xml(data[i], tab) + '\n</element>';
    }
  }
  cells = '<root>\n' + cells + '\n</root>';

  if (juststring) {
    return cells;
  }

  // Major set of browser.
  if (window.DOMParser) {
    parser = new DOMParser();
    xmlDoc = parser.parseFromString(cells, "text/xml");
  }
  else {
    // Internet Explorer case.
    xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
    xmlDoc.async = false;
    xmlDoc.loadXML(cells);
  }
  return xmlDoc;
}

/**
 * Travelling through nested JSON object recursively.
 *
 * @param object $o
 *   containing .
 * @param string $tab
 *   containing a letter of separator for output string.
 *
 * @return string
 *   XML tree for a chart .
 */
function json2xml(o, tab) {
  var toXml = function(v, name, ind) {
    recdepth++;

    var xml = "";
    if (v instanceof Array) {
      // Inside 1st array recursion - remember it.
      if (!inarray) {
        arraylevel = recdepth;
      }
      inarray = true;
      // Debug: xstack.push(new Array("##A##",v)); .
      for (var i = 0, n = v.length; i < n; i++) {
        xml += ind + toXml(v[i], name, ind + "\t") + "\n";
      }
      // Standard notation for array elements.
      if (name == "values" && inarray) {
        if (recdepth > arraylevel) {
          // Down under top.
          xml = "\n<element>\n" + xml + "\n</element>";
        }
        else {
          // Top level cell.
          xml = "\n<values>\n" + xml + "\n</values>";
        }
      }
      else {
        // Other type cells.
        xml = "\n<" + name + ">\n" + xml + "\n</" + name + ">";
      }

      // Out of array's all recursions here.
      if (arraylevel == recdepth) {
        inarray = false;
      }
    }
    else if (typeof(v) == "object") {
      // Debug: xstack.push(new Array("##O##",v)); .
      if (name == "values") {
        xml = toXml(v, "element", "\t");
      }
      else {
        var hasChild = false;
        xml += ind + "<" + name;
        for (var m in v) {
          if (m.charAt(0) == "@") {
            xml += " " + m.substr(1) + "=\"" + v[m].toString() + "\"";
          }
          else {
            hasChild = true;
          }
        }
        xml += hasChild ? ">" : "/>";
        if (hasChild) {
          for (var m in v) {
            if (m == "#text") {
              xml += v[m];
            }
            else if (m == "#cdata") {
              xml += "<![CDATA[" + v[m] + "]]>";
            }
            else if (m.charAt(0) != "@") {
              xml += toXml(v[m], m, ind + "\t");
            }
          }
          xml += (xml.charAt(xml.length - 1) == "\n" ? ind : "") + "\t</" +
              name + ">";
        }
      }
    }
    else {
      // Debug: xstack.push(new Array("##X##",v)); .
      if (inarray && name == "values") {
        xml = ind + "<element>" + v.toString() + "</element>";
      }
      else {
        xml += ind + "<" + name + ">" + v.toString() + "</" + name + ">";
      }
    }
    recdepth--;
    return xml;
  },
  xml = "";
  var inarray = false;
  var recdepth = 0;
  var arraylevel = 0;
  // Debug: var xstack = new Array(); .
  for (var m in o) {
    xml += toXml(o[m], m, "");
  }
  // Debug: console.info(xstack); .
  return tab ? xml.replace(/\t/g, tab) : xml.replace(/\t|\n/g, "");
}
