const isValidPostUserRequest = (reqBody) => {
    const valid = true

    const { login, password, email } = reqBody

    if (!login || !password) return !valid
    if (login.length < 4) return !valid
    if (password.length < 6) return !valid
    if (email.length < 6) return !valid

    return valid
}

module.exports = isValidPostUserRequest
