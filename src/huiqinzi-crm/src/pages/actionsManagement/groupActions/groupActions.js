verifyEventsInit()
getCategory()
$('#categoryG').on('change', getCategorySub)
$('#subcategoryG').on('change', getGroups)
// 活动时间
$('.form_datetime').datetimepicker({
  weekStart: 0, // 一周从哪一天开始
  todayBtn: 1, //
  autoclose: true,
  todayHighlight: 1,
  language: 'zh-CN',
  startView: 0,
  forceParse: 0,
  showMeridian: 1
})

$('#example').DataTable({
  dom: 'Bfrtip',
  buttons: [
    'copy',
    {
      extend: 'excel',
      messageTop: 'The information in this table is copyright to Sirius Cybernetics Corp.'
    },
    {
      extend: 'pdf',
      messageBottom: null
    },
    {
      extend: 'print',
      messageTop: function () {
        printCounter++

                if (printCounter === 1) {
          return 'This is the first time you have printed this document.'
                } else {
          return 'You have printed this document ' + printCounter + ' times'
                }
      },
      messageBottom: null
    }
  ]
})

var oTab = null,
  nodeEdit
var opr
// 根据权限移除对应菜单项,当以root权限登录时,会移除class='root'的菜单项.
var role = $.cookie('perm')

$('#' + role).remove()
var token = $.cookie('token')
console.log(token)

function getCategory () {
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
        var idx
        data.category.map((e, i) => {
          if (e.name.indexOf('团购') != -1) {
            idx = e.uuid
            $('#categoryG').append(
              $(
                '<option onclick="choseCatogery" value="' +
                                    e.uuid +
                                    '">' +
                                    e.name +
                                    '</option>'
              )
            )
            $('#categoryG')
              .val(idx)
              .change()
              .prop('disabled', true)
          }
        })
        // $("#categoryG").change();
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
        $('#subcategoryG').append(
          $('<option value="null">暂无二级分类</option>')
        )
        $('tbody').html("<tr><td colspan='6'>没有匹配结果</td></tr>")
      } else {
        data.category.map((e, i) => {
          $('#subcategoryG').append(
            $('<option value="' + e.uuid + '">' + e.name + '</option>')
          )
        })
        $('#subcategoryG').change()
      }
    }
  })
}

function getGroups () {
  if (oTab) {
    oTab.fnSettings().ajax.data.uuid = $('select[name=subcategoryG]').val()
    dtReloadData(oTab, false)
  } else {
    oTab = createDt()
  }
}

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
    // drawCallback: function() {
    //     this.api().column(0).nodes().each(function(cell, i) { cell.innerHTML = ++i; });
    // },
    language: {
      url: 'js/lib/dataTables.chinese.json'
    },
    ajax: {
      url: '/crmgroups/findAll',
      type: 'GET',
      data: {
        uuid: $('select[name=subcategoryG]').val()
      },
      dataSrc: d => {
        return d.groups
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
      render: d => {
        return d ? new Date(d).format('yyyy-MM-dd hh:mm:ss') : ''
      }
    },
    {
      data: 'uuid',
      render: function (d, t, r) {
        var t =
                        r.state != 'on'
                          ? '<a class="btn btn-info  btn-forup" onclick="upDownGoods(this)" data-toggle="tooltip" data-container="body" title="上架"><i class="fa fa-arrow-up"></i></a></div> '
                          : '<a class="btn btn-danger  btn-fordown" onclick="upDownGoods(this)" data-toggle="tooltip" data-container="body" title="下架"><i class="fa fa-arrow-down"></i></a></div>'
        return (
          '<div class="btn-group btn-group-sm" style="min-width:100px;">' +
                        '<a class="btn btn-primary _edit" data-toggle="tooltip" data-container="body" onclick="editData(this)"  title="编辑"><i class="fa fa-pencil"></i></a>' +
                        '<a class="btn btn-danger btn_delete" data-toggle="tooltip" data-container="body" onclick="deleteData(this)" title="删除"><i class="fa fa-trash"></i></a> ' +
                        t
        )
      }
    }
    ],
    drawCallback: function () {
      $('body > div.tooltip').remove()
      $('[data-toggle="tooltip"]').tooltip()
    }
  })
}
/* 设置提示模态框点击遮罩层不隐藏 */
$('#modalAdd').modal({
  backdrop: 'static',
  show: false
})

function openAdd () {
  // $(".form-horizontal").resetForm();
  //
  // $(".num").show()
  // $(".checkType2").show()
  // $(".checkType1").hide()
  //
  opr = 'add'
  gotoGoodsEdit()
  // $("#inspect").attr("disabled", false);
  // $("#modalAdd").modal("show");
  // $("#myModalLabel").text("新增团购商品");
  // $("#modalAdd").find(".form-group i").attr("class", "fa fa-exclamation-circle");
}

function editData (that) {
  $('.form-horizontal').resetForm()

  opr = 'edit'

  // $("#modalAdd").modal("show");
  // $("#myModalLabel").text("编辑团购商品");
  var node = $(that).closest('tr')
  nodeEdit = oTab
    .api()
    .row(node)
    .data()

    // for (var key in nodeEdit) {
    //     $("#" + key).val(nodeEdit[key]);
    // }
  gotoGoodsEdit()

  // $("#modalAdd").find(".form-group i").attr("class", "fa fa-check-circle-o");
}

function deleteData (that) {
  var node = $(that).closest('tr')
  nodeEdit = oTab
    .api()
    .row(node)
    .data()
  createModalTips('确定要删除该活动？', 'confirmDeleteData')
}

function confirmDeleteData () {
  console.log(nodeEdit)
  $.ajax({
    url: '/crmactivity/' + nodeEdit.uuid,
    type: 'delete',
    success: function (data) {
      createModalTips(data.msg || '删除成功！')
      oTab.api().ajax.reload(null, false)
    }
  })
}

function upDownGoods (that) {
  var node = $(that).closest('tr')
  nodeEdit = oTab
    .api()
    .row(node)
    .data()
  $.ajax({
    url: '/crmactivity/state',
    data: {
      uuid: nodeEdit.uuid,
      state: nodeEdit.state == 'on' ? 'off' : 'on'
    },
    type: 'put',
    success: function (data) {
      if (data) {
        createModalTips(
          (nodeEdit.state == 'on' ? '活动下架' : '活动上架') + '成功！'
        )
        oTab.api().ajax.reload(null, false)
      }
    },
    error: cgiDtError
  })
}

function gotoGoodsEdit () {
  var goodsEditUrl = 'pages/actionsManagement/actionsManagement/editAction'
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
