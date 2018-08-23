verifyEventsInit()
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
$.ajax({
  url: '/crmlogistics/shipper',
  type: 'get',
  success: function (data) {
    data.map((e, i) => {
      $('#logisticscode').append($('<option value="' + e.shippercode + '">' + e.shippername + '</option>'))
    })
  },
  error: cgiDtError
})

$('#state').on('change', function () {
  var t = $('#state').val()
  $('.usecode').toggle(t == 'wait-use')
  oTab.fnSettings().ajax.data.start = 0
  oTab.fnSettings().ajax.data.state = t
  dtReloadData(oTab, true)
})

$('#code').on('keypress', function (event) {
  if (event.keyCode == 13) {
    oTab.fnSettings().ajax.data.start = 0
    oTab.fnSettings().ajax.data.code = $('#code').val()
    dtReloadData(oTab, false)
  }
})

var oTab = createDt(),
  nodeEdit
var opr
// 根据权限移除对应菜单项,当以root权限登录时,会移除class='root'的菜单项.
var role = $.cookie('perm')

$('#' + role).remove()
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
    language: {
      url: 'js/lib/dataTables.chinese.json'
    },
    ajax: {
      url: '/crmorders/findAll',
      type: 'GET',
      data: function (d, t, r) {
        return {
          start: d.start,
          length: d.length,
          state: $('#state').val(),
          code: $('#code').val()
        }
      },
      dataSrc: (d) => {
        d.orders.map((e, i) => {
          e.goodsName = e.goodsinfo ? JSON.parse(e.goodsinfo).title : ''
          e.created = new Date(e.created).format('yyyy-MM-dd hh:mm:ss')
        })
        return d.orders
      },
      error: cgiDtError
    },
    columns: [
      {
        data: 'goodsName'
      },
      {
        data: 'amount'
      },
      {
        data: 'state'
      },
      {
        data: 'name'
      },
      {
        data: 'phone',
      },
      {
        data: 'code'
      },
      {
        data: 'created'
      },
      {
        data: 'uuid',
        className: 'all',
        render: function (d, t, r) {
          var str = '<div class="btn-group btn-group-sm root admin" style="min-width:100px;">' +
            '<a class="btn btn-primary " data-toggle="tooltip" data-container="body" onclick="orderDetail(this)"  title="查看订单详情"><i class="fa fa-circle"></i></a>'
          if (r.state == '待使用' && role == 'business') {
            str += '<a class="btn btn-info" data-toggle="tooltip" data-container="body" onclick="cashData(this)"  title="消费"><i class="fa fa-exchange"></i></a>'
          } else if (r.state == '待发货' && role == 'root') {
            str += '<a class="btn btn-primary " data-toggle="tooltip" data-container="body" onclick="send(this)"  title="发货"><i class="fa fa-plane"></i></a>'
          } else if (r.state == '已发货') {
            str += '<a class="btn btn-primary " data-toggle="tooltip" data-container="body" onclick="getShipped(this)"  title="查看物流"><i class="fa fa-line-chart"></i></a>'
          }
          return str + '</div>'
        }
      }
    ],
    'drawCallback': function () {
      $('body > div.tooltip').remove()
      $('[data-toggle="tooltip"]').tooltip()
    }
  })
}

function cashData (that) {
  var node = $(that).closest('tr')
  nodeEdit = oTab.api().row(node).data()
  createModalTips('确定要消费所选活动券？', 'confirmCashData')
}

function orderDetail (that) {
  var node = $(that).closest('tr')
  nodeEdit = oTab.api().row(node).data()
  Object.keys(nodeEdit).map((e, i) => {
    $('#modal_detail .form-group .' + e).text(nodeEdit[e])
  })
  $('#modal_detail').modal('show')
}

function confirmCashData () {
  $.ajax({
    url: '/crmorders/consume',
    data: {
      uuid: nodeEdit.uuid
    },
    type: 'put',
    success: function (data) {
      createModalTips(data.msg || '消费成功！')
      oTab.api().ajax.reload(null, false)
    }
  })
}

function send (that) {
  $('#modalAdd_send').modal('show')
  var node = $(that).closest('tr')
  nodeEdit = oTab.api().row(node).data()
}

function doSend () {
  $.ajax({
    url: '/crmorders/update',
    data: {
      uuid: nodeEdit.uuid,
      logisticscode: $('#shippercode').val(),
      shippercode: $('#logisticscode').val()
    },
    type: 'put',
    success: function (data) {
      createModalTips(data.msg || '订单状态更新成功！')
      $('#modalAdd_send').modal('hide')
      oTab.api().ajax.reload(null, false)
    }
  })
}

function getShipped (that) {
  var node = $(that).closest('tr')
  nodeEdit = oTab.api().row(node).data()
  $.ajax({
    url: '/crmlogistics/getTrace',
    data: {
      orderuuid: nodeEdit.uuid
    },
    type: 'get',
    success: function (data) {
      $('#modal_shipped h5').text('运单号：' + data.logisticscode)
      $('#modal_shipped .temp:visible').remove()

      if (data.traces) {
        data.traces.map(function (e, i) {
          var t = $('#modal_shipped .temp').clone().removeClass('temp').show()
          $(t).find('label').text(e.AcceptTime)
          $(t).find('div').text(e.AcceptStation)
          $('#modal_shipped form').append($(t))
        })
        $('#modal_shipped').modal('show')
      } else {
        createModalTips('暂无物流信息！')
      }
    }
  })
}
