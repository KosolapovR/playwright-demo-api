module.exports = (user) => {
    const resultedUser = { ...user._doc }

    resultedUser.password = undefined

    return resultedUser
}
