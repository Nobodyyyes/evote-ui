export function formatDateTime(value?: string | Date | null): string {
    if (!value) {
        return '-'
    }

    const raw = String(value)

    const match = raw.match(/^(\d{4}-\d{2}-\d{2})[T\s](\d{2}:\d{2}:\d{2})/)

    if (match) {
        return `${match[1]} ${match[2]}`
    }

    const date = new Date(raw)

    if (Number.isNaN(date.getTime())) {
        return raw
    }

    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const seconds = String(date.getSeconds()).padStart(2, '0')

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}