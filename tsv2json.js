/**
 * @file
 * Basic function to convert TSV & CSV format data into chart's JSON.
 */
 
/**
 * Converting CSV/TSV data into valid JSON format of chart.
 *
 * @param string $tsv
 *   containing input data in TSV format.
 * @param string $csv
 *   containing input data in CSV format.
 * @param string $type
 *   containing type of chart .
 *
 * @return string
 *   valid JSON of given data set for NVD3 lib.
 */
function tsv2json(tsv, csv, type) {

  // CSV string into TSV format.
  if (csv) {
    if (csv.indexOf(";") > -1) {
      tsv = csv.replace(/;/g, "\t");
    }
    else if (csv.indexOf(",") > -1) {
      tsv = csv.replace(/,/g, "\t");
    }
  }
  var myJSON = d3.tsv.parse(tsv);
  var myNVD3 = JSON2NVD3(myJSON, type);

  return JSON.stringify(myNVD3);
}

/**
 * Parse TSV based input data into JSON based on chart's type.
 *
 * @param string $data
 *   input data in general JSON format.
 * @param string $chart
 *   containing type of chart .
 *
 * @return array
 *   legal pairs of keys & values of data set.
 */
function JSON2NVD3(data, chart) {

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
    // 1st column passed (eq t=0).
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
    // Other types of charts: multibars etc.
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
   * Name data points + force numbers type for values.
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
   * Name data points + force numbers type for values.
   *
   * Return new array.
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

  /**
   * Gets one column of data into the array.
   */
  function getCol(colname, lines) {
    var out = new Array();
    for (i = 0; i < lines.length; i++) {
      if (lines[i][colname] && + lines[i][colname]) {
        // Forcing numerical values output here.
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
    return x;
  }
}
