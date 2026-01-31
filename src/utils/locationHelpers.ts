/**
 * Formats a full address string into a shorter, more readable "City, Country" format.
 * @param locationName The full address string returned by reverse geocoding
 * @returns Formatted string "City, Country"
 */
export const formatLocationName = (locationName: string): string => {
    if (!locationName) return '';

    const parts = locationName.split(',').map(p => p.trim());
    if (parts.length === 0) return locationName;
    
    const country = parts[parts.length - 1]; // Last part is usually country

    // Try to find the city/region part
    // Skip parts that are too short (likely street/building names) or numbers
    let city = parts[parts.length - 1]; // Fallback to country
    
    for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];
        // Skip very short parts (street numbers, building codes)
        if (part.length < 2) continue;
        // Skip pure numbers
        if (/^\d+$/.test(part)) continue;
        
        // Look for administrative areas (city, prefecture, state, etc.)
        if (part.includes('市') || part.includes('県') || part.includes('都') || 
            part.includes('区') || part.includes('Province') ||
            part.includes('City') || part.includes('Prefecture') ||
            part.includes('Borough') || part.includes('County') ||
            part.includes('州') || part.includes('省')) {
            city = part;
            break;
        }
        
        // If we haven't found a city yet, use the last meaningful part before country
        if (i === parts.length - 2 && part.length >= 2) {
            city = part;
        }
    }

    // If city is same as country, return only country
    if (city === country) return country;
    
    return `${city}, ${country}`;
};
