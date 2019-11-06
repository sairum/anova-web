# anova-web
a web-based analysis of variance

*anova-web* is a web based suite of small utilities that I use as the backbone of a Master's Course on Experimental Design, a mandatory course for the Masters in Biodiversity, Genetics and Evolution, and an optional course for many other Masters held at the Department of Biology of Faculty of Sciences, University of Porto.

The course is loosely based on A. J. Underwood's book *Experiments in Ecology: Their Logical Design and Interpretation Using Analysis of Variance*, Cambridge University Press, 1997 ISBN: 978-0521556965. The focus is put on hypothesis testing and how to devise experiments that can answer unambiguously questions pertaining to the highly variable biological world and its phenomena.

Initially, the software for the course consisted on a web site written in PHP which used a CGI executable written in C++ to compute ANOVAs. This software is still available at https://github.com/sairum/mwanova. However, due to security reasons the IT department strongly encouraged me to abandon CGI executables and use instead ECMAScript (JavaScript). *anova-web* is precisely the port of the old C++ *mwanova* to a web-based software.

## Development of anova-web

While porting *anova-web* I aimed at developing a suit of software with the least amount of dependencies possible. Using *node.js* was my first attempt at porting *anova-web* to a JavaScript environment. I used *grunt* as my task runner of choice, but the incomprehensible large amount of node modules installed soon made me abandon *node* as developing platform and use plain JavaScript. Abandoning *node* implied abandoning *grunt* and all the 'minifications' and linting facilities that come with *node*. *anova-web* uses a plain Makefile to build all its components. If you want to use it just type 

`$ make watch`
