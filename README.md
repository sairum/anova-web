# anova-web
a web-based analysis of variance

**anova-web** is a web based suite of small utilities that I use as the backbone of a Master's Course on Experimental Design, a mandatory course for the Masters in Biodiversity, Genetics and Evolution, and an optional course for many other Masters held at the Department of Biology of Faculty of Sciences, University of Porto.

The course is loosely based on A. J. Underwood's book *Experiments in Ecology: Their Logical Design and Interpretation Using Analysis of Variance*, Cambridge University Press, 1997 ISBN: 978-0521556965. The focus is put on hypothesis testing and how to devise experiments that can answer unambiguously questions pertaining to the highly variable biological world and its phenomena.

Initially, the software for the course consisted on a web site written in PHP which used a CGI executable written in C++ to compute ANOVAs. This software is still available at https://github.com/sairum/mwanova. However, due to security reasons the IT department strongly encouraged me to abandon CGI executables and use instead ECMAScript (JavaScript). Hence, **anova-web** is precisely the port of the old C++ *mwanova* to a web-based software.

## Development of anova-web

While porting **anova-web** I aimed at developing a suit of software with the least amount of dependencies possible. Using *node.js* was my first attempt at porting **anova-web** to a JavaScript environment. I used *grunt* as the task runner of choice, but the incomprehensible large amount of node modules installed soon made me abandon *node* as a developing platform and use plain JavaScript. Abandoning *node* implied abandoning *grunt* and all the 'minifications' and linting facilities that come with *node*. Currently, **anova-web** uses a plain Makefile to build all its components. If you want to use it just type 

`$ make watch`

and edit the files under inside the folder *src/* (this includes css styles and JavaScript). To make use of the Makefile you need *inotifywatch*, a standard tool installed by default in most Linux system, and Douglas Crockford's *jsmin* (https://www.crockford.com/jsmin.html) for minification of JavaScript files. Other than that, **anova-web** depends only on three JavaScript libraries and one CSS Style sheet:

* JStat (https://github.com/jstat/jstat) for probability distributions and related stuff
* FileSaver.js (https://github.com/eligrey/FileSaver.js/) to generate files to download
* seedrandom.js (https://github.com/davidbau/seedrandom) as a RNG with seed capabilities to be used by JStat
* normalize.css (https://necolas.github.io/normalize.css/) to make browsers behave well

## Installation and usage

### Web server installation

The proper way to install **anova-web** is to clone this project and copy all *\*.html* files, together with the *css/*, *examples/*, *js/* and *support/* folders to the document root directory of an http server such as *apache*: 

* css/
* examples/
* js/
* support/
* index.html
* anova.html
* examples.html
* sampling.html
* simulate.html

The *src/* directory is not necessary unless you intend to modify or improve the software. All programs reside on the *js/* directory, either minified or not, The *\*.html* files use the minified versions of the JavaScript files found under *js/*.

### Local installation

Another way to run **anova-web** is to uncompress or clone this github repository somewhere in the directory tree of a personal computer. Then, using a GUI, click on *index.html*. This should run the whole bundle just fine (at least it does on a Linux system running KDE Plasma 5). 

### General flow of the program
```
openDataFile()
 │
 ├── resetAnalysis()
 │
 ├── DEBUG: displayFactors()
 │
 ├── displayData()
 │
 └── computeCells()
       │
       ├── DEBUG: displayCells()
       │
       ├── homogeneityTests()
       │
       └── buildTerms()
             │
             └── IF ── getCellsSS()
                  │
                  ├── DEBUG: displayTerms()
                  │
                  ├── correctForNesting()
                  │     │
                  │     └ correctTermNames()
                  │
                  ├── DEBUG: displayFactors()
                  │
                  ├── computeCTRules()
                  │     │
                  │     └ displayCTRules()
                  │
                  ├── DEBUG: displayTerms()
                  │
                  ├── displayAverages()
                  │
                  ├── buildMultipleComparisons()
                  │
                  ├── displayMultipleComparisons()
                  │     │
                  │     └── multipleTests()
                  │
                  └── displayANOVA()
```
 


