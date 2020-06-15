if (typeof (window) === 'undefined') {

} else {
  // console.log('browser');


  let durl = "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_global.csv";
  let worldmapjson = 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/95368/world.json';

  $.get(worldmapjson, function (chinaJson) {
    echarts.registerMap('world', chinaJson);
    // 绘制图表
    let worldChart = echarts.init(document.getElementById('main'));

    let nameMap = {
      "Democratic Republic of the Congo": "Congo (Kinshasa)",
      "Republic of the Congo": "Congo (Brazzaville)",
      "South Korea": "Korea, South",
      "United States of America": "US",
      "Myanmar": "Burma",
      "Czech Republic": "Czechia",
      "Republic of Serbia": "Serbia",
      "Papua New Guinea": "Papua New Guinea",
      "East Timor": "Timor-Leste",
      "Ivory Coast": "Cote d'Ivoire",
      "Somaliland": "Somalia",
      "Macedonia": "North Macedonia",
      "United Republic of Tanzania": "Tanzania",
      "Guinea Bissau": "Guinea-Bissau"

    };

    let a = d3.csv(durl).then(function (data) {
      let caseMap = new Map();
      data.map((ele) => {
        if (caseMap.has(ele['Country/Region']))
          caseMap.set(ele['Country/Region'], caseMap.get(ele['Country/Region']) + parseInt(ele['6/14/20']));
        else
          caseMap.set(ele['Country/Region'], parseInt(ele['6/14/20']));
      });

      let d = [];
      caseMap.forEach(function (value, key) {
        d.push({ name: key, value: value });
      })


      let option = {
        //  backgroundColor: "#02AFDB",
        title: {    //地图显示标题
          show: false,
          text: '',
          top: "30px",
          left: 'center',
          textStyle: { color: '#000' }
        },
        visualMap: {   //图列显示柱
          type: 'piecewise',
          left: 30,
          realtime: false,
          calculable: true,
          color: ['green', 'lightgreen', 'red'],
          pieces: [
            { "max": 50000000, "min": 100000, "label": ">100000", "color": "#E61010" },
            { "max": 99999, "min": 10000, "label": "10000-99999", "color": "#F2680B" },
            { "max": 9999, "min": 5000, "label": "5000-9999", "color": "#B56741" },
            { "max": 4999, "min": 1000, "label": "500-4999", "color": "#ECAC36" },
            { "max": 999, "min": 100, "label": "10-499", "color": "#52acFF" },
            { "max": 99, "min": 1, "label": "1-9", "color": "#88A1BD" },
            { "max": 0, "min": 0, "label": "0", "color": "#FFFFFF" },
          ]
        },
        toolbox: {  //工具栏
          show: false,
          orient: 'vertical',
          top: 50,
          itemGap: 20,
          left: 30,
          feature: {
            dataView: { readOnly: false },
            restore: {},
            saveAsImage: {}
          }
        },
        tooltip: {  //提示框组件
          show: true,
          trigger: 'item',
          formatter: ''
        },
        series: [{
          name: "Confirmed Cases",
          type: 'map',
          mapType: 'world',
          roam: true,
          zoom: 1,
          mapLocation: { y: 100 },
          data: d,   //绑定数据
          nameMap: nameMap,
          symbolSize: 12,
          label: {
            normal: { show: false },
            emphasis: { show: true }
          },
          itemStyle: {
            emphasis: {
              borderColor: 'transparent',
              borderWidth: 1
            }
          }
        }],
      };
      worldChart.setOption(option);
    });

  });
}
