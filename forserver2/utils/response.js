export const success = (res, message, data = {}) => {
    return res.json({
        status: "success",
        message,
        data
    });
};

export const fail = (res, message, code = 400) => {
    return res.status(code).json({
        status: "fail",
        message
    });
};
