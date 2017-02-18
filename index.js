const _ = require('lodash')

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
