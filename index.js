/* eslint-disable max-statements */
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
	const reExt = 'jpg|png|svg'
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
			const paramValue = auxParam[0].match(/[0-9,]+/)[0]
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
		_.forEach(files, (file, filename) => {
			if (picPattern.test(filename)) {
				const params = imagenameParams(filename)
				console.log(JSON.stringify(params, null, 4))

				const fullpath = `${metalsmith._source}/${filename}`
				const newpath = `${metalsmith._source}/${opts.path}/anthony-200.jpg`
				const jpgQuality = 80
				// const webpQuality = 80
				// const widths = [100, 200, 400, 800]

				// Create promise to resize image
				const promise = sharp(fullpath)
					.resize(200)
					.jpeg({ quality: jpgQuality })
					.toBuffer()

				// TODO: Act on this single promise by saving to file
				Promise.all([promise]).then((buffer) => {
					console.log(`Done with: ${newpath}`)
				})

				// Make note of promise (we later have to ensure all are done)
				promises.push(promise)
			}
		})

		Promise.all(promises).then((data) => {
			setImmediate(done)
		})
	}
}

module.exports = plugin
