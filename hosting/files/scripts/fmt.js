/**
 * Format number to be human readable
 * @param {number} num 
 * @param {string} units
 * @return {string}
 */
export const formatNumber = (num, units = '') => {
    if (num < 1000) return `${num.toFixed(1)}${units}`.replace('.0', '').trim()
    return formatNumber(num / 1000, units + `k`)
}