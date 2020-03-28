
function matchingFilter(query) {
	return subject => {
		return subject.value.toLowerCase().includes(query.toLowerCase())
	}
}

module.exports = {
	matchingFilter
}
