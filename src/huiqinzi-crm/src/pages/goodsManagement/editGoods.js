var pricetag, pics, editArea,
  goodsAttrs = ['title', 'price', 'category', 'subcategory',
    'opentime', 'closetime', 'city',
    'position', 'inventory', 'sold', 'specialprice', 'hotposition'
  ]

$('#category').on('change', choseCatogery)
verifyEventsInit()
$.ajax({
  url: '/crmcategory',
  type: 'get',
  data: {
    start: 0,
    length: 100
  },
  success: function (data) {
    if (data.category.length < 1) {
      $('#category').append($('<option value="null">暂无一级分类</option>'))
    } else {
      data.category.map((e, i) => {
        if (e.key == 'shopping') {
          $('#category').append($('<option onclick="choseCatogery" value="' + e.uuid + '">' + e.name + '</option>'))
          $('#category').val(e.uuid).change()
        }
      })
    }
  }
})

editArea = $('#goodsDetail').summernote({
  lang: 'zh-CN',
  height: 300,
  tabsize: 2,
  styleWithSpan: false,
  callbacks: {
    onImageUpload: function (files, editor, $editable) {
      uploadImg(files)
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

if (opr == 'add') {
  pricetag = []
  pics = []

  goodsAttrs.map((e, i) => {
    $('#' + e).val('')
  })
} else {
  pricetag = nodeEdit.pricetag
  pics = nodeEdit.pics
  editArea.summernote('code', nodeEdit.detail)
  goodsAttrs.map((e, i) => {
    nodeEdit[e] ? $('#' + e).val(nodeEdit[e].toString()).change() : ''
  })
  console.log($('#opentime').val())
  pics.map((e, i) => {
    $('.cover-middle').eq(i).show().css(
      'backgroundImage',
      'url(' + imgUrl + e + ')'
    )
    $('.trash-icon-middle').eq(i).show()
  })
  $('#pricetag').empty()
  pricetag.map((e, i) => {
    $('#pricetag').append($('<option value="' + i + '">' + e.name + '/' + e.type + '/价格' + e.price + '元/内部结算价' + e.realprice + '元/库存' + e.stock + '</option>'))
  })
}

function choseCatogery () {
  let category = $('#category').val()
  if (!category) {
    return
  }
  $.ajax({
    url: '/crmcategory/sub',
    type: 'get',
    data: {
      uuid: category,
      start: 0,
      length: 100
    },
    success: function (data) {
      $('#subcategory').empty()
      if (data.category.length < 1) {
        $('#subcategory').append($('<option value="null">暂无二级分类</option>'))
      } else {
        data.category.map((e, i) => {
          $('#subcategory').append($('<option value="' + e.uuid + '">' + e.name + '</option>'))
        })
      }
    }
  })
}

function saveNorms () {
  var t = {
    name: $('#norm-name').val(),
    type: $('#norm-type').val(),
    price: Number($('#norm-price').val()),
    stock: Number($('#norm-stock').val()),
    realprice: Number($('#norm-realprice').val())
  }
  pricetag.push(t)
  $('#pricetag').append($('<option value="' + pricetag.length + '">' + t.name + '/' + t.type + '/' + t.price + '/' + t.realprice + '/' + t.stock + '</option>'))
}

function uploadImg (that) {
  compressionPic(that).then(res => {
    console.log(res)
    if (res != '') {
      var f = Object.prototype.toString.call(that) == '[object FileList]'
      var formData = new FormData()
      formData.append('pic', f ? that[0] : $(that).prop('files')[0])
      formData.append('fileType', 'goods')

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

function saveGoods () {
  if (!verification()) return
  var params = {}
  goodsAttrs.map((e, i) => {
    params[e] = $('#' + e).val()
  })
  params.price = Number(params.price)
  params.position = Number(params.position) || 0
  params.hotposition = Number(params.hotposition) || 0
  params.inventory = Number(params.inventory)
  params.sold = Number(params.sold)
  params.pricetag = JSON.stringify(pricetag)
  params.pics = JSON.stringify(pics)
  params.detail = $('#goodsDetail').summernote('code')
  // 'detail', 'pricetag', 'state', 'pics'
  if (opr == 'add') {
    $.ajax({
      url: '/crmgoods/add',
      data: params,
      type: 'post',
      dataType: 'json',
      success: function (data) {
        createModalTips('成功添加商品')
        gotoGoodsList()
      }
    })
  } else {
    params.uuid = nodeEdit.uuid
    $.ajax({
      url: '/crmgoods/update',
      data: params,
      type: 'put',
      dataType: 'json',
      success: function (data) {
        createModalTips('成功修改商品')
        gotoGoodsList()
      }
    })
  }
}

function gotoGoodsList () {
  var goodsEditUrl = 'pages/goodsManagement/goodsManagement'
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
      }
    })
  })
}
