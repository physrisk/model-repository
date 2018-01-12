# Physics of Risk model repository

This repository stores development code for the models that are, or will be, featured on [Physics of Risk](http://rf.mokslasplius.lt/) blog. All of the respective descriptions of the models will be published on [Physics of Risk](http://rf.mokslasplius.lt/) blog.

# Dependencies

Most of the models depend on some well-known javascript libraries, which are not part of this repository. Some models also reuse "common" code written by us. All of these dependencies in our development environment are stored in `js-lib` folder.

Here, in this repository, we have only made available "common" code developed by us. You could fetch the well-known libraries on your own (e.g., from CDNs). You can always obtain the files from [Physics of Risk](http://rf.mokslasplius.lt) (click links in the braces).

These well-known libraries include:
* [d3](https://d3js.org/) 4.12 (stored as [js-lib/d3-v4.min.js](http://rf.mokslasplius.lt/uploads/models/js-lib/d3-v4.min.js))
* [JIT](https://philogb.github.io/jit/) 2.0.1 (stored as [js-lib/jit-201.min.js](http://rf.mokslasplius.lt/uploads/models/js-lib/jit-201.min.js))
* [jQuery](https://jquery.com/) 1.8.3 (stored as [js-lib/jquery-183.min.js](http://rf.mokslasplius.lt/uploads/models/js-lib/jquery-183.min.js))
* [flot-axislabels](https://github.com/markrcote/flot-axislabels) (stored as [js-lib/jquery.flot-07.axislabels.js](http://rf.mokslasplius.lt/uploads/models/js-lib/jquery.flot-07.axislabels.js))
* [Flot](http://www.flotcharts.org/) 0.8 (stored as [js-lib/jquery.flot-08.min.js](http://rf.mokslasplius.lt/uploads/models/js-lib/jquery.flot-08.min.js))
* [Normalize CSS](https://necolas.github.io/normalize.css/) 7.0.0 (stored as [js-lib/normalize.css](http://rf.mokslasplius.lt/uploads/models/js-lib/normalize.css))
* [Plotly](https://plot.ly/) 1.3.1 (stored as [js-lib/plotly-131.min.js](http://rf.mokslasplius.lt/uploads/models/js-lib/plotly-131.min.js))


**Why don't we use CDN ourselves?** Because once a CDN went under and we have noticed it only after a really long time :)

# To do

1. Create new models and provide their descriptions on [Physics of Risk](http://rf.mokslasplius.lt).
1. Write more comments in the code. Models are usually extermely simple, so the purpose of various functions should be self-evident from model descriptions.
1. Modernize coding style.
1. Update ancient dependencies with newer ones. Some of the code was written back in 2010, so some of the dependencies are ancient in web standards.

# License

You (re)use the code according to [CC-BY-NC](https://creativecommons.org/licenses/by-nc/4.0/) licence. Simply put - you may use or modify it, as long as you do so for non-commercial purpose and as long as you appropriately attribute (refer/link to) the [Physics of Risk](http://rf.mokslasplius.lt/).

If in doubt, please contact [us](http://rf.mokslasplius.lt/about/).
