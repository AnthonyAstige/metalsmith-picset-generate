/* eslint-disable max-statements */
/* eslint-disable no-sync */
const _ = require('lodash')
const sharp = require('sharp')
const fs = require('fs')

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
		const tmpdir = `${metalsmith._destination}/.metalsmith-picset-generate-tmp`
		if (!fs.existsSync(tmpdir)) {
			fs.mkdirSync(tmpdir)
		}
		const promises = []
		const removeFilenames = []

		function createImage(buffer, width, params) {
			const newname = `${params.name}-${width}.${params.ext}`
			const newpath = `${opts.path}/${newname}`
			const tmppath = `${tmpdir}/${newname}`

			// Create promise to create new file
			let s = sharp(buffer).resize(width)
			switch (params.ext) {
				case 'png':
					s = s.png()
					break
				case 'jpg':
					s = s.jpeg({ quality: params.jpg })
					break
			}
			// TODO: Change to toBuffer and stop messing around with temp files
			// TODO: * Could speed up runtime and simplify code
			const promise = s.toFile(tmppath)

			// Once file is written, read it in
			Promise.all([promise]).then((buff) => {
				files[newpath] = { contents: fs.readFileSync(tmppath) }
				fs.unlink(tmppath)
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

				// Images for every width
				_.forEach(params.w, (width) => {
					createImage(file.contents, width, params)
				})
			}
		})

		Promise.all(promises).then((data) => {
			// Remove original file so doesn't show up in build
			_.forEach(removeFilenames, (filename) => {
				delete files[filename]
			})

			// Remove temp files
			fs.rmdirSync(tmpdir)

			// All done with Metalsmith plugin
			setImmediate(done)
		})
	}
}

module.exports = plugin
