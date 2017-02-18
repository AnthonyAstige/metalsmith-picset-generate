Generates responsive image sets for use with [metalsmith-picset-handlebars-helper](https://github.com/AnthonyAstige/metalsmith-picset-handlebars-helper) to give browsers image resolution choices

### Use

`npm i metalsmith-picset-generate --save`

```
const picsetGenerate = require(metalsmith-picset-generate)
Metalsmith(__dirname)
	.use(picsetGenerate({path: '/img/picsets/'}))
	.build(function(err) {})
```
Name files like

 1. Human: `{name}_{quality#}webp_{quality#}jpg_{w1#},{w2#},{...},{wn#}.ext`
 1. RegEx: `/([a-Z]*)_([0-9](1,2))webp_([0-9](1,2))jpg_\([[0-9]+,]+\).[webp|jpg|png]/`
  1. Param 1: Prefix (a-Z)
  1. Param 2: webp quality (1-100)
  1. Param 3: jpg quality (1-100)
  1. Param 4: Image widths (Comma seperated integers)

### Effect

This plugin will generate web

### Implementation

Uses [sharp](https://github.com/lovell/sharp) for image generation
