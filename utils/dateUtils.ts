/**
 * Parses a date string from various common formats into a Date object using a robust manual method.
 * This function is designed to handle both YYYY-MM-DD and DD-MM-YYYY formats, as well as SQL-like timestamps.
 * It avoids the inconsistencies of the native `new Date()` constructor with non-standard strings.
 *
 * @param dateString The date string to parse.
 * @returns A valid Date object if parsing is successful, otherwise null.
 */
export function parseRobust(dateString: string | null | undefined): Date | null {
  if (!dateString || typeof dateString !== 'string') {
    return null;
  }

  // Regex for YYYY-MM-DD format (e.g., 2025-10-27 16:22:12+00)
  const ymdRegex = /^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2}):(\d{2}))?.*$/;
  // Regex for DD-MM-YYYY format (e.g., 31-05-2025 21:05:51+00)
  const dmyRegex = /^(\d{2})-(\d{2})-(\d{4})(?:[ T](\d{2}):(\d{2}):(\d{2}))?.*$/;

  let parts: RegExpMatchArray | null = null;
  let year: number, month: number, day: number;

  // Try matching YYYY-MM-DD first
  parts = dateString.match(ymdRegex);
  if (parts) {
    year = parseInt(parts[1], 10);
    month = parseInt(parts[2], 10) - 1; // JS months are 0-indexed
    day = parseInt(parts[3], 10);
  } else {
    // If it fails, try matching DD-MM-YYYY
    parts = dateString.match(dmyRegex);
    if (parts) {
      day = parseInt(parts[1], 10);
      month = parseInt(parts[2], 10) - 1; // JS months are 0-indexed
      year = parseInt(parts[3], 10);
    }
  }

  if (!parts) {
    // Fallback for unexpected but valid formats that native parser might handle
    const nativeDate = new Date(dateString);
    if (!isNaN(nativeDate.getTime())) {
      return nativeDate;
    }
    console.warn(`[parseRobust] Date string did not match any expected format: "${dateString}"`);
    return null;
  }

  const hours = parseInt(parts[4], 10) || 0;
  const minutes = parseInt(parts[5], 10) || 0;
  const seconds = parseInt(parts[6], 10) || 0;
  
  // Use Date.UTC to create the date object, ensuring it's timezone-agnostic.
  const date = new Date(Date.UTC(year, month, day, hours, minutes, seconds));

  // A final sanity check. `new Date(Date.UTC(2024, 1, 30))` would create a valid date for March 1st.
  // This check ensures the date parts we parsed match the date object created.
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month || date.getUTCDate() !== day) {
    console.warn(`[parseRobust] Invalid date components created an overflowed date for: "${dateString}"`);
    return null;
  }

  return date;
}
