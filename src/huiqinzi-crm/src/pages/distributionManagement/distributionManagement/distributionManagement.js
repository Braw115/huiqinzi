var oTab = createDt(),
  nodeEdit, opr, all

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
      url: '/crmdistribute/getDistPeople',
      dataSrc: (d) => {
        return d.res
        alert('返回', d)
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
        data: 'wxname'
      },
      {
        data: 'distribute_num'
      },
      {
        data: 'distribute_price'
      },
      {
        data: 'totalincom'
      },
      {
        data: 'withdrawbalance',

      },
      {
        data: 'distribute',
        render: (d) => {
          return d ? '正常' : '异常'
        }
      }
    ],
    'rowCallback': function (row, data, index) {
      $(row).find('td:first').html(index + 1)
      $(row).find('select:first').val(data.status)
    },
  })
}
