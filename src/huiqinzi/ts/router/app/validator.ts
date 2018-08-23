const uuid = {
    isUUID: {
        errmsg: "uuid有误！",
        param: 1
    }
}


const phone = {
    isMobilePhone: {
        errmsg: "手机号格式错误！",
        param: ["zh-CN"]
    }
}

const name = {
    isLength: {
        errmsg: "姓名错误！",
        param: [1, 30]
    }
}

export const appusersValidator = {
    wxlogin: {
        jscode: {
            isLength: {
                errmsg: "JSCODE错误",
                param: [32, 32]
            }
        }
    },
    update: {
        storename: {
            isLength: {
                errmsg: "storename错误",
                param: [1, 32]
            }
        },
        logo: {
            isLength: {
                errmsg: "logo错误",
                param: [1, 256]
            }
        }
    },
    Distribution: {
        useruuid: uuid
    }
}

export const goodsValidator = {
    getAll: {
        page: {
            isInt: {
                errmsg: "page err",
                param: { min: 0, max: 90 }
            }
        },
        count: {
            isInt: {
                errmsg: "count err",
                param: { min: 0, max: 90 }
            }
        },
        category: uuid,
        subcategory: uuid
    },
    buyGoods: {
        useruuid: uuid,
        activityuuid: uuid,
        amount: {
            isInt: {
                errmsg: "amount err",
                param: { min: 1, max: 90000 }
            }
        },
        address: {
            require: 0,
            isLength: {
                errmsg: "address err",
                param: [1, 256]
            }
        }
    },
    buyActivity: {
        useruuid: uuid,
        activityuuid: uuid,
        amount: {
            isInt: {
                errmsg: "amount err",
                param: { min: 1, max: 90000 }
            }
        },
        contact: {
            isLength: {
                errmsg: "contact err",
                param: [1, 32]
            }
        },
        phone,
        remark: {
            isLength: {
                errmsg: "remark err",
                param: [0, 32]
            }
        }
    },
    getCount: {
        uuid: uuid
    },
    createGroups: {
        useruuid: uuid,
        activityuuid: uuid,
        name,
        phone,
        remark: {
            isLength: {
                errmsg: "remark err",
                param: [0, 32]
            }
        }
    }
}
const address = {
    isLength: {
        errmsg: "address错误",
        param: [1, 255]
    }
}
const contact = {
    isLength: {
        errmsg: "contact有误",
        param: [1, 200]
    }
}

export const addressValidator = {
    newAddress: {
        useruuid: uuid,
        address: address,
        contact: contact,
        phone: phone,
        defaul: {
            isIn: {
                errmsg: "defual错误",
                param: [["yes", "no"]]
            }
        }
    },
    deleteAddress: {
        addressuuid: uuid
    },
    updateAddress: {
        addressuuid: uuid,
        address,
        contact,
        phone,
        defaul: {
            isIn: {
                errmsg: "defual错误",
                param: [["yes", "no"]]
            }
        }
    },
    findAddress: {
        useruuid: uuid
    },
    setDefaul: {
        addressuuid: uuid,
        useruuid: uuid
    }
}

export const wxpayValidator = {
    pay: {
        orderuuid: uuid,
        useruuid: uuid
    }
}

export const withdrawValidator = {
    add: {
        useruuid: uuid,
        amount: {
            isInt: {
                errmsg: 'amount err',
                param: { min: 1, max: 90000 }
            }
        },
        remark: {
            isLength: {
                errmsg: "remark err",
                param: [0, 64]
            }
        }
    },
    get: {
        useruuid: uuid
    }
}