/* eslint-disable no-sync */
const _ = require('lodash')
const sharp = require('sharp')

// Returns an object with params from file following pattern defined in README.md
function imagenameParams(imagename, picPattern, reParam, opts) {
	// Non-repeating params
	const basicParams = imagename.match(picPattern)
	let params = {
		name: basicParams[1],
		ext: basicParams[3]
	}

	// Repeating params
	const paramPattern = new RegExp(`${reParam}`, 'g')
	let auxParam
	while ((auxParam = paramPattern.exec(imagename)) !== null) {
		const paramName = auxParam[0].match(/[a-z]+/)[0]
		let paramValue = auxParam[0].match(/[0-9,]+/)[0]
		// Special param: Width is an array
		if ('w' === paramName) {
			paramValue = _.map(paramValue.split(','), (val) => Number(val))
		} else {
			paramValue = Number(paramValue)
		}

		params[paramName] = paramValue
	}

	// Add in default file params
	const defaults = { jpg: opts.jpg, webp: opts.webp }
	params = _.assignIn(defaults, params)

	// Return constructed params object
	return params
}

// Returns promise to insert new image into Metalsmith `files` object with `params`:
// * name: Image filename prefix
// * width: How wide the image should be
// * ext: What file extension the image should be
// * quality: What quality the image should be (For .jpg & .webp)
function createImage(files, params, opts) {
	const newname = `${params.name}-${params.width}.${params.ext}`
	const newpath = `${opts.path}/${newname}`

	// Resize the image and put in appropriate format / quality
	let s = sharp(params.buffer).resize(params.width)
	switch (params.ext) {
		case 'png':
			s = s.png()
			break
		case 'jpg':
			s = s.jpeg({ quality: params.quality })
			break
		case 'webp':
			s = s.webp({
				quality: params.quality,
				lossless: (100 === params.quality)
			})
			break
	}

	// Return promise to actually create the buffer as new Metalsmith file
	return new Promise((resolve, reject) => {
		s.toBuffer((err, buffer, info) => {
			if (err) {
				reject(err)
			}
			files[newpath] = { contents: buffer }
			resolve()
		})
	})
}

function plugin(options) {
	// Options and defaults
	const opts = options || {}
	if (!opts.path) {
		opts.path = 'img/picset'
	}
	if (!opts.jpg) {
		opts.jpg = 80
	}
	if (!opts.webp) {
		opts.webp = 80
	}

	// Regular Expression filename variables
	const reParam = '_[0-9,]+[a-z]+'
	const reName = '[a-zA-Z-]*'
	const reExt = 'jpg|png'
	const picPattern = new RegExp(`${opts.path}/(${reName})(${reParam})*\\.(${reExt})`)

	// The actual plugin returned from `.use(...)` call
	return function(files, metalsmith, done) {
		const promisesToCreateImages = []
		const removeFilenames = []

		_.forEach(files, (file, filename) => {
			if (picPattern.test(filename)) {
				// Mark to remove original file when we're done
				removeFilenames.push(filename)

				// Gather params from filename
				const params = imagenameParams(filename, picPattern, reParam, opts)

				// Set default params for new image
				const defs = {
					buffer: file.contents,
					name: params.name
				}

				/* eslint-disable no-inner-declarations*/
				function createNTrack(customOpts) {
					// Track ensure promise is fulfilled
					promisesToCreateImages.push(
						// Create the image
						createImage(
							// Add new image buffer to files
							files,
							_.assignIn(
								// Options always the same
								defs,
								// Passed in options
								customOpts
							),
							opts
						)
					)
				}
				/* eslint-enable no-inner-declarations*/

				// Images for every width
				_.forEach(params.w, (width) => {
					defs.width = width

					// Render every image in webp
					createNTrack({ ext: 'webp', quality: params.webp })

					// Render every image in it's original format
					switch (params.ext) {
						case 'jpg':
							createNTrack({ ext: 'jpg', quality: params.jpg })
							break
						case 'png':
							createNTrack({ ext: 'png' })
							break
					}
				})
			}
		})

		// Ensure all promised fulfilled before we complete
		// * Prevents race condition where buffers aren't done before Metalsmith is
		Promise.all(promisesToCreateImages).then((data) => {
			// Remove original file so they don't show up in build
			_.forEach(removeFilenames, (filename) => {
				delete files[filename]
			})

			// All done with Metalsmith plugin
			setImmediate(done)
		})
	}
}

module.exports = plugin
