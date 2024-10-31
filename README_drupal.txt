-- SUMMARY --

NVD3 visualisations give you tools on WordPress & Drupal 7 to generate 
impressive business quality charts based on the famous open NVD3 framework.

NVD3 visualisations is a full set of visually interactive charts that 
you can control by simple options.

You can start to create any example chart into your site and study it 
more before you decide if that suits for your visual presentation's needs.

When you are happy with your chart & node you just publish whole content
of page / article normally.

This software is also distributed on WordPress as its plugin and works on both
systems of CMS without any major modifications.

-- REQUIREMENTS --

None.

-- INSTALLATION --

* Install as usual, see http://drupal.org/node/895232 for further information.


-- CONFIGURATION --

* Module creates gallery of all charts automatically as a normal page. 
  You can clone own charts from this collection.


-- CUSTOMIZATION --

* In order to change any new chart behavior you can change options 
  of automatically generated JavaScript of node.
* To feed in your own data you can edit input cloned input files / 
  define mySQL access to the data set.

-- TROUBLESHOOTING --

* If you play with the options of chart and something goes wrong open the 
  JavaScript console from your browser. There is often clear error message 
  what went wrong.

-- FAQ --

Q: How can I visualize my own data set?

A: Module creates automatically gallery of example charts.
   You just clone from there your template chart and populate it
   with your own data set.

Q: How can I change the margins around the chart bigger?

A: You have 2 choices here: outside of chart container (normally div/span element & 
   container) or inside its svg element. Take a look at example **shortcode_margins_demo.txt** 
   to learn more about these options, please.

Q: Where are my data sets (of files) stored and what happens for them if I remove 
   chart's page/article?

A: Look at your blog's root and the folder called **charts_nvd3**. Data sets are stored 
   there by random names and they stay there until you remove them by FTP client manually. 
   If you create very many/big data sets it is a pretty good idea to clean this folder 
   from time to time.

Q: Is it possible to have multiple charts on the same page?

A: Good point & question here !
   YES indeed, the software is written so that it transparently creates and draws 
   many charts on the same page and gives you exact control where you like to show 
   them.

-- CONTACT --

Current maintainers:
* Jouni Santara (drupal_bn4f) - https://ee.linkedin.com/in/santara
