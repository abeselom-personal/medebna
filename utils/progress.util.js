// utils/progress.js
export const calculateProgress = (stepsCompleted) => {
    const steps = Object.keys(stepsCompleted)
    const done = steps.filter(key => stepsCompleted[key]).length
    return Math.round((done / steps.length) * 100)
}
