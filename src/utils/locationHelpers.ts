/**
 * Formats a full address string into a shorter, more readable "City, Country" format.
 * @param locationName The full address string returned by reverse geocoding
 * @returns Formatted string "City, Country"
 */
export const formatLocationName = (locationName: string): string => {
    if (!locationName) return '';

    const parts = locationName.split(',').map(p => p.trim());
    const country = parts[parts.length - 1]; // Last part is usually country

    // Try to find the city part
    // Logic: Look for "City", "市", or take the first part as fallback
    let city = parts[0];

    // Heuristic: check first few parts for city-like keywords
    for (let i = 0; i < Math.min(3, parts.length); i++) {
        if (parts[i].includes('市') || parts[i].includes('City') ||
            parts[i].includes('Borough') || parts[i].includes('County')) {
            city = parts[i];
            break;
        }
    }

    return `${city}, ${country}`;
};
