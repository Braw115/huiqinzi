
console.log('888')
  var myChart = echarts.init(document.getElementById('main')),
  option = {
    legend: {
      data: ['分销总金额', '分销商品数', '达人赚钱总额', '利润', '入驻分销达人']
    },
    xAxis: {
      type: 'category',
      data: []
    },
    yAxis: {
      type: 'value',
    },
    series: [
      {
        name: '分销总金额',
        data: [],
        type: 'line'
      },
      {
        name: '分销商品数',
        data: [],
        type: 'line'
      },
      {
        name: '达人赚钱总额',
        data: [],
        type: 'line'
      },
      {
        name: '利润',
        data: [],
        type: 'line'
      },
      {
        name: '入驻分销达人',
        data: [],
        type: 'line'
      },
    ]
  }
getDistributeData ()
function getDistributeData () {
  $.ajax({
    type: 'post',
    url: '/crmdistribute/getDistributeData',
    success: function (data) {
      var res = data.distributeOrder
      console.log('分销总金额', res.totalfee)
      $('#totalfee').text(res.totalfee)
      $('#distributeordernum').text(res.distributeordernum)
      $('#dispeoplefee').text(res.dispeoplefee)
      $('#profits').text(res.profits)
      $('#peopleNum').text(res.peopleNum)
      data.distributeOrders.reverse().map((e,i)=>{
        option.xAxis.data.push(e.date)
        option.series[0].data.push(e.totalfee)
        option.series[1].data.push(e.distributeordernum)
        option.series[2].data.push(e.dispeoplefee)
        option.series[3].data.push(e.profits)
        option.series[4].data.push(e.peopleNum)
      })
      myChart.setOption(option)
    }
  })
}