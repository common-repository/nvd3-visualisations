/**
 * @file
 * Main JavaScript software API for NVD3 Visualisations.
 */
 
charts = new Array();
bootup = 1;

if (typeof cms == 'undefined') {
  cms = 'wordpress';
}

/**
 * Drawing new chart from JavaScript.
 *
 * Main API interface that is visible to the users & PHP script.
 *
 * @param string/integer $id
 *   containing unique id nro of chart into its htlm container.
 * @param string $infile
 *   containing data's input file / data's JSON object / "mysql".
 * @param string $type
 *   containing type of chart.
 * @param object $dims
 *   containing height & width of output chart in pixels.
 * @param object $options
 *   containing all switches to adjust char's behavior & look, and
 *   possible direct input data for chart.
 */
function jsChart(id, infile, type, dims, options) {

  if (!options && typeof chartData == 'object') {
    options = chartData[id];
	infile = options.dataSet;
  }

  if (bootup) {
    bootup = 0;
    checkJQ();
	checkLogin();
  }

  // All localisation settings active (look: locale.js).
  if (options.locale) {
    myLocale(options.locale);
  }
  else {
    myLocale(detectBrowser(false));
  }

  // Default size of chart: VGA screen.
  var height = '480';
  var width = ' width:640';
  if (typeof options != 'undefined') {
    if (options.height && options.width) {
      height = options.height;
      width = ' width:' + options.width;
    }
    else if (dims) {
      height = dims['height'];
      width = ' width:' + dims['width'];
    }
  }

  if (!options) {
    options = new Object();
  }

  var svg = "<svg id='svg" + id + "' style='height:" + height + "px; " +
    width + "px; '/>";
  jQuery('#chart' + id).empty();

  if (typeof options.noPopup) {
    if (options.noPopup == 0) {
      if (!options.title) {
        options.title = 'My (' + type + ') chart';
      }

      if (!options.height && !options.width) {
        options.height = +dims['height'];
        options.width = +dims['width'];
      }

      var popup = '';
      if (!options.inPopup) {
        popup = '<img src="' + rootpath +
          '../icons/newindow.png" style="float:left"><br />';
      }
      var inopts = '<script>opts = new Object(' + JSON.stringify(options) +
        '); </script>';
      var strid = "'" + id + "' ";
      popup = inopts + '<a onclick="svg2Win(' + strid +
        ', opts)" style="cursor:pointer" >' + popup + '</a>';
      jQuery('#chart' + id).append(popup);
    }
  }
  // Container of chart printed out here.
  jQuery('#chart' + id).append(svg);
  jQuery('#chart' + id).append(sliderContainer(id, options));

  type = type.toLowerCase();
  dataRead(infile, id, type, options);

  return;

  function sliderContainer(id, options) {
    var margins = ' margin:1px 5px 20px 20px; ';
    var ss = ' style="width:' + options.width + 'px; ' + margins + '"  ';
    var fromP = 'fromID' + id; var toP = 'toID' + id;
    var labelSlider = '<div ' + ss + '>' + fromTo(fromP, '') +
                     '<div id="labelSlider' + id + '"></div>' +
                     fromTo(toP, 'float:right') + '</div>';
    return labelSlider;

    // Print slider's end points of values (containers).
    function fromTo(id, s) {
      return '<b id="' + id + '" style="color:gray; ' + s + '"></b>';
    }
  }

  function checkJQ() {
    if ('undefined' == typeof window.jQuery) {
      window.alert(
        'Please, load jQuery to use NVD3 visualisations properly.');
      return 0;
    }
    else {
      console.info('jQuery: ok %');
      if (jQuery.ui) {
        console.info('jQuery UI: ok %');
        return 1;
      }
      console.warn('Please, load jQuery UI to use NVD3 visualisations properly.');
      return 0;
    }
  }

  // Data reader from different sources: 
  // demos / own file / direct input options / JSON / MySQL.
  function dataRead(infile, id, type, options) {
	// Make this global.
    ginfile = infile;
    if (typeof chartData == 'undefined') {
      chartData = [];
    }
    if (infile == '') {
      demoShows(id, '', type, options);
    }
    else if (infile.indexOf(".json") > 0) {
      d3.json(infile, function(error, data) {
        // Debug: printLines(data); .
        chartSelector(id, data, type, options);
        options = recChart('json', infile, options, id);
        initLabelSlider(id, data, type, options);
      });
    }
    else if (infile.indexOf('.xml') > 0) {
      // Note: d3.xml() had its own parsing problems.
      d3.text(infile, function(error, data) {
        data = xml2json(data, ' ');
        chartSelector(id, data, type, options);
        options = recChart('xml', infile, options, id);
        initLabelSlider(id, data, type, options);
      });
    }
    else if (infile.indexOf(".tsv") > 0) {
      d3.tsv(infile, function(error, data) {
        data = parseJSON(data, type);
        chartSelector(id, data, type, options);
        options = recChart('tsv', infile, options, id);
        initLabelSlider(id, data, type, options);
      });
    }
    else if (infile.indexOf('.csv') > 0) {
      d3.csv(infile, function(error, data) {
        data = parseJSON(data, type);
        chartSelector(id, data, type, options);
        options = recChart('csv', infile, options, id);
        initLabelSlider(id, data, type, options);
      });
    }
    else if (infile == 'mysql') {
      if (options.mysql) {
        var host = encodeURIComponent(options.mysql.host);
        var db = encodeURIComponent(options.mysql.db);
        var table = encodeURIComponent(options.mysql.table);
        var user = '';
        if (options.mysql.user) {
          user = '&user=' + encodeURIComponent(options.mysql.user);
        }
        var pwd = '';
        if (options.mysql.pwd) {
          pwd = '&pwd=' + encodeURIComponent(options.mysql.pwd);
        }
        // @todo: getting last rows of MySQL by request.
        var lastrows = '';
        if (options.mysql.rows) {
          lastrows = '&rows=' + options.mysql.rows;
        }
        var query = rootpath + '../getsql.php?table=' + table + '&host=' +
          host + '&db=' + db + lastrows + user + pwd;
        jQuery.getJSON(query, function(data) {
          readTSV(id, rootpath + data, type, options);
        });
      }
    }
    else if (options.values && !options.tsv) {
      // Direct input of data.
      var titles = ['Labels', 'DataSet1', 'DataSet2', 'DataSet3'];
      // Name of data's columns given.
      if (options.series) {
        if (!options.inPopup && options.series != 'Labels') {
          var arr = ['Labels'];
          titles = arr.concat(options.series);
          options.series = titles;
        }
      }
      var out = new Array();
      for (i = 0; i < options.values.length; i++) {
        var o = new Object();
        if (options.labels) {
          o[titles[0]] = options.labels[i];
        }
        else {
          o[titles[0]] = i + 1;
        }
        o[titles[1]] = options.values[i];
        out.push(o);
      }
      var data = parseJSON(out, type);
	  initLabelSlider(id, data, type, options);
      chartSelector(id, data, type, options);

      options.datatype = 'direct';
      options.infile = 'foo';
      // Record data & options into DOM.
      if (!options.inPopup) {
        if (typeof chartData == 'undefined') {
          chartData = [];
        }
        chartData[id] = new Object(options);
      }
    }
    // ID of table exists as an input.
    else if (options.table) {
      // Parsing OpenOffice table as automagically as possible.
      var idtable = options.table;
      if (typeof options.inPopup == 'undefined' || !options.inPopup) {
        var colors = colColors(idtable);
        if (typeof options.autocoloring == "undefined") {
          // Case: table guides chart coloring.
          options.colors = colors;
        }
        else {
          if (options.autocoloring == 'table') {
            // Case: chart controls table's coloring.
            options.autocoloring = colors;
          }
          else if (options.autocoloring == 'chart' || options.autocoloring ==
            true) {
            options.colors = colors;
          }
        }
      }
      if (!options.tsv) {
        var dataset2 = d3.selectAll('#' + idtable + ' tr').selectAll('td');
        var tsv = "key\t";
        for (row = 0; row < dataset2.length; row++) {
          for (cols = 0; cols < dataset2[row].length; cols++) {
            if (dataset2[row][cols].innerText) {
              var acell = dataset2[row][cols].innerText;
              tsv = tsv + acell;
              if (cols != dataset2[row].length - 1) {
                tsv = tsv + "\t";
              }
            }
          }
          tsv = tsv + "\n";
        }
        options.tsv = tsv;
      }
      var out = d3.tsv.parse(options.tsv);
      var datax = parseJSON(out, type);
	  initLabelSlider(id, data, type, options);
      chartSelector(id, datax, type, options);

      recordDOM(options);
    }
    // Data set is embedded into document all over its HTML tags / table.
    else if (options.class) {
      // Wait until DOM + all HTML is ready for its input read.
      jQuery(document).ready(function() {
        var data = parseJSON(cells2set(options), type);
        chartSelector(id, data, type, options);
        /*
        options.series = series;
        options.labels = labels;
        options.values = datapoints;

        Note, @todo: extract data sets above for popup win.
         */
        recordDOM(options);
        initLabelSlider(id, data, type, options);
      });
    }
    // Pure raw data set by JSON variable (= formats on examples/ folder & its JSONs).
    else if (typeof infile == 'object') {
      chartSelector(id, infile, type, options);
      initLabelSlider(id, infile, type, options);
    }

    function recChart(filetype, infile, options, id) {
        options.datatype = filetype;
        options.infile = infile;
        // Record data & options into global DOM.
        if ((options.exports || options.chartpicker) && !options.inPopup) {
          if (typeof chartData == 'undefined') {
            chartData = [];
          }
          chartData[id] = new Object(options);
        }
        return options;
    }

    function readTSV(id, infile, type, options) {
      d3.tsv(infile, function(error, data) {
        var data = parseJSON(data, type);
        chartSelector(id, data, type, options);
        options.datatype = 'tsv';
        options.infile = infile;
        // Record data & options into DOM.
        if ((options.exports || options.chartpicker) && !options.inPopup) {
          if (typeof chartData == 'undefined') {
            chartData = [];
          }
          chartData[id] = new Object(options);
        }
      });
    }

    function colColors(id) {
      var cells = d3.selectAll('#' + id).selectAll('tbody tr').selectAll(
        'td');
      if (cells.length > 1) {
        // Pick 2nd line of data table.
        cells = cells[1];
      }
      else {
        cells = cells[0];
      }

      var bgcolors = new Array();
      for (col = 1; col < cells.length; col++) {
        bgcolors.push(cells[col]['attributes']['bgcolor']['value']);
      }

      return bgcolors.join();
    }

    function recordDOM(options) {
      options.datatype = 'direct';
      options.infile = 'foo';
      // Record data & options into DOM.
      if ((options.exports || options.chartpicker) && !options.inPopup) {
        if (typeof chartData == 'undefined') {
          chartData = [];
        }
        chartData[id] = new Object(options);
      }
    }

    function cells2set(options) {

      var set = new Array();
      var labels = new Array();
      var series = new Array();
      if (typeof options.class == 'string') {
        set.push(d3.selectAll('.' + options.class));
      }
      else if (typeof options.class == 'object') {
        if (options.class.id && options.class.bgcolor && typeof options.class
          .bgcolor == 'string') {
          var bgcolor = options.class.bgcolor;
        }
        if (options.class.coloring) {
          options.colors = options.class.bgcolor;
        }
        if (bgcolor.indexOf(",") == -1) {
          set.push(d3.selectAll('#' + options.class.id + ' [bgcolor="' +
            bgcolor + '"]'));
        }
        // Multi series data case.
        else {
          var stack = bgcolor.split(",");
          for (i = 0; i < stack.length; i++) {
            set.push(d3.selectAll('#' + options.class.id + ' [bgcolor="' +
              stack[i] + '"]'));
          }
        }
        if (options.class.id && options.class.titlecolor) {
          var stack = d3.selectAll('#' + options.class.id + ' [bgcolor="' +
            options.class.titlecolor + '"]');
          // Bg.colored labels from stack.
          for (c = 0; c < stack[0].length; c++) {
            labels.push(jQuery(stack[0][c]).text());
          }
          var setlength = set[0][0].length * set.length;
          // Less labels than data points.
          if (setlength > labels.length) {
            var repeat = 0;
            var inf = 100000;
            while (labels.length < setlength && labels.length < inf) {
              labels.push(labels[repeat]);
              repeat++;
            }
          }
        }
        if (options.class.id && options.class.seriescolor) {
          var stack = d3.selectAll('#' + options.class.id + ' [bgcolor="' +
            options.class.seriescolor + '"]');
          // Bg.colored labels from stack.
          for (c = 0; c < stack[0].length; c++) {
            series.push(jQuery(stack[0][c]).text());
          }
        }
      }
      return set2values(set, labels, series, options);
    }

    function set2values(aset, labels, series, options) {
      var label_c = 1;
      var values = new Array();
      /*
      var cname = options.class;
      @todo: a loop to get multidim sets, set by set.
       */
      var backtrack = new Array();
      for (s = 0; s < aset.length; s++) {
        var set = aset[s];

        var all_labels = new Array();
        if (set[0]) {
          for (d = 0; d < set[0].length; d++) {
            if (set[0][d]['innerText']) {
              var stitles = 'Data ' + (s + 1);
              if (series.length) {
                stitles = series[s];
              }
              var nro = set[0][d]['innerText'].replace(/[^0-9^.^,^-]+/g,
                "");
              // This value must be number && its arr index too.
              if (+nro) {
                if (set[0][d]['attributes']) {
                  // Labels from each cell's ID.
                  if (set[0][d]['attributes']['id']) {
                    var alabel = set[0][d]['attributes']['id']['value'];
                    var rec = {
                      'Labels': alabel
                    };
                    rec[stitles] = +nro;
                    // Labels autonumbered or from 1 row/column of table.
                  }
                  else {
                    var alabel = label_c;
                    if (labels[label_c - 1]) {
                      alabel = labels[label_c - 1];
                    }
                    var rec = {
                      'Labels': alabel
                    };
                    rec[stitles] = +nro;
                  }
                  if (!backtrack[alabel] && backtrack[alabel] != 0) {
                    backtrack[alabel] = values.length;
                    values.push(rec);
                  }
                  else {
                    values[backtrack[alabel]][stitles] = +nro;
                  }
                  label_c++;
                }
              }
            }
          }
        }
      }
      return values;
    }
    // Func: dataRead.
  }
  // Func: jsChart.
}

/**
 * Cloning SVG elements of chart into its popup window.
 *
 * @param integer $svgid
 *   containing unique id nro of svg element of chart.
 * @param object $options
 *   containing all switches to modify cloned chart's look.
 */
function svg2Win(svgid, options) {
  if (typeof chartData != 'undefined') {
    if (chartData[svgid]) {
      if (chartData[svgid]['exports'] || chartData[svgid]['chartpicker']) {
        options = chartData[svgid];
      }
    }
  }
  var id = 'dialWin' + Math.floor(Math.random() * 1000) + 1;
  var svgidNew = Math.floor(Math.random() * 1000) + 1;
  // Clone options + data for popup.
  chartData[svgidNew] = chartData[svgid];

  var ss = ' style="vertical-align:top" ';
  html = getZooms(id, options, svgidNew);
  html = html + '<table class="svgtable"><tr ' + ss + '><td>';

  var cid = "'chart" + svgidNew + "'";
  var sid = "'svg" + svgidNew + "'";

  var svgstyle = jQuery("#svg" + svgid).attr("style");
  // Old: height="100%" width="100%".
  var resize = ' resize:both; overflow:auto; ';
  resize = ' ';
  if (typeof options.noResize != 'undefined') {
    if (options.noResize) {
      resize = '';
    }
  }
  html = html + '</td></tr><tr ' + ss + '><td class="svgchart" ><div id="chart' + svgidNew +
    '" style="' + svgstyle + resize +
    ' " onmouseup="document.getElementById(' + sid +
    ').style.height = document.getElementById(' + cid +
    ').style.height; document.getElementById(' + sid +
    ').style.width = document.getElementById(' + cid + ').style.width;">';
  html = html + cloneSvgData2(svgid, options) + '</div>';
  // Lets print all buttons into new page.
  var pickers = chartPickers(svgidNew, options);
  html = html + '</td>' + pickers + '</tr><tr><td>' + exportButts(svgid, options) +
    '</td><tr><tr><td id="databuffer" style="color:gray"></td></tr></table>';

  printOnWin(html, options, id);

  /* ToDo: make this happen.
  chartData[svgidNew] = {};
  chartData[svgidNew].dataSet = options.dataSet;
  if (!options.dataSet) {
    var buffID = svgid + svgid;
    chartData[svgidNew].dataSet = chartData[buffID].dataSet;
  }
  jsChart(svgidNew, options.dataSet, options.type, '', options);
  */
  return;

function exportButts(svgid, options) {
  // Popup's print button.
  var ss = ' style="float:right; cursor:pointer;" ';
  var printB = 
    '<button ' + ss + ' onClick="window.print()" title="Print This Chart on Paper">' +
    makeIco('print.gif') + '</button> ';
  // Export buttons for SVG & Excel formats.
  var expB = '';
  var svgB = '';
  if (options.exports) {
    var expID = "'svg" + svgid + "'";
    expB =
      '<button ' + ss + ' onClick="exportData(' +
      expID + ',\'csv\')" ' + 
      ' title="Export Data into Excel or Other Spreadsheets Software">' +
      makeIco('excel.png') + '</button> ';
    svgB =
      '<button ' + ss + ' onClick="exportData(' +
      expID + ',\'svg\')" ' + 
      ' title="Export Chart into Illustrator or SVG Editor Software">' +
      makeIco('svgedit.png') + '</button> ';
	  return printB + expB + svgB;
  }
  return '';

  function makeIco(pict) {
    return '<img src="' + rootpath + '../icons/' + pict + '">';
  }
}

function chartPickers(svgidNew, options) {
  // Charts picker's buttons generation.
  var pickers = '';
  if (options.chartpicker || options.chartpicker == 1) {
    // All legal chart types (@todo: horizontalmultibar, scatterbubble, add).
    var types = {
      'lineplusbar': 1,
      'simpleline': 1,
      'cumulativeline': 1,
      'stackedarea': 1,
      'discretebar': 1,
      'horizontalmultibar': 1,
      'pie': 1,
      'donut': 1,
      'bullet': 1,
      'scatterbubble': 1,
      'multibar': 1,
      'viewfinder': 1
    };
    // Supported types for Excel based table formats: CSV/TSV.
    var typesTSV = {
      'simpleline': 1,
      'cumulativeline': 1,
      'stackedarea': 1,
      'discretebar': 1,
      'pie': 1,
      'donut': 1,
      'multibar': 1,
      'viewfinder': 1
    };
    options.inPopup = true;
    // CSV/TSV formats support max 8 different types of chart.
    if (options.datatype == 'tsv' || options.datatype == 'csv') {
      for (t in typesTSV) {
        pickers = pickers + popButt(t, svgidNew, options, types);
      }
    }
    // Other data sets: add max 6 possible chart buttons into popup window.
    else {
      pickers = popButt('pie', svgidNew, options, types) + popButt(
          'donut', svgidNew, options, types) + popButt('discretebar', svgidNew,
          options, types) + popButt('multibar', svgidNew, options, types) +
        popButt('simpleline', svgidNew, options, types) + popButt('viewfinder',
          svgidNew, options, types);
    }
    return '<td>' + pickers + '</td>';
  }
  return '';
}
  
// Clone chart's svg into popup window & its existing styles.
function cloneSvgData2(svgid, options) {
  var viewbox = ' viewBox="0 0 ' + options.width + ' ' + options.height + '" ';
  var svg = '<svg id="svg' + svgid + '" ' + viewbox + ' >' +
              jQuery('#svg' + svgid).html() + '</svg>';
  return svg;
}

// Clone chart's data set into JS variable on popup window.
function cloneSvgData(id) {
  if (typeof chartData == 'object') {
    if (chartData[id]) {
      if (chartData[id]['exports'] || options.chartpicker) {
        var html = '<script>chartData = ' + JSON.stringify(chartData[id]) +
          '; chartData.inPopup=true; rootpath="' + rootpath +
          '"; function getChartData() { return chartData; } </script>';
		return html;
      }
    }
  }
  return '';
}

function getZooms(id, options, chartID) {
    // Popup windows's 2 zoom buttons.
	var zoomBigJS = 'jQuery(\'#' + id + '\').dialog(\'option\', \'height\', dialMinMax(\'' +
	                id + '\', \'maxHeight\'));' + reSizeJS(id, chartID, 1) +
                    'jQuery(\'#' + id + '\').dialog(\'option\', \'width\', dialMinMax(\'' +
					id + '\', \'maxWidth\'));';
	var zoomBackJS = 'jQuery(\'#' + id + '\').dialog(\'option\', \'height\', dialMinMax(\'' +
	                id + '\', \'minHeight\'));' + reSizeJS(id, chartID, 0) +
                    'jQuery(\'#' + id + '\').dialog(\'option\', \'width\', dialMinMax(\'' +
					id + '\', \'minWidth\'));';
    var zoomButt = '<span style="float:right"><button title="Full Screen Chart" onclick="' +
                   zoomBigJS + '"><img src="' + rootpath +
                  '../icons/zoooomin.gif"></button><button title="Original Sized Chart" onclick="' +
				  zoomBackJS + '"><img src="' + rootpath + '../icons/zoooomout.gif"></button></span><br />';
  return zoomButt;
  // Generator of reSize calls.
  function reSizeJS(dialID, chartID, getMax) {
    return ' chartReSize(\'' + dialID + '\', \'' + chartID + '\', ' + getMax + '); ';
  }
}

// Create popup's new container for a chart.
function printOnWin(html, options, id) {
      var optsOfWin = {
        autoOpen: true,
        width: options.width + 100,
        height: options.height + 250,
        minHeight: options.height + 250,
        minWidth: options.width + 100,
        maxHeight: window.screen.availHeight - 140,
        maxWidth: window.screen.availWidth - 200,
        show: {
          effect: "blind",
          duration: 1000
        },
        hide: {
          effect: "explode",
          duration: 2000
        },
        modal: true,
        buttons: {
          Ok: function() {
            jQuery(this).dialog("close");
            jQuery("#" + id).empty();
          }
        }
      };
	  var container = '<div id="' + id + '" title="' + options.title + '"> ' + html + '</div>';
	  jQuery("body").append(container);
      jQuery(function() {
        jQuery("#" + id).dialog(optsOfWin);
      });
	  return id;
}
}

function dialMinMax(id, optName) {
  return jQuery('#' + id).dialog("option", optName);
}

function chartReSize(id, chartID, getMax) {
  var delta = 160;
  var h =jQuery('#' + id).dialog("option", "maxHeight");
  var w = jQuery('#' + id).dialog("option", "maxWidth");
  var cd = chartData[chartID];
  if (!getMax) {
    h =jQuery('#' + id).dialog("option", "minHeight");
    w = jQuery('#' + id).dialog("option", "minWidth");
  }
  var delta = 160;
  h = h - 1.5 * delta;
  w = w - delta;

  var newsize = 'height:' + h + 'px; width:' + w + 'px; ';
  jQuery('#chart' + chartID).attr('style', newsize);
  cd.height = h;
  cd.width = w;

  jQuery('#chart' + chartID).attr('style', newsize);

  jQuery('#svg' + chartID).empty();
  var dims = {'height':h, 'width':w};
  jsChart(chartID, cd.infile, cd.type, dims, cd);
}

/**
 * Building of charts button for its popup window.
 *
 * @param string $atype
 *   selected type of chart for button.
 * @param string $id
 *   containing unique id of new chart.
 * @param object $ops
 *   set of standard options.
 * @param array $types
 *   list of asked valid chart's types with popup.
 *
 * @return string
 *   html code of new created button.
 */
function popButt(atype, id, ops, types) {
  if (!types[atype]) {
    return '';
  }
  // Chartpicker is a list of valid names of types: 'pie,multibar' etc.
  if (typeof ops['chartpicker'] == 'string' && ops['chartpicker'] != 1) {
    var asks = ops['chartpicker'].split(',');
    if (asks.indexOf(atype) == -1) {
      return '';
    }
  }
  var dims = " {\'height\':" + ops.height + ", \'width\':" + ops.width + "} ";
//  var o = JSON.stringify(ops);
  var jsCall = " jsChart('" + id + "','" + ops.infile + "','" + atype +
    "', " + dims + ", ''); ";
  var ico = '<img src="' + rootpath + '../icons/' + atype + '.png"></button><br />';

  var s = '<button onclick="' + jsCall + '" title="' + atype + ' chart">' + ico;
  return s;
}

/**
 * Resizing chart for new window's size.
 */
function resizeWin(percent, svgid, resizeopts, oldw, oldh) {
  oldwinsize = ' width:' + (+100 + oldw) + 'px; height:' + (+100 + oldh) +
    'px; ';

  var w = oldw + 100;
  var h = oldh + 100;
  if (percent > 0) {
    w = window.screen.availWidth * Math.round(percent / 100);
    h = window.screen.availHeight * Math.round(percent / 100);
  }
  window.self.resizeTo(w, h);
  // Write id into global of this window.
  svgx = svgid;
  resize = resizeopts;
  chartData.height = h - 200;
  chartData.width = w - 200;

  window.onresize = function(event) {
    var newsize = 'height:' + (h - 160) + 'px; width:' + (w - 160) + 'px; ' +
      resize;
    jQuery('#chart' + svgx).attr('style', newsize);
    jQuery('#svg' + svgx).attr('style', newsize);
  };
}

/**
 * Debugging data set to the console of browser.
 *
 * @param array $data
 *   containing data set in valid 2x2 table format.
 */
function printLines(data) {
  var tab = '  ';
  var newline = "\n";
  var out = '';
  for (line = 0; line < data.length; line++) {
    if (data[line].values) {
      for (line2 = 0; line2 < data[line].values.length; line2++) {
        out += data[line].values[line2][0] + tab + data[line].values[line2][1] +
          newline;
      }
    }
    out += 'DATA SET' + newline;
  }
  console.info(out);
}

/* Some test data sets for parseJSON() on console.

tsvtest = "key  Cats  Birds  Dogs"  +"\n";
tsvtest = tsvtest + "2010  10  15  7"  +"\n";
tsvtest = tsvtest + "2011  1  2  3"  +"\n";
tsvtest = tsvtest + "2012  7  2  11"  +"\n";
tsvtest = tsvtest + "2014  5  1  4"  +"\n";

csvtest = "key;Cats;Birds;Dogs"    +"\n";
csvtest = csvtest + "2010;10;15;7"  +"\n";
csvtest = csvtest + "2011;1;2;3"  +"\n";
csvtest = csvtest + "2012;7;2;11"  +"\n";
csvtest = csvtest + "2014;5;1;4"  +"\n";
 */
 
/**
 * Parsing CSV/TSV input data into JSON based on chart's type.
 *
 * @param array $data
 *   containing data set in valid 2x2 table format.
 * @param string $chart
 *   containing type of asked chart.
 *
 * @return object
 *   JSON that is valid for the asked chart type.
 */
function parseJSON(data, chart) {

  var lines = new Array();
  var titles = new Array();
  for (line = 0; line < data.length; line++) {
    var colss = new Array();
    for (label in data[line]) {
      colss.push(data[line][label]);
      if (line == 0 && label != 'max' && label != 'min' && label !=
        'numericSortReverse') {
        titles.push(label);
      }
    }
    lines.push(colss);
  }
  var res = new Array();
  if (chart == 'pie' || chart == 'donut') {
    for (t = 0; t < lines.length; t++) {
      res.push(new Object({
        "label": lines[t][0],
        "value": operator(+lines[t][1])
      }));
    }
  }
  else if (chart == 'discretebar') {
    // The 1st column passed (eq t = 0).
    for (t = 1; t < titles.length; t++) {
      res.push(new Object({
        "key": titles[t],
        "values": forceNumb(lines, t)
      }));
    }
  }
  else if (chart == 'stackedarea' || chart == 'lineplusbar' || chart ==
    'cumulativeline') {
    for (t = 1; t < titles.length; t++) {
      res.push(new Object({
        "key": titles[t],
        "values": forceNumb2(lines, t)
      }));
    }
    // Case: multibars etc.
  }
  else {
    for (t = 1; t < titles.length; t++) {
      res.push(new Object({
        "key": titles[t],
        "values": getCol(t, lines)
      }));
    }
  }

  return res;

  /**
   * Naming data points + type casting them to be numeric.
   */
  function forceNumb(arr, t) {

    for (i = 0; i < arr.length; i++) {
      arr[i]['label'] = arr[i][0];
      if (+arr[i][1] || arr[i][1] == '0') {
        arr[i]['value'] = operator(+arr[i][1]);
      }
    }
    return arr;
  }

  /**
   * Naming data points + type casting them to be numeric.
   */
  function forceNumb2(arr, t) {

    var out = new Array();
    for (i = 0; i < arr.length; i++) {
      if (+arr[i][t] || arr[i][t] == '0') {
        out.push(new Array(+arr[i][0], operator(+arr[i][t])));
      }
    }
    return out;
  }

  function getCol(colname, lines) {
    var out = new Array();
    for (i = 0; i < lines.length; i++) {
      // Only numerical values output.
      if (lines[i][colname] && + lines[i][colname]) {
        // Old: if (! +lines[i][colname]) console.warning('Illegal value on input:'+lines[i][colname]); .
        var cell = new Object({
          "y": (operator(+lines[i][colname])),
          "x": lines[i][0]
        });
        out.push(cell);
      }
    }
    return out;
  }

  function operator(x) {

    if (typeof NVD3calcme != 'undefined') {
      if (chartData[NVD3calcme]) {
        var scaler = chartData[NVD3calcme].modifier;
        // Chart in popup window.
      }
      else {
        var scaler = chartData.modifier;
      }
      if (scaler) {
        // EU compatible decimal points ",".
        if (scaler.indexOf(",") > 0) {
          scaler = scaler.replace(",", ".");
        }
      }
      if (scaler) {
        if (typeof x == 'number') {
          return eval(x.toString() + scaler);
        }
        else if (typeof x == 'string') {
          return eval(x + scaler);
        }
      }
    }
    return x;
  }
  // Function: parseJSON.
}

/**
 * Zzzzzzzzzzzzzzzzzzzzzzz.
 */
function newpost(linkjson, linkxml, id) {

  var choice = jQuery('#' + id).val();

  if (choice == 'xmlpage' || choice == 'jsonpage') {
    linkjson = linkjson.replace('new=post', 'new=page');
    linkxml = linkxml.replace('new=post', 'new=page');
  }

  if (choice == 'jsonpost' || choice == 'jsonpage') {
    window.open(linkjson);
  }
  else if (choice == 'xmlpost' || choice == 'xmlpage') {
    window.open(linkxml);
  }
}

/**
 * Creating and posting in a new chart.
 *
 * @param string $alink
 *   url to the posting script with all parameters.
 * @param string $afile
 *   containing gallery's sample file name.
 * @param string $id
 *   containing id order number of chart from gallery's tabs.
 * @param string $id2
 *   containing id2 of data format of element from gallery page.
 */
function newpost2(alink, afile, id) {

  var qqq = alink.split('?');
  var query = qqq[0];
  var ctype = qqq[1].split('=');
  ctype = ctype[1];

  var post_type = galleryOpts[id]['gmenu' + id];
  var data_format = galleryOpts[id]['gformat' + id];;
  var trendLines = galleryOpts[id]['trends' + id];;
  var calc = galleryOpts[id]['calculator' + id];

  if (data_format == 'table' || data_format == 'cells' || data_format ==
    'direct' || data_format == 'table2') {
    afile = '';
  }
  else if (data_format == 'url') {
    afile = jQuery('#urlPath' + id).val();
  }
  else if (data_format != 'json') {
    afile = afile.replace('json', data_format);
  }
/*
  var user = "";
  if (typeof u_id == 'undefined' || u_id == 0) {
    window.alert('Please, log in before creating new charts!');
    return;
  } else {
    user = "&uid=" + u_id;
  }
  var key = "";
  if (u_k)
    key = "&k=" + u_k;  

  var my_cms = '';
  if (cms) {
    my_cms = '&cms=' + cms;
  }
*/
  // Check background image path, if: given + not URL  + not root of blog.
  var bg = galleryOpts[id]['backgroundimage' + id];
  if (bg && bg.indexOf('http://') == -1 && bg.indexOf('/') != 0) {
    galleryOpts[id]['backgroundimage' + id] = rootpath + '../' + bg;
  }

  var chartOpts = galleryOpts[id];
  jQuery.get(query, {
    cms: cms,
    new: post_type,
    uid: u_id,
    filepath: afile,
    type: ctype,
    template: data_format,
    trends: trendLines,
    chartNro: id,
    calculator: calc,
    opts: chartOpts
  }, function(data) {
//    alink = alink + user + key + my_cms;
//    window.open(alink);
    if (data.indexOf('//') > 0) {
	  window.location.href = data;
	  return;
	}
    console.warn(data);
    window.alert(data);
//	window.location.href = rootpath + '../error_login.htm';
  }, 'text');
}

/**
 * Create slider for labels of chart.
 *
 * @param string $id
 *   containing chart's id from its container.
 * @param object $data
 *   containing standard JSON formatted data set.
 * @param string $type
 *   containing type of chart.
 * @param object $options
 *   containing standard set of options for chart.
 */
function initLabelSlider(id, data, type, options) {
  if (options.rangeLabels && ['bullet', 'donut', 'pie'].indexOf(type) == -1) {
    var range = aSlider(id, data, type, options);
	if (typeof chartData == 'undefined') {
	  chartData = []; 
	}
	if (!chartData[id]) {
	  chartData[id] = {};
	}
	chartData[id].dataSet = data;
  }
}

/**
 * Drawing of chart based on its named type.
 *
 * @param string $id
 *   containing chart's id from its container.
 * @param object $data
 *   containing standard JSON formatted data set.
 * @param string $type
 *   containing type of chart.
 * @param object $options
 *   containing standard set of options for chart.
 */
function chartSelector(id, data, type, options) {

  options.type = type.toLowerCase();

  if (type == 'lineplusbar') {
    NVD3linePlusBar(id, data, options);
  }
  else if (type == 'simpleline') {
    NVD3simpleLine(id, data, options);
  }
  else if (type == 'scatterbubble') {
    NVD3ScatterBubble(id, data, options);
  }
  else if (type == 'viewfinder') {
    NVD3viewFinder(id, data, options)
  }
  else if (type == 'multibar') {
    NVD3MultiBar(id, data, options);
  }
  else if (type == 'cumulativeline') {
    NVD3cumulativeLineData(id, data, options);
  }
  else if (type == 'stackedarea') {
    NVD3stackedArea(id, data, options);
  }
  else if (type == 'discretebar') {
    NVD3discreteBar(id, data, options);
  }
  else if (type == 'horizontalmultibar') {
    NVD3horizontalMultiBar(id, data, options);
  }
  else if (type == 'pie') {
    NVD3Pie(id, data, options);
  }
  else if (type == 'donut') {
    NVD3Donut(id, data, options);
  }
  else if (type == 'bullet') {
    NVD3Bullet(id, data, options);
  }

  if (typeof inPopUp == 'undefined') {
    if (options.calculator == 1) {
      var title = '';
      if (typeof options.calculatortitle == 'string') {
        title = options.calculatortitle;
      }
      var unit = '';
      if (typeof options.calculatorunit == 'string') {
        unit = options.calculatorunit;
      }
      var lockme = '';
      if (options.calculatorlock) {
        if (options.calculatorlock == true) {
          lockme = ' disabled ';
        }
      }
      var hideme = 'text';
      if (options.calculatorhide) {
        if (options.calculatorhide == true) {
          hideme = 'hidden';
        }
      }
      scaler4Chart(id, options.calculator, title, unit, lockme, hideme);
    }
  }
}

/**
 * Scaling of chart by adding of this calculator 9433
 * 
 * @param string $id
 *   containing id of html where calculator appears.
 * @param string $op
 *   containing any formula that is applied to chart.
 * @param string $title
 *   containing help text of calculator, verb what it does.
 * @param string $unit
 *   containing unit of chart with its application.
 * @param string $lock
 *   containing locking field for formula in html.
 * @param string $hidden
 *   hiding calculator away for the chart.
 */
function scaler4Chart(id, op, title, unit, lock, hidden) {
  if ((typeof op == 'boolean' && op) || op == 1) {
    op = '*1';
  }
  if (chartData[id]) {
    if (chartData[id].modifier) {
      op = chartData[id].modifier;
    }
  }
  var ico = '<img src="' + rootpath + '../icons/calculator.png">';
  // console.info(hidden);
  var nrobox = '<input size="6" style="font-size:16px" value="' + op +
    '" type="' + hidden + '" id="scaler' + id +
    '" title="Change data points of chart on this way & amount" ' +
    lock +
    '>';
  var inbox =
    '<br /> <span style="float:right; background-color:darkgray; border: 3px outset gray;"><b> ' +
    title + ' </b>' + nrobox + unit + ' <button onclick="rescaleChart(\'' +
    id + '\')" title="Rebuild chart" style="cursor:pointer;"> ' + ico +
    ' </button></span> ';

  jQuery("#chart" + id).append(inbox);
}

/**
 * Redrawing the chart to new size.
 *
 * @param string $id
 *   containing id nro of scaler & chart.
 */
function rescaleChart(id) {

  // Remember me in globally.
  NVD3calcme = id;
  var cD = chartData[id];
  if (!cD) {
    cD = chartData;
  }

  cD.modifier = jQuery('#scaler' + id).val();
  var dims = {
    height: cD.height,
    width: cD.width
  };
  jsChart(id, cD.infile, cD.type, dims, cD);
}

/**
 * Formatting axis of chart with timestamps.
 *
 * @param string $x
 *   containing a value of one tick on axis.
 * @param object $options
 *   containing a set of chart options.
 */
function timeStamp(x, options) {
  if (options.xtime) {
    return d3.time.format('%x')(new Date(x));
  }
  return x;
}

/*
ALL Supported NVD3 Chart Types: 1 function / chart's type.
 */
/**
 * Rescaling Y-axis of chart by new min & max.
 *
 * @param object $chart
 *   containing chart in D3 format.
 * @param object $options
 *   containing set of options with min & max values.
 */
function NVD3axisScale(chart, options) {

  var minY = options.minY;
  var maxY = options.maxY;
  if (!minY && options.domain) {
    minY = options.domain.minY;
  }
  if (!maxY && options.domain) {
    maxY = options.domain.maxY;
  }

  if (minY && maxY) {
    chart.forceY([minY, maxY]);
    return;
  }
  var diff = 0.00000000001;
  if (minY) {
    chart.forceY([minY, minY + diff]);
  }
  if (maxY) {
    chart.forceY([maxY - diff, maxY]);
  }
}

/**
 * Put new labels on the axis of chart.
 *
 * @param object $axis
 *   containing axis of chart in D3 format.
 * @param object $opts
 *   containing set of options with axis labels.
 */
function labelAxis(axis, opts) {
  // Empty labels of axis.
  if (opts.xaxis) {
    if (opts.xaxis.hide) {
      axis.tickFormat("");
    }
  }
  if (opts.yaxis) {
    if (opts.yaxis.hide) {
      axis.tickFormat("");
    }
  }
  // Relabeling axis.
  if (opts.xaxis) {
    if (!opts.xaxis.hide) {
      if (opts.xaxis.labels) {
        axis.tickValues(opts.xaxis.labels);
      }
    }
  }
  if (opts.yaxis) {
    if (!opts.yaxis.hide) {
      if (opts.yaxis.labels) {
        axis.tickValues(opts.yaxis.labels);
      }
    }
  }
}

/**
 * Drawing chart: linePlusBar.
 *
 * @param string $chartID
 *   containing id of chart from its container.
 * @param object $data
 *   containing JSON formatted legal data set.
 * @param object $options
 *   containing a set of chart options.
 *
 * @return object
 *   new chart in nvd3 format.
 */
function NVD3linePlusBar(chartID, data, options) {

  nv.addGraph(function() {
    var chart = nv.models.linePlusBarChart()
      .margin(setMargin({
        top: 30,
        right: 90,
        bottom: 50,
        left: 90
      }, options))
      /*
      We can set x data accessor to use index.
      Reason? So the bars all appear evenly spaced.
       */
        .x(function(d, i) {
          return i
        })
        .y(function(d, i) {
          return d[1]
        });

    chart.xAxis.tickFormat(function(d) {
      var dx = data[0].values[d] && data[0].values[d][0] || 0;
      return timeStamp(dx, options);
    });

    chart.y1Axis
      .tickFormat(setFormat2(',.2r', options));
    // Test: NVD3axisScale(chart, options); .
    labelAxis(chart.xAxis, options);
    /*
    chart.y2Axis
    .tickFormat(setFormat2(',.2r',options));
    .tickFormat(function(d) { return d3.format(',f')(d) });
     */
    chart.bars.forceY([0]);

    chart.options(options);
    shadowEffects(chartID, options);

    d3.select("#svg" + chartID)
      .datum(data)
      .transition()
      .duration(500)
      .call(chart);

    formatAxis(".nv-x", options, "xaxis");
    formatAxis(".nv-y1", options, "yaxis");
    formatAxis(".nv-y2", options, "yaxis");

    xlinks(chartID, options);

    colorSegments(options, chartID, data);
    /*
    Update the chart when window resizes.
    nv.utils.windowResize(function() { chart.update() });
     */
    return chart;
  });
}

/**
 * Drawing chart: cumulativeLineData.
 *
 * @param string $chartID
 *   containing id of chart from its container.
 * @param object $data
 *   containing JSON formatted legal data set.
 * @param object $options
 *   containing a set of chart options.
 *
 * @return object
 *   new chart in nvd3 format.
 */
function NVD3cumulativeLineData(chartID, data, options) {

  nv.addGraph(function() {
    var chart = nv.models.cumulativeLineChart()
      .margin(setMargin({
        left: 50,
        right: 50,
        bottom: 50
      }, options))
      .x(function(d) {
        return d[0]
      })
      // Adjusting, 100% is 1.00, not 100 as it is in the data.
      .y(function(d) {
        return d[1] / 100
      })
      .color(d3.scale.category10().range())
      .useInteractiveGuideline(true);

    chart.xAxis
      .tickFormat(function(d) {
        return timeStamp(d, options)
      });

    chart.yAxis
      .tickFormat(setFormat2(',.1%', options));
    NVD3axisScale(chart, options);

    labelAxis(chart.xAxis, options);

    chart.options(options);
    shadowEffects(chartID, options);

    d3.select("#svg" + chartID)
      .datum(data)
      .call(chart);

    formatAxis(".nv-x", options, "xaxis");
    formatAxis(".nv-y", options, "yaxis");

    xlinks(chartID, options);

    colorSegments(options, chartID, data);
    // Note: colorTable(options, chartID); .
    /*
    Update the chart when window resizes.
    nv.utils.windowResize(function() { chart.update() });
     */
    return chart;
  });
}

/**
 * Drawing chart: stackedArea.
 *
 * @param string $chartID
 *   containing id of chart from its container.
 * @param object $data
 *   containing JSON formatted legal data set.
 * @param object $options
 *   containing a set of chart options.
 *
 * @return object
 *   new chart in nvd3 format.
 */
function NVD3stackedArea(chartID, data, options) {

  nv.addGraph(function() {
    var chart = nv.models.stackedAreaChart()
      .margin(setMargin({
        left: 70,
        right: 50,
        bottom: 50
      }, options))
        .x(function(d) {
          return d[0]
        })
        // We can modify the data accessor functions here.
        .y(function(d) {
          return d[1]
        })
        // Tooltips which show all data points.
        .useInteractiveGuideline(true)
        // Let's move the y-axis to the right side.
        .rightAlignYAxis(true)
        .transitionDuration(500)
        // Allow user to choose 'Stacked', 'Stream', 'Expanded' mode.
        .showControls(true)
        .clipEdge(true);

    // Format x-axis labels with custom function.
    chart.xAxis
      .tickFormat(function(d) {
        return timeStamp(d, options)
      });

    chart.yAxis
      .tickFormat(setFormat2(',.2r', options));
    NVD3axisScale(chart, options);

    labelAxis(chart.xAxis, options);

    chart.options(options);
    shadowEffects(chartID, options);

    d3.select("#svg" + chartID)
      .datum(data)
      .call(chart);

    formatAxis(".nv-x", options, "xaxis");
    formatAxis(".nv-y", options, "yaxis");

    xlinks(chartID, options);

    colorSegments(options, chartID, data);
    // Note: colorTable(options, chartID); .
    /*
    Update the chart when window resizes.
    nv.utils.windowResize(function() { chart.update() });
     */
    return chart;
  });
}

/**
 * Format axis appearance by any CSS/SVG attributes.
 *
 * @param string $axisClass
 *   containing name of class from SVG chart.
 * @param object $opts
 *   containing set of options for chart.
 * @param string $optax
 *   containing name of axis to format: "xaxis"/"yaxis".
 */
function formatAxis(axisClass, opts, optax) {

  var olds = jQuery(axisClass + ' .tick text').attr("style");
  if (opts[optax]) {
    if (opts[optax].style) {
      jQuery(axisClass + ' .tick text').attr("style", opts[optax].style +
        '; ' + olds);
    }
    if (opts[optax].transform) {
      jQuery(axisClass + ' .tick text').attr("transform", opts[optax].transform);
    }
  }
}

/**
 * Building ext. links for chart's visual elements.
 *
 * @param object $opts
 *   containing options set with array of url links.
 * @param string $id
 *   containing id of SVG that is modified.
 */
function xlinks(id, opts) {

  if (!opts.links) {
    return;
  }

  // Chart types that do not work with web links, yet.
  if (opts.type == 'scatterbubble') {
    console.warn('Chart type scatterbubble not supported for web links yet.');
    return;
  }

  var bars2 = jQuery("#svg" + id + getElement(opts.type));
  for (h in bars2) {
    if (+h || h == 0) {
      if (typeof opts.links[h] == 'string') {
        // Existing 'javascript:' in options for links.
        if (opts.links[h].indexOf('javascript:') == 0) {
          // JavaScript call to even.
          bars2[h].setAttribute('onclick', opts.links[h].substring(11));
        }
        else {
          // Just one url of new window given as option.
          bars2[h].setAttribute('onclick', 'window.open(\'' + opts.links[h] +
            '\')');
        }
        var oldie = bars2[h].getAttribute('style');
        bars2[h].setAttribute('style', 'cursor:pointer; ' + oldie);
      }
    }
  }

  return;

  function getElement(ctype) {

    var element = ' .nv-group';
    if (ctype == 'pie' || ctype == 'donut') {
      element = ' .nv-slice';
    }
    else if (ctype == 'discretebar') {
      element = ' .nv-group g';
    }

    return element;
  }
}

/**
 * Drawing chart: discreteBar.
 *
 * @param string $chartID
 *   containing id of chart from its container.
 * @param object $data
 *   containing JSON formatted legal data set.
 * @param object $options
 *   containing a set of chart options.
 *
 * @return object
 *   new chart in nvd3 format.
 */
function NVD3discreteBar(chartID, data, options) {

  nv.addGraph(function() {
    var chart = nv.models.discreteBarChart()
      .margin(setMargin({
        left: 70,
        bottom: 50,
        right: 50
      }, options))
        // Specify the data accessors.
        .x(function(d) {
          return d.label
        })
        .y(function(d) {
          return d.value
        })
        // Too many bars and not enough room? Try staggering labels.
        .staggerLabels(true)
        .tooltips(false)
        // Show the bar value right on top of each bar with this type.
        .showValues(true)
        .transitionDuration(350);

    chart.yAxis
      .tickFormat(setFormat2('.3r', options));
    NVD3axisScale(chart, options);

    labelAxis(chart.xAxis, options);

    if (options.showValues == "0") {
      options.showValues = false;
	}
    chart.options(options);
    shadowEffects(chartID, options);

    d3.select("#svg" + chartID)
      .datum(data)
      .call(chart);

    formatAxis(".nv-x", options, "xaxis");
    formatAxis(".nv-y", options, "yaxis");

    xlinks(chartID, options);

    if (data[0]) {
      if (data[0].values) {
        colorSegments(options, chartID, data[0].values);
      }
    }
    /*
    Update the chart when window resizes.
    nv.utils.windowResize(function() { chart.update() });
     */
    colorTable(options, chartID);

    if (options.trendLine == "1" || options.trendLine == true) {
      var line = {"stroke":"navy", "stroke-width":1, "fill":"none"};
      if (typeof options.trendline == 'object') {
        line = options.trendLine;
      }
      globalizeTrendData(chartID);
      trendsData[chartID][0] = getData(data, chartID);
      var chart2 = {height:chart.height(), width:chart.width(), margin:chart.margin()};
      drawLine(chartID, trendsData[chartID][0], chart2, line, 'bars_data');
    }
    return chart;
  });

  function getData(data, id) {
    if (!data[0]) {
      return [];
    }
    var y = 0;
    var aSet = [];
    for (i = 0; i < data[0].values.length; i++) {
      y = data[0].values[i].value;
      aSet.push(y);
      if (y < trendsData[id].minY || trendsData[id].minY == 0) {
        trendsData[id].minY = y;
      }
      if (y > trendsData[id].maxY || trendsData[id].maxY == 0) {
        trendsData[id].maxY = y;
      }
    };
    return aSet;
  }
}

/**
 * Drawing chart: horizontalMultiBar.
 *
 * @param string $chartID
 *   containing id of chart from its container.
 * @param object $data
 *   containing JSON formatted legal data set.
 * @param object $options
 *   containing a set of chart options.
 *
 * @return object
 *   new chart in nvd3 format.
 */
function NVD3horizontalMultiBar(chartID, data, options) {

  nv.addGraph(function() {
    var chart = nv.models.multiBarHorizontalChart()
      .margin(setMargin({
        left: 70,
        bottom: 50,
        right: 50
      }, options))
        .x(function(d) {
          return d.label
        })
        .y(function(d) {
          return d.value
        })
        // Show bar value next to each bar.
        .showValues(true)
        // Show tooltips on hover.
        .tooltips(true)
        .transitionDuration(350)
        // Allow user to switch between "Grouped" and "Stacked" mode.
        .showControls(true);

    chart.yAxis
      .tickFormat(setFormat2(',.2r', options));
    NVD3axisScale(chart, options);

    labelAxis(chart.xAxis, options);

    if (options.showValues == "0") {
      options.showValues = false;
	}
    chart.options(options);
    shadowEffects(chartID, options);

    d3.select("#svg" + chartID)
      .datum(data)
      .call(chart);

    formatAxis(".nv-x", options, "xaxis");
    formatAxis(".nv-y", options, "yaxis");

    xlinks(chartID, options);

    colorSegments(options, chartID, data);
    colorTable(options, chartID);
    /*
    Update the chart when window resizes.
    nv.utils.windowResize(function() { chart.update() });
     */
    return chart;
  });

}

/**
 * Drawing chart: scatterBubble.
 *
 * @param string $chartID
 *   containing id of chart from its container.
 * @param object $data
 *   containing JSON formatted legal data set.
 * @param object $options
 *   containing a set of chart options.
 *
 * @return object
 *   new chart in nvd3 format.
 */
function NVD3ScatterBubble(chartID, data, options) {

  nv.addGraph(function() {
    var chart = nv.models.scatterChart()
      .margin(setMargin({
        left: 50,
        bottom: 50,
        right: 50
      }, options))
        // Display those little distribution lines on the axis.
        .showDistX(true)
        .showDistY(true)
        .transitionDuration(350)
        .color(d3.scale.category10().range());

    // Configure how the tooltip looks like.
    chart.tooltipContent(function(key) {
      return '<h3>' + key + '</h3>';
    });

    // Axis settings.
    chart.xAxis.tickFormat(setFormat2('.02f', options));
    chart.yAxis.tickFormat(setFormat2('.02f', options));

    // We want to show shapes other than circles.
    chart.scatter.onlyCircles(false);

    NVD3axisScale(chart, options);

    labelAxis(chart.xAxis, options);

    chart.options(options);
    shadowEffects(chartID, options);

    d3.select("#svg" + chartID)
      .datum(data)
      .call(chart);

    formatAxis(".nv-x", options, "xaxis");
    formatAxis(".nv-y", options, "yaxis");

    xlinks(chartID, options);

    colorSegments(options, chartID, data);
    /*
    Update the chart when window resizes.
    nv.utils.windowResize(function() { chart.update() });
     */
    return chart;
  });
}

/**
 * Drawing chart: multiBar.
 *
 * @param string $chartID
 *   containing id of chart from its container.
 * @param object $data
 *   containing JSON formatted legal data set.
 * @param object $options
 *   containing a set of chart options.
 *
 * @return object
 *   new chart in nvd3 format.
 */
function NVD3MultiBar(chartID, data, options) {

  nv.addGraph(function() {
    var chart = nv.models.multiBarChart()
      .margin(setMargin({
        left: 70,
        bottom: 50,
        right: 50
      }, options))
        .transitionDuration(350)
        // If 'false', every single x-axis tick label will be rendered.
        .reduceXTicks(true)
        // Angle to rotate x-axis labels.
        .rotateLabels(0)
        // Allow user to switch between 'Grouped' and 'Stacked' mode.
        .showControls(true)
        // Distance between each group of bars.
        .groupSpacing(0.1)
        .x(function(d, i) {
          return i
        });
    /*
    chart.xAxis
    .tickFormat(d3.format(',f'));
     */
    chart.xAxis.tickFormat(function(d) {
      var dx = data[0].values[d] && data[0].values[d]["x"] || 0;
      return timeStamp(dx, options);
    });

    chart.yAxis
      .tickFormat(setFormat2('.2r', options));
    NVD3axisScale(chart, options);

    labelAxis(chart.xAxis, options);

    chart.options(options);
    shadowEffects(chartID, options);

    d3.select("#svg" + chartID)
      .datum(data)
      .call(chart);

    formatAxis(".nv-x", options, "xaxis");
    formatAxis(".nv-y", options, "yaxis");

    xlinks(chartID, options);

    colorSegments(options, chartID, data);
    colorTable(options, chartID);

    if (options.trendLine == "1" || options.trendLine == true) {
      var colors = getCols(chartID);
      var line = {"stroke":"navy", "stroke-width":1, "fill":"none"};
      if (typeof options.trendline == 'object') {
        line = options.trendLine;
      }
      globalizeTrendData(chartID);
      // Counting all series ready for trend lines.
      for (j=0; j < data.length; j++) {
        trendsData[chartID][j] = getData(data[j], chartID);
      }
      for (j=0; j < data.length; j++) {
	  if (colors[j] != false) {
        line.stroke = colors[j];
        var serieName = data[j].key;
		var chart2 = {height:chart.height(), width:chart.width(), margin:chart.margin()};
        drawLine(chartID, trendsData[chartID][j], chart2, line, serieName);
		chart2 = JSON.stringify(chart2);
		var line2 = JSON.stringify(line);
        // Add events to recount all trends for user click.
        var refresh = "trendUpdates('" + chartID + "', 'nv-trends', " + j + ", " +
		    chart2 + ", " + line2 + ", '" + serieName + "')";
        jQuery("#svg" + chartID + ' .nv-legend-symbol').attr("onClick", refresh);
		// debug - remove!!!...
//		var xxx = ' drawLine(' + chartID + ', trendsData[' + chartID + '][' + j + '],' + chart2 + ', ' + line2 + ', "' + serieName + '");';
//		console.info(xxx);
      } }
    }
    /*
    Update the chart when window resizes.
    nv.utils.windowResize(function() { chart.update() });
     */
    return chart;
  });

  function getData(data, id) {
    if (!data) {
      return [];
    }
    var y = 0;
    var aSet = [];
    for (i = 0; i < data.values.length; i++) {
      y = data.values[i].y;
      aSet.push(y);
      if (y < trendsData[id].minY || trendsData[id].minY == 0) {
        trendsData[id].minY = y;
      }
      if (y > trendsData[id].maxY || trendsData[id].maxY == 0) {
        trendsData[id].maxY = y;
      }
    };
    return aSet;
  }
  function getCols(id) {
    var cols = [];
    for (i = 0; i < data.length; i++) {
      var barStyle = d3.selectAll("#svg" + id + " circle")[0][i].attributes.style;
	  barStyle = barStyle.value.split(";");
	  for (j = 0; j < barStyle.length; j++) {
	    if (barStyle[j].indexOf('fill') > -1 && barStyle[j].indexOf('none') == -1) {
		  var aColor = barStyle[j].split(":");
		  cols.push(aColor[1]);
		} else if (barStyle[j].indexOf('fill') > -1) {
		  // Signal that data serie is inactive.
		  cols.push(false);
		}
	  }
	}
	return cols;
  }
}

/**
 * Drawing chart: viewFinder.
 *
 * @param string $chartID
 *   containing id of chart from its container.
 * @param object $data
 *   containing JSON formatted legal data set.
 * @param object $options
 *   containing a set of chart options.
 *
 * @return object
 *   new chart in nvd3 format.
 */
function NVD3viewFinder(chartID, data, options) {

  nv.addGraph(function() {
    var chart = nv.models.lineWithFocusChart()
      .margin(setMargin({
        left: 70,
        bottom: 50,
        right: 50
      }, options))
        .x(function(d, i) {
          return i
        });
    /*
    chart.xAxis
    .tickFormat(d3.format(',f'));
     */
    chart.xAxis.tickFormat(function(d) {
      var dx = data[0].values[d] && data[0].values[d]["x"] || 0;
      return timeStamp(dx, options);
    });

    chart.yAxis
      .tickFormat(setFormat2(',.2r', options));

    chart.y2Axis
      .tickFormat(setFormat2(',.2r', options));

    NVD3axisScale(chart, options);

    labelAxis(chart.xAxis, options);

    chart.options(options);
    shadowEffects(chartID, options);

    d3.select("#svg" + chartID)
      .datum(data)
      .transition().duration(500)
      .call(chart);

    xlinks(chartID, options);

    colorSegments(options, chartID, data);
    colorTable(options, chartID);

    /*
    Update the chart when window resizes.
    nv.utils.windowResize(function() { chart.update() });
     */
    return chart;
  });
}

/**
 * Drawing chart: simpleLine.
 *
 * @param string $chartID
 *   containing id of chart from its container.
 * @param object $data
 *   containing JSON formatted legal data set.
 * @param object $options
 *   containing a set of chart options.
 *
 * @return object
 *   new chart in nvd3 format.
 */
function NVD3simpleLine(chartID, data, options) {
  /*
  These lines are all chart setup.
  Pick and choose which chart features you want to use.
   */
  nv.addGraph(function() {
    var chart = nv.models.lineChart()
      // Adjust chart margin wider.
      .margin(setMargin({
        left: 70,
        bottom: 50,
        right: 50
      }, options))
        // We want nice looking tooltips and a guideline.
        .useInteractiveGuideline(true)
        // How fast do you want the lines to transition.
        .transitionDuration(350)
        // Show the legend, allowing users to turn on/off line series.
        .showLegend(true)
        // Show the y-axis.
        .showYAxis(true)
        // Show the x-axis.
        .showXAxis(true)
        .x(function(d, i) {
          return i
        });

    chart.xAxis.tickFormat(function(d) {
      var dx = data[0].values[d] && data[0].values[d]["x"] || 0;
      return timeStamp(dx, options);
    });

    // Chart y-axis settings.
    chart.yAxis
      .tickFormat(setFormat2('.2r', options));
    NVD3axisScale(chart, options);

    labelAxis(chart.xAxis, options);

    chart.options(options);
    shadowEffects(chartID, options);

	d3.select("#svg" + chartID)
      // Populate the <svg> element with chart data.
      .datum(data)
      .call(chart);

    formatAxis(".nv-x", options, "xaxis");
    formatAxis(".nv-y", options, "yaxis");

    xlinks(chartID, options);

    colorSegments(options, chartID, data);
    colorTable(options, chartID);

    /*
    Update the chart when window resizes it.
    nv.utils.windowResize(function() { chart.update() });
     */
    return chart;
  });
}

/**
 * Coloring chart based on HTML table of data.
 *
 * @param object $options
 *   containing options set with autocoloring flag.
 * @param string $id
 *   containing id of SVG that is modified.
 */
function colorTable(options, id) {

  if (typeof options.autocoloring == 'string' && !options.inPopup) {
    var element = '.nv-group';
    var multiseries = true;
    if (options.type == 'pie' || options.type == 'donut') {
      element = '.nv-slice';
    }
    else if (options.type == 'discretebar') {
      element = '.nv-bar';
    }
    if (element != '.nv-group') {
      multiseries = false;
    }

    var gcolors = d3.select("#svg" + id).selectAll(element);
    xcolors = gcolors;
    var cstack = new Array();
    for (c = 0; c < gcolors[0].length; c++) {
      if (gcolors[0][c]['style']['fill'] || gcolors[0][c].getAttribute('fill')) {
        if (element == '.nv-slice') {
          cstack.push(gcolors[0][c].getAttribute('fill'));
        }
        else {
          cstack.push(gcolors[0][c]['style']['fill']);
        }
      }
    }

    var idtable = chartData[id].table;
    var colors = options.autocoloring.split(",");
    if (multiseries) {
      for (c = 0; c < colors.length; c++) {
        var cells = d3.selectAll('#' + idtable + ' [bgcolor="' + colors[c] +
          '"]');
        cells.attr('bgcolor', '').attr('style', 'background-color:' + cstack[
          c]);
      }
    }
    else {
      var cells = d3.selectAll('#' + idtable + ' [bgcolor="' + colors[0] +
        '"]');
      xcells = cells;
      // The 1st row = title of columns.
      if (cstack.length + 1 == cells[0].length) {
        for (c = 0; c < cstack.length; c++) {
          var acell = cells[0][c + 1];
          acell.setAttribute('bgcolor', '')
          acell.setAttribute('style', 'background-color:' + cstack[c]);
        }
      }
      /*
      acell['attributes']['bgcolor']['value'] = '';
      acell['attributes']['style'] = 'background-color:' + cstack[1];
      acell.attr('bgcolor','').attr('style','background-color:' + cstack[c]);
       */
    }
  }
}

/**
 * Drawing chart: Pie.
 *
 * @param string $chartID
 *   containing id of chart from its container.
 * @param object $data
 *   containing JSON formatted legal data set.
 * @param object $options
 *   containing a set of chart options.
 *
 * @return object
 *   new chart in nvd3 format.
 */
function NVD3Pie(chartID, data, options) {

  // Regular pie chart example.
  nv.addGraph(function() {
    var chart = nv.models.pieChart()
      .margin(setMargin({
        left: 10,
        bottom: 50
      }, options))
        .x(function(d) {
           return d.label
        })
        .y(function(d) {
          return d.value
        })
        .showLabels(true);

    chart.valueFormat = setFormat2('.2r', options);

    chart.options(options);
    shadowEffects(chartID, options);

    d3.select("#svg" + chartID)
      .datum(data)
      .transition().duration(700)
      .call(chart);

    colorSegments(options, chartID, data);
    colorTable(options, chartID);
    xlinks(chartID, options);

    return chart;
  });
}

/**
 * Drawing chart: Donut.
 *
 * @param string $chartID
 *   containing id of chart from its container.
 * @param object $data
 *   containing JSON formatted legal data set.
 * @param object $options
 *   containing a set of chart options.
 *
 * @return object
 *   new chart in nvd3 format.
 */
function NVD3Donut(chartID, data, options) {

  // Donut chart example.
  nv.addGraph(function() {
    var chart = nv.models.pieChart()
      .margin(setMargin({
        left: 10,
        bottom: 50
      }, options))
        .x(function(d) {
          return d.label
        })
        .y(function(d) {
          return d.value
        })
        // Display pie labels.
        .showLabels(true)
        // Configure the minimum slice size for labels to show up.
        .labelThreshold(.05)
        // Configure what type of data to show in the label: "key", "value" or "percent".
        .labelType("percent")
        // Turn on Donut mode. Makes pie chart looks tasty.
        .donut(true)
        // Configure how big you want the donut hole size to be.
        .donutRatio(0.35);

    chart.valueFormat = setFormat2('.2r', options);

    chart.options(options);
    shadowEffects(chartID, options);

    d3.select("#svg" + chartID)
      .datum(data)
      .transition().duration(700)
      .call(chart);

    colorSegments(options, chartID, data);
    colorTable(options, chartID);
    xlinks(chartID, options);

    return chart;
  });
}

/**
 * Drawing chart: Bullet.
 *
 * @param string $chartID
 *   containing id of chart from its container.
 * @param object $data
 *   containing JSON formatted legal data set.
 * @param object $options
 *   containing a set of chart options.
 *
 * @return object
 *   new chart in nvd3 format.
 */
function NVD3Bullet(chartID, data, options) {

  nv.addGraph(function() {
    var chart = nv.models.bulletChart()
      .margin(setMargin({
        left: 150,
        bottom: 50
      }, options));

    chart.options(options);

    d3.select("#svg" + chartID)
      .datum(data)
      .transition().duration(1000)
      .call(chart);

    return chart;
  });
}

/**
 * Custom coloring chart's bars & segments of data.
 *
 * @param object $options
 *   containing options for shadows & background image.
 * @param string $chartID
 *   containing id of SVG that is modified.
 * @param object $data
 *   containing data set of chart in JSON.
 */
function colorSegments(options, chartID, data) {
  var size = data.length;
  initCB();
  var classname = 0;
  if (options.colorbrewer) {
    if (options.colorbrewer.segment) {
      classname = options.colorbrewer.segment;
    }
  }
  var action = 'fill';
  var type = options.type;
  if (!classname) {
    if (type == 'pie' || type == 'donut') {
      classname = ' .nv-slice';
    }
    else if (type == 'horizontalmultibar' || type == 'discretebar') {
      classname = ' .nv-bar';
    }
    else if (type == 'stackedarea') {
      classname = ' .nv-area';
    }
    else if (type == 'scatterbubble' || type == 'lineplusbar' || type ==
      'multibar') {
      classname = ' .nv-group';
    }
    else if (type == 'simpleline' || type == 'cumulativeline' || type ==
      'viewfinder') {
      classname = ' .nv-group';
      action = 'stroke';
    }
  }

  var customs = false;
  // Fixed named palettes called up.
  if (options.colorbrewer) {
    if (options.colorbrewer.palette) {
      if (colorbrewer[options.colorbrewer.palette]) {
        var amount = size;
        if (options.colorbrewer.amount) {
          amount = options.colorbrewer.amount;
        }
        if (amount < 3) {
          amount = 3;
        }
        else if (amount > colorbrewer[options.colorbrewer.palette].max) {
          amount = colorbrewer[options.colorbrewer.palette].max;
        }
        var colors = d3.scale.ordinal().range(colorbrewer[options.colorbrewer
          .palette][amount]);
        customs = true;
      }
    }
  }
  // Own custom colors (eq options.colors:'red,green,blue' or options.colors:{startbar:'red', endbar:'lime'}).
  if (options.colors) {
    // There is a list of colors.
    if (typeof options.colors == 'string') {
      var colors = d3.scale.ordinal().range(options.colors.split(','));
      customs = true;
    }
    else {
      // Object => interpolating of colours for smooth gradient.
      if (options.colors.startbar && options.colors.endbar) {
        if (options.colors.values) {
          var min = '';
          var max = '';
          for (c in data) {
            if (min > data[c].value || min == '') {
              min = data[c].value;
            }
            if (max < data[c].value || max == '') {
              max = data[c].value;
            }
          }
          // Setting new domain to range relation for data values based coloring.
          var colors = d3.scale.linear().domain([min, max]).range([options.colors
            .startbar, options.colors.endbar]);
        }
        else {
          // Setting domain by the order of labels from right to left / from smaller to larger.
          var colors = d3.scale.ordinal().range(gradientColors(options.colors
            .startbar, size, options.colors.endbar));
        }
        customs = true;
      }
    }
  }
  // Here @todo: colors of these blocked chart types active too.
  if (customs && type != 'lineplusbar' && type != 'multibar') {
    if (options.colors.values) {
      d3.selectAll('#svg' + chartID + classname).style(action, function(d, i) {
        return colors(d.value);
      });
    }
    else {
      d3.selectAll('#svg' + chartID + classname).style(action, function(d, i) {
        return colors(i);
      });
    }
    // Legend's coloring styles.
    d3.selectAll('#svg' + chartID + ' .nv-legend-symbol').style("fill",
      function(d, i) {
        return colors(i);
      });
    d3.selectAll('#svg' + chartID + ' .nv-legend-symbol').style("stroke",
      function(d, i) {
        return colors(i);
      });
  }
  else if (options.style) {
    // Example: {"fill":"navy"}.
    d3.selectAll('#svg' + chartID + classname).style(options.style);
  }

  if (options.shadows) {
    d3.selectAll('#svg' + chartID + classname).style({
      filter: "url(#blackshadows)"
    });
    d3.selectAll('#svg' + chartID + classname + ' text').style({
      filter: "url(#blackshadows)"
    });
  }

  // Generates smooth colors based on given starting and ending colors and returns its HTML color codes.
  function gradientColors(startColor, steps, endColor) {

    if (startColor && endColor) {

      var colors = new Array();
      // We give up coloring task for the CSS declarations over here.
      if (!startColor.length) {
        return '';
      }

      // Defining proper lightness change step.
      var csteps = 0;
      if (!endColor) {
        var acolor = d3.hsl(startColor);
        // Starting color is over 50% from all lightness => going to darken it.
        if (acolor.l > 0.5) {
          // Target range: (startColor lightness ... black/0).
          csteps = acolor.l / (steps);
          ssteps = acolor.s / steps;
          // Brighten it up.
        }
        else {
          // Target range: (startColor lightness ... white/1).
          csteps = (1 - acolor.l) / steps;
          ssteps = (1 - acolor.s) / steps;
        }
        // Generating colors (without endColor given).
        var thecolor = acolor;
        for (i = 0; i < steps; i++) {
          colors.push(thecolor.toString());
          if (acolor.l > 0.49) {
            thecolor = thecolor.darker(csteps * 4);
          }
          else {
            thecolor = thecolor.brighter(csteps * 4);
          }
        }
      }
      else {
        /*
        Here we have start and end color traveling from => to by using steps of given color changes.
        We encode start and end colors by using Lab's color model's components from HTML's color strings.
         */
        var startColor = d3.lab(startColor);
        var Lab_start = new Array(startColor.l, startColor.a, startColor.b);
        var endColor = d3.lab(endColor);
        var Lab_end = new Array(endColor.l, endColor.a, endColor.b);

        steps = steps - 1;
        // Time to define (L,a,b) linear steps for each components change and build result.
        var L_step = (-Lab_start[0] + Lab_end[0]) / steps;
        var a_step = (-Lab_start[1] + Lab_end[1]) / steps;
        var b_step = (-Lab_start[2] + Lab_end[2]) / steps;
        // Generating color ramp by using these steps together from start to end color.
        var thecolor = startColor;
        for (i = 0; i < steps + 1; i++) {
          colors.push(thecolor.toString());
          thecolor = d3.lab(d3.lab(thecolor).l + L_step, d3.lab(thecolor).a +
            a_step, d3.lab(thecolor).b + b_step);
        }
        /*
        Why? Use of D3's Lab (vs HSL) model here: 'father of all humans coloring models :-)'.
        Look: http://www.photozone.de/colorimetric-systems-and-color-models
         */
      }
      return colors;
    }
    else {
      return new Array();
    }
    // Function: gradientColors.
  }

  function initCB() {
    for (x in colorbrewer) {
      if (colorbrewer[x]['max']) {
        return;
      }
      else {
        for (j in colorbrewer[x]) {
          colorbrewer[x]['max'] = colorbrewer[x][j].length;
        }
      }
    }
  }
  // Function: colorSegments.
}

/**
 * Generating shadows for chart's bars or segments + bg pict of chart.
 *
 * @param object $chartID
 *   containing id of SVG that is modified.
 * @param object $options
 *   containing options for shadows & background image.
 */
function shadowEffects(chartID, options) {

  if (options.shadows) {
    // Filters go in defs element.
    var svg = d3.select("#svg" + chartID);
    var defs = svg.append("defs");

    /*
    Create filter with id #drop-shadow.
    height = 130% so that the shadow is not clipped.
     */
    var filter = defs.append("filter")
      .attr("id", "blackshadows")
      .attr("height", "130%");

    /*
    SourceAlpha refers to opacity of graphic that this filter will be applied to
    convolve that with a Gaussian with standard deviation 3 and store result
    in blur.
     */
    filter.append("feGaussianBlur")
      .attr("in", "SourceAlpha")
      .attr("stdDeviation", 5)
      .attr("result", "blur");

    /*
    Translate output of Gaussian blur to the right and downwards with 2px.
    store result in offsetBlur.
     */
    filter.append("feOffset")
      .attr("in", "blur")
      .attr("dx", 5)
      .attr("dy", 5)
      .attr("result", "offsetBlur");

    /*
    Overlay original SourceGraphic over translated blurred opacity by using.
    Use feMerge filter. Order of specifying inputs is important.
     */
    var feMerge = filter.append("feMerge");

    feMerge.append("feMergeNode")
      .attr("in", "offsetBlur")
    feMerge.append("feMergeNode")
      .attr("in", "SourceGraphic");
  }
  // Background's coloring / picts.
  if (options) {
    if (options['background-image'] || options['backgroundimage']) {
      if (options['backgroundimage']) {
        options['background-image'] = options['backgroundimage'];
      }
      var pict = options['background-image'];
      var xloc = 0;
      var yloc = 0;
      if (typeof pict == 'object') {
        if (typeof pict.x == 'number') {
          xloc = pict.x;
        }
        if (typeof pict.y == 'number') {
          yloc = pict.y;
        }
        pict = pict['backgroundimage'];
      }
      // An array of picts given => make a random choice from them.
      if (pict.indexOf(',')) {
        // Trim off all white spaces.
        pict = pict.replace(/ /g, '');
        pict = pict.replace(/\t/g, '');
        var picts = pict.split(',');
        pict = picts[Math.floor(Math.random() * picts.length)];
      }
      var svg = d3.selectAll('#svg' + chartID);
      svg.append("svg:image")
        .attr("xlink:href", pict)
        .attr("width", options.width)
        .attr("height", options.height)
        .attr("x", xloc)
        .attr("y", yloc);
    }
    else if (options['background-color'] || options['backgroundcolor']) {
      if (options['backgroundcolor']) {
        options['background-color'] = options['backgroundcolor'];
      }
      var svg = d3.selectAll('#svg' + chartID);
      svg.append("rect")
        .attr("fill", options['background-color'])
        .attr("width", options.width)
        .attr("height", options.height);
    }
  }
  // End of all coloring functions.
}

/**
 * Setting new chart's margin around it.
 *
 * @param object $m
 *   containing default left, right, top & bottom margins of chart in px.
 * @param object $options
 *   containing user's own customized margins from options.
 */
function setMargin(m, options) {

  if (options.margin) {
    return options.margin;
  }
  return m;
}

/**
 * Setting new format for tickers of axis of chart.
 *
 * @param string $m
 *   containing valid D3 format of tickers.
 * @param string $options
 *   containing options set of chart.
 *
 * @return object
 *   D3 format of tickers of chart.
 */
function setFormat2(m, options) {
  if (options.format) {
    m = options.format;
  }
  return d3.format(m);
}

/**
 * Saving chart's modified own data set from data editor.
 *
 * @param string $header
 *   containing valid xmlheader of data set (optional).
 * @param string $databox
 *   containing id of html element of data set.
 * @param string $filename
 *   containing path of file to the data set on server.
 */
function saveData(header, databox, filename) {

  var mydata = encodeURIComponent(jQuery('#' + databox).val());
  mydata = jQuery('#' + header).html() + mydata;

  var query = rootpath + '../updatechart.php';
  my_cms = cms;
  jQuery.post(query, {
    infile: filename,
    cms: my_cms,
    indata: mydata
  }, function(data) {
    // Server must return 1 if data saved ok.
    if (data) {
      // Ok, refresh chart & its whole page.
      location.reload();
    }
    else {
      var notOk = 'Data Set failed to update on server side !';
      console.warn(notOK);
      alert(notOk);
    }
  });
}

/**
 * Converter between different data inputs on data editor.
 *
 * @param string $intype
 *   containing type of input data.
 * @param string $input
 *   containing id of input box from html form.
 * @param string $output
 *   containing id of output box from html form.
 * @param string $ctype
 *   containing type of chart for output's JSON.
 */
function dataConvert(intype, input, output, ctype) {

  var data = jQuery('#' + input).val();
  var tab = '';

  if (intype == 'json') {
    data = json22xml(jQuery.parseJSON(data), tab, true);
  }
  else if (intype == 'xml') {
    data = xml2json(data, tab, true);
  }
  else if (intype == 'tsv') {
    data = tsv2json(data, '', ctype);
  }
  else if (intype == 'csv') {
    data = tsv2json('', data, ctype);
  }

  jQuery('#' + output).empty();
  jQuery('#' + output).val(data);
}

/*
// Resizing of a chart on its popup window.
function svgscaler(svgid, dir) {

  var sizer = 0.1;

  // Old existing whole SVG element of chart.
  var svgH = parseInt(jQuery('#chart' + svgid).attr('height'));
  var svgW = parseInt(jQuery('#chart' + svgid).attr('width'));

  jQuery('svg').attr('height',svgH  +  dir*Math.round(svgH*sizer));
  jQuery('svg').attr('width',svgW + dir*Math.round(svgW*sizer));

  // Resize of chart itself.
  var svgG = '.g'+svgid; // Group of svg objects
  var oldT = jQuery(svgG).attr('transform');
  // Magic of resizing svg chart
  var diffW = Math.round(svgW*(1+sizer)/2);
  var diffH = Math.round(svgH*(1+sizer)/2);
//  console.info(svgW);
//  console.info(diffW);

  // For Pies: its center must move when scaled down/up too.
  if (diffW == diffH) {
    var moveC = ' translate(' + diffW + ',' + diffH + ') ';
    sizer = 1 + 2*sizer;
    jQuery(svgG).attr('transform', moveC + ' scale('+ sizer +') ');
  } else {
    sizer = 1+sizer;
    jQuery(svgG).attr('transform', oldT + ' scale('+ sizer +') ');
  }
  // Scaling window size around a chart.
  var w=parseInt(window.innerWidth);
  var h=parseInt(window.innerHeight);
  window.innerWidth = Math.round(w*sizer);
  window.innerHeight = Math.round(h*sizer);
}
 */

/**
 * Parse JSON data structure into TSV table.
 *
 * Note, @todo: still experimental & not working yet.
 */
function json2tsv(input) {

  var data = jQuery('#' + input).val();
  data = jQuery.parseJSON(data);
  if (typeof data[0] == 'object' && !data[0].value) {
    data = data[0];
  }

  var keys = new Array();
  var values = new Array();
  var labels = new Array();

  if (typeof data == 'object') {
    for (cell in data) {
      if (cell == 'key') {
        keys.push(data[cell]);
        if (cell == 'values') {
          for (i = 0; i < data[cell].length; i++) {
            var dcell = data[cell][i];
            if (dcell.label) {
              labels.push(dcell.label);
            }
            if (dcell.value || dcell.value == '0') {
              values.push(dcell.value);
            }
          }
        }
        // Simple case.
        if (+cell || cell == '0') {
          // Simple arr of tuples: [label,value]...[label,value].
          labels.push(data[cell]['label']);
          values.push(data[cell]['value']);
        }
      }
    }
  }
  var tab = '  ';
  var newline = '\n';
  var tsv = new Array();
  var tsvstr = '';

  tsv.push('keys' + tab + keys[0]);
  tsvstr = 'keys' + tab + keys[0];
  for (i = 0; i < values.length; i++) {
    tsvstr += newline + labels[i] + tab + values[i];
  }
}

/**
 * Exporting all types of chart's data.
 *
 * @param string $id
 *   containing id of SVG element of chart.
 * @param string $format
 *   containing type of export data.
 */
function exportData(id, format) {
  var data = '';
  if (typeof chartData != 'undefined') {
    data = chartData;
  }
  else {
    return;
  }
  var upDir = '../../../../';
  if (cms == 'drupal')
    upDir = '../../../../../';
  if (format == 'csv') {
    if (typeof chartData.infile != 'undefined') {
      if (chartData.infile != 'foo') {
        var link = '<button title="Export Chart Data from File"><a href="' +
          rootpath + upDir + data.infile +
          '">Download Data of Chart</a></button>';
      }
    }
    else {
      var dataout = 'Labels;' + data.title + "\n";
      if (data.series) {
        // Old: dataout = data.series[1] + ';' + data.title + "\n"; .
        dataout = data.series.join().replace(/,/g, ';') + "\n";
      }
      var cols = dataout.length;
      if (data.tsv) {
        dataout = data.tsv.replace(/\t/g, ';');
        cols = dataout.indexOf("\n") + 1;
      }
      else if (data.labels.length == data.values.length && data.datatype ==
        'direct') {
        for (line in data.labels) {
          if (data.values[line]) {
            var line = data.labels[line] + ';' + data.values[line] + "\n";
            dataout = dataout + line;
            if (line.length > cols) {
              cols = line.length;
            }
          }
        }
      }
      writeBuffer('Data', cols, dataout);
    }
  }
  else if (format == 'svg') {
    // Fetch chart's all svg elements out.
    var svgX = document.getElementById(id).outerHTML;
    writeBuffer('SVG Chart', 40, svgX);
  }
}

/**
 * Showing data set of chart for exporting it.
 *
 * @param string $title
 *   containing name of data type.
 * @param string $cols
 *   containing number how width is export box.
 * @param string $dataout
 *   containing data set (eq JSON/CSV/TSV in string).
 */
function writeBuffer(title, cols, dataout) {
  var s = "float:right; font-size:xx-small";
  var js = "removeMe(\'databuff\')";
  var closeMe =
    '<button style="' + s + '" title="Close" onclick="' + js + '">[X]</button>';
  var inBox = '<span id="databuff">' + closeMe + '<br />' + title +
    '<br /><textarea rows="20" cols="' + cols + '" style="color:darkgray">' +
    dataout + '</textarea></span>';
  jQuery("#databuffer").html(inBox);
}

/**
 * Showing data set of chart for exporting it.
 *
 * @param string $datafile
 *   containing name of file for data set.
 * @param string $id
 *   containing id of data box with data editor.
 */
function updateDataSet(datafile, id) {
  var my_cms = '&cms=' + cms;
  var query = rootpath + '../updatechart.php?file=' + datafile + my_cms;
  jQuery.getJSON(query, function(data) {
    jQuery("#" + id).val(data);
  });
}

/**
 * Removal of HTML element "me".
 *
 * @param string $obj
 *   containing id of removed html.
 */
function removeMe(obj) {
  $('#' + obj).remove();
}

/**
 * Create slider for labels of chart.
 *
 * @param string $id
 *   containing chart's id from its container.
 * @param object $dataC
 *   containing standard JSON formatted data set.
 * @param string $ctype
 *   containing type of chart.
 * @param object $allOpts
 *   containing standard set of options for chart.
 */
function aSlider(id, dataC, ctype, allOpts) {
    if (!dataC && allOpts.dataSet) {
	  dataC = allOpts.dataSet;
	}
    var sliderMap = forSlider(dataC, ctype);
    var sMax = sliderMap.labels.length - 1;
    var sMin = 0;
	var startMax = setStart(sMax, allOpts, 0);
	var startMin = setStart(sMin, allOpts, 1);
	var uiHistory = [];
	// One way to record + freeze 1st data set here.
	var firstDataSet = JSON.stringify(dataC);

    // End points fields init.
    var sm = sliderMap.labels;
	var updateChart = 
    startLabel('fromID' + id, sm, sMin, startMin, allOpts) +
    startLabel('toID' + id, sm, sMax, startMax, allOpts);
	if (updateChart) {
	  drawStart(dataC, startMin, startMax, firstDataSet, id, ctype);
	}

    jQuery(function() {
      jQuery("#labelSlider" + id).slider({
        range: true,
        min: sMin,
        max: sMax,
        values: [startMin, startMax],
        slide: function(event, ui) {
		  var sliderMap = forSlider(dataC, ctype);
		  var sm = sliderMap.labels;
		  jQuery("#fromID" + id).html(timeStamp(sm[ui.values[0]], allOpts));
		  jQuery("#toID" + id).html(timeStamp(sm[ui.values[1]], allOpts));
        },
        change: function(event, ui) {
		  var selectedRange = filterChart(dataC, ui.values[0], ui.values[1]);
		  if (chartData[id]) {
		    chartData[id].dataSet = selectedRange;
		  }
		  jQuery('#svg' + id).empty();
		  chartSelector(id, selectedRange, ctype, allOpts);
		  uiHistory.push([ui.values[0], ui.values[1]]);
		  dataC = JSON.parse(firstDataSet);
        }
      });
    });
    return sliderMap;

	function drawStart(data, min, max, firstDataSet, id, ctype) {
//	  if (typeof opts.rangeLabels == 'object') {
	    var selectedRange = filterChart(dataC, min, (max - min));
		  if (chartData[id]) {
		    chartData[id].dataSet = selectedRange;
		  }
		  jQuery('#svg' + id).empty();
		  chartSelector(id, selectedRange, ctype, allOpts);
		  dataC = JSON.parse(firstDataSet);
//	  }
	}

	function threeTimes(uiHistory) {
	  if (((uiHistory.length) % 4) == 0 && uiHistory.length != 0) {
	    console.warn('KNOWN BUG: need to redraw a chart from every 3 times !');
		return 1;
	  }
	  return 0;
	}

	function expandRange(uiHistory, ui) {
	  var last = uiHistory.length - 1;
	  if (last > -1) {
	    if (ui.values[0] < uiHistory[last][0] || uiHistory[last][1] < ui.values[1]) {
//	      window.alert('Sorry, expanding range is not available yet: just reload the page & draw chart again.');
		  return 1;
	    }
	  }
	  return 0;
	}

	function setStart(endVal, allOpts, min) {
	  if (typeof allOpts.rangeLabels == 'object') {
	    if (min && allOpts.rangeLabels.min) {
		  return allOpts.rangeLabels.min;
		}
		if (allOpts.rangeLabels.max) {
		  return allOpts.rangeLabels.max;
		}
	  }
	  return endVal;
	}

	function startLabel(id, sm, defStart, custom, allOpts) {
	  if (defStart != custom) {
	    jQuery('#' + id).html(timeStamp(sm[custom], allOpts));
		return 1;
	  }
	  jQuery("#" + id).html(timeStamp(sm[defStart], allOpts));
	  return 0;
	}

	function filterChart(okdata, fromMin, toMax) {
	 var newSet = [];
	 for (s = 0; s < okdata.length; s++) {
	  for (k = fromMin; k < toMax + 1; k++) {
	    if (okdata[s].values[k]) {
	      newSet.push(okdata[s].values[k]);
		}
	  }
	  okdata[s].values = newSet;
	  newSet = [];
	 }
	 return okdata;
	}

  function forSlider(dataS, ctype) {
    var set = dataS[0];
    if (ctype == 'pie' || ctype == 'donut') {
      set = dataS;
      set.values = [];
      for (j in set) {
	  if (j > -1)
	    set.values[j] = set[j];
	  }
    }
    var vals = [];
	var labels = [];
	if (typeof set != 'undefined') {
	 for (j in set.values) {
	 /*
	  var dataVal = set.values[j].value;
	  if (+dataVal || dataVal == 0) {
	    vals.push(dataVal);
	  }
	  */
	  if (set.values[j].label) {
	    labels.push(set.values[j].label);
	  }
	  if (set.values[j].x) {
	    labels.push(set.values[j].x);
	  }
	  if (set.values[j][0]) {
	    labels.push(set.values[j][0]);
	  }
	 }
	}
	var outRec = {'nros':vals, 'labels':labels};
	return outRec;
  }
}

/**
 * Generate a linear line for a given data set.
 *
 * @param string $obj
 *   containing id of removed html.
 */
function trendLineByLeastSquares(valuesX, valuesY, fastDraw) {

    var valuesLength = valuesY.length;
    // Count trivial X axis: 1, 2, 3... etc, if not defined.
    if (valuesX.length == 0) {
      for (i = 0; i < valuesLength; i++) {
	    valuesX[i] = i + 1;
	  }
    }
    else if (valuesLength != valuesX.length) {
        console.error('The parameters valuesX and valuesY need to have same size!');
    }

    /*
     * Nothing to do.
     */
    if (valuesLength === 0) {
        return false;
    }

    var x = 0;
    var y = 0;
    var sumX = 0;
    var sumY = 0;
    var sumXY = 0;
    var sumXX = 0;
    var minY = 0;
    var maxY = 0;
    /*
     * Calculate the sum for each of the parts necessary.
     */
    for (var v = 0; v < valuesLength; v++) {
        x = valuesX[v];
        y = valuesY[v];
        sumX += x;
        sumY += y;
        sumXX += x * x;
        sumXY += x * y;
        if (minY == 0 || minY > y) {
          minY = y;
        };
        if (maxY == 0 || maxY < y) {
          maxY = y;
        }
    }

    /*
     * Calculate m and b for formula:
     *   y = x * m + b
     */
    var count = valuesLength;
    var m = (count * sumXY - sumX * sumY) / (count * sumXX - sumX * sumX);
    var b = (sumY / count) - (m * sumX) / count;

    if (fastDraw) {
      var start = {'x':valuesX[0], 'y':linearY(valuesX[0], m, b)};
      var end = {'x':valuesX[count - 1], 'y':linearY(count - 1, m, b)};
      showHelp(m, b, [valuesX[0], valuesX[count - 1]]);
      return {'points':[start, end], 'm':m, 'b':b,
              'minY':minY, 'maxY':maxY, 'formula':'Y = ' + m + '*X + ' + b};
    }

    /*
     * We will make the x and y result line now.
     */
    var resultValuesX = [];
    var resultValuesY = [];
    var linePoints = [];
    for (var v = 0; v < valuesLength; v++) {
        x = valuesX[v];
        y = linearY(x, m, b);
        resultValuesX.push(x);
        resultValuesY.push(y);
        linePoints.push({'x':x, 'y':y});
    }
    showHelp(m, b, resultValuesX);
    return {'points':linePoints, 'Xs':resultValuesX, 'Ys':resultValuesY, 'm':m, 'b':b,
            'minY':minY, 'maxY':maxY, 'formula':'Y = ' + m + '*X + ' + b};

    function showHelp(m, b, Xs) {
      var msg = 'trend line: Y = ' + m.toFixed(2) + '*X + ' + b.toFixed(2);
      msg = msg + ', where Xs are: ' + Xs;
      msg = msg + '. Call: linearY(X, ' + m + ', ' + b + ') to get any Y from console.';
      console.info(msg);
    }
}

/**
 * Count value Y for any linear formula.
 */
function linearY(x, m, b) {
  return m * x + b;
}

/**
 * Count & add SVG line element for an existing chart.
 *
 */
function drawLine(svgID, data, chart, aLine, sTitle) {

var height = chart.height;
var width = chart.width;
var margins = chart.margin;

var vals = trendLineByLeastSquares([], data, false);
var trendPoints = vals.points;
var trend = {'minY':trendsData[svgID].minY, 'maxY':trendsData[svgID].maxY};

// Scales for X & Y coordinates.
var yScale = d3.scale.linear()
                             .range([height - margins.bottom - margins.top, margins.top])
                             .domain([trend.minY, trend.maxY]);
var xScale = d3.scale.linear()
                             .range([margins.left - margins.right, width - margins.right])
//                             .range([margins.left - margins.right, width - margins.right])
                             .domain([0, trendPoints.length]);

for (i = 0; i < trendPoints.length; i++) {
  trendPoints[i]["y"] = yScale(trendPoints[i]["y"]);
  trendPoints[i]["x"] = xScale(trendPoints[i]["x"]);
}
// Function for the path.
var lineCreator = d3.svg.line()
                 .x(function (d) { return d.x; })
                 .y(function (d) { return d.y; })
                 .interpolate("linear");

// Draw Line & and add is as an svg path.
var trendClass = 'nv-trends';
sTitle = 'serie' + Math.floor((Math.random() * 10000) + 1);
var trendID = 'trend' + svgID + sTitle;
var trendAttrs = {'id':trendID, 'class':trendClass, 'transform':'translate(0, 0)'};
var path = d3.select('#svg' + svgID)
               .append('g')
                 .attr(trendAttrs)
                 .append("path")
                   .attr("d", lineCreator(trendPoints))
                   .attr("stroke", aLine["stroke"])
                   .attr("stroke-width", aLine["stroke-width"])
                   .attr("fill", aLine["fill"]);

// Animation.
var totalLength = path.node().getTotalLength();
path
    .attr("stroke-dasharray", totalLength + " " + totalLength)
    .attr("stroke-dashoffset", totalLength)
    .transition()
    .duration(1000)
    .ease("linear")
    .attr("stroke-dashoffset", 0);

return trendID;
}

/**
 * Refreshing trend line status after chart's change.
 *
 */
function trendUpdates(svgID, trendsClass, serie, chart, aLine, sTitle) {
  jQuery(".nv-trends").remove();
  // ToDo: recount & draw trends again.
//  drawLine(svgID, trendsData[svgID][serie], chart, aLine, sTitle);
}

/**
 * Create global memory for trend line(s) / existing chart.
 *
 */
function globalizeTrendData(chartID) {
  // Globals for redrawing.
  if (typeof trendsData == 'undefined') {
    trendsData = {};
    trendsData[chartID] = {};
    trendsData[chartID]['minY'] = 0;
    trendsData[chartID]['maxY'] = 0;
  }
}

/**
 * Generate linear equation from 2 known data points of price & volume
 * by returning its slope (m) & constant (b).
 *
 * Starting point you have 2 equations in which both has formula for 2 points (dataT1 & dataT2):
 *   (m * price1 + c = soldPcs1,  m * price2 + c = soldPcs2)
 *
 * By solving this set of formulas in linear algebra m & c are found.
 *
 */
function linearFormula(dataT1, dataT2) {
  var diffSoldPcs = dataT1.soldPcs - dataT2.soldPcs;
  var diffPrices = (-dataT1.price) - (-dataT2.price);
  var m = diffSoldPcs / (-diffPrices);
  var b = dataT1.soldPcs - dataT1.price * m;
  return {slope:m, constant:b};
}

/**
 * Draw a set of linear lines by using simplechart in the same chart +
 * show it on container or own window. Example call:
 * 
 *   drawLinearFormulas([66,77,88], [1007,1077,1777], ['2016-1','2015-12'], {min:1000, max:3000, step:10}, 'multibar', {height:200, width:450}, 'Price Trends')
 *
 * It supports the types: multibar, simpleline, scatterbubble.
 */
function drawLinearFormulas(pcs, prices, labels, outValues, ctype, dims, title, id, opts) {
  if (!outValues.max || !outValues.min || !outValues.step) {
    return false;
  }
  if (pcs.length != prices.length || pcs.length != labels.length - 1) {
    return false;
  }
  var range = [];
  for (i = outValues.min; i < outValues.max + 1; i = i + outValues.step) {
    range.push(i);
  }
  var moments = [];
  for (i = 0; i < pcs.length - 1; i++) {
    var dataT1 = {soldPcs:pcs[i], price:prices[i]};
	var dataT2 = {soldPcs:pcs[i + 1], price:prices[i + 1]};
	moments.push(linearFormula(dataT1, dataT2));
  }
  var drawPoints = {};
  var allSets = [];
  for (m in moments) {
  for (i = 0; i < range.length; i++) {
    var pcs = moments[m].slope * range[i] + moments[m].constant;
    drawPoints[range[i]] = +pcs.toFixed(0);
  }
   allSets.push(drawPoints);
   drawPoints = {};
  }
  var data4Chart = makeJSON(allSets, labels);
  if (!id) {
    var id = Math.floor(Math.random() * 10000) + 1;
    jQuery("body").append('<div id="chart' + id + '"></div>');
  }
  if (!dims) {
    var dims = {height:300, width:450};
  }
  jsChart(id, data4Chart, ctype, {}, chartOpts(dims));
  dialogMe2('chart' + id, title, dims);

  function makeJSON(points, series, ctype) {
    var out = [];
	var dataSets = []
//	for (key in series) {
	 for (m in points) {
	  for (i in points[m]) {
	    out.push({x:+i, y:+points[m][i]});
	  }
	  dataSets.push({values:out, key:series[m]});
	  out = [];
	 }
//	}
	return dataSets;
	
	function pointsOfMoment() {
	
	}
  }
  function chartOpts(dims) {
    var opts = {"colors":"","gradColors":"0","backgroundcolor":"darkgray","xaxis":{"hide":false,"style":"font-size:10px; fill:navy","transform":"rotate(0 -20,0)"},"yaxis":{"hide":false,"style":"font-size:12px; fill:blue","transform":"rotate(0 -20,0)"},"showControls":"1","toolTips":"1","showLegend":"1","showValues":"1","calculator":"0","Popup":"1","chartpicker":"1","trendLine":"0","autoColors":"1","exports":"1","rangeLabels":"1","shadows":"Black","gmenu":"post","gformat":"json","noPopup":"0","inPopup":false,"noResize":true,"title":"Own Data Chart: simpleline","height":dims.height,"width":dims.width};
	return opts;
  }
}

function dialogMe2(id, desc, dims) {
  var h = dims.height;
  var w = dims.width;
  if (!h || !w) {
    h = 400;
    w = 800;
  }
  jQuery(function() {
    jQuery("#" + id).dialog({
      width: (w + 90),
      height: (h + 140),
      title: desc,
      autoOpen: true,
      show: {
        effect: "blind",
        duration: 1500
      },
      hide: {
        effect: "explode",
        duration: 1500
      }
    });
    jQuery("#opener").click(function() {
      jQuery("#" + id).dialog("open");
    });
  });
}

/**
 * Check if user is logged in now or not on WordPress.
 *  + what are the user levels there.
 *
 * Not enough caps leads to dimming some parts with charts gallery.
 */
function checkLogin() {
  var query = rootpath + '../wordpress/logged_in.php';
  jQuery.getJSON(query, function(data) {
	jQuery(document).ready(function(){
	if (data.caps) {
	  if (data.caps.length == 0) {
		jQuery(".createCharts").attr("disabled", true);
		var warning = "WARNING: you need to be logged in to publish new charts !";
		jQuery(".createCharts").attr("title", warning);
		jQuery(".createCharts").attr("style", "color:red");
	  }
	}
	});
  });
}