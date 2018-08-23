(function (root, undefined) {
  var VerifyImplication = {
    // 非空
    'required': {
      method: function (val) {
        val = $.trim(val)
        return val != ''
      },
      message: '不能为空!'
    },
    // 数字范围（整数）
    'num': {
      method: function (val, from, to) {
        if (val == '') return true
        var reg = /^-?[0-9]\d*$/
        if (!reg.test(val)) return false
        if (from && to) return (parseInt(val) >= parseInt(from) && parseInt(val) <= parseInt(to))
        return true
      },
      message: '非法数字格式!'
    },
    // 价格
    'price': {
      method: function (val) {
        return /(^[1-9]([0-9]+)?(\.[0-9]{1,2})?$)|(^(0){1}$)|(^[0-9]\.[0-9]([0-9])?$)/.test(val.trim())
      },
      message: '价格格式不正确！'
    },
    // 积分
    'points': {
      method: function (val) {
        if (val === '') {
          this.message = '不能为空！'
          return false
        } else if (isNaN(val)) {
          this.message = '格式不正确！'
          return false
        } else {
          this.message = '不能为负数!'
          return val >= 0
        }
      }
    },
    // 用户名
    'username': {
      method: function (val) {
        var reg = /^[a-zA-Z0-9_-]{4,16}$/
        return reg.test(val)
      },
      message: '格式不正确!'
    },
    name: {
      method: function (val, form, to) {
        var text = val.trim()
        var res = null
        switch (true) {
          case text === '':
            this.message = '不能为空！'
            res = false
            break
          case !/^.{from,to}$/.test(text):
            this.message = '长度只能为' + from + ' - ' + to + '！'
            res = false
            break
          default:
            this.message = '格式不正确，只能输入中文字符！'
            res = /^[\u4E00-\u9FA5]{1,5}$/.test(text)
            break
        }
        return res
      }
    },
    // 密码
    'password': {
      method: function (val) {
        var reg = /^[\x21-\x7e]{4,16}$/
        return reg.test(val)
      },
      message: '格式不正确!'
    },
    // 邮箱
    'email': {
      method: function (val) {
        if (val == '') {
          this.message = '不能为空！'
          return false
        } else {
          this.message = '请填写正确的邮箱地址'
          var reg = /[\w!#$%&'*+/=?^_`{|}~-]+(?:\.[\w!#$%&'*+/=?^_`{|}~-]+)*@(?:[\w](?:[\w-]*[\w])?\.)+[\w](?:[\w-]*[\w])?/
          return reg.test(val)
        }
      },
      message: '格式不正确!'
    },
    // 一致性对比
    'identical': {
      method: function (val, compare) {
        return $('#' + compare).val() == val
      },
      message: '两次输入的密码不一致!'
    },
    // 手机号码检查
    'mobile': {
      method: function (val) {
        if (val == '') {
          this.message = '不能为空!'
          return false
        } else {
          this.message = '请填写正确的手机号码'
          // /^1[3|4|5|8][0-9]\d{4,8}$/
          var reg = /^1[0-9]{10}$/
          return reg.test(val)
        }
      }
    },
    // 长度范围
    'strlen': {
      method: function (val, from, to) {
        if (arguments.length < 4) {
          return val.length == parseInt(from)
        } else {
          return val.length >= parseInt(from) && val.length <= parseInt(to)
        }
      },
      message: '长度不在范围内!'
    },
    // 身份证号码
    'idcard': {
      method: function (val) {
        if (val == '') {
          this.message = '不能为空！'
          return false
        } else {
          this.message = '格式不正确'
          var reg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/
          return reg.test(val)
        }
      }
    },
    'upload': {
      /** 图片上传验证，限制格式与大小
       * @param {String} path - input file的值，物理路径
       * @param {String} limit - 图片的限制大小，单位为KB
       */
      method: function (path, limit) {
        if (path == '') return true
        if (!(typeof path !== 'undefined' && path != '')) return false
        // 验证图片格式
        var arr = path.split('.')
        if (arr.length < 2) return false
        var postfix = arr[arr.length - 1].toLowerCase()
        var accept = ['png', 'jpg', 'jpeg']
        if ($.inArray(postfix, accept) == -1) {
          this.message = '只能上传png/jpg/jpeg格式的图片!'
          $(arguments[arguments.length - 1]).val('')
          return false
        }
        // 验证图片大小
        if (limit != undefined && !isNaN(Number(limit))) {
          var elem = arguments[arguments.length - 1]
          var fileSize = elem.files[0].size
          var size = fileSize / 1024
          var str
          if (limit / 1024 >= 1) {
            if (limit / (1024 * 1024) >= 1) {
              str = limit / (1024 * 1024) + 'GB!'
            } else {
              str = limit / 1024 + 'MB!'
            }
          } else {
            str = limit + 'KB!'
          }
          if (size > parseInt(limit)) {
            this.message = '上传图片不能大于' + str
            $(arguments[arguments.length - 1]).val('')
            return false
          }
        }
        return true
      }
    }
  }

  function getVerifyObject (key) {
    var obj = VerifyImplication[key]
    if (typeof (obj) === 'object' && obj.method) {
      return obj
    } else {
      return null
    }
  }

  function getVerfiyPars (doc, flag) {
    var verify = doc.attr('verify')
    if (doc.is(':disabled') || doc.is(':hidden') && flag != true) {
      doc.removeClass('has-error')
      return null
    }
    if (typeof (verify) !== 'string') {
      return null
    }
    verify = verify.toLowerCase().split(' ')
    verify = $.grep(verify, function (value, i) {
      value = $.trim(value)
      verify[i] = value
      return value != ''
    })
    return verify
  }

  function rmModaltip (el) {
    var hid = ''
    $('body .modal').each(function (index, element) {
      if ($(element).is(':visible')) {
        hid = $(element).attr('id')
        return false
      }
    })

    if (hid != '') {
      var that = $('#' + hid + ' .modal-footer .tip')
      if (that.length > 0) {
        var tip = el.closest('.form-group').find('label.control-label').html()
        var tip2 = that.html()
        if (tip2.indexOf(tip) > 0) {
          that.html('')
        }
      }
    }
  }

  var verifyModalTip = function (h, t) {
    var tips
    if (typeof h === 'undefined') return false
    if (typeof t !== 'undefined') {
      tips = h + ' ' + t
    } else {
      tips = h
    }

    var hmark = true
    var hid = ''
    $('body .modal').each(function (index, element) {
      if ($(element).is(':visible')) {
        hmark = false
        hid = $(element).attr('id')
        return false
      }
    })

    if (hmark && $('body > .modal-backdrop').length == 0 && Object.prototype.toString.call(createModalTips) === '[object Function]') {
      createModalTips(tips)
    } else if (typeof hid !== 'undefined' && hid != '' && $('#' + hid + ' .modal-footer .tip').length > 0) {
      $('#' + hid + ' .modal-footer .tip').html('<span title=\'' + tips + '\'><i class=\'icon-remove-sign\'></i> ' + tips + '</span>')
    } else {
      alert(tips)
    }
    return false
  }

  var verification = function (doc) {
    var res = true
    if (!doc) doc = 'body'

    $('input,textarea,select', doc).each(function () {
      var key,
        pars,
        obj

      pars = getVerfiyPars($(this))
      if (!pars || pars.length < 1) {
        return true
      }

      key = pars[0]
      obj = getVerifyObject(key)

      if (obj && obj.method) {
        pars[0] = $(this).val()
        pars.push(this)
        res = obj.method.apply(obj, pars)
        if (res != true) {
          var tips = '',
            mtip = '',
            tip = $(this).closest('.form-group').find('label.control-label').html() || ''

          $(this).closest('.form-group').addClass('has-error')
          $(this).closest('.form-group').find('i').attr('class', 'fa fa-exclamation-circle')
          verifyModalTip(mtip + tip, obj.message)
          return false
        } else {
          $(this).closest('.form-group').removeClass('has-error')
          $(this).closest('.form-group').find('i').attr('class', 'fa fa-check-circle-o')
          rmModaltip($(this))
        }
      }
    })

    return res
  }

  var verifyEventsInit = function (doc) {
    var res = true
    if (!doc) doc = 'body'

    $('input[type=\'radio\'], input[type=\'checkbox\']', doc).on('change', function () {
      var that = this
      setTimeout(function () {
        $(that).closest('form').find('input, textarea').each(function (index, element) {
          if ($(element).is(':disabled') && $(element).closest('.form-group').length > 0 && $(element).closest('.form-group').hasClass('has-error')) {
            $(element).closest('.form-group').removeClass('has-error')
            rmModaltip($(element))
          }
        })
      }, 150)
    })

    $('select', doc).on('change', function () {
      var that = this
      setTimeout(function () {
        if ($(that).val()) {
          $(that).closest('.form-group').removeClass('has-error')
          $(that).closest('.form-group').find('i').attr('class', 'fa fa-check-circle-o')
        } else {
          $(that).closest('.form-group').addClass('has-error')
          $(that).closest('.form-group').find('i').attr('class', 'fa fa-exclamation-circle')
        }
      }, 150)
    })

    $('input, textarea', doc).each(function () {
      var key,
        pars,
        obj,
        that = this

      pars = getVerfiyPars($(that), true)
      if (!pars || pars.length < 1) {
        return true
      }

      key = pars[0]
      obj = getVerifyObject(key)
      if (obj && obj.method) {
        $(that).on('blur keyup', function (e) {
          if (e.type == 'keyup' && !$(that).closest('.form-group').hasClass('has-error')) return false
          pars[0] = $(that).val()
          if (pars[pars.length - 1] !== that) {
            pars.push(that)
          }
          res = obj.method.apply(obj, pars)
          if (res != true) {
            $(that).closest('.form-group').addClass('has-error')
            $(that).closest('.form-group').find('i').attr('class', 'fa fa-exclamation-circle')
          } else {
            $(that).closest('.form-group').removeClass('has-error')
            $(that).closest('.form-group').find('i').attr('class', 'fa fa-check-circle-o')
            rmModaltip($(that))
          }
        })
      }
    })
  }

  root.verification = verification // 直接显示调用
  root.verifyEventsInit = verifyEventsInit // 事件绑定触发方式调用
  root.verifyModalTip = verifyModalTip // alert提示
})(window)
