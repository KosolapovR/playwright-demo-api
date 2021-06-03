module.exports = {
    logger: (text, ...rest) => {
        console.log(`${new Date().getSeconds()} --- ${text}`, ...rest)
    },
}
