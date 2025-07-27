// utils/progress.js
export const calculateProgress = (stepsCompleted) => {
    const steps = stepsCompleted.toObject ? stepsCompleted.toObject() : { ...stepsCompleted };
    delete steps._id;
    delete steps.rooms;
    const done = Object.values(steps).filter(v => v === true).length;
    const total = Object.keys(steps).length;
    return Math.round((done / total) * 100);
}
