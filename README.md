# Physics of Risk model repository

This repository stores development code for the models that are, or will be, featured on [Physics of Risk](http://rf.mokslasplius.lt/) blog. All of the respective descriptions of the models will be published on [Physics of Risk](http://rf.mokslasplius.lt/) blog.

Raw markdown files behind the posts and pages on Physics of Risk are stored in another GitHub repository: [https://github.com/akononovicius/physRisk-model-repository](https://github.com/akononovicius/physRisk-model-repository).

Images and other external files are not uploaded to any GitHub repository.

## Dependencies

Most of the models depend on some well-known javascript libraries, which are not part of this repository. Some models also reuse "common" code written by the contributors for [Physics of Risk](http://rf.mokslasplius.lt). All of these dependencies in our development environment are stored in `js-lib` folder.

Here, in this repository, we have only included the commonly reused code developed by the contributors of [Physics of Risk](http://rf.mokslasplius.lt). You could fetch the well-known libraries on your own (e.g., from CDNs) or you can obtain the respective files from [Physics of Risk](http://rf.mokslasplius.lt) (click links in the braces).

These well-known libraries include:
* [d3](https://d3js.org/) 4.12 (stored as [js-lib/d3-v4.min.js](http://rf.mokslasplius.lt/uploads/models/js-lib/d3-v4.min.js))
* [JIT](https://philogb.github.io/jit/) 2.0.1 (stored as [js-lib/jit-201.min.js](http://rf.mokslasplius.lt/uploads/models/js-lib/jit-201.min.js))
* [jQuery](https://jquery.com/) 1.8.3 (stored as [js-lib/jquery-183.min.js](http://rf.mokslasplius.lt/uploads/models/js-lib/jquery-183.min.js))
* [flot-axislabels](https://github.com/markrcote/flot-axislabels) (stored as [js-lib/jquery.flot-07.axislabels.js](http://rf.mokslasplius.lt/uploads/models/js-lib/jquery.flot-07.axislabels.js))
* [Flot](http://www.flotcharts.org/) 0.8 (stored as [js-lib/jquery.flot-08.min.js](http://rf.mokslasplius.lt/uploads/models/js-lib/jquery.flot-08.min.js))
* [Normalize CSS](https://necolas.github.io/normalize.css/) 7.0.0 (stored as [js-lib/normalize.css](http://rf.mokslasplius.lt/uploads/models/js-lib/normalize.css))
* [Plotly](https://plot.ly/) 1.3.1 (stored as [js-lib/plotly-131.min.js](http://rf.mokslasplius.lt/uploads/models/js-lib/plotly-131.min.js))


**Why don't we use CDN ourselves?** Because once a CDN went under and we have noticed it only after a really long time :)

## To do (priorities)

1. **Create new models and provide their descriptions on [Physics of Risk](http://rf.mokslasplius.lt).** This is a top priority as it is needed to fill [Physics of Risk](http://rf.mokslasplius.lt) with content.
1. **Include more comments in the code and make them more useful.** This priority will most likely hold only for the newly implemented models as in general the models and thus the implementing code are usually extremely simple (so the purpose of various code fragments is usually evident after reading the model descriptions).
1. **Modernize coding style** (use linting, beautification and etc.). This priority will most likely hold for the newly implemented models, but it is possible that some of these tools can be automatically applied to older implementations.
1. **Make user experience more uniform**. As the models were written at very different times, the UI behavior is not always the same. It would be nice to do the "uniformization" procedure and setup general guidelines for the future, but this most likely will happen only if capable students appear.
1. **Rewrite "ancient" code and replace "ancient" dependencies**. Some of the code was written way back in 2010, so the code and the dependencies appear to be "ancient" in web standards. It would be nice to do a rewrite, but most likely this will be done only if capable students appear.

## Contribute

**Would you like to contribute an interactive content to Physics of Risk?** Great! Read the rough guidelines [here](http://rf.mokslasplius.lt/contribute/) and contact [us](http://rf.mokslasplius.lt/about/).

**Have you noticed an error?** Great! Let us know -- submit an issue.

## License

You may (re)use the code according to [CC-BY-NC](https://creativecommons.org/licenses/by-nc/4.0/) license. Simply put - you may use or modify it as long as you do so for non-commercial purpose and as long as you appropriately attribute (refer/link to) the [Physics of Risk](http://rf.mokslasplius.lt/).

If in doubt, please contact [us](http://rf.mokslasplius.lt/about/).
