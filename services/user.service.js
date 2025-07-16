import User from '../model/user/user.model.js'

export const findUserById = async (id) => {
    return await User.findById(id).select('-password -refreshToken -eventTypeIds -roomIds -carIds')
}

export const findUserByEmail = async (email) => {
    return await User.findOne({ email }).select('+password +refreshToken')
}

export const createUser = async (userData) => {
    const user = new User(userData)
    return await user.save()
}

export const updateUser = async (id, update) => {
    return await User.findByIdAndUpdate(id, update, { new: true })
}

export const deleteUser = async (id) => {
    return await User.findByIdAndDelete(id)
}

export const setRefreshToken = async (id, token) => {
    return await User.findByIdAndUpdate(id, { refreshToken: token })
}

export const clearRefreshToken = async (id) => {
    return await User.findByIdAndUpdate(id, { $unset: { refreshToken: "" } })
}

export const getCurrentUser = async (id) => {
    return await User.findById(id).select('-password -refreshToken -eventTypeIds -roomIds -carIds')
}
