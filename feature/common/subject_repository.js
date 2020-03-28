
// subjectsDatabase = [ { value: 'covid-19', }, ]
const subjectsDatabase = [
	{ value: 'covid-19', frequency: 78 },
	{ value: 'coronavirus', frequency: 92 },
	{ value: 'Life in isolation', frequency: 92 },
	{ value: 'depression', frequency: 42 },
	{ value: 'Hytteforbud', frequency: 54 },
	{ value: 'hvordan overleve at alle i hustanden har brakkefeber', frequency: 67 },
	{ value: 'jeg ble nettopp permitert, hva skal jeg gjøre', frequency: 48 },
	{ value: 'Hack the Crisis!', frequency: 130 },
	{ value: 'Norge after the crisis', frequency: 64 },
	{ value: 'I want to get to know you!', frequency: 40 },
	{ value: 'How we can help our farmers?', frequency: 55 }
]

function getAllSubjects() {
	return [...subjectsDatabase]
}

module.exports = {
	getAllSubjects
}
