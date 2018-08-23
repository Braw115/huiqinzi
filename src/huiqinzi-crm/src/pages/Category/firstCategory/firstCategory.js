verifyEventsInit()

var oTab = createDt(),
  nodeEdit
var opr, currentImg
// 根据权限移除对应菜单项,当以root权限登录时,会移除class='root'的菜单项.
var role = $.cookie('perm')

$('#' + role).remove()
var token = $.cookie('token')

$('#key').on('change', function () {
  $('#name').val($('#key option:selected').attr('data-name') || $('#key option:selected').text())
})

function createDt () {
  return $('#tableLi').dataTable({
    serverSide: true,
    searching: false,
    ordering: false,
    responsive: true,
    bLengthChange: true,
    lengthMenu: [
      [10, 15, 50, 100],
      [10, 15, 50, 100]
    ],

    language: {
      url: 'js/lib/dataTables.chinese.json'
    },
    ajax: {
      url: '/crmcategory',
      type: 'GET',
      dataSrc: (d) => {
        return d.category
      },
      error: cgiDtError
    },

    // drawCallback: function () {
    //     this.api().column(0).nodes().each(function (cell, i) { cell.innerHTML = ++i; });
    // },

    columns: [{
      data: 'position',
      render: function (d) {
        return d == null || d == '' ? '--' : d
      }
    }, {
      data: 'name',
      render: function (d) {
        return d == null || d == '' ? '--' : d
      }
    },
    {
      data: 'pic',
      render: function (d) {
        return '<img class="catogeryImg" src=' + imgUrl + d + ' alt="">'
      }
    },

    {
      data: 'uuid',
      render: function (d, t, r) {
        $('#key option[value=' + r.key + ']').attr('data-name', r.name)
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
  opr = 'add'
  $('#key').val('rushBuy').change().attr('disable', false)
  $('#modalAdd').modal('show')
  $('#myModalLabel').text('新增分类')
  $('#modalAdd').find('.form-group i').attr('class', 'fa fa-exclamation-circle')
}

function editData (that) {
  opr = 'edit'
  $('#modalAdd').modal('show')
  $('#myModalLabel').text('编辑分类')
  var node = $(that).closest('tr')
  nodeEdit = oTab.api().row(node).data()
  currentImg = nodeEdit.pic

  $('#name').val(nodeEdit.name)
  $('#key').val(nodeEdit.key).change().attr('disable', true)
  $('#position').val(nodeEdit.position)

  $('#modalAdd').find('.form-group i').attr('class', 'fa fa-check-circle-o')

  if (currentImg == '') {
    $('.cover-middle').hide().css(
      'backgroundImage',
      'none'
    )
    $('.trash-icon-middle').hide()
  } else {
    $('.cover-middle').show().css(
      'backgroundImage',
      'url(' + imgUrl + currentImg + ')'
    )
    $('.trash-icon-middle').show()
  }
}

function saveUser () {
  if (!verification()) return

  var parm = {
    name: $('#name').val(),
    pic: currentImg,
    position: $('#position').val(),
    key: $('#key').val()
  }
  if (opr == 'add') {
    $.ajax({
      url: '/crmcategory/add',
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
      url: '/crmcategory/update',
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
  $('.cover-middle').hide().css(
    'backgroundImage',
    'url()'
  )
  $('.trash-icon-middle').hide()
}

function deleteData (that) {
  var node = $(that).closest('tr')
  nodeEdit = oTab.api().row(node).data()
  createModalTips('确定要删除该分类？', 'confirmDeleteData')
}

function confirmDeleteData () {
  $.ajax({
    url: '/crmcategory/' + nodeEdit.uuid,
    type: 'delete',
    success: function (data) {
      createModalTips(data.msg || '删除成功！')
      oTab.api().ajax.reload(null, false)
    }
  })
}

function checkTypeChange () {
  if ($('#inspect option:selected').val() == '例行检查') {
    $('.num').hide()
    $('.checkType2').hide()
    $('.checkType1').show()
  } else {
    $('.num').show()
    $('.checkType2').show()
    $('.checkType1').hide()
  }
}

// 上传文件/图片
// $("#fileUploadContent").initUpload({
//     "uploadUrl": "/uploads/pics", //上传文件信息地址
//     // "size": 3720, //文件大小限制,单位kb,默认不限制
//     // "maxFileNumber": 5, //文件个数限制,为整数
//     // "fileSavePath": "", //文件上传地址,后台设置的根目录
//     "beforeUpload": beforeUploadFun, //在上传前执行的函数
//     "onUpload": onUploadFun, //上传后执行的函数
//     autoCommit: true, //文件是否自动上传
//     "fileType": ['png', 'jpg', 'jpeg', 'bmp', 'tiff', 'gif', 'svg', 'ai'] //文件类型限制,默认不限制,注意写的是文件后缀
// })

function beforeUploadFun (opt) {
  opt.otherData = [{
    name: 'fileType',
    value: 'category'
  }]
}

function onUploadFun (opt, data) {
  uploadTools.uploadError(opt) // 显示上传错误
  uploadTools.uploadSuccess(opt) // 显示上传成功
}

function testUpload () {
  var opt = uploadTools.getOpt('fileUploadContent')
  uploadEvent.uploadFileEvent(opt)
}

function uploadImage (that) {
  compressionPic(that).then(res => {
    console.log(res)
    if (res != '') {
      var formData = new FormData()
      // formData.append("pic", $("#pic").prop("files")[0]);
      formData.append('pic', res)
      formData.append('fileType', 'category')

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
