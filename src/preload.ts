// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
window.addEventListener('DOMContentLoaded', () => {
    // @ts-ignore
    const replaceText = (selector: string, text: string) => {
        // @ts-ignore
        const element = document.getElementById(selector)
        // @ts-ignore
        if (element)
            element.innerText = text
    }
    // @ts-ignore
    for (const type of ['chrome', 'node', 'electron']) {
        // @ts-ignore
        replaceText(`${type}-version`, process.versions[type])
    }
})
