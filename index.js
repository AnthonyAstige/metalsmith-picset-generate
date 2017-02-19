/* eslint-disable max-statements */
/* eslint-disable no-sync */
// TODO: Refactor this whole thing as needed, code reviewing, ...
const _ = require('lodash')
const sharp = require('sharp')

function plugin(options) {
	const opts = options || {}
	if (!opts.path) {
		opts.path = 'img/picset'
	}

	// Regular Expression filename variables
	const reParam = '_[0-9,]+[a-z]+'
	const reName = '[a-zA-Z-]*'
	const reExt = 'jpg|png'
	const picPattern = new RegExp(`${opts.path}/(${reName})(${reParam})*\\.(${reExt})`)

	// Returns an object with params from file following pattern defined in README.md
	function imagenameParams(imagename) {
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
		const defaults = { jpg: 80, webp: 80 }
		params = _.assignIn(defaults, params)

		// Return constructed params object
		return params
	}

	return function(files, metalsmith, done) {
		const promises = []
		const removeFilenames = []

		function createImage(params) {
			const newname = `${params.name}-${params.width}.${params.ext}`
			const newpath = `${opts.path}/${newname}`

			// Create promise to create new file
			let s = sharp(params.buffer).resize(params.width)
			switch (params.ext) {
				case 'png':
					s = s.png()
					break
				case 'jpg':
					s = s.jpeg({ quality: params.quality })
					break
				case 'webp':
					s = s.webp({ quality: params.quality })
					break
			}

			// TODO: Make buffer processing finish...this is messing up timers
			// TODO: * It looks like this plugin finishes in 7[ms] when it's more like 300[ms]
			// TODO: ** Which will presumably get worse the more files we're processing
			const promise = s.toBuffer((err, buffer, info) => {
				if (err) {
					throw err
				}
				files[newpath] = { contents: buffer }
			})

			// Make note of promise (we later have to ensure all are done)
			// TODO: Remove use of external vars..
			promises.push(promise)
		}

		_.forEach(files, (file, filename) => {
			if (picPattern.test(filename)) {
				// Make not to remove original file when we're all done
				removeFilenames.push(filename)

				// Gather params from filename
				const params = imagenameParams(filename)

				// Set default params for new image
				const defs = {
					buffer: file.contents,
					name: params.name
				}

				// Images for every width
				_.forEach(params.w, (width) => {
					defs.width = width

					// Render every image in webp
					createImage(_.assignIn(defs, { ext: 'webp', quality: params.webp }))

					// Render every image in it's original format
					switch (params.ext) {
						case 'jpg':
							createImage(
								_.assignIn(defs, { ext: 'jpg', quality: params.jpg }))
							break
						case 'png':
							createImage(_.assignIn(defs, { ext: 'png' }))
							break
					}
				})
			}
		})

		Promise.all(promises).then((data) => {
			// Remove original file so doesn't show up in build
			_.forEach(removeFilenames, (filename) => {
				delete files[filename]
			})

			// All done with Metalsmith plugin
			setImmediate(done)
		})
	}
}

module.exports = plugin
