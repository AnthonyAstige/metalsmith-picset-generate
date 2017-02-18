# CURRENTLY IN DEVELOPMENT - NOT YET READY FOR USE

Generates image sets for use with [metalsmith-picset-handlebars-helper](https://github.com/AnthonyAstige/metalsmith-picset-handlebars-helper) to give browsers choice

## How to use

Add to your pipeline like

`npm i metalsmith-picset-generate --save`

```
const picsetGenerate = require(metalsmith-picset-generate)
Metalsmith(__dirname)
	...
	.use(picsetGenerate())
	...
```
Place images in your source folder under `/src/picsets` named like so

 1. Human: `{name}_{quality#}webp_{quality#}jpg_{w1#},{w2#},{...},{wn#}.ext`
 1. RegEx: `/([a-Z\-]*)_([0-9](1,2))webp_([0-9](1,2))jpg_\([[0-9]+,]+\).[jpg|png|svg]/`
  1. Param 1: Prefix (a-Z)
  1. Param 2: webp quality (1-100)
  1. Param 3: jpg quality (1-100)
  1. Param 4: Image widths (Comma seperated integers)

And images will be generated relative to your source folder in /img/picsets/

## Specification

### Metalsmith options object

```
{
	path: 'img/picsets'
}
```

**path**

* Relative to Metalsmith **source** folder
* Default: `img/picsets/`

### Output

This plugin will generate images

* In original format
* In `.webp` format
* At widths and qualities specified
* At the specified `path`
* Following a convention like {name}-{width}.{ext}
* Removes original image

## Background info

### Philosophy &amp; architecture

* [Convention over Configuration](https://en.wikipedia.org/wiki/Convention_over_configuration)
* Image generation placed on file level instead of helper level
 * Generate once, use multiple times throughout site if desired
 * More likely to get cache hits by keeping standard file generation sizes on re-use
* Seperate plugin for stages
 * Seperation of concerns (re-usable, if say someone wants to implement another templating engine solution than handlebars)
 * The Metalsmith way

### Implementation

* Uses [sharp](https://github.com/lovell/sharp) for image generation because [sharp is fast](http://sharp.dimens.io/en/stable/performance/#results)
* Implemented on Node v6.9.1, untested in other versions
