var oTab = createDt(),
  nodeEdit, opr

function createDt () {
  return $('#tableLi').dataTable({
    serverSide: true,
    searching: false,
    ordering: false,
    pagingType: 'full_numbers',
    responsive: true,
    'autoWidth': false,
    bLengthChange: true,
    lengthMenu: [
      [10, 15, 50, 100],
      [10, 15, 50, 100]
    ],
    language: {
      url: 'js/lib/dataTables.chinese.json'
    },
    ajax: {
      url: '/crmdistribute/getWithDraw',
      dataSrc: (d) => {
        return d.res
      },
      error: cgiDtError

    },
    columns: [
      {
        'data': null,
        'orderable': false,
        'searchable': false,
      },
      {
        data: 'useruuid'
      },
      {
        data: 'amount'
      },
      {
        data: 'modified'
      },
      {
        data: 'state'

      },
      {
        data: 'remark'
      },
      {
        data: 'uuid',
        render: function (d, t, r) {
          if (r.state == '待受理') {
            return '<div class="btn-group btn-group-sm" style="min-width:100px;">' +
              '<a class="btn btn-primary " data-toggle="tooltip" data-container="body" title="拒绝"  onclick="refused(this)"><i class="glyphicon glyphicon-circle-arrow-left"></i></a>' +
              '<a class="btn btn-danger " data-toggle="tooltip" data-container="body"   title="受理"  onclick="accepted(this)"><i class="glyphicon glyphicon-circle-arrow-right"></i></a>'
            '</div>'
          } else {
            return '暂无任何操作'
          }
        }
      }
    ],
    'rowCallback': function (row, data, index) {
      $(row).find('td:first').html(index + 1)
      $(row).find('select:first').val(data.status)
    },
  })

  $('input[name="test"]:checked').prop('checked', false)
  $('#modalAdd2').modal('show')
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
  $('#myModalLabel').text('分销达人提现管理')
  $('#modalAdd').find('.form-group i').attr('class', 'fa fa-exclamation-circle')

}

var state

//改为已受理
function accepted (that) {
  state = 'accepted'
  var node = $(that).closest('tr')
  nodeEdit = oTab
    .api()
    .row(node)
    .data()
  createModalTips('确定要改为已受理吗？', 'updatedistributionGoods')
}

//待受理
function Pending (that) {
  state = 'pending'
  var node = $(that).closest('tr')
  //  alert('添加分销商品',node)
  nodeEdit = oTab
    .api()
    .row(node)
    .data()
  createModalTips('确定要改为已接受吗？', 'updatedistributionGoods')
}

function refused (that) {
  state = 'refused'
  var node = $(that).closest('tr')
  nodeEdit = oTab
    .api()
    .row(node)
    .data()
  createModalTips('确定要改为已拒绝吗？', 'updatedistributionGoods')
}

function updatedistributionGoods () {
  $.ajax({
    url: '/crmdistribute/updateWithDraw',
    type: 'post',
    data: {uuid: nodeEdit.uuid, state},
    success: function (data) {
      createModalTips(data.msg || '修改成功！')
      oTab
        .api()
        .ajax
        .reload(null, false)
    }
  })
}
