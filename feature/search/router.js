const express = require('express')

const { getAllSubjects } = require('../common/subject_repository')
const { matchingFilter } = require('./subject_matching')

const router = express.Router()

const MAXIMUM_RESULTS_LIMIT = 10

router.get('/', async (req, res) => {
	const query = req.query.query
	const limit = req.query.limit || MAXIMUM_RESULTS_LIMIT

	const subjects = getAllSubjects()

	let results = subjects
	if (query) results = subjects.filter(matchingFilter(query))

	res.json({ subjects: results.slice(0, limit) })
})

module.exports = router
