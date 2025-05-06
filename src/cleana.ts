import type { CleanaOptions, Cleaned } from "./types"
import { deepEqual } from "./utils"

export function cleana<T>(data: T, options: CleanaOptions = {}): Cleaned<T> {
	options.inPlace ??= false
	options.cleanArray ??= true
	options.cleanObject ??= true
	options.cleanNull ??= true
	options.cleanString ??= true
	options.cleanNaN ??= true
	options.cleanUndefined ??= true
	options.removeKeys ??= []
	options.removeValues ??= []

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

		if (shouldRemoveValue(options, item)) {
			if (isInPlace) {
				arr.splice(i, 1)
				i--
			}
			continue
		}

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
		else if (!shouldRemovePrimitive(item, options)) {
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

		if (shouldRemoveKey(options, key)) {
			if (isInPlace)
				delete output[key]
			continue
		}

		if (shouldRemoveValue(options, value)) {
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
			const shouldKeep = !shouldRemovePrimitive(value, options)
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
	return value !== null && typeof value === "object" && Object.prototype.toString.call(value) === "[object Object]"
}

function shouldRemoveKey(options: CleanaOptions, key: string) {
	return options.removeKeys!.length && options.removeKeys!.includes(key)
}

function shouldRemoveValue(options: CleanaOptions, value: any) {
	if (options.removeValues!.length === 0)
		return false

	for (let index = 0; index < options.removeValues!.length; index++) {
		const isEqual = deepEqual(value, options.removeValues![index])
		if (isEqual)
			return true
	}

	return false
}

function shouldReturnArray(arr: any[], options: CleanaOptions): boolean {
	return !options.cleanArray || arr.length > 0
}

function shouldReturnObject(object: Record<string, any>, options: CleanaOptions): boolean {
	return !options.cleanObject || Object.keys(object).length > 0
}

function shouldRemovePrimitive(value: any, options: CleanaOptions): boolean {
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
