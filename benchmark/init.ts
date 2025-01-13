import { mkdir, readdir, writeFile } from "node:fs/promises"
import { join, resolve } from "node:path"
import { consola } from "consola"

const baseUrl = "https://raw.githubusercontent.com/Saeid-Za/cleana-benchmark-data/master/data/"
const fileNames = [
	"heavy.json",
	"medium.json",
	"small.json",
]

async function initBenchmark() {
	consola.start("Preparing Benchmark ...")

	const isFound = await checkIfDataExists()
	if (!isFound) {
		await downloadBenchmarkData()
	}

	consola.success("Benchmark is ready to be run.")
}

async function downloadBenchmarkData() {
	consola.log("Starting to download benchmark files ...")

	await ensureDataDir()

	const promiseList: Promise<void>[] = []
	for (const file of fileNames) {
		const filePath = join(getDataDir(), file)
		promiseList.push(downloadFileFromGitHub(baseUrl + file, filePath))
	}

	await Promise.all(promiseList)

	consola.log("Downloaded benchmark files.")
}

async function downloadFileFromGitHub(url: string, filePath: string): Promise<void> {
	const response = await fetch(url)

	if (!response.ok) {
		throw new Error(`Network response was not ok: ${response.statusText}`)
	}

	const data = await response.text()

	await writeFile(filePath, data)
}

async function checkIfDataExists() {
	let filesFound: string[] = []
	let result = true

	try {
		filesFound = await readdir(getDataDir(), {})
	}
	catch {
		result = false
		return result
	}

	for (const file of fileNames) {
		if (!filesFound.includes(file)) {
			result = false
			break
		}
	}

	return result
}

async function ensureDataDir() {
	const dataDir = getDataDir()
	await mkdir(dataDir, { recursive: true })
}

function getDataDir() {
	return resolve(join(__dirname, "data"))
}

initBenchmark()
