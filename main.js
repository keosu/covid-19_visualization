(function(){

  $(window).on('load', function () {
    $(".loading").fadeOut()
  })

  $(document).ready(function () {
    let whei = $(window).width()
    $("html").css({ fontSize: whei / 20 })
    $(window).resize(function () {
      let whei = $(window).width()
      $("html").css({ fontSize: whei / 20 })
    });
  });

  let t = setTimeout(update_time, 1000);
  function update_time() {
    let dt = new Date();
    let y = dt.getFullYear();
    let mt = dt.getMonth() + 1;
    let day = dt.getDate();
    let h = dt.getHours();
    let m = dt.getMinutes();
    let s = dt.getSeconds();
    document.getElementById("showTime").innerHTML = y + "-" + mt + "-" + day + " " + h + ":" + m + ":" + s;
    t = setTimeout(update_time, 1000);
  } 

  function update_case_chart(xdata, ydata, chartid,color) {
    // 基于准备好的dom，初始化echarts实例
    let myChart = echarts.init(document.getElementById(chartid));
    let option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      grid: {
        left: '1%',
        right: '1%',
        bottom: '0%',
        top: '0%',
        containLabel: true
      },
      xAxis: {
        type: 'log',
        boundaryGap: [0, 0.01],
        axisLabel: {
          interval: 0,
          show: true,
          splitNumber: 15,
          textStyle: {
            color: "rgba(255,255,255,.6)",
            fontSize: '12',
          },
        },
      },
      yAxis: {
        type: 'category',
        data: xdata,
        inverse: true,
        axisLabel: {
          interval: 0,
          show: true,
          splitNumber: 15,
          textStyle: {
            color: "rgba(255,255,255,.6)",
            fontSize: '12',
          },
        },
      },
      series: [
        {
          name: 'cases',
          type: 'bar',
          data: ydata,
          label: {
            show: true,
            position: 'right'
          },
          itemStyle:{
            color:color
          }
        }
      ]
    };

    // 使用刚指定的配置项和数据显示图表。
    myChart.setOption(option);
    window.addEventListener("resize", function () {
      myChart.resize();
    });
  }

  function update_daily_chart(xdata, ydata, chartid,color) { 
    let myChart = echarts.init(document.getElementById(chartid));
 

    let option = {
      tooltip: {
        trigger: 'axis', 
      },
      grid: {
        left: '1%',
        right: '1%',
        bottom: '15%',
        top: '5%',
        containLabel: true
      },  
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: xdata,
        axisLabel: { 
          show: true,
          splitNumber: 15,
          textStyle: {
            color: "rgba(255,255,255,.6)",
            fontSize: '12',
          },
        } 
      },
      yAxis: {
        type: 'value',
        boundaryGap: [0, '100%'],
        max:'dataMax',
        axisLabel: { 
          show: true,
          splitNumber: 15,
          textStyle: {
            color: "rgba(255,255,255,.6)",
            fontSize: '12',
          },
        },
      },
      dataZoom: [{
        type: 'inside',
        start: 0,
        end: 1000
      }, {
        start: 0,
        end: 10,
        handleSize: '80%',
        handleStyle: {
          color: '#fff',
          shadowBlur: 3,
          shadowColor: 'rgba(0, 0, 0, 0.6)',
          shadowOffsetX: 2,
          shadowOffsetY: 2
        }
      }],
      series: [
        {
          name: '',
          type: 'line',
          smooth: false,
          symbol: 'none',
          sampling: 'average',
          itemStyle: {
            color: color
          },
          areaStyle: {
            color: color
            // new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
            //   offset: 0,
            //   color: 'rgb(255, 158, 68)'
            // }, {
            //   offset: 1,
            //   color: 'rgb(255, 70, 131)'
            // }])
          },
          data: ydata
        }
      ]
    };
 
    myChart.setOption(option);
    window.addEventListener("resize", function () {
      myChart.resize();
    });
  }



  let durl = "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_global.csv";
  let death_url = "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_deaths_global.csv"
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
      "East Timor": "Timor-Leste",
      "Ivory Coast": "Cote d'Ivoire",
      "Somaliland": "Somalia",
      "Macedonia": "North Macedonia",
      "United Republic of Tanzania": "Tanzania",
      "Guinea Bissau": "Guinea-Bissau"

    };

    d3.csv(durl).then(function (data) {
      let keys = Object.keys(data[0]);
      let daily_case = {};
      keys.forEach((ele) => {
        daily_case[ele] = 0;
      });
      let caseMap = new Map();
      data.map((ele) => {
        keys.forEach((key) => {
          daily_case[key] += parseInt(ele[key]);
        });
        if (caseMap.has(ele['Country/Region']))
          caseMap.set(ele['Country/Region'], caseMap.get(ele['Country/Region']) + parseInt(ele[keys[keys.length - 1]]));
        else
          caseMap.set(ele['Country/Region'], parseInt(ele[keys[keys.length - 1]]));
      });

      let d = [];
      caseMap.forEach(function (value, key) {
        d.push({ name: key, value: value });
      })

      let sortdata = d.sort(function (a, b) { return b.value - a.value });
      
      let xdata = [], ydata = [];
      sortdata.slice(0, 20).forEach((val) => {
        xdata.push(val.name);
        ydata.push(val.value);
      })
      update_case_chart(xdata, ydata, 'chart_cases','red');

      delete daily_case['Long'];
      delete daily_case['Lat'];
      delete daily_case['Province/State'];
      delete daily_case['Country/Region']
      let values = Object.values(daily_case);
      document.getElementById('total_num').innerText = values[values.length-1];
      for(let i=values.length-1;i>=1;i--)
        values[i] = values[i] - values[i-1]
      update_daily_chart(Object.keys(daily_case), values, 'chart_daily_cases','red')


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
          show: false,
          left: 30,
          realtime: false,
          calculable: true,
          color: ['green', 'lightgreen', 'red'],
          pieces: [
            { "max": 100000000, "min": 10000000, "label": ">500000", "color": "#4D1F00" },
            { "max": 9999999, "min": 1000000, "label": "100000-499999", "color": '#8B0000' },
            { "max": 999999, "min": 500000, "label": "50000-99999", "color": '#CC5500' },
            { "max": 499999, "min": 100000, "label": "10000-49999", "color": "#FF7300" },
            { "max": 99999, "min": 10000, "label": "1000-9999", "color": "#FFA500" },
            { "max": 9999, "min": 1000, "label": "10-999", "color": "#F0E68C" },
            { "max": 999, "min": 1, "label": "1-9", "color": "#FFFFE0" },
            { "max": 0, "min": 0, "label": "0", "color": "#FFFFFF" },
          ]
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

    d3.csv(death_url).then(function (data) {
      let keys = Object.keys(data[0]);
      let daily_death = {};
      keys.forEach((ele) => {
        daily_death[ele] = 0;
      });

      let caseMap = new Map();
      data.map((ele) => {
        keys.forEach((key) => {
          daily_death[key] += parseInt(ele[key]);
        });
        if (caseMap.has(ele['Country/Region']))
          caseMap.set(ele['Country/Region'], caseMap.get(ele['Country/Region']) + parseInt(ele[keys[keys.length - 1]]));
        else
          caseMap.set(ele['Country/Region'], parseInt(ele[keys[keys.length - 1]]));
      }); 

      let d = [];
      caseMap.forEach(function (value, key) {
        d.push({ name: key, value: value });
      })

      let sortdata = d.sort(function (a, b) { return b.value - a.value });

      let xdata = [], ydata = [];
      sortdata.slice(0, 20).forEach((val) => {
        xdata.push(val.name);
        ydata.push(val.value);
      })

      update_case_chart(xdata, ydata, 'chart_death','green');
      delete daily_death['Long'];
      delete daily_death['Lat'];
      delete daily_death['Province/State'];
      delete daily_death['Country/Region']
      let values = Object.values(daily_death);
      document.getElementById('death_num').innerText = values[values.length-1];
      for(let i=values.length-1;i>=1;i--)
        values[i] = values[i] - values[i-1]
      update_daily_chart(Object.keys(daily_death), values, 'chart_daily_death','green')
    });

  });

})();
