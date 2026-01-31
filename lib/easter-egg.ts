/**
 * Easter egg: "Green Colibri" should always appear in this special color
 */
export const EASTER_EGG_NAME = "Green Colibri";
export const EASTER_EGG_COLOR = "#28918a";

/**
 * Check if a name is the easter egg name and return appropriate styling
 */
export function getNameStyle(name: string): { color?: string } {
  return name === EASTER_EGG_NAME ? { color: EASTER_EGG_COLOR } : {};
}

/**
 * Get className for easter egg name
 */
export function getNameClassName(name: string): string {
  return name === EASTER_EGG_NAME ? "text-[#28918a]" : "";
}
