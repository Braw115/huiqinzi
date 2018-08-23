verifyEventsInit()
getCategory()
$('#categoryG,#categorys').on('change', function () {
  getCategorySub($(this).attr('id'))
})
$('#subcategoryG').on('change', getActions)

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
  defaultDate: new Date()
})

var oTab = null,
  nodeEdit
var opr
// 根据权限移除对应菜单项,当以root权限登录时,会移除class='root'的菜单项.
var role = $.cookie('perm')

$('#' + role).remove()
var token = $.cookie('token')

function getCategory () {
  $.ajax({
    url: '/crmcategory',
    type: 'get',
    data: {
      start: 0,
      length: 100
    },
    headers: {
      'Content-Type': 'application/json; charset=UTF-8'
    },
    success: function (data) {
      if (data.category.length < 1) {
        $('#categoryG').append($('<option value="null">暂无一级分类</option>'))
      } else {
        data
          .category
          .map((e, i) => {
            let option = $('<option  data-k="' + e.key + '" value="' + e.uuid + '">' + e.name + '</option>')

            if (e.key == 'rushBuy' || e.key == 'groupBuy') {
              $('#categoryG,#categorys').append(option)
            } else {
              $('#categoryG').append(option)
            }
          })
        $('#categoryG,#categorys').change()
      }
    }
  })
}

function getCategorySub (that) {
  var v = $('#' + that).val()
  let t = v == 'newhot'
  that == 'categorys' && $('.nohot').toggle(!t)

  if (t) {
    return
  }
  $.ajax({
    url: '/crmcategory/sub',
    type: 'get',
    data: {
      uuid: v,
      start: 0,
      length: 100
    },
    success: function (data) {
      var select = $('#sub' + that)
      $(select)
        .find(' option:not(.newhot)')
        .remove()
      if (data.category.length < 1) {
        $(select).append($('<option value="null">暂无二级分类</option>'))
        $('tbody').html("<tr><td colspan='6'>没有匹配结果</td></tr>")
      } else {
        data
          .category
          .map((e, i) => {
            $(select).append($('<option value="' + e.uuid + '">' + e.name + '</option>'))
          })
        $(select).change()
      }
    }
  })
}

function getActions () {
  if (oTab) {
    oTab
      .fnSettings()
      .ajax
      .data
      .category = $('#categoryG').val()
    oTab
      .fnSettings()
      .ajax
      .data
      .subcategory = $('select[name=subcategoryG]').val()
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
    'autoWidth': false,
    lengthMenu: [
      [
        10, 15, 50, 100
      ],
      [10, 15, 50, 100]
    ],
    drawCallback: function () {
      // this.api().column(0).nodes().each(function(cell, i) { cell.innerHTML = ++i;
      // });
    },
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
      dataSrc: d => {
        return d.activity
      },
      error: cgiDtError
    },
    columns: [{
      data: 'position'
    }, {
      data: 'title'
    }, {
      data: 'price'
    }, {
      data: 'groupbyprice'
    }, {
      data: 'realprice'
    }, {
      data: 'sold'
    }, {
      data: 'realsold'
    }, {
      data: 'opentime',
      render: (d, t, r) => {
        return '<div>开始时间：' + d + '</div><div>结束时间：' + r.closetime + '</div>'
      }
    }, {
      data: 'created',
      render: d => {
        return d
          ? new Date(d).format('yyyy-MM-dd hh:mm:ss')
          : ''
      }
    }, {
      data: 'state',
      render: (d) => {
        return {
          'on': '上线',
          'off': '下线',
          'wait-on': '自动上线',
          new: '新建'
        }[d]
      }
    }, {
      data: 'uuid',
      className:'all',
      render: function (d, t, r) {
        var t = $('#categoryG option:selected').attr('data-k'),
          str = ''
        if (r.state == 'on') {
          str = str + '<a class="btn btn-warning" data-toggle="tooltip" data-container="body" data-opr=' +
            '"off" onclick="updateState(this)"  title="下线"><i class="fa fa-arrow-down"></i></' +
            'a>'
        } else {
          str = str + '<a class="btn btn-danger btn_delete" data-toggle="tooltip" data-container="body"' +
            ' onclick="deleteData(this)" title="删除"><i class="fa fa-trash"></i></a> <a class=' +
            '"btn btn-success" data-toggle="tooltip" data-container="body" data-opr="on" oncl' +
            'ick="updateState(this)"  title="马上上线"><i class="fa fa-arrow-up"></i></a>'
        }
        if (r.state == 'off' || r.state == 'new') {
          str = str + '<a class="btn btn-info" data-toggle="tooltip" data-container="body" data-opr="wa' +
            'it-on" onclick="updateState(this)" title="自动上线"><i class="fa fa-upload"></i></a>'
        }
        if (t != 'rushBuy' && t != 'groupBuy') {
          str = str + '<a class="btn btn-info" data-toggle="tooltip" data-container="body" onclick="pus' +
            'hGoods(this)"  title="推送"><i class="fa fa-hand-o-right"></i></a>'
          if (r.state != 'on') {
            str = str + '<a class="btn btn-primary" data-toggle="tooltip" data-container="body" onclick="' +
              'editData(this)"  title="编辑"><i class="fa fa-pencil"></i></a>'
          }
        }

        return ('<div class="btn-group btn-group-sm" style="width:181px;">' + str + '</div>')
      }
    }],
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
  $('.form-horizontal').resetForm()
  opr = 'add'
  gotoGoodsEdit()
}

function editData (that) {
  opr = 'edit'
  var node = $(that).closest('tr')
  nodeEdit = oTab.api().row(node).data()
  $.ajax({
    url: '/crmactivity/getByuuid',
    type: 'get',
    data: {
      uuid: nodeEdit.uuid
    },
    success: function (data) {
      gotoGoodsEdit()
      nodeEdit = data
    }
  })
}

function deleteData (that) {
  var node = $(that).closest('tr')
  nodeEdit = oTab.api().row(node).data()
  createModalTips('确定要删除该活动？', 'confirmDeleteData')
}

function confirmDeleteData () {
  $.ajax({
    url: '/crmactivity/' + nodeEdit.uuid,
    type: 'delete',
    success: function (data) {
      createModalTips(data.msg || '删除成功！')
      dtReloadData(oTab)
    }
  })
}

function updateState (that) {
  var node = $(that).closest('tr')
  state = $(that).data('opr')
  nodeEdit = oTab
    .api()
    .row(node)
    .data()
  $.ajax({
    url: '/crmactivity/state',
    data: {
      uuid: nodeEdit.uuid,
      state: state
    },
    type: 'put',
    success: function (data) {
      dtReloadData(oTab)
    },
    error: cgiDtError
  })
}

function gotoGoodsEdit () {
  $('body > div.tooltip').remove()
  $('[data-toggle="tooltip"]').tooltip()
  var goodsEditUrl = 'pages/actionsManagement/actionsManagement/editAction'
  $('.content').load(goodsEditUrl + '.html', function () {
    $.ajax({
      type: 'GET',
      dataType: 'script',
      cache: true,
      url: goodsEditUrl + '.js',
      complete: function () {
        $('body .modal')
          .on('hidden.bs.modal', function () {
            $('.has-error', this).removeClass('has-error')
            $('.modal-footer .tip', this).html('')
          })
      }
    })
  })
}

function pushGoods (that) {
  var node = $(that).closest('tr')
  nodeEdit = oTab
    .api()
    .row(node)
    .data()
  $('#modal_pushgoods').modal('show')
}

function savePush () {
  var params = {
    uuid: nodeEdit.uuid,
    categoryuuid: $('#categorys').val(),
    subcategoryuuid: $('#subcategorys').val(),
    endtime: $('#endtime').val(),
    position: parseInt($('#position').val())
  }
  if (params.categoryuuid == 'newhot') {
    return
  }
  $.ajax({
    url: '/crmactivity/addgroup',
    data: params,
    type: 'put',
    success: function (data) {
      $('#modal_pushgoods').modal('hide')
      createModalTips('推送成功')
    },
    error: cgiDtError
  })
}
