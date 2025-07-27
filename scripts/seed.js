import Business from '../model/business/business.model.js'

async function removeRoomsStep() {
    try {
        await Business.updateMany(
            { 'stepsCompleted.rooms': { $exists: true } },
            { $unset: { 'stepsCompleted.rooms': '' } }
        )
        console.log('✅ Removed "rooms" key from stepsCompleted')
    } catch (err) {
        console.error('❌ Failed to update businesses:', err)
    }
}

export default removeRoomsStep
