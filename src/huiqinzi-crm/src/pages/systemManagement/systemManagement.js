var attrs = {
  客服电话: 'servicePhone'
}

verifyEventsInit()

$('#hotsearchs').on('change', function () {
  $('#hotsearchKW').val($('#hotsearchs option:checked').text())
})
var nodeEdit,
  opr,
  oTab = null,
  testdata = [],
  hotsearchs

function getAllSystem () {
  $.ajax({
    url: '/crmsystem',
    type: 'get',
    dataType: 'json',
    success: function (data) {
      data.map((e, i) => {
        switch (e.name) {
          case 'service':
            testdata.push({
              name: '客服电话',
              value: e.value.phone,
              edit: e.name
            })
                        break;
          case 'rebate':
            testdata.push({
              name: '返佣率',
              value: e.value.rebate1 + '/' + e.value.rebate2,
              edit: e.name
            })
                        break;
          case 'hotsearch':
            testdata.push({
              name: '热搜',
              value: e.value.join('<br>'),
              edit: e.name
            })
                        break;
          default:
            break
                }
      })
            oTab = createDt()
        },
    error: cgiDtError
  })
}

getAllSystem()

//根据权限移除对应菜单项,当以root权限登录时,会移除class='root'的菜单项.
var role = $.cookie('perm')

$('#' + role).remove()
var token = $.cookie('token')

function createDt () {
  return $('#tableLi').dataTable({
    searching: false,
    ordering: false,
    bLengthChange: false,
    language: {
      url: 'js/lib/dataTables.chinese.json'
    },
    data: testdata,
    columns: [
      { data: 'name' },
      { data: 'value' },
      {
        data: 'edit',
        render: function (d) {
          return (
            '<div class="btn-group btn-group-sm" style="min-width:60px;">' +
                        '<a class="btn btn-primary _edit" data-toggle="tooltip" data-container="body" onclick="editData(this)" title="编辑">编辑</a>'
          );
          ('</div>')
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

    opr = 'add';
  $('#modalAdd').modal('show')
    $('#myModalLabel').text('添加系统设置')
    $('#modalAdd')
    .find('.form-group i')
    .attr('class', 'fa fa-exclamation-circle')
}

function editData (that) {
  $('.form-horizontal').resetForm()

    opr = 'edit';

  var node = $(that).closest('tr')
    nodeEdit = oTab
    .api()
    .row(node)
    .data()
    if (nodeEdit.edit == 'service') {} else {}
  switch (nodeEdit.edit) {
    case 'service':
      $('#modalAdd_service').modal('show')
            $('#phone').val(nodeEdit.value)
            break;
    case 'rebate':
      var rebates = nodeEdit.value.split('/')
            $('#modalAdd_rebate').modal('show')
            $('#rebate1').val(rebates[0])
            $('#rebate2').val(rebates[1])
            break;
    case 'hotsearch':
      $('#modalAdd_hotsearch').modal('show')
            $('#hotsearchs option:not(.new)').remove()
            hotsearchs = nodeEdit.value.split('<br>')
            hotsearchs.map((e, i) => {
        $('#hotsearchs').append(
          $("<option value='" + i + "'>" + e + '</option>')
        )
            })
            $('#hotsearchs').change()
            break;
    default:
      break
    }

  $('#modalAdd')
    .find('.form-group i')
    .attr('class', 'fa fa-check-circle-o')
}

function saveSetting () {
  if (!verification()) return
    var parm = {
    name: nodeEdit.edit
  }
    if (nodeEdit.edit == 'service') {
    parm.value = JSON.stringify({
      phone: $('#phone').val()
    })
    } else {
    parm.value = JSON.stringify({
      rebate1: $('#rebate1').val(),
      rebate2: $('#rebate2').val()
    })
    }
  switch (nodeEdit.edit) {
    case 'service':
      parm.value = JSON.stringify({
        phone: $('#phone').val()
      })
            break;
    case 'rebate':
      parm.value = JSON.stringify({
        rebate1: $('#rebate1').val(),
        rebate2: $('#rebate2').val()
      })
            break;
    case 'hotsearch':
      if ($('#hotsearchs').val() == 'new') {
        var t = $('#hotsearchKW')
          .val()
          .trim()
                if (t != '') {
          $('#hotsearchs').append(
            $("<option value='" + hotsearchs.length + "'>" + t + '</option>')
          )
                    hotsearchs.push(t)
                    $('#hotsearchKW').val('')
                } else {
          createModalTips('热搜不能为空！')
                }
      } else {
        if (
          $('#hotsearchKW')
            .val()
            .trim() != ''
        ) {
          hotsearchs.splice($('#hotsearchs').val(), 1, $('#hotsearchKW').val())
                } else {
          createModalTips('热搜不能为空！')
                }
      }

      parm.value = JSON.stringify(hotsearchs)
            break;
    default:
      break
    }

  $.ajax({
    url: '/crmsystem',
    data: parm,
    type: 'put',
    success: function (data) {
      if (data) {
        createModalTips(data.msg || '修改信息成功！')
                $('#modalAdd_' + nodeEdit.edit).modal('hide')
                testdata = []
                oTab.fnDestroy()
                getAllSystem()
            }
    },
    error: cgiDtError
  })
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
    /*$.ajax({
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
          });*/
}

function delHotSearch () {
  hotsearchs.splice($('#hotsearchs').val(), 1)
    $('#hotsearchKW').val('')
    $('#hotsearchs option[value=' + $('#hotsearchs').val() + ']').remove()
    saveSetting()
    createModalTips('所选热搜已成功移除！')
}

function addHotSearch () {}
