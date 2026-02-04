import cleanDeep, { CleanOptions as CleanDeepOptions } from "clean-deep"
import { clean as deepCleaner, CleanOptions as DeepCleanerOption } from "deep-cleaner"
import { clean as fastClean, ICleanerOptions as FastCleanOptions } from "fast-clean"
import { bench, run, summary } from "mitata"
import objClean, { Options as ObjCleanOptions } from "obj-clean"
import { cleana, CleanaOptions } from "../dist/index.mjs"
import heavy from "./data/heavy.json"
import medium from "./data/medium.json"
import small from "./data/small.json"

const fastCleanOptions: FastCleanOptions = {
	emptyArraysCleaner: true,
	emptyObjectsCleaner: true,
	emptyStringsCleaner: true,
	nanCleaner: true,
	nullCleaner: true,
	cleanInPlace: false,
}

const cleanDeepOptions: CleanDeepOptions = {
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
	circularReference: false,
	inPlace: false,
}

const deepCleanerOptions: DeepCleanerOption = {
	clone: false,
	skipEmpty: false,
}

const objCleanOptiopns: ObjCleanOptions = {
	cleanArrays: true,
	preserveArrays: false,
}

const onlyCleanaFastClean = process.argv.includes("--only-cleana-fastclean")

summary(() => {
	bench("Cleana - Small Sized File", () => {
		return cleana(small, cleanaOptions)
	})

	bench("Fast Clean - Small Sized File", () => {
		return fastClean(small, fastCleanOptions)
	})

	if (!onlyCleanaFastClean) {
		bench("Clean Deep - Small Sized File", () => {
			return cleanDeep(small, cleanDeepOptions)
		})

		bench("Deep Cleaner - Small Sized File", () => {
			return deepCleaner(small, deepCleanerOptions)
		})

		bench("Obj Clean - Small Sized File", () => {
			return objClean(small, objCleanOptiopns)
		})
	}
})

summary(() => {
	bench("Cleana - Medium Sized File", () => {
		return cleana(medium, cleanaOptions)
	})

	bench("Fast Clean - Medium Sized File", () => {
		return fastClean(medium, fastCleanOptions)
	})

	if (!onlyCleanaFastClean) {
		bench("Clean Deep - Medium Sized File", () => {
			return cleanDeep(medium, cleanDeepOptions)
		})

		bench("Obj Clean - Medium Sized File", () => {
			return objClean(medium, objCleanOptiopns)
		})

		bench("Deep Cleaner - Medium Sized File", () => {
			return deepCleaner(medium, deepCleanerOptions)
		})
	}
})

summary(() => {
	bench("Cleana - Heavy Sized File", () => {
		return cleana(heavy, cleanaOptions)
	})

	bench("Fast Clean - Heavy Sized File", () => {
		return fastClean(heavy, fastCleanOptions)
	})

	if (!onlyCleanaFastClean) {
		bench("Clean Deep - Heavy Sized File", () => {
			return cleanDeep(heavy, cleanDeepOptions)
		})

		bench("Obj Clean - Heavy Sized File", () => {
			return objClean(heavy, objCleanOptiopns)
		})
	}
})

run()
