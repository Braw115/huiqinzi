var pricetag, pics, editArea, oTab, oTab_goods = null,
  nodeEdit_goods,
  goodsAttrs = [
    'businessuuid', 'category', 'subcategory', 'position', 'hotposition',
    'title', 'reservation', 'city', 'price', 'realprice', 'specialprice',
    'substance', 'sold',
    'opentime', 'closetime', 'rush_opentime', 'rush_closetime',
    'groupbyprice', 'amount', 'realprice', 'distributionGoods'
  ]
var perm = $.cookie('perm'),
  uuid = $.cookie('uuid')

$('#category,#categoryG').on('change', function () {
  choseCatogery($(this))
})
$('#distribution').on('change', function () {
  chosedistribution($(this))
})

$('#subcategoryG').on('change', getGoods)
verifyEventsInit()
initPage()

function initPage () {
  editArea = $('#goodsDetail').summernote({
    lang: 'zh-CN',
    height: 1000,
    tabsize: 2,
    styleWithSpan: false,
    toolbar: [
      // [groupName, [list of button]]

      ['style', ['style']],
      ['font', ['bold', 'underline', 'clear']],
      ['fontname', ['fontname']],
      ['fontsize', ['fontsize']],
      ['height', ['height']],
      ['color', ['color']],
      ['para', ['ul', 'ol', 'paragraph']],
      ['table', ['table']],
      ['insert', ['link', 'picture']],
      ['view', ['fullscreen', 'codeview', 'help']]
    ],
    callbacks: {
      onImageUpload: function (files, editor, $editable) {
        uploadImg(files, 'activity')
      }
    }
  })
  $('.form_datetime').datetimepicker({
    weekStart: 0, // 一周从哪一天开始
    todayBtn: 1, //
    autoclose: true,
    todayHighlight: 1,
    format: 'yyyy-mm-dd hh:ii:ss',
    language: 'zh-CN',
    startView: 0,
    forceParse: 0,
    showMeridian: 1,
    // initialDate: new Date()
    defaultDate: new Date()
  })

  new Promise((resolve, reject) => {
    getAllBusiness()
    getCategory(resolve)
  }).then(() => {
    if (opr == 'add') {
      pricetag = []
      pics = []
      $('[name=acttime]').prop('checked', true)
      goodsAttrs.map((e, i) => {
        $('#' + e).not('select').val('')
      })
    } else {
      pricetag = nodeEdit.pricetag
      pics = nodeEdit.pics
      acttime = nodeEdit.acttime
      editArea.summernote('code', nodeEdit.detail.replace(/<o:p>.*<\/o:p>/g, ''))
      goodsAttrs.map((e, i) => {
        nodeEdit[e] ? $('#' + e).val(nodeEdit[e].toString()).change() : ''
      })
      setTimeout(function () {
        $('#subcategory').val(nodeEdit.subcategory)
      }, 500)
      $('#gooduuid').val(nodeEdit.title)
      $('#rush_opentime').val(nodeEdit.opentime)
      $('#rush_closetime').val(nodeEdit.closetime)
      var actBanners = []

      for (let i = 0, len = pics.length; i < len; i++) {
        if (pics[i].indexOf('activitybanner') == 0) {
          actBanners.push(pics[i])
        }
      }
      if (actBanners.length == 0) {
        actBanners = pics.splice(0, 3)
      }
      for (let i = 0, len = actBanners.length; i < len; i++) {
        $('.cover-middle').eq(i).show().css(
          'backgroundImage',
          'url(' + imgUrl + actBanners[i] + ')'
        )
        $('.trash-icon-middle').eq(i).show()
      }

      $('[name=acttime]').prop('checked', false)
      acttime.map((e, i) => {
        $('[name=acttime][value=' + e + ']').prop('checked', true)
      })
    }
    renderNorms()
  })
}

function createGoodsDt () {
  return $('#table_goodsList').dataTable({
    serverSide: true,
    searching: false,
    ordering: false,
    responsive: true,
    bLengthChange: true,
    // paging: false,
    lengthMenu: [
      [10, 15, 50, 100],
      [10, 15, 50, 100]
    ],
    language: {
      url: 'js/lib/dataTables.chinese.json'
    },
    ajax: {
      url: '/crmactivity/getAll',
      type: 'GET',
      data: {
        category: $('select[name=categoryG]').val(),
        subcategory: $('select[name=subcategoryG]').val()
      },
      dataSrc: (d) => {
        return d.activity
      },
      error: cgiDtError
    },
    columns: [{
      data: 'position'
    },
      {
        data: 'title'
      },
      {
        data: 'price'
      },
      // {
      //   data: 'city'
      // },
      {
        data: 'created',
        render: (d) => {
          return d ? new Date(d).format('yyyy-MM-dd hh:mm:ss') : ''
        }
      },
      {
        data: 'uuid',
        render: function (d) {
          return '<input type="radio" name="goodsChose" id="goodsChose" onclick="choseGoods(this)" value="' + d + '">'
        }
      }
    ]
  })
}

function getAllBusiness () {
  $.ajax({
    url: '/crmusers/business',
    type: 'get',
    data: {
      start: 0,
      length: 100
    },
    success: function (data) {
      $('#businessuuid').empty()
      if (data.length < 1) {
        $('#businessuuid').append($('<option value="null">暂无商户</option>'))
      } else {
        data.map((e, i) => {
          $('#businessuuid').append($('<option value="' + e.uuid + '">' + e.username + '</option>'))
        })
        $('#businessuuid').val(opr == 'add' ? data[0].uuid : nodeEdit.businessuuid)
      }
      if (perm == 'business') {
        $('#businessuuid').val(uuid).attr('disabled', true)
      }
    }
  })
}

function getCategory (resolve) {
  $.ajax({
    url: '/crmcategory',
    type: 'get',
    data: {
      start: 0,
      length: 100
    },
    success: function (data) {
      if (data.category.length < 1) {
        $('#category,#categoryG').append($('<option value="null">暂无一级分类</option>'))
      } else {
        data.category.map((e, i) => {
          var t = null
          if (e.key == 'rushBuy') {
            t = 'limitTimeAction'
          } else if (e.key == 'groupBuy') {
            t = 'groupAction'
          } else {
            t = 'generalAction'
          }
          if (e.key != 'rushBuy' && e.key != 'groupBuy') {
            $('#category').append('<option onclick="choseCatogery" data-type="' + t + '" data-key="' + e.key + '"  value="' + e.uuid + '">' + e.name + '</option>')
          }
        })
        $('#category').val(opr == 'add' ? $('#category option:first').attr('value') : nodeEdit.category).change()
        setTimeout(function () {
          // $('#categoryG').val($('#categoryG option:first').attr('value')).change()
          // $('#reservation').val('false')
        }, 100)
      }
      resolve()
    }
  })
}

function showGoodsList () {
  $('#modal_goodsList').modal('show')
}

function getGoods () {
  // if (!$('#modal_goodsList').hasClass('in')) {
  //   return
  // }
  if (oTab_goods) {
    if ($('#categoryG option:selected').attr('data-key') == 'shopping') {
      oTab_goods.fnSettings().ajax.url = '/crmgoods/getAll'
      oTab_goods.fnSettings().ajax.dataSrc = (d) => {
        return d.goods
      }
    } else {
      oTab_goods.fnSettings().ajax.url = '/crmactivity/getAll'
      oTab_goods.fnSettings().ajax.dataSrc = (d) => {
        return d.activity
      }
    }
    oTab_goods.fnSettings().ajax.data.category = $('#categoryG').val()
    oTab_goods.fnSettings().ajax.data.subcategory = $('select[name=subcategoryG]').val()
    dtReloadData(oTab_goods, false)
  } else {
    oTab_goods = createGoodsDt()
  }
}

function choseCatogery (that) {
  var id = $(that).attr('id') == 'category' ? '#subcategory' : '#subcategoryG'
  if (id == '#subcategory') {
    $('.groupAction,.limitTimeAction,.generalAction').hide()
    switch ($('#category option:checked').attr('data-type')) {
      case 'generalAction':
        $('.generalAction').show()
        nodeEdit_goods = null
        break
      case 'limitTimeAction':
        $('.limitTimeAction').show()
        // $('#groupbyprice').attr('placeholder', '请输入疯抢价')
        // $('#groupbyprice').parent().prev().text('疯抢价')
        break
      case 'groupAction':
        $('.groupAction').show()
        // $('#groupbyprice').attr('placeholder', '请输入团购价')
        // $('#groupbyprice').parent().prev().text('团购价')
        break
      default:
        break
    }
  }

  $.ajax({
    url: '/crmcategory/sub',
    type: 'get',
    data: {
      uuid: $(that).val(),
      start: 0,
      length: 100
    },
    success: function (data) {
      $(id).empty()
      if (data.category.length < 1) {
        $(id).append($('<option value="null">暂无二级分类</option>'))
      } else {
        data.category.map((e, i) => {
          $(id).append($('<option value="' + e.uuid + '">' + e.name + '</option>'))
        })
        $(id).change()
      }
    }
  })
}

function deleteNorms () {
  var index = $('#pricetag').val()
  pricetag.splice(index, 1)
  renderNorms()
}

function renderNorms () {
  $('#pricetag').empty()
  pricetag.map((e, i) => {
    $('#pricetag').append($('<option value="' + i + '">' + e.name + '/' + e.type + '/价格' + e.price + '元/团购价' + e.groupprice + '元/内部结算价' + e.realprice + '元/库存' + e.stock + '</option>'))
  })
}

function saveNorms () {
  var e = {
    name: $('#norm-name').val(),
    type: $('#norm-type').val(),
    price: Number($('#norm-price').val()),
    groupprice: Number($('#norm-groupprice').val()),
    stock: Number($('#norm-stock').val()),
    realprice: Number($('#norm-realprice').val())
  }
  pricetag.push(e)
  $('#pricetag').append($('<option value="' + pricetag.length + '">' + e.name + '/' + e.type + '/价格' + e.price + '元/团购价' + e.groupprice + '元/内部结算价' + e.realprice + '元/库存' + e.stock + '</option>'))
}

function uploadImg (that, type) {
  compressionPic(that).then(res => {
    if (res != '') {
      var f = Object.prototype.toString.call(that) == '[object FileList]',
        formData = new FormData()
      formData.append('pic', res)
      formData.append('fileType', type || 'activitybanner')
      $.ajax({
        url: '/uploads/pics',
        data: formData,
        type: 'post',
        contentType: false,
        processData: false,
        success: function (data) {
          pics.push(data[0])
          if (!f) {
            var image_wrapper = $(that).parent()
            image_wrapper.next().show()
            image_wrapper
              .next()
              .css(
                'backgroundImage',
                'url(' + imgUrl + data[0] + ')'
              )

            image_wrapper
              .next()
              .next()
              .show()
          } else {
            editArea.summernote(
              'insertImage',
              imgUrl + data[0]
            )
          }
        }
      })
    }
  })
}

function onMediaRemove ($target, $editable) {
  var f = $($target).attr('src').replace(imgUrl, '')
  deleteImage(f)
}

function deleteImage (that) {
  var t = Object.prototype.toString.call(that) == '[object String]'
  var currentImg = t ? that : $(that).parent().find('.cover-middle').css('backgroundImage').replace('url(\"' + imgUrl, '').replace('\")', '')
  $.ajax({
    url: '/uploads/pic',
    data: {
      url: currentImg
    },
    type: 'delete',
    dataType: 'json',
    success: function (data) {
      var idx = pics.indexOf(currentImg)
      pics.splice(idx, 1)
      currentImg = ''
      if (!t) {
        $(that).parent().find('.cover-middle').hide().css(
          'backgroundImage',
          'url()'
        )
        $(that).parent().find('.trash-icon-middle').hide()
      }
      createModalTips('删除成功！')
    }
  })
}

function choseGoods (that) {
  nodeEdit_goods = oTab_goods.api().row($(that).closest('tr')).data()
  $('#gooduuid').val(nodeEdit_goods.title)
  $('#modal_goodsList').modal('hide')
}

function saveGoods () {
  if (!verification()) return
  var params = {},
    acttime = []
  $('input[name="acttime"]:checked').each(function () {
    acttime.push($(this).val())
  })
  goodsAttrs.map((e, i) => {
    $('#' + e).closest('.form-group').is(':visible') ? params[e] = $('#' + e).val() : ''
  })
  params.position = Number(params.position)
  params.hotposition = Number(params.hotposition)
  params.price = Number(params.price)
  params.pricetag = JSON.stringify(pricetag)
  params.pics = JSON.stringify(pics)
  params.detail = $('#goodsDetail').summernote('code').replace(/<o:p>.*<\/o:p>/g, '')
  params.acttime = JSON.stringify(acttime)
  var goodsTemp = nodeEdit_goods || ($('#category option:selected').attr('data-type') != 'generalAction' && nodeEdit) // opr == 'add' ? nodeEdit_goods : nodeEdit_goods || nodeEdit
  if (goodsTemp) {

    params.title = goodsTemp.title
    params.price = goodsTemp.price
    params.reservation = goodsTemp.reservation
    params.city = goodsTemp.city
    params.acttime = JSON.stringify(goodsTemp.acttime)
    params.detail = goodsTemp.detail
    params.specialprice = goodsTemp.specialprice
    params.pics = JSON.stringify(goodsTemp.pics)
    params.pricetag = JSON.stringify(goodsTemp.pricetag)
    params.opentime = params.rush_opentime || goodsTemp.opentime // || goodsTemp.opentime
    params.closetime = params.rush_closetime || goodsTemp.closetime // || goodsTemp.closetime
  }
  delete params.rush_opentime
  delete params.rush_closetime
  if (opr == 'add') {
    $.ajax({
      url: '/crmactivity/add',
      data: params,
      type: 'post',
      dataType: 'json',
      success: function (data) {
        createModalTips('成功添加活动')
        gotoGoodsList()
      }
    })
  } else {
    params.uuid = nodeEdit.uuid
    $.ajax({
      url: '/crmactivity/update',
      data: params,
      type: 'put',
      dataType: 'json',
      success: function (data) {
        createModalTips('成功修改活动')
        gotoGoodsList()
      }
    })
  }
}

function gotoGoodsList () {
  var goodsEditUrl = 'pages/actionsManagement/actionsManagement/actionsManagement'
  $('.content').load(goodsEditUrl + '.html', function () {
    $.ajax({
      type: 'GET',
      dataType: 'script',
      cache: true,
      url: goodsEditUrl + '.js',
      complete: function () {
        $('body .modal').on('hidden.bs.modal', function () {
          $('.has-error', this).removeClass('has-error')
          $('.modal-footer .tip', this).html('')
        })
        oTab = null
        oTab_goods = null
      }
    })
  })
}
