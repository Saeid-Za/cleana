import type { CleanaOptions, Cleaned } from "./types"

export function cleana<T>(data: T, options: CleanaOptions = {}): Cleaned<T> {
	options.inPlace ??= false
	options.cleanArray ??= true
	options.cleanObject ??= true
	options.cleanNull ??= true
	options.cleanString ??= true
	options.cleanNaN ??= true
	options.cleanUndefined ??= true
	options.removeKeys ??= []

	if (!data)
		return data as Cleaned<T>

	if (Array.isArray(data))
		return cleanArray(data, options) as Cleaned<T>

	if (isObject(data))
		return cleanObject(data, options) as Cleaned<T>

	return data as Cleaned<T>
}

function cleanArray<T>(arr: T[], options: CleanaOptions): T[] {
	const isInPlace = options.inPlace
	const result: T[] = isInPlace ? arr : []

	for (let i = 0; i < arr.length; i++) {
		const item = arr[i]

		if (Array.isArray(item)) {
			const cleanedItem = cleanArray(item, options)
			if (shouldReturnArray(cleanedItem, options)) {
				if (!isInPlace) {
					result.push(cleanedItem as T)
				}
			}
			else if (isInPlace) {
				arr.splice(i, 1)
				i--
			}
		}
		else if (isObject(item)) {
			const cleanedItem = cleanObject(item, options)
			if (shouldReturnObject(cleanedItem, options)) {
				if (!isInPlace) {
					result.push(cleanedItem as T)
				}
			}
			else if (isInPlace) {
				arr.splice(i, 1)
				i--
			}
		}
		else if (!shouldRemoveValue(item, options)) {
			if (!isInPlace) {
				result.push(item as T)
			}
		}
		else if (isInPlace) {
			arr.splice(i, 1)
			i--
		}
	}

	return result
}

function cleanObject<T extends Record<string, unknown>>(object: T, options: CleanaOptions): Partial<T> {
	const isInPlace = options.inPlace
	const output = isInPlace ? object : {} as T

	for (const key in object) {
		const value = object[key]

		if (options.removeKeys!.length && options.removeKeys!.includes(key)) {
			if (isInPlace)
				delete output[key]
			continue
		}

		if (Array.isArray(value)) {
			const cleaned = cleanArray(value, options)

			if (shouldReturnArray(cleaned, options)) {
				output[key] = cleaned as any
			}
			else if (isInPlace) {
				delete output[key]
			}
		}
		else if (isObject(value)) {
			const cleaned = cleanObject(value, options)

			if (shouldReturnObject(cleaned, options)) {
				output[key] = cleaned as any
			}
			else if (isInPlace) {
				delete output[key]
			}
		}
		else {
			const shouldKeep = !shouldRemoveValue(value, options)
			if (!isInPlace && shouldKeep) {
				output[key] = value
			}
			else if (isInPlace && !shouldKeep) {
				delete output[key]
			}
		}
	}

	return output
}

function isObject(value: any): value is Record<string, unknown> {
	return value !== null && typeof value === "object" && !Array.isArray(value)
}

function shouldReturnArray(arr: any[], options: CleanaOptions): boolean {
	return !options.cleanArray || arr.length > 0
}

function shouldReturnObject(object: Record<string, any>, options: CleanaOptions): boolean {
	return !options.cleanObject || Object.keys(object).length > 0
}

function shouldRemoveValue(value: any, options: CleanaOptions): boolean {
	if (value === null)
		return !!options.cleanNull

	if (value === "")
		return !!options.cleanString

	if (Number.isNaN(value))
		return !!options.cleanNaN

	if (value === undefined)
		return !!options.cleanUndefined

	return false
}
