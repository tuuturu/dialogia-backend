const { Subject } = require('./subject')

const subjectsDatabase = []

function getAllSubjects() {
	return [...subjectsDatabase]
}

function bumpSubject(subject) {
	const index = subjectsDatabase.findIndex(item => item.body === subject)

	if (index < 0) subjectsDatabase.push(new Subject(subject))
	else subjectsDatabase[index].frequency += 1
}

module.exports = {
	bumpSubject,
	getAllSubjects
}
