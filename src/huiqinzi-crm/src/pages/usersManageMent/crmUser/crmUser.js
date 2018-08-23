verifyEventsInit()

//活动时间
$('.form_datetime').datetimepicker({
  weekStart: 0, //一周从哪一天开始
  // todayBtn: 1, //
  autoclose: true,
  todayHighlight: 1,
  todayBtn: true,
  language: 'zh-CN',
  startView: 0,
  forceParse: 0,
  showMeridian: 1
})

var userAttrs = ['username', 'password', 'description', 'state', 'perm', 'phone', 'email', 'realname', 'address', 'remark']

var oTab = createDt(),
  nodeEdit, opr,
  role = $.cookie('perm')

$('.' + role).remove()

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
      url: '/crmusers/users',
      type: 'GET',
      dataSrc: (d) => { return d.res },
      error: cgiDtError
    },
    columns: [{
      data: 'username'
    }, {
      data: 'realname'
    }, {
      data: 'phone'
    }, {
      data: 'address'
    }, {
      data: 'perm'
    },
      {
        data: 'state',
        render: (d, t, r) => {
          if ((role == 'root')) { //|| r.perm != "root"
            return (d == 'on') ? '<span class=" fa fa-2x fa-toggle-on " title="禁用" onclick="toogle(this)" style="display: inline-block;color: #30d260;transition:0.7s;"></span>' :
              '<span class=" fa fa-2x fa-toggle-off " title="启用" onclick="toogle(this)" style="display: inline-block;color: #bababa;transition:0.7s;"></span>'
          } else {
            return {on: '启用', off: '禁用'}[d]
          }

        }
      }, {
        data: 'created'
      },
      {
        data: 'uuid',
        className: 'all',
        render: function (d, t, r) {
          if (role == 'root' || r.perm == 'business') {
            return '<div class="btn-group btn-group-sm" style="min-width:100px;">' +
              '<a class="btn btn-primary _edit" data-toggle="tooltip" data-container="body" onclick="editData(this)"  title="编辑"><i class="fa fa-pencil"></i></a>' +
              '<a class="btn btn-danger btn_delete" data-toggle="tooltip" data-container="body" onclick="deleteData(this)" title="删除"><i class="fa fa-trash"></i></a> '
            '</div>'
          } else {
            return '暂无任何操作'
          }

        }
      }
    ],
    'drawCallback': function () {
      $('body > div.tooltip').remove()
      $('[data-toggle="tooltip"]').tooltip()
    }
  })
}

/*设置提示模态框点击遮罩层不隐藏*/
$('#modalAdd').modal({
  'backdrop': 'static',
  'show': false
})

function openAdd () {
  $('.form-horizontal').resetForm()

  $('.num').show()
  $('.checkType2').show()
  $('.checkType1').hide()

  opr = 'add'
  $('#inspect').attr('disabled', false)
  $('#modalAdd').modal('show')
  $('#myModalLabel').text('新增CRM用户')
  $('#modalAdd').find('.form-group').show().find(' i').attr('class', 'fa fa-exclamation-circle')
}

function editData (that) {
  $('.form-horizontal').resetForm()

  opr = 'edit'
  $('#modalAdd').modal('show')
  $('#myModalLabel').text('修改CRM用户')
  var noAllowAttr = ['password', 'state', 'perm'],
    node = $(that).closest('tr')
  nodeEdit = oTab.api().row(node).data()

  userAttrs.map((e, i) => {
    if (noAllowAttr.indexOf(e) != -1) {
      $('#' + e).closest('.form-group').hide()
    } else {
      $('#' + e).val(nodeEdit[e])
    }
  })

  $('#modalAdd').find('.form-group i').attr('class', 'fa fa-check-circle-o')

}

function saveUser () {
  if (!verification()) return

  var typeContent
  if ($('#inspect option:selected').val() == '例行检查') {
    typeContent = $('#type option:selected').val()

  } else {

    typeContent = $('#type2').val()

  }
  var parm = {}
  userAttrs.map((e, i) => {
    parm[e] = $('#' + e).val()
  })

  if (opr == 'add') {
    $.ajax({
      url: '/crmusers/crm',
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
    delete parm.password
    delete parm.state
    delete parm.perm
    $.ajax({
      url: '/crmusers/update/' + nodeEdit.uuid,
      data: parm,
      type: 'put',
      success: function (data) {
        if (data) {
          createModalTips(data.msg || '修改CRM账户信息成功！')
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
  createModalTips('确定要删除该CRM账户？', 'confirmDeleteData')
}

function confirmDeleteData () {
  $.ajax({
    url: '/crmusers/' + nodeEdit.uuid,
    type: 'delete',
    success: function (data) {
      createModalTips('删除CRM账户成功！')
      oTab.api().ajax.reload(null, false)
    }
  })
}

function toogle (that) {
  var node = $(that).closest('tr')
  nodeEdit = oTab.api().row(node).data()
  $.ajax({
    url: '/crmusers/state/' + nodeEdit.uuid,
    type: 'put',
    success: function (data) {
      createModalTips('成功修改CRM账户状态！')
      oTab.api().ajax.reload(null, false)
    }
  })
}