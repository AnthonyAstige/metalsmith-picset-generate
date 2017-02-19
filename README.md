Generates image sets for use with [metalsmith-picset-handlebars-helper](https://github.com/AnthonyAstige/metalsmith-picset-handlebars-helper) to give browsers choice

## Example use

Add to your pipeline like

`npm i metalsmith-picset-generate --save`

```javascript
const picsetGenerate = require(metalsmith-picset-generate)
Metalsmith(__dirname)
	...
	.use(picsetGenerate())
	...
```
Place `picture.jpg` in your source folder under `/img/picset/`

And images will be generated relative to your source folder in `/img/picset/``

## Specification

### Image naming

Image size generation is done by naming convention with parameters denoted by the `_{NUMBERS}{PARAM}`. Examples:

Note: All examples will generate images with the name `anthony` at widths of 100px, 200px, and 400px

1. `anthony_400,200,100w.jpg` - Name is **anthony**, file type is **jpg**
1. `anthony_400,200,100w_65jpg.jpg` - Name is **anthony**, jpeg quality is **65**%, file type is **jpg**
1. `anthony_400,200,100w_65jpg_50webp.jpg` - Name is **anthony**, jpeg quality is **65**%, webp quality is **55%**, file type is **jpg**

#### Image naming: parameters

**w** - Image widths (**Required**)

Comma seperated list of integers for widths of output images

**webp** - .webp quality (Default: Set in plugin `use()` call or 80)

A integer from 1-100 indicating webp quality (lossy compression).

* A value of 100 will trigger use of lossless compression mode

**jpg** - .jpg quality (Default: Set in plugin `use()` call or 80)

An integer from 1-100 indicating jpg quality (lossy compression).

### Metalsmith options

#### Metalsmith options: Example object

```javascript
{
	path: 'img/picset',
	jpg: 80,
	webp: 80
}
```

Which would place all images in `img/picset` with a default quality of 80 for both jpg and webp files

#### Metalsmith options: Specifics

**path** - images location (Default: `img/picset/`)

Place all your source images here. They should be high quality and high resolution.

* Relative to Metalsmith **source** folder

**jpg** - Default jpg quality (Default: 80)

Default jpg quality if left unspecified in file name

**webp** - Default webp quality (Default: 80)

Default wbep quality if left unspecified in file name

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
