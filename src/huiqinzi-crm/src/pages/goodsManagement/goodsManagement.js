verifyEventsInit()
getCategory()
$('#categoryG').on('change', getCategorySub)
$('#subcategoryG').on('change', getGoods)

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
    success: function (data) {
      if (data.category.length < 1) {
        $('#categoryG').append($('<option value="null">暂无一级分类</option>'))
      } else {
        data.category.map((e, i) => {
          if (e.key == 'shopping') {
            $('#categoryG').append(
              $(
                '<option onclick="choseCatogery" value="' +
                e.uuid +
                '">' +
                e.name +
                '</option>'
              )
            )
            $('#categoryG').change()
          }
        })
      }
    }
  })
}

function getGoods () {
  if (oTab) {
    oTab.fnSettings().ajax.data.category = $('#categoryG').val()
    oTab.fnSettings().ajax.data.subcategory = $(
      'select[name=subcategoryG]'
    ).val()
    dtReloadData(oTab, false)
  } else {
    oTab = createDt()
  }
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
        oTab = createDt()
      }
    }
  })
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
      url: '/crmgoods/getAll',
      type: 'GET',
      data: {
        category: $('select[name=categoryG]').val(),
        subcategory: $('select[name=subcategoryG]').val()
      },
      dataSrc: d => {
        return d.goods
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
      data: 'inventory'
    },
    {
      data: 'sold'
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
        return (
          '<div class="btn-group btn-group-sm" style="min-width:100px">' +
          // `<a class="btn btn-primary _edit" data-toggle="tooltip" data-container="body" onclick="editData(this)"  title="编辑"><i class="fa fa-pencil"></i></a>
          // <a class="btn btn-danger btn_delete" data-toggle="tooltip" data-container="body" onclick="deleteData(this)" title="删除"><i class="fa fa-trash"></i></a>
          // ` +
            (r.state != 'on'
              ? `<a class="btn btn-primary _edit" data-toggle="tooltip" data-container="body" onclick="editData(this)"  title="编辑"><i class="fa fa-pencil"></i></a>
                        <a class="btn btn-info  btn-forup" onclick="upDownGoods(this)" data-toggle="tooltip" data-container="body" title="上架"><i class="fa fa-arrow-up"></i></a>
                        <a class="btn btn-danger btn_delete" data-toggle="tooltip" data-container="body" onclick="deleteData(this)" title="删除"><i class="fa fa-trash"></i></a>
                        `
              : `<a class="btn btn-danger  btn-fordown" onclick="upDownGoods(this)" data-toggle="tooltip" data-container="body" title="下架"><i class="fa fa-arrow-down"></i></a>`)               +
            '</div>'
        )
      }
    }
    ],
    drawCallback: function () {
      $('body > div.tooltip').remove()
      $('[data-toggle="tooltip"]').tooltip()
      $('.dataTables_paginate ').append(
        "<div id='jumptopage'>到第 <input type='text'  class='input-text form-control' > 页</div>"
      )
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

function upDownGoods (that) {
  var node = $(that).closest('tr')
  nodeEdit = oTab
    .api()
    .row(node)
    .data()
  $.ajax({
    url: '/crmgoods/state',
    data: {
      uuid: nodeEdit.uuid,
      state: nodeEdit.state == 'on' ? 'off' : 'on'
    },
    type: 'put',
    success: function (data) {
      if (data) {
        createModalTips(
          (nodeEdit.state == 'on' ? '商品下架' : '商品上架') + '成功！'
        )
        oTab.api().ajax.reload(null, false)
      }
    },
    error: cgiDtError
  })
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
  nodeEdit = oTab
    .api()
    .row(node)
    .data()
  createModalTips('确定要删除该检查项？', 'confirmDeleteData')
}

function confirmDeleteData () {
  console.log(nodeEdit)
  $.ajax({
    url: '/crmgoods/' + nodeEdit.uuid,
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

function gotoGoodsEdit () {
  $('body > div.tooltip').remove()
  $('[data-toggle="tooltip"]').tooltip()
  var goodsEditUrl = 'pages/goodsManagement/editGoods'
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
