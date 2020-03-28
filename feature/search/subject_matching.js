

function matchingFilter(query) {
	return subject => {
		return subject.value.includes(query)
	}
}

module.exports = {
	matchingFilter
}
