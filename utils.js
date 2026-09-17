export function coordinatesToKey(x, y) {
    return `${x},${y}`;
}

export function getActiveTool() {
    const activeTool = document.querySelector('input[name="tool"]:checked');
    return activeTool ? activeTool.value : null;
}

export function levelIntToString(level) {
    if (level > 50) {
        return "high";
    }
    if (level > 0) {
        return "low";
    }
    return "none";
}