const _ = require('lodash')
// const sharp = require('sharp')

function plugin(options) {
	return function(files, metalsmith, done) {
		const opts = options || {}
		if (!opts.path) {
			opts.path = 'img/picset'
		}

		console.log()
		_.forEach(files, (file, filename) => {
			console.log(filename)
		})
		console.log()

		console.log('Inside: metalsmith-picset-generate')
		console.log(opts)
		console.log()

		const filePattern = new RegExp(
			`${opts.path}/\
([A-z-]*)_([0-9](1,2))webp_([0-9](1,2))jpg_(([0-9]+,)+).(jpg|png|svg)`
		)
		console.log(filePattern)

		setImmediate(done)
	}
}

module.exports = plugin
