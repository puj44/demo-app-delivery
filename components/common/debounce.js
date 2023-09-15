export const searchDebounce = (func) => {
    let debounceTimer
    return function() {
        const context = this
        const args = arguments
            clearTimeout(debounceTimer)
                
         debounceTimer = setTimeout(() => func.apply(context, args), 700)
    }
}