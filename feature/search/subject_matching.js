
function matchingFilter(query) {
	return subject => {
		return subject.body.toLowerCase().includes(query.toLowerCase())
	}
}

module.exports = {
	matchingFilter
}
