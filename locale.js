/**
 * @file
 * All national dependent definitions how to format numbers, currencies, dates, etc.
 */
 
// Update this (US/FI/RU) global based on your area + add new locale's block below.
myCountry = "FI";

/**
 * Finding root directory for all JavaScript + major included libs.
 *
 * Note: optional if you want to support multinational audience on website.
 *
 * @param boolean $wanted
 *   containing flag if browser's automatic detection is wished.
 *
 * @return string
 *   language code used in user's browser.
 */
function detectBrowser(wanted) {

  if (wanted) {
    return (navigator.language || navigator.userLanguage);
  }
  return 0;
}

/**
 * Setting locale active on d3 framework.
 *
 * @param boolean $code
 *   national code that is wanted to be active.
 */
function myLocale(code) {

  if (!code) {
    code = myCountry;
  }
  /*
  Each new country needs one d3.locale block as below, use example format:
  xx_XX where XX is your country's locale and xx its language code.
   */

  // Finland.
  var fi_FI = d3.locale({
    "decimal": ",",
    "thousands": " ",
    "grouping": [3],
    "currency": ["", " €"],
    "dateTime": "%a %b %e %X %Y",
    "date": "%d.%m.%Y",
    "time": "%H:%M:%S",
    "periods": ["", ""],
    "days": ["Sunnuntai", "Maanantai", "Tiistai", "Keskiviikko",
      "Torstai", "Perjantai", "Lauantai"],
    "shortDays": ["SU", "MA", "TI", "KE", "TO", "PE", "LA"],
    "months": ["Tammikuu", "Helmikuu", "Maaliskuu", "Huhtikuu",
      "Toukokuu", "Kesakuu", "Heinakuu", "Elokuu", "Syyskuu", "Lokakuu",
      "Marraskuu", "Joulukuu"],
    "shortMonths": ["Tammi", "Helmi", "Maalis", "Huhti", "Touko", "Kesa",
      "Heina", "Elo", "Syys", "Loka", "Marras", "Joulu"]
  });

  // USA.
  var en_US = d3.locale({
    "decimal": ".",
    "thousands": ",",
    "grouping": [3],
    "currency": ["$", ""],
    "dateTime": "%a %b %e %X %Y",
    "date": "%m/%d/%Y",
    "time": "%H:%M:%S",
    "periods": ["AM", "PM"],
    "days": ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday",
      "Friday", "Saturday"],
    "shortDays": ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    "months": ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"],
    "shortMonths": ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul",
      "Aug", "Sep", "Oct", "Nov", "Dec"]
  });

  // Russian.
  var ru_RU = d3.locale({
    "decimal": ",",
    "thousands": "\xa0",
    "grouping": [3],
    "currency": ["", " руб."],
    "dateTime": "%A, %e %B %Y г. %X",
    "date": "%d.%m.%Y",
    "time": "%H:%M:%S",
    "periods": ["AM", "PM"],
    "days": ["воскресенье", "понедельник", "вторник", "среда", "четверг",
      "пятница", "суббота"],
    "shortDays": ["вс", "пн", "вт", "ср", "чт", "пт", "сб"],
    "months": ["января", "февраля", "марта", "апреля", "мая", "июня",
      "июля", "августа", "сентября", "октября", "ноября", "декабря"],
    "shortMonths": ["янв", "фев", "мар", "апр", "май", "июн", "июл",
      "авг", "сен", "окт", "ноя", "дек"]
  });

  // Setting d3 chart to follow 1 block of national format.
  code = code.toUpperCase();
  if (code.indexOf('FI') > -1) {
    d3.time.format = fi_FI.timeFormat;
    d3.format = fi_FI.numberFormat;
    return;
  }
  else if (code.indexOf('US') > -1) {
    d3.time.format = en_US.timeFormat;
    d3.format = en_US.numberFormat;
    return;
  }
  else if (code.indexOf('RU') > -1) {
    d3.time.format = ru_RU.timeFormat;
    d3.format = ru_RU.numberFormat;
    return;
  }
}
