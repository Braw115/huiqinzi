verifyEventsInit()
$('#categoryG').on('change', getCategorySub)
$('#subcategoryG').on('change', getGoods)
var oTab_goods = null,
  oTab = createDt(),
  nodeEdit, currentImg, opr, curruuid
// 根据权限移除对应菜单项,当以root权限登录时,会移除class='root'的菜单项.
var role = $.cookie('perm')
getCategory()

$('#' + role).remove()
var token = $.cookie('token')

function createDt () {
  return $('#tableLi').dataTable({
    serverSide: true,
    searching: false,
    ordering: false,
    responsive: true,
    bLengthChange: true,
    'paging': false, // 禁止分页
    lengthMenu: [
      [10, 15, 50, 100],
      [10, 15, 50, 100]
    ],
    drawCallback: function () {
      this.api().column(0).nodes().each(function (cell, i) {
        cell.innerHTML = ++i
      })
    },
    language: {
      url: 'js/lib/dataTables.chinese.json'
    },
    ajax: {
      url: '/crmbanner',
      type: 'GET',
      dataSrc: (d) => {
        return d
      },
      error: cgiDtError
    },
    columns: [{
      data: 'position'
    },

    {
      data: 'pic',
      render: function (d) {
        return '<img class="bannerImg" src="' + imgUrl + d + '" alt="" >'
      }
    },
    {
      data: 'created',
      render: function (d) {
        return d ? new Date(d).format('yyyy-MM-dd hh:mm:ss') : ''
      }
    },

    {
      data: 'uuid',
      render: function (d) {
        return '<div class="btn-group btn-group-sm" style="min-width:100px;">' +
            '<a class="btn btn-primary _edit" data-toggle="tooltip" data-container="body" onclick="editData(this)"  title="编辑"><i class="fa fa-pencil"></i></a>' +
            '<a class="btn btn-danger btn_delete" data-toggle="tooltip" data-container="body" onclick="deleteData(this)" title="删除"><i class="fa fa-trash"></i></a> '
        '</div>'
      }
    }
    ],
    'drawCallback': function () {
      $('body > div.tooltip').remove()
      $('[data-toggle="tooltip"]').tooltip()
    }
  })
}

function openAdd () {
  $('.form-horizontal').resetForm()
  $('input[name="test"]:checked').prop('checked', false)

  $('#modalAdd').modal('show')
  $('#bumeng').show()
  $('#managerUser').hide()
  $('#departments').hide()
  $('#selectFloor').hide()
  opr = 'add'
  $('.cover-middle').hide().css(
    'backgroundImage',
    'url()'
  )
  $('.trash-icon-middle').hide()
  $('#myModalLabel').text('轮播管理')
  $('#modalAdd').find('.form-group i').attr('class', 'fa fa-exclamation-circle')
}

function editData (that) {
  $('.form-horizontal').resetForm()

  opr = 'edit'

  $('#modalAdd').modal('show')
  $('#myModalLabel').text('轮播管理')
  var node = $(that).closest('tr')
  nodeEdit = oTab.api().row(node).data()
  currentImg = nodeEdit.pic

  $('.cover-middle').show().css(
    'backgroundImage',
    'url(' + imgUrl + currentImg + ')'
  )
  $('.trash-icon-middle').show()

  $('#position').val(nodeEdit.position)
  $('#synopsis').val(nodeEdit.synopsis)
  $('#gooduuid').val(nodeEdit.title)
  $('#modalAdd').find('.form-group i').attr('class', 'fa fa-check-circle-o')
}

function saveUser () {
  if (!verification()) return
  var parm = {
    pic: currentImg,
    gooduuid: $('#gooduuid').attr('data-uuid') || nodeEdit.gooduuid,
    position: $('#position').val(),
    title: $('#gooduuid').val(),
    synopsis: $('#synopsis').val(),
    category: $('#categoryG option:selected').attr('data-key'),
    price: parseFloat($('#gooduuid').attr('data-price') || nodeEdit.price)
  }
  if (opr == 'add') {
    $.ajax({
      url: '/crmbanner/add',
      data: parm,
      type: 'post',
      success: function (data) {
        if (data) {
          createModalTips(data.msg || '添加成功！')
          $('#modalAdd').modal('hide')
          oTab.api().ajax.reload(null, false)
        }
      },
      error: cgiDtError
    })
  } else if (opr == 'edit') {
    parm.uuid = nodeEdit.uuid
    $.ajax({
      url: '/crmbanner/update',
      data: parm,
      type: 'put',
      success: function (data) {
        if (data) {
          createModalTips(data.msg || '修改信息成功！')
          $('#modalAdd').modal('hide')
          oTab.api().ajax.reload(null, false)
        }
      },
      error: cgiDtError
    })
  }
}

function deleteData (that) {
  var node = $(that).closest('tr')
  nodeEdit = oTab.api().row(node).data()
  createModalTips('确定要删除所选Banner？', 'confirmDeleteData')
}

function confirmDeleteData () {
  $.ajax({
    url: '/crmbanner/' + nodeEdit.uuid,
    type: 'delete',
    success: function (data) {
      createModalTips(data.msg || 'Banner成功！')
      oTab.api().ajax.reload(null, false)
    }
  })
}

async function getCategory () {
  $.ajax({
    url: '/crmcategory',
    type: 'get',
    data: {
      start: 0,
      length: 100
    },
    success: function (data) {
      if (data.category.length < 1) {
        $('#categoryG').append($('<option value="null">暂无一级分类</option>'))
      } else {
        data.category.map((e, i) => {
          $('#categoryG').append($('<option onclick="choseCatogery" data-key="' + e.key + '" value="' + e.uuid + '">' + e.name + '</option>'))
        })
        $('#categoryG').change()
      }
    }
  })
}

function getCategorySub () {
  $.ajax({
    url: '/crmcategory/sub',
    type: 'get',
    data: {
      uuid: $('#categoryG').val(),
      start: 0,
      length: 100
    },
    success: function (data) {
      $('#subcategoryG').empty()
      if (data.category.length < 1) {
        $('#subcategoryG').append($('<option value="null">暂无二级分类</option>'))
      } else {
        data.category.map((e, i) => {
          $('#subcategoryG').append($('<option value="' + e.uuid + '">' + e.name + '</option>'))
        })
        $('#subcategoryG').val(data.category[0].uuid).change()
      }
    }
  })
}

async function getGoods () {
  if (oTab_goods) {
    oTab_goods.fnSettings().ajax.data.category = $('#categoryG').val()
    oTab_goods.fnSettings().ajax.data.subcategory = $('select[name=subcategoryG]').val()
    dtReloadData(oTab_goods, false)
    $('#modal_goodsList').modal('show')
  } else {
    oTab_goods = createGoodsDt()
  }
}

function createGoodsDt () {
  return $('#table_goodsList').dataTable({
    serverSide: true,
    searching: false,
    ordering: false,
    responsive: true,
    bLengthChange: true,
    // paging: false,
    dom: 'Bfrtip',
    buttons: [{
      extend: 'excel',
      text: 'Save current page',
      exportOptions: {
        modifier: {
          page: 'current'
        }
      }
    }],
    lengthMenu: [
      [10, 15, 50, 100],
      [10, 15, 50, 100]
    ],
    // drawCallback: function() {
    //     this.api().column(0).nodes().each(function(cell, i) { cell.innerHTML = ++i; });
    // },
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
    {
      data: 'city'
    },
    {
      data: 'created',
      render: (d) => {
        return d ? new Date(d).format('yyyy-MM-dd hh:mm:ss') : ''
      }
    },
    {
      data: 'uuid',
      render: function (d) {
        // <input type="radio" name="goodsChose" id="goodsChose" onclick="choseGoods(this)" value="' + d + '">
        return '<button type="button" class="btn btn-success" onclick="choseGoods(this)">选中商品</button>'
      }
    }
    ]
  })
}

function choseFile () {
  console.log("$('#pic').click()")
  $('#pic').click()
}

function choseGoods (that) {
  console.log($(that).attr('value'))
  var node = $(that).closest('tr'),
    nodeEdit_goods = oTab_goods.api().row(node).data()
  $('#modal_goodsList').modal('hide')
  $('#gooduuid').val(nodeEdit_goods.title).attr('data-uuid', nodeEdit_goods.uuid).attr('data-price', nodeEdit_goods.price)
}

function uploadImage (that) {
  compressionPic(that).then(res => {
    console.log(res)
    if (res != '') {
      var formData = new FormData()
      formData.append('pic', res)
      formData.append('fileType', 'banner')

      $.ajax({
        url: '/uploads/pics',
        data: formData,
        type: 'post',

        contentType: false,
        processData: false,
        success: function (data) {
          currentImg = data[0]
          var image_wrapper = $(that).parent()
          image_wrapper.next().show()
          image_wrapper
            .next()
            .css(
              'backgroundImage',
              'url(' + imgUrl + currentImg + ')'
            )

          image_wrapper
            .next()
            .next()
            .show()
        }
      })
    }
  })
}

function deleteImage (that) {
  $.ajax({
    url: '/uploads/pic',
    data: {
      url: currentImg
    },
    type: 'delete',
    dataType: 'json',
    success: function (data) {
      currentImg = ''
      $('.cover-middle').hide().css(
        'backgroundImage',
        'url()'
      )
      $('.trash-icon-middle').hide()
      createModalTips('删除成功！')
    }
  })
}
