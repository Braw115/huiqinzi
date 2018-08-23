verifyEventsInit()
getCategory()
$('#categoryG').on('change', getCategorySub)

// 活动时间
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

var oTab = null,
  nodeEdit, opr
// 根据权限移除对应菜单项,当以root权限登录时,会移除class='root'的菜单项.
var role = $.cookie('perm')

$('#' + role).remove()
var token = $.cookie('token')
$('#length').on('change', function () {
  // oTab.fnSettings().ajax.data.length = $('#length').val()
  // dtReloadData(oTab, true)
  oTab.api().page.len(Number($('#length').val())).draw()
})

function createDt () {
  return $('#tableLi').dataTable({
    serverSide: true,
    searching: false,
    ordering: false,
    responsive: true,
    lengthMenu: [
      [10, 15, 50, 100],
      [10, 15, 50, 100]
    ],
    dom: 'Bfrtip',
    buttons: [{
      extend: 'excel',
      text: '导出Excel',
      title: $('#categoryG option:selected').text() + '-' + $('#subcategoryG option:selected').text(),
      exportOptions: {
        modifier: {
          page: 'all'
        }
      }
    }],
    drawCallback: function () {

      // this.api().column(0).nodes().each(function (cell, i) { cell.innerHTML = ++i; });
    },
    language: {
      url: 'js/lib/dataTables.chinese.json'
    },
    ajax: {
      url: '/crmprofit',
      type: 'GET',
      data: {
        category: $('#subcategoryG').val() || $('#categoryG').val(),
        startdate: $('#startdate').val(),
        enddate: $('#enddate').val(),
        length: $('#length').val()
      },
      dataSrc: (d) => {
        $('#sum').text(d.sum)
        return d.orders
      },
      error: cgiDtError
    },
    columns: [
      {
        data: 'uuid'
      },
      {
        data: 'goodsinfo',
        render: (d) => /^{.*}$/.test(d) ? JSON.parse(d).title : ''
      },
      {
        data: 'total_fee'
      },
      {
        data: 'realtotal_fee'
      },
      {
        data: 'uuid',
        render: (d, t, r) => {
          return r.total_fee - r.realtotal_fee
        }
      },
      {
        data: 'created',
        render: function (d) {
          return d ? new Date(d).format('yyyy-MM-dd hh:mm:ss') : ''
        }
      }
    ],
    'drawCallback': function () {
      $('body > div.tooltip').remove()
      $('[data-toggle="tooltip"]').tooltip()
    }
  })
}

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
        data.category.map((e, i) => {
          $('#categoryG').append($('<option onclick="choseCatogery" value="' + e.uuid + '">' + e.name + '</option>'))
        })
      }
      $('#categoryG').change()
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
      }
      if (oTab) {
        oTab.fnSettings().ajax.data.category = $('#categoryG').val()
        oTab.fnSettings().ajax.data.subcategory = $('select[name=subcategoryG]').val()
        dtReloadData(oTab, false)
      } else {
        oTab = createDt()
      }
    }
  })
}

function openAdd () {
  $('.form-horizontal').resetForm()

  $('.num').show()
  $('.checkType2').show()
  $('.checkType1').hide()

  opr = 'add'
  $('#inspect').attr('disabled', false)
  $('#modalAdd').modal('show')
  $('#myModalLabel').text('新增团购商品')
  $('#modalAdd').find('.form-group i').attr('class', 'fa fa-exclamation-circle')
}

function editData (that) {
  $('.form-horizontal').resetForm()

  opr = 'edit'
  $('#inspect').attr('disabled', true)
  $('#modalAdd').modal('show')
  $('#myModalLabel').text('编辑团购商品')
  var node = $(that).closest('tr')
  nodeEdit = oTab.api().row(node).data()
  console.log(nodeEdit)

  for (var key in nodeEdit) {
    $('#' + key).val(nodeEdit[key])
  }
  if (nodeEdit.inspect == '例行检查') {
    $('.num').hide()
    $('.checkType2').hide()
    $('.checkType1').show()

    // $("#type1").val(nodeEdit.type);
  } else {
    $('.num').show()
    $('.checkType2').show()
    $('.checkType1').hide()

    $('#type2').val(nodeEdit.type)
  }

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
  var parm = {
    inspectname: $('#inspect option:selected').val(),
    type: typeContent,
    item: $('#item').val(),
    standard: $('#standard').val(),
    score: $('#score').val(),
    num: $('#num').val()
  }
  console.log(parm)
  if (opr == 'add') {
    /* $.ajax({
            url: cgiDtUrl("/user/addInspectItem"),
            data: parm,
            type: 'post',
            success: function (data) {
                if (data) {
                    createModalTips(data.msg || '添加成功！');
                    $("#modalAdd").modal("hide");
                    oTab.api().ajax.reload(null, false);
                }
            },
            error: cgiDtError
        }) */
  } else if (opr == 'edit') {
    parm.uuid = nodeEdit.uuid
    /* $.ajax({
                url: cgiDtUrl("/user/updateInspectItem"),
                data: parm,
                type: 'put',
                success: function (data) {
                    if (data) {
                        createModalTips(data.msg || '修改信息成功！');
                        $("#modalAdd").modal("hide");
                        oTab.api().ajax.reload(null, false);
                    }
                },
                error: cgiDtError
            }) */
  }
}

function deleteData (that) {
  var node = $(that).closest('tr')
  nodeEdit = oTab.api().row(node).data()
  createModalTips('确定要删除该检查项？', 'confirmDeleteData')
}

function confirmDeleteData () {
  console.log(nodeEdit)
  /* $.ajax({
            url: cgiDtUrl("/user/deleteInspectItem"),
            data: {
                uuid: nodeEdit.uuid
            },
            type: "delete",
            success: function (data) {
                createModalTips(data.msg || '删除成功！');
                oTab.api().ajax.reload(null, false);
                $("#modal_tips").modal("hide");
            }
        }); */
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
