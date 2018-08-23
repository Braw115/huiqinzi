var oTab = createDt(),
  nodeEdit, opr
var token = $.cookie('token')

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
      url: '/crmdistribute/getGoodsDetail',
      dataSrc: (d) => {
        return d.activity

      },
      error: cgiDtError
    },
    columns: [
      {
        data: null
      },
      {
        data: 'title'
      },
      {
        data: 'price'
      },
      {
        data: 'groupbyprice',
      },
      {
        data: 'specialprice'
      },
      {
        data: 'sold',
      },
      {
        data: 'realsold'
      },
      {
        data: 'opentime',
        render: function (d) {
          return d ? new Date(d).format('yyyy-MM-dd hh:mm:ss') : ''
        }
      },
      {
        data: 'modified',
        render: function (d) {
          return d ? new Date(d).format('yyyy-MM-dd hh:mm:ss') : ''
        }
      },
      {
        data: 'distribute',
        render: function (d) {
          var str
          return d == '0' ? '否' : '是'
        }
      },
      {
        data: 'state',
        render: (d) => {
          return {
            'on': '上线',
            'off': '下线',
            'wait-on': '自动上线',
            new: '新建'
          }[d]
        }

      },
      {
        data: 'uuid',
        render: function (d, t, r) {
          var str = ''
          if (r.distribute == '0') {
            str = str + '<a class="btn btn-info" data-toggle="tooltip" data-container="body" data-opr="wait-on" onclick="adddistribution(this)" title="添加为分销商品"><i class="fa fa-upload"></i></a>'
          }
          else {
            str = str + '<a class="btn btn-danger" data-toggle="tooltip" data-container="body" data-opr="wait-on" onclick="deletedistribution(this)" title="添加为普通商品"><i class="fa fa-download"></i></a>'
          }
          return ('<div class="btn-group btn-group-sm" style="width:50px;">' + str + '</div>')
        }
      }
    ],
    'rowCallback': function (row, data, index) {
      $(row).find('td:first').html(index + 1)
      $(row).find('select:first').val(data.status)
    },
  })
}

function openAdd () {
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
  $('#myModalLabel').text('新增分销商品')
  $('#modalAdd').find('.form-group i').attr('class', 'fa fa-exclamation-circle')
}

// 添加为分销商品
function adddistribution (that) {
  var node = $(that).closest('tr')
  //  alert('添加分销商品',node)
  nodeEdit = oTab
    .api()
    .row(node)
    .data()
  createModalTips('确定要添加该商品为分销商品？', 'adddistributionGoods')

}

function adddistributionGoods () {
  var obj = nodeEdit.uuid
  $.ajax({
    url: '/crmdistribute/addDistributeGoods',
    type: 'post',
    data: {uuid: nodeEdit.uuid},
    success: function (data) {
      createModalTips(data.msg || '添加成功！')
      oTab
        .api()
        .ajax
        .reload(null, false)
    }

  })
}

//删除该分销商品
function deletedistribution (that) {
  var node = $(that).closest('tr')
  //  alert('添加分销商品',node)
  nodeEdit = oTab
    .api()
    .row(node)
    .data()
  createModalTips('确定要添加为分普通商品？', 'deletedistributionGoods')
}

function deletedistributionGoods () {
  var obj = nodeEdit.uuid
  $.ajax({
    url: '/crmdistribute/delDistributeGoods',
    type: 'post',
    data: {uuid: nodeEdit.uuid},
    success: function (data) {
      createModalTips(data.msg || '添加成功！')
      oTab
        .api()
        .ajax
        .reload(null, false)
    }
  })
}
  