const _ = require('lodash')
// const sharp = require('sharp')

function plugin(opts) {
	return function(files, metalsmith, done) {
		console.log('Inside: metalsmith-picset-generate')
		console.log(opts)

		_.forEach(files, (file, filename) => {
			// console.log(filename)
		})

		setImmediate(done)
	}
}

module.exports = plugin
