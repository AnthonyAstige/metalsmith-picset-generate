/* eslint-disable max-statements */
const _ = require('lodash')
const sharp = require('sharp')

function plugin(options) {
	return function(files, metalsmith, done) {
		const opts = options || {}
		if (!opts.path) {
			opts.path = 'img/picset'
		}

		/*
		console.log()
		console.log('Inside: metalsmith-picset-generate')
		console.log(opts)
		console.log(metalsmith._source)
		*/

		const name = '[a-zA-Z-]*'
		const param = '_[0-9,]+[a-z]+'
		const ext = 'jpg|png|svg'
		const filePattern = new RegExp(`${opts.path}/(${name})(${param})*\\.(${ext})`, 'g')
		console.log(`RegEx: ${filePattern}`)

		const promises = []
		_.forEach(files, (file, filename) => {
			if (filePattern.test(filename)) {
				//const vals = filename.match(filePattern)
				let m
				while (m = filePattern.exec(filename)) {
					console.log('IN')
					console.log(m)
				}
				console.log(m)
				//console.log(vals)
				const fullpath = `${metalsmith._source}/${filename}`
				const newpath = `${metalsmith._source}/${opts.path}/anthony-200.jpg`
				const jpgQuality = 80
				// const webpQuality = 80
				// const widths = [100, 200, 400, 800]
				/*
				console.log('FOUND ONE')
				console.log(fullpath)
				console.log(newpath)
				*/

				// Create promise to resize image
				const promise = sharp(fullpath)
					.resize(200)
					.jpeg({ quality: jpgQuality })
					.toBuffer()

				// TODO: Act on this single promise by saving to file
				Promise.all([promise]).then((buffer) => {
					// console.log(`Done with: ${newpath}`)
					// console.log(buffer)
				})

				// Make note of promise (we later have to ensure all are done)
				promises.push(promise)
			}
		})

		Promise.all(promises).then((data) => {
			// console.log(data)
			// console.log('Done with promises')
			setImmediate(done)
		})
	}
}

module.exports = plugin
