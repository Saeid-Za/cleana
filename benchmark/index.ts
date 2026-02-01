import cleanDeep from "clean-deep"
import { clean as deepCleaner } from "deep-cleaner"
import { clean as fastClean, ICleanerOptions } from "fast-clean"
import { bench, run, summary } from "mitata"
import objClean from "obj-clean"
import { cleana, CleanaOptions } from "../src"
import heavy from "./data/heavy.json"
import medium from "./data/medium.json"
import small from "./data/small.json"

const fastCleanOptions: ICleanerOptions = {
	emptyArraysCleaner: true,
	emptyObjectsCleaner: true,
	emptyStringsCleaner: true,
	nanCleaner: true,
	nullCleaner: true,
	cleanInPlace: false,
}

const cleanDeepOptions = {
	emptyArrays: true,
	emptyObjects: true,
	emptyStrings: true,
	NaNValues: true,
	nullValues: true,
	undefinedValues: true,
}

const cleanaOptions: CleanaOptions = {
	cleanArray: true,
	cleanNaN: true,
	cleanNull: true,
	cleanObject: true,
	cleanString: true,
	cleanUndefined: true,
}

const deepCleanerOptions = {
	clone: true,
}

summary(() => {
	bench("Cleana - Small Sized File", () => {
		return cleana(small, cleanaOptions)
	})

	bench("Fast Clean - Small Sized File", () => {
		return fastClean(small, fastCleanOptions)
	})

	bench("Clean Deep - Small Sized File", () => {
		return cleanDeep(small, cleanDeepOptions)
	})

	bench("Deep Cleaner - Small Sized File", () => {
		return deepCleaner(small, deepCleanerOptions)
	})

	bench("Obj Clean - Small Sized File", () => {
		return objClean(small, { cleanArrays: true, preserveArrays: false })
	})
})

summary(() => {
	bench("Cleana - Medium Sized File", () => {
		return cleana(medium, cleanaOptions)
	})

	bench("Fast Clean - Medium Sized File", () => {
		return fastClean(medium, fastCleanOptions)
	})

	bench("Clean Deep - Medium Sized File", () => {
		return cleanDeep(medium, cleanDeepOptions)
	})

	bench("Obj Clean - Medium Sized File", () => {
		return objClean(medium, { cleanArrays: true, preserveArrays: false })
	})

	bench("Deep Cleaner - Medium Sized File", () => {
		return deepCleaner(medium, deepCleanerOptions)
	})
})

summary(() => {
	bench("Cleana - Heavy Sized File", () => {
		return cleana(heavy, cleanaOptions)
	})

	bench("Fast Clean - Heavy Sized File", () => {
		return fastClean(heavy, fastCleanOptions)
	})

	bench("Clean Deep - Heavy Sized File", () => {
		return cleanDeep(heavy, cleanDeepOptions)
	})

	bench("Obj Clean - Heavy Sized File", () => {
		return objClean(heavy, { cleanArrays: true, preserveArrays: false })
	})
})

run()
