import { ClassValue, clsx } from "clsx"

import { twMerge } from "tailwind-merge"
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const isNumeric = (n: any): n is number =>
  !isNaN(parseFloat(n)) && isFinite(n)

export function replaceChar(
  str: string,
  charToReplace: string,
  replacementChar: string
): string {
  // Use the String.replace() method with a regular expression to replace all occurrences of the character
  const replacedString = str.replace(
    new RegExp(charToReplace, "g"),
    replacementChar
  )
  return replacedString
}

export function reverseArray<T>(arr: T[]): T[] {
  return arr.reverse()
}

export function parseText(text: string): { text: string; isHtml: boolean } {
  const isHtml = /<\/?[a-z][\s\S]*>/i.test(text)
  const cleanedText = isHtml ? text?.replace(/<[^>]*>?/gm, "") : text?.trim()
  return { text: cleanedText, isHtml }
}

export function capitalizeFirstChars(inputString: string): string {
  return inputString
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

export function convertToDate(isoString: string): string | null {
  try {
    const date = new Date(isoString)
    if (isNaN(date.getTime())) {
      throw new Error(`Invalid date string: ${isoString}`)
    }
    return date.toLocaleDateString()
  } catch (error) {
    console.error(error)
    return null
  }
}

export function getSectionalign(align: string, defaultalignClass?: string) {
  if (!align) {
    return defaultalignClass
  }

  const aligns = {
    center: "text-center",
    right: "text-right",
    left: "text-left",
  }
  const alignClass = aligns[align?.toLowerCase() as keyof typeof aligns]

  if (!alignClass) {
    return defaultalignClass
  }

  return alignClass
}

export function alignmentClasses(matchingData: { align: string }) {
  const align = matchingData?.align?.toLowerCase()
  const isLeft = align === "left"
  const isRight = align === "right"
  const isCenter = align === "center"

  const textAlignClass = getSectionalign(align, "text-left")

  let justifyClass = `justify-start`
  let alignItemsClass = `items-start`
  let justifyGridClass = ``
  let objectPositionClass = ``

  if (isLeft) {
    justifyClass = `justify-start`
    alignItemsClass = `items-start`
    justifyGridClass = `justify-items-start`
    objectPositionClass = `object-left`
  }

  if (isRight) {
    justifyClass = `justify-end`
    alignItemsClass = `items-end`
    justifyGridClass = `justify-items-end`
    objectPositionClass = `object-right`
  }
  if (isCenter) {
    justifyClass = `justify-center`
    alignItemsClass = `items-center`
    justifyGridClass = `justify-items-center`
    objectPositionClass = `object-center`
  }
  return {
    textAlignClass,
    justifyClass,
    alignItemsClass,
    justifyGridClass,
    objectPositionClass,
  }
}
