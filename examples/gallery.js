/**
 * @file
 * Generating the chart pickers for real data sets.
 */
 
/**
 * Build gallery of charts for chart picker.
 */
function nvd3Charter(myID, backgrounds) {

  chartEnvilope = {'id':myID, 'picts':backgrounds};

  // For debug of XML demo files = true.
  var xml = false;

  // All valid names of chart types.
  var types = ['simpleline', 'lineplusbar', 'scatterbubble', 'viewfinder',
    'multibar', 'cumulativeline', 'stackedarea', 'discretebar',
    'horizontalmultibar', 'donut', 'pie', 'bullet'];

  var pcs = types.length;

   // Print out chart containers.
  genContainers(myID, pcs);
  activateBM();
  // Set def options of chart behaviors.
  if (typeof galleryOpts == 'undefined') {
    galleryOpts = initGalleryOpts(pcs);
  }
  // Generate all types of charts.
  var allOpts = [];
  for (i = 0; i < pcs; i++) {
	allOpts[i] = redrawOpts(i, types[i]);
	var dims = {height:allOpts[i].height, width:allOpts[i].width};
    jsChart(i, '', types[i], dims, allOpts[i]);
  }
  return;

  // Start state of all charts options created here.
  function initGalleryOpts(pcs) {
    var allOpts = galleryOpsUI();
	var id = 0;
	var defVal = 0;
	var galleryOpts = [];
	for (var c = 0; c < pcs; c++) {
	  galleryOpts[c] = {};
      for (var o in allOpts) {
	    galleryOpts[c][o + c] = allOpts[o][defVal];
	  }
    }
	return galleryOpts;
  }

  function reSizeOpts() {
    jQuery(function() {
      jQuery( ".resizable" ).resizable();
    });
  }

  function redrawOpts(i, type) {
    var opts4Chart = {
      xtime: false,
      showLegend: true,
      xmldemo: xml,
      shadows: 'Black',
      backgroundcolor: 'darkgray',
      picts: backgrounds,
      height: 400,
      width: 500
    };
    if (type == 'cumulativeline' || type == 'stackedarea' || type ==
      'lineplusbar') {
      opts4Chart.xtime = true;
    }
	var gOpts = [];
    if (typeof galleryOpts != 'undefined') {
	  gOpts = galleryOpts[i];
	  if (gOpts['backgroundimage' + i]) {
         opts4Chart.backgroundimage = rootpath + '../' +
		 gOpts['backgroundimage' + i];
	  }
      if (gOpts['colors' + i]) {
        opts4Chart.colors = gOpts['colors' + i];
	  }
      if (galleryOpts[i]['height' + i] & galleryOpts[i]['width' + i]) {
	    opts4Chart.height = galleryOpts[i]['height' + i];
	    opts4Chart.width = galleryOpts[i]['width' + i];
	  }
      if (gOpts['rangeLabels' + i] != "0") {
        opts4Chart.rangeLabels = gOpts['rangeLabels' + i];
	  }
	}
	return opts4Chart;
  }

  function genContainers(myID, pcs) {
  var tabs = '';
  var charts = '';

  for (var i = 0; i < pcs; i++) {
    var myChart = '<span id="chart' + i + '">Empty Chart (' + (i + 1) +
      ') Container</span>';
    tabs = tabs + '<li><a href="#tabs-' + i + '" style="font-size:10px">' +
      types[i] + '</a></li>';
    charts = charts + '<div id="tabs-' + i + '">' + myChart + '</div>';
  }

  var buildTabs =
    '<script> jQuery(function() { jQuery( "#tabs" ).tabs(); }); </script>';

  var bookmark = bmLink();
  var msg =
    "Select here: your chart type, data source, and where new chart can show up.<br />";
  var res = bookmark + msg + buildTabs + '<div id="tabs"><ul>' + tabs + '</ul>' + charts +
    '</div>';

  // Print out chart's container.
  jQuery("#" + myID).empty();
  jQuery("#" + myID).html(res);
  }
  
  function bmLink() {
    var icon = '<img src="' + rootpath + '../icons/star.png">';
    var desc = 'Remember your gallery later & create fast new charts';
    var aLink = '<a id="bookmarkme" href="#" rel="sidebar" title="' + desc + '">'
      + icon + ' Bookmark Gallery</a>';
    return '<b style="float:right">' + aLink + '</b><br />';
  }

  function activateBM() {
      jQuery(function() {
        jQuery('#bookmarkme').click(function() {
            // Mozilla Firefox Bookmark.
            if (window.sidebar && window.sidebar.addPanel) {
                window.sidebar.addPanel(document.title,window.location.href,'');
            // IE Favorite.
            } else if(window.external && ('AddFavorite' in window.external)) {
                window.external.AddFavorite(location.href,document.title);
            // Opera Hotlist.
            } else if(window.opera && window.print) {
                this.title=document.title;
                return true;
            // webkit - safari/chrome.
            } else {
                alert('Press ' + (navigator.userAgent.toLowerCase().indexOf('mac') != - 1 ? 'Command/Cmd' : 'CTRL') + ' + D to bookmark this page.');
            }
        });
    });
  }
}

/**
 * Old gallery of charts for chart picker.
 *
 * HTML table format.
 */
function nvd3Demos(myID, pcs, xmldemo) {

  // XML versions of demos asked or not.
  var xml = false;
  if (xmldemo) {
    xml = true;
  }

  // Generate empty table for envelope.
  var html = '';
  for (i = 0; i < pcs; i++) {
    html = html + '<tr><td id="chart' + i + '">Empty Chart (' + (i + 1) +
      '.) Container</td></tr>';
  }
  html = '<table>' + html + '</table>';

  // Print it out into chart's container.
  jQuery("#" + myID).html(html);

  /*
  All valid names of chart types

  simpleline  linePlusBar  scatterbubble  viewfinder  multibar  multibar
  cumulativeline  stackedarea  discretebar  horizontalmultibar  donut  pie  bullet
   */

  pcs--;
  jsChart(pcs, '', 'linePlusBar', {
    height: '250',
    width: '350'
  }, {
    showLegend: true,
    tooltips: true,
    transitionDuration: 3000,
    useInteractiveGuideline: true,
    xtime: true,
    xmldemo: xml,
    shadows: 'black',
    backgroundcolor: 'SandyBrown'
  });
  pcs--;

  jsChart(pcs, '', 'bullet', {
    height: '250',
    width: '300'
  }, {
    showLegend: true,
    xmldemo: xml
  });
  pcs--;

  jsChart(pcs, '', 'simpleline', {
    height: '250',
    width: '300'
  }, {
    showLegend: false,
    transitionDuration: 3000,
    xmldemo: xml,
    shadows: 'black',
    domain: {
      minY: -1.5,
      maxY: 2
    }
  });
  pcs--;

  jsChart(pcs, '', 'scatterbubble', {
    height: '250',
    width: '300'
  }, {
    showLegend: true,
    xmldemo: xml,
    shadows: 'black'
  });
  pcs--;

  jsChart(pcs, '', 'viewfinder', {
    height: '250',
    width: '300'
  }, {
    showLegend: true,
    xmldemo: xml,
    shadows: 'black'
  });
  pcs--;

  jsChart(pcs, '', 'multibar', {
    height: '250',
    width: '300'
  }, {
    showLegend: false,
    xmldemo: xml,
    shadows: 'black'
  });
  pcs--;

  jsChart(pcs, '', 'cumulativeline', {
    height: '250',
    width: '300'
  }, {
    showLegend: false,
    xmldemo: xml,
    xtime: true,
    shadows: 'black',
    backgroundcolor: 'SkyBlue'
  });
  pcs--;

  var bg_pict = rootpath + '../backgrounds/';
  jsChart(pcs, '', 'stackedarea', {
    height: '250',
    width: '300'
  }, {
    showLegend: false,
    xmldemo: xml,
    xtime: true,
    shadows: 'black',
    backgroundimage: bg_pict + 'continents1.jpg'
  });
  pcs--;

  jsChart(pcs, '', 'discretebar', {
    height: '250',
    width: '300'
  }, {
    color: ['red', 'green', 'blue', 'orange', 'brown', 'navy', 'yellow',
      'black'],
    xmldemo: xml,
    shadows: 'black',
    backgroundimage: bg_pict + 'continents11.jpg',
    minY: -200
  });
  pcs--;

  jsChart(pcs, '', 'horizontalmultibar', {
    height: '250',
    width: '450'
  }, {
    showLegend: false,
    xmldemo: xml,
    shadows: 'black'
  });
  pcs--;

  jsChart(pcs, '', 'donut', {
    height: '250',
    width: '300'
  }, {
    showLegend: true,
    xmldemo: xml,
    shadows: 'black'
  });
  pcs--;

  jsChart(pcs, '', 'pie', {
    height: '250',
    width: '300'
  }, {
    showLegend: true,
    xmldemo: xml,
    shadows: 'black'
  });

}

function galleryOpsUI() {
    // Options of gallery: [init state, its title, UI element type].
    var allOpts = {
                   'colors':['', '<b>Colors of Markers</b>', 'IB', 'Mark colors of data points by html names or hex codes, colors are used for single data points / series based on created new chart & type'],
                   'gradColors':['0', 'Smooth gradient of data coloring', 'CB', 'Generating automatically smooth  change of colors for data points based on their values or order of reading (eq value:false) when possible for a chart type'],
                   'backgroundimage':['', '<b>Background Pic</b>', 'IB', 'Path to the background image of chart on plugins folder (use \'/\' letter to get pict from blog root, eq: /abc.jpg)'],
                   'xaxis':['1', 'Labels visible with chart', 'CB', 'Turns labels of data on axis of chart on/off (mostly on x-axis)'],
                   'yaxis':['1', 'Values visible with chart', 'CB', 'Turns values of data on axis of chart on/off (mostly on y-axis)'],
                   'showControls':['1', 'Show Controls', 'CB', 'Activate buttons of different visual views for chart type if that is available on popup window'],
                   'toolTips':['1', 'Show Tool Tips', 'CB', 'Show bubbles of data points of chart when user moves cursor over them'],
                   'showLegend':['1', 'Show Legend', 'CB', 'Show a legend of data for chart and let user to turn them on & off by its buttons'],
                   'showValues':['1', 'Show Values on Chart', 'CB', 'Show data points values together with its marker (eq discretebar & horizontalmultibar type of charts'],
                   'calculator':['0', 'Chart Calculator', 'CB', 'Interactive chart calculator lets user to apply free formula for all data points of chart & update it visually neatly'],
                   'Popup':['1', 'Popup Chart', 'CB', 'Show popup button & let bonus operations to happen for chart there'],
                   'chartpicker':['1', 'Chart Picker', 'CB', 'Let look at same data set by different chart types on popup window'],
                   'trendLine':['0', 'Trend Line(s)', 'CB', 'Generate linear trend line(s) for all data points of chart'],
                   'autoColors':['1', 'Colors of Lines & Markers from Data', 'CB', 'Colors of markers of data are copied from the elements of input table (eq its html elements)'],
                   'exports':['1', 'Data Exporting (Excel/SVG/Print)', 'CB', 'Export all data points from chart in numeric, graphical, or paper forms when popup window of chart opens'],
                   'rangeLabels':['1', 'Range Slider of Labels', 'CB', 'Show visual slider to limit visible data for labels of chart'],
                   'shadows':['Black', 'Shadows of Lines & Markers', 'CB', 'Select if those cool shadows are ON for markers & lines of data'],
                   'gmenu':['post', 'Article Type', 'DD', 'Select if publication is permanent info or more like a news in time on content management system (Wordpress / Drupal)'],
                   'gformat':['json', 'Data Input', 'DD', 'Select from where is input dataset coming from']
                  };  // noPopup
	return allOpts;
}

// Global to store 1st data sets.
if (typeof origDataSet == 'undefined') {
  origDataSet = [];
}

/**
 * Gallery of charts for charts picker.
 *
 * HTML table format for WordPress & Drupal 7.
 *
 */
function demoShows(id, data, type, options) {
    options.height = 400;
    options.width = 500;
    options.xaxis = {"hide":false,"style":"font-size:10px; fill:navy","transform":"rotate(0 -20,0)"};
    options.yaxis = {"hide":false,"style":"font-size:12px; fill:blue","transform":"rotate(0 -20,0)"};

  // All data templates for gallery.
  var demos = {
    lineplusbar: 'linePlusBarData.json',
    simpleline: 'simpleLineData.json',
    cumulativeline: 'cumulativeLineData.json',
    stackedarea: 'stackedAreaData.json',
    discretebar: 'discreteBarData.json',
    horizontalmultibar: 'multibarData.json',
    pie: 'pieData.json',
    donut: 'pieData.json',
    bullet: 'bulletData.json',
    scatterbubble: 'scatterData.json',
    multibar: 'multiData.json',
    viewfinder: 'viewFinderData.json'
  };
  if (options.xmldemo) {
    demos[type] = demos[type].replace(/json/g, 'xml');
  }
  // Home dir of demo data sets.
  var infile = 'wp-content/plugins/nvd3/data/' + demos[type];
  // Global URL of root set by shortcode of WP.
  if (rootpath) {
    infile = rootpath + demos[type];
  }

  var aform = jQuery("#chartForm" + id).html();
  if (typeof aform != 'string') {
/*
  var desc = 'Data File: data/' + demos[type];
  var msg = '<b class="title_nvd3" title="' + desc + '">Chart Type: ' + type +
            '<sup> ?</sup></b>';
  msg = '<br /><a href="' + infile + '" target="_blank">' + msg + '</a>';
*/
  var ctype = '&type=' + type;
  var filepath = '&filepath=' + demos[type];
  var tt = 'Clone data set from this chart into new draft for preview.';

  var postPage = menuPagePost(id);
  var query = rootpath + "../postchart.php?type=" + type + postPage.qcms;
  var ctype = demos[type];
  /*
  var mbutt = '<button style="cursor:pointer" onclick="newpost2(' + sQuote(
    query) + ', ' + sQuote(ctype) + ', ' + sQuote(idmenu) + ', ' + sQuote(
    idmenu2) + ')" title="' + tt + '">New Chart</button>';
	*/
  var mbutt = '<button class="createCharts" style="cursor:pointer" onclick="newpost2(' + sQuote(
    query) + ', ' + sQuote(ctype) + ', ' + id + 
    ')" title="' + tt + '">New Chart</button>';
/*
  var trends = '';
  var JS = ' onclick="galleryCheckBX(' + id + ', \'calculator\')" ';
  var calc = '<input id="calculator' + id + '" type="checkbox" value="0" ' + JS + '>Chart Calculator</input>';
  if (id == 4 || id == 7) {  // " name="trends' + id + '" " name="calculator' + id + '"
    JS = ' onclick="galleryCheckBX(' + id + ', \'trends\')" ';
    trends = '<input id="trends' + id + '" type="checkbox" value="0"' + JS + '>Trend Line(s)</input>';
  var optsBox = '<div id="optsEnvelope' + id + '" style="display:none">' + calc + trends + '</div>';
  }
  */
  var shortmsg = 'Add this into: ';
  aform = settingsButt(id) + '<br />' + shortmsg + postPage.menu + ' from ' +
               formatsMenu(id) + mbutt + '<br />' + urlInput(id, infile);

  // Buffer into DOM all html generation of form.
  aform = '<div id="chartForm' + id + '">' + aform + '<div>';
  jQuery("body").append(aform);
  }

  // Read html from DOM buffer.
  var msg = jQuery("#chartForm" + id).html();

  buildOptions(id, options);

  options.gallery = true;
  if (infile.indexOf(".json") > 0) {
    d3.json(infile, function(error, data) {
	  initLabelSlider(id, data, type, options);
      console.info('Drawing chart "' + type + '" from a file: data/' +
        demos[type]);
      chartSelector(id, data, type, options);
      jQuery("#chart" + id).append(msg);

	  // No sense to have any slider for these.
      var blocked = ['bullet', 'pie', 'donut'];
      // NVD3 do not like hiding of xvalues + crash.
      if (!options.xaxis.hide && blocked.indexOf(options.type) == -1) {
//        aSlider(id, origDataSet[ctype], type, options);
      }
    });
  }
  else if (infile.indexOf('.xml') > 0) {
    // Lib d3.xml had its parsing problems of xml: read it as  a text.
    d3.text(infile, function(error, data) {
      data = xml2json(data, '  ');
      chartSelector(id, data, type, options);
      console.info('Drawing chart "' + type + '" from a XML file: data/' +
        demos[type]);
      jQuery("#chart" + id).append(msg);
    });
  }
  if (typeof chartData == "undefined") {
    chartData = [];
  }
  chartData[id] = options;
  chartData[id].dataSet = data;

  return;

  function menuPagePost(id) {
    var qcms = '';
    // WordPress CMS publications is default.
    var mpostpage =
      '<option value="post">New Post</option><option value="page">New Page</option>';
   if (cms) {
    if (cms == 'drupal') {
      mpostpage =
        '<option value="post">New Article</option><option value="page">New Basic Page</option>';
      qcms = '&cms=' + cms;
    }
   }
   var idmenu = "gmenu" + id;
   var JS = ' onchange="galleryPop(' + id + ', \'gmenu\')" ';
   mpostpage = '<select id="' + idmenu + '" ' + JS + '>' + mpostpage + '</select>';
   return {"menu":mpostpage, "qcms":qcms};
  }

  function settingsButt(id) {
    var m = "Setting chart's options";
    var ico = '<img src="' + rootpath + '../icons/settings.png">';
    var openSettings = ' <button onclick="gallerySettings(\'optsEnvelope' + id +
                     '\')" style="float:left" title="' + m + '">' + ico + '</button>';
    return openSettings;
  }

  function urlInput(id, infile) {
    var desc = 'Data file from URL can be in .CSV / .TSV / .JSON / .XML formats';
    var urlBox = '<div id="urlBox' + id + '" style="display:none"><br />' +
                 openButt(infile) + '<br /><input id="urlPath' + id +
                 '" type="text" size="60" title="' + desc + '" value="' + infile + '"></input><div>';
	return urlBox;

	function openButt(file) {
	  return '<button><a href="' + file + '" target="_blank">URL for Open Data</a></button>';
	}
  }

  function formatsMenu(id) {

  var helps = [];
  helps.push('Data input from JSON file');
  helps.push('Data input from XML file');
  helps.push('Data input from CSV file');
  helps.push('Data input from TSV file');
  helps.push('Data input from direct JSON/JavaScript function: values, labels, series, and links');
  helps.push('Data input from HTML of article');
  helps.push('Data input from simple table (OpenOffice compatible)');
  helps.push('Data input from 2x2 table (OpenOffice compatible)');
  helps.push('Data input from MySQL database');
  helps.push('Data input from URL path');

  var mformat = '<option value="json" title="' + helps[0] +
    '">JSON data</option><option value="xml" title="' + helps[1] +
    '">XML data</option><option value="csv" title="' + helps[2] +
    '">CSV data</option><option value="tsv" title="' + helps[3] +
    '">TSV data</option><option value="direct" title="' + helps[4] +
      '">Direct input</option><option value="cells" title="' + helps[5] +
      '">Simple text</option>';
  // ToDo: test these on Drupal 7 too.
  if (cms == 'wordpress') {
    mformat = mformat + '<option value="table" title="' + helps[6] +
    '">Table (from article)</option><option value="table2" title="' + helps[7] +
    '">BIG table (2x2 dim.)</option><option value="mysql" title="' + helps[8] +
    '">MySQL database</option><option value="url" title="' + helps[9] +
    '">URL address</option>';
  }
  var JS = ' onchange="galleryPop(' + id + ', \'gformat\')" ';
  mformat = '<select id="gformat' + id + '"' + JS + '>' + mformat + '</select>';

  return mformat;
  }
  // Print slider's end points (containers).
  function fromTo(id, s) {
    return '<b id="' + id + '" style="color:gray; ' + s + '"></b>';
  }

  // Check starting state of each setting.
  function getStart(id, label, newDef) {
    if (typeof galleryOpts == 'undefined') {
	  return newDef;
	}
	return galleryOpts[id][label + id];
  }

  // Start state of all charts options created here.
  function initGalleryOpts(pcs, allOpts) {
	var id = 0;
	var defVal = 0;
	galleryOpts = [];
	for (var c = 0; c < pcs; c++) {
	  galleryOpts[c] = {};
      for (var o in allOpts) {
	    galleryOpts[c][o + c] = allOpts[o][defVal];
	  }
    }
	// Global to prevent reinits of galleryOptions.
	galleryReady = true;
  }

  function buildOptions(id, opts) {
    var allOpts = galleryOpsUI();
    if (typeof jQuery("#optsEnvelope" + id) == 'string') {
	  return '';
	}
	var defVal = 0;
	var title = 1;
	var htmlUI = 2;
	var help = 3;
	var stuff = '<h4>Behavior & Look</h4>';
	var othersDone = 0;
    for (var o in allOpts) {
//	  console.info(allOpts[o][htmlUI]);
      if (allOpts[o][htmlUI] == 'CB') {
	    if(!othersDone) {
//		  stuff = stuff + '<b>Other Settings</b><br/>';
		  othersDone = 1;
		}
        stuff = stuff + makeCB(id, o, allOpts[o][defVal], allOpts[o][title], allOpts[o][help]) + '<br />';
      }
      if (allOpts[o][htmlUI] == 'IB') {
	    var t = allOpts[o][title];
        stuff = stuff + makeIB(id, o, allOpts[o][defVal], allOpts[o][title], allOpts[o][help], opts) + '<br />';
      }
    }
    var e = '<div id="optsEnvelope' + id + '" title="Chart Options" style="display:none">' + stuff + '</div>';
    jQuery("body").append(e);

    function makeCB(id, label, defVal, title, help) {
	  // No trends if no multibar / discretebar allowed.
	  if (label == 'trendLine' && !(id == 4 || id == 7)) {
	    return '';
	  }
      var JS = ' onclick="galleryCheckBX(' + id + ', \'' + label + '\')" ';
	  defVal = getStart(id, label, defVal);
      var selected = '';
      if (defVal != 0) {
	    selected = ' checked ';
	  }
      var CB = '<input id="' + label + id + '" type="checkbox" value="' + defVal +
          '" ' + JS + selected + ' title="' + help + '"> ' + title + '</input>';
      return CB;
    }
    function makeIB(id, label, defVal, title, help, opts) {
	  defVal = getStart(id, label, defVal);
      var JS = ' onchange="galleryCheckIB(' + id + ', \'' + label + '\')" ';
      var IB = title + ': <input id="' + label + id + '" type="text" value="' + defVal +
          '" ' + JS + ' title="' + help + '"> </input>';
      if (label == 'colors') {
         IB = IB + genColorPicker(id);
      }
      if (label == 'backgroundimage') {
         IB = '<p>' + genBackMenu(id, opts.picts) + IB + '</p><br/><br/>';
         IB = IB + genSizeBox(opts.height, opts.width, id);
      }
      return IB;
    }
  }
  function genColorPicker(id) {
    var JS = ' onchange="updateColors(this.jscolor, ' + id + ')" ';
    var ss = ' size = "7" ';
    var jsClass = 'input class="jscolor" ';
    var setUpCols = ['value="000057"', 'value="008080"', 'value="#7b7b7b"', 'value="#ffa338"'];
    var cp = '<br />Design owns: ';
      cp = cp + '<' + jsClass + setUpCols[0] + ss + JS + '>';
      cp = cp + '<' + jsClass + setUpCols[1] + ss + JS + '>';
      cp = cp + '<' + jsClass + setUpCols[2] + ss + JS + '>';
      cp = cp + '<' + jsClass + setUpCols[3] + ss + JS + '>';
    return cp + '<br />';
  }
  function genBackMenu(id, backpicts) {
    var opts = '<option value="">- Select Other -</option>';
    for (pict in backpicts) {
      var p = backpicts[pict];
      if (p != '.' && p != '..') {
        opts = opts + '<option value="' + p + '">' + p + '</option>';
      }
    }
    // var defPic = rootpath + '../backgrounds/sky.jpg';
    var ss = 'float:right; height:50px; width:100px; border: 4px outset gray';
    var sample = '<img id="backSample' + id + '" style="' + ss + '" src=""><br/>';
    var JS = ' onchange="setBackgroundPict(' + id + ', this.value)" ';
    return sample + '<span style="float:right"><select ' + JS + '>' + opts + '</select> ' + '</span>';
  }
  function genSizeBox(h, w, id) {
    var JS = ' onchange="setChartSize(this.value, this.id);" ';
    var form = 'Height<br/><input id="chartH' + id + '" class="chartH" ' + JS +
               'type="text" value="' + h + '" size="4"><br/>' +
               'Width<br/><input id="chartW' + id + '" class="chartW" ' + JS +
               'type="text" value="' + w + '" size="4">';
    var title = '<b class="ui-widget-header">Dimensions Visually</b>';
    var ss = ' style = "width:' + w + 'px; ' + ' height: ' + h + 'px; background-color:gray" ';
    var sizeB = '<br /><img class="sizeBox" src="' + rootpath + '../icons/chart_dims.png" ' + ss + '>';
    var tit = '<b>Size of Chart</b><br/>';
    ss = ss = ' style = "vertical-align:top;" ';
    var layout = tit + '<table><tr ' + ss + '><td>' + form + '</td><td>' + sizeB + '</td></tr></table>';
    return layout;
  }
}

function setChartSize(newVal, id) {
  // All chart dims + text boxes are updated by class name as a group.
  if (id.indexOf('chartH') > -1) {
    oldW = jQuery('.sizeBox').width();
//    jQuery('.sizeBox').attr('style', 'height:' + newVal + 'px; width:' + oldW + 'px');
    reDraw('.sizeBox', newVal, oldW);
    jQuery('.chartH').val(newVal);
  }
  else if (id.indexOf('chartW') > -1) {
    oldH = jQuery('.sizeBox').height();
//    jQuery('.sizeBox').attr('style', 'height:' + oldH + 'px; width:' + newVal + 'px');
    reDraw('.sizeBox', oldH, newVal);
    jQuery('.chartW').val(newVal);
  }
  for (g in galleryOpts) {
    galleryOpts[g]['height' + g] = jQuery('#chartH' + g).val();
    galleryOpts[g]['width' + g] = jQuery('#chartW' + g).val();
  }
  function reDraw(boxClass, h, w) {
    jQuery(boxClass).attr('style', 'height:' + h + 'px; width:' + w + 'px');
  }
}

function setBackgroundPict(id, pict) {
  if (!pict) {
    jQuery('#backgroundimage' + id).val('');
    jQuery('#backSample' + id).attr('src', '');
    galleryOpts[id]['backgroundimage' + id] = "";
    return;
  }
  var p = 'backgrounds/' + pict;
  jQuery('#backgroundimage' + id).val(p);
  var img = rootpath + '../backgrounds/' + pict;
  jQuery('#backSample' + id).attr('src', img);
  galleryOpts[id]['backgroundimage' + id] = p;
}

function gallerySettings(id) {
      var opts = {
        autoOpen: true,
        width: 600,
        height: 450,
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
            // Redraw whole gallery.
            var ce = chartEnvilope;
            jQuery('#' + ce.id).empty();
            nvd3Charter(ce.id, ce.picts);
            jQuery(this).dialog("close");
          }
        }
      };
      jQuery(function() {
        jQuery("#" + id).dialog(opts);
      });
}

function galleryCheckBX(cNro, idBX) {
  idBX = idBX + cNro;
  var grads = 0;
    if (idBX.indexOf('gradColors') > -1) {
	  grads = 1;
	}
  if (galleryOpts[cNro][idBX] == '1') {
    galleryOpts[cNro][idBX] = '0';
	if (grads) {
	  jQuery("#colors" + cNro).val("");
	}
    return;
  }
  galleryOpts[cNro][idBX] = '1';
  if (grads) {
     var sampleGradient = {startbar:"red", endbar:"lime", values:true};
	 idBX = 'colors' + cNro;
     jQuery("#" + idBX).val(JSON.stringify(sampleGradient));
	 galleryOpts[cNro][idBX] = sampleGradient;
  }
}

function galleryCheckIB(cNro, idIB) {
  idIB = idIB + cNro;
  var textIn = jQuery('#' + idIB).val();
  // Test gradients object.
  if (textIn.indexOf('startbar') > -1) {
    textIn = JSON.parse(textIn);
  }
  galleryOpts[cNro][idIB] = textIn;
}

function galleryPop(cNro, idPop) {
  var idChart = idPop + cNro;
  var selected = jQuery("#" + idChart).val();
  galleryOpts[cNro][idChart] = selected;
  if (idPop == 'gformat') {
   jQuery("#urlBox" + cNro).attr("style", "display:none");
   if (selected == 'url') {
    jQuery("#urlBox" + cNro).attr("style", "display:inline");
   }
  }
}

function updateColors(jscolor, id) {
  var oldies = jQuery('#colors' + id).val();
  var sep = '';
  if (oldies) {
    sep = ',';
  }
  jQuery('#colors' + id).val(oldies + sep + '#' + jscolor);
  galleryOpts[id]['colors' + id] = jQuery('#colors' + id).val();
}

function sQuote(w) {
  return " '" + w + "' ";
}
