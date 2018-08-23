
const username = {
    isLength: {
        errmsg: "用户名长度错误！必须在4位到16位之间",
        param: [4, 16]
    }
}
const start = {
    isLength: {
        errmsg: "分页开始参数有误",
        param: [0, 80]
    }
}
const length = {
    isLength: {
        errmsg: "分页长度有误",
        param: [0, 10]
    }
}

const uuid = {
    isUUID: {
        errmsg: "uuid有误！",
        param: 1
    }
}

const password = {
    isLength: {
        errmsg: "密码长度错误！必须在4位到16位之间",
        param: [4, 16]
    }
}

const state = {
    isIn: {
        errmsg: "state有误",
        param: [["on", "off", "new", "wait-on"]]
    }
}

const perm = {
    isIn: {
        errmsg: "perm值有误",
        param: [["root", "admin", "business"]]
    }
}

const title = {
    isLength: {
        errmsg: "title长度有误！",
        param: [1, 100]
    }
}


export const crmusersValidator = {
    uuid: {
        uuid: uuid
    },
    login: {
        username: username,
        password: password
    },
    setPassword: {
        uuid: uuid,
        password: password,
    },
    create: {
        username: username,
        password: password,
        perm: perm,
        state: state
    },
    startLength: {
        start: start,
        length: length
    },
    updateCrmUser: {
        uuid: uuid,
        username: username,
    }
}


export const bannerValidator = {
    add: {
        pic: {
            isLength: {
                errmsg: "图片长度有误",
                param: [4, 128]
            }
        },
        gooduuid: uuid,
        position: {
            isInt: {
                errmsg: "position有误",
                param: { min: 0, max: 9 }
            }
        }
    },
    delete: {
        uuid: uuid
    },
    update: {
        uuid: uuid,
        pic: {
            isLength: {
                errmsg: "图片长度有误",
                param: [4, 128]
            }
        },
        gooduuid: uuid,
        position: {
            isInt: {
                errmsg: "position有误",
                param: { min: 0, max: 9 }
            }
        }
    }
}

export const goodsValidator = {
    add: {
        title: title,
        price: {
            isFloat: {
                errmsg: "price错误！",
                param: { min: 0, max: 1000000000 }
            }
        },
        specialprice: {
            isFloat: {
                errmsg: "specialprice错误！",
                param: { min: 0, max: 1000000000 }
            }
        },
        detail: {
            isLength: {
                errmsg: "detail有误",
                param: [0, 14096]
            }
        },
        category: uuid,
        subcategory: uuid,
        position: {
            isInt: {
                errmsg: "position有误",
                param: { min: 0, max: 9000 }
            }
        },
        inventory: {
            isInt: {
                errmsg: "inventory有误",
                param: { min: 0, max: 900000 }
            }
        },
        sold: {
            isInt: {
                errmsg: "inventory有误",
                param: { min: 0, max: 900000 }
            }
        },
        city: {
            require: 0,
            isLength: {
                errmsg: "city有误",
                param: [1, 12]
            }
        }
    },
    delete: {
        uuid: uuid
    },
    update: {
        uuid: uuid,
        title: title,
        price: {
            isFloat: {
                errmsg: "price错误！",
                param: { min: 0, max: 1000000000 }
            }
        },
        detail: {
            isLength: {
                errmsg: "detail有误",
                param: [0, 14096]
            }
        },
        category: uuid,
        subcategory: uuid,
        position: {
            isInt: {
                errmsg: "position有误",
                param: { min: 0, max: 9000 }
            }
        },
        inventory: {
            isInt: {
                errmsg: "inventory有误",
                param: { min: 0, max: 900000 }
            }
        },
        sold: {
            isInt: {
                errmsg: "inventory有误",
                param: { min: 0, max: 900000 }
            }
        },
        city: {
            require: 0,
            isLength: {
                errmsg: "city有误",
                param: [1, 12]
            }
        }
    },
    startLength: {
        start: start,
        length: length,
        category: uuid,
        subcategory: uuid
    },
    updateState: {
        state: {
            isIn: {
                errmsg: "state有误",
                param: [["on", "off", "new"]]
            }
        }
    }
}

export const actValidator = {
    add: {
        title: title,
        price: {
            isFloat: {
                errmsg: "price错误！",
                param: { min: 0, max: 1000000000 }
            }
        },
         detail: {
             isLength: {
                 errmsg: "detail有误",
                 param: [0, 5000000]
            }
         },
        category: uuid,
        subcategory: uuid,
        position: {
            isInt: {
                errmsg: "position有误",
                param: { min: 0, max: 9000 }
            }
        },
        city: {
            isLength: {
                errmsg: "city有误",
                param: [1, 12]
            }
        }
    },
    amount: {
        groupbyprice: {
            isFloat: {
                errmsg: "groupbyprice错误！",
                param: { min: 0, max: 1000000000 }
            }
        },
        amount: {
            isInt: {
                errmsg: "amount有误",
                param: { min: 0, max: 900 }
            }
        }
    },
    delete: {
        uuid: uuid
    },
    startLength: {
        start: start,
        length: length,
        category: uuid,
        subcategory: uuid
    },
    updatestate: {
        state: {
            isIn: {
                errmsg: "state有误",
                param: [["on", "off", "new", "wait-on"]]
            }
        }
    },
    addgroup: {
        uuid: uuid,
        categoryuuid: uuid,
        subcategoryuuid: uuid,
        position: {
            require: 0,
            isInt: {
                errmsg: "position有误",
                param: { min: 0, max: 9000 }
            }
        }
    }
}

export const cateValidator = {
    add: {
        name: {
            isLength: {
                errmsg: "name有误",
                param: [1, 12]
            }
        },
        /* pic: {
            isLength: {
                errmsg: "pic有误",
                param: [1, 128]
            }
        }, */
        position: {
            isInt: {
                errmsg: "position有误",
                param: { min: 0, max: 90 }
            }
        }
    },
    parent: {
        parent: uuid
    },
    delete: {
        uuid: uuid
    },
    update: {
        uuid: uuid,
        // pic: {
        //     isLength: {
        //         errmsg: "pic有误",
        //         param: [1, 128]
        //     }
        // },
        name: {
            isLength: {
                errmsg: "name有误",
                param: [1, 12]
            }
        },
        position: {
            isInt: {
                errmsg: "position有误",
                param: { min: 0, max: 90 }
            }
        }
    },
    getAll: {
        start: start,
        length: length
    },
    getAllSub: {
        uuid: uuid,
        start: start,
        length: length
    }
}

export const groupsValidator = {
    findAll: {
        uuid: uuid,
        start: start,
        length: length
    }
}

export const ordersValidator = {
    findAll: {
        start: start,
        length: length
    },
    update: {
        uuid: uuid,
        logisticscode: {
            isLength: {
                errmsg: "logisticscode有误",
                param: [1, 16]
            }
        },
        shippercode: {
            isLength: {
                errmsg: "shippercode有误",
                param: [1, 8]
            }
        }
    },
    update2: {
        uuid: uuid
    },
    search: {
        search: {
            isLength: {
                errmsg: "search有误",
                param: [1, 16]
            }
        }
    }
}

export const wxusersValidator = {
    startLength: {
        start,
        length
    },
    uuid: {
        uuid: uuid
    }
}

export const profitValidator = {
    category: {
        uuid: uuid
    },
    date: {
        startdate: {
            isLength: {
                errmsg: "时间错误",
                param: [1, 32]
            }
        },
        enddate: {
            isLength: {
                errmsg: "时间错误",
                param: [1, 32]
            }
        }
    }
}

export const withdrawValidator = {
    get: {
        start,
        length
    },
    deal: {
        uuid: uuid,
        state: {
            isIn: {
                errmsg: "state err",
                param: [["accepted", "refused"]]
            }
        }
    }
}
