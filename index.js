const channel = 951169;
const possible_from = 10;
const possible_to = 70;
const recommended_from = 30;
const recommended_to = 50;
const circuit = 140 * 2 * 3.14

let last_entry_id;

function start(enforced) {
    const speed = vegaEmbed('#speedChart', speedSpec, {actions: false})
    const direction = vegaEmbed('#directionChart', directionSpec, {actions: false});
    const temp = vegaEmbed('#tempChart', tempSpec, {actions: false});
    setRecommended();
    setPossible();
    update(speed, direction, temp, 100, enforced);
}
function update(speed, direction, temp, n, enforced){
    const data = fetchThingspeakData(channel, n);
    Promise.all([data, speed, direction, temp])
    .then((res) => {
        console.log(`${last_entry_id}:${res[0].channel.last_entry_id}`);
        if(enforced || last_entry_id != res[0].channel.last_entry_id) {
          last_entry_id = res[0].channel.last_entry_id;
          res[1].view
            .insert('fetched', res[0].feeds)
            .runAsync();
          res[2].view
            .insert('fetched', res[0].feeds)
            .runAsync();
          res[3].view
            .insert('fetched', res[0].feeds)
            .runAsync();
        }
      }
    );

    data.then ( resp => {
        const latestId = resp.channel.last_entry_id;
        const latest = resp.feeds.find( f => f.entry_id == latestId)
        setWind(latest);
        setGust(latest);
        setDirection(latest);
        setTemperature(latest);
        setUpdatedText(latest.created_at);
    }).catch( err => {
        const text = document.getElementById("updated");
        text.style.fill = "red";
    }).finally(() => setTimeout(() => update(speed, direction, temp, 1), 60*1000));
}
  
async function fetchThingspeakData(id, n) {
    const response = await fetch(`https://api.thingspeak.com/channels/${id}/feeds.json?results=${n}&timezone=Europe/Warsaw`);
    const data = await response.json();
    return data;
}

function setRecommended() {
    const recommended = document.getElementById("recommended")
    const range = circuit * (recommended_to - recommended_from) / 360;
    const shift = -90 + recommended_from;
    recommended.setAttribute("stroke-dasharray",`${range} ${circuit}`)
    recommended.setAttribute("transform",`rotate(${shift} 200,200)`);
}

function setPossible() {
  const possible = document.getElementById("possible")
  const range = circuit * (possible_to - possible_from) / 360;
  const shift = -90 + possible_from;
  possible.setAttribute("stroke-dasharray",`${range} ${circuit}`)
  possible.setAttribute("transform",`rotate(${shift} 200,200)`);
}

function dateToTime(updated) {
    const date = new Date(updated);
    return date.toLocaleTimeString('pl-PL', { hour: "2-digit", minute: "2-digit" });
    
}
function setUpdatedText(updated) {
    const time = dateToTime(updated);
    const text = document.getElementById("updated");
    text.textContent = `\u{27F3} ${time}`;
    text.style.fill = "black";
}

function setArrow(latest) {
    const arrow = document.getElementById("arrow");
    const direction = getDirection(latest);
    const speed = getSpeed(latest);
    arrow.style.fill = getSpeedColor(speed);
    arrow.style.stroke = getDirectionColor(direction);
    arrow.setAttribute("transform", `rotate(${direction} 200,200)`);    
}

function setWind(latest) {
    const element = document.getElementById("wind")
    const value = element.getElementsByClassName("value")[0];
    const indicator = element.getElementsByClassName("indicator")[0];
    const speed = getSpeed(latest);
    indicator.style.background = getSpeedColor(speed);
    value.innerHTML = `${speed} <span>m/s</span>`;
}
function setGust(latest) {
    const element = document.getElementById("gust")
    const value = element.getElementsByClassName("value")[0];
    const indicator = element.getElementsByClassName("indicator")[0];
    const gust = getGust(latest);
    indicator.style.background = getSpeedColor(gust);
    value.innerHTML = `${gust} <span>m/s</span>`;
}
function setDirection(latest) {
    const element = document.getElementById("direction")
    const value = element.getElementsByClassName("value")[0];
    const indicator = element.getElementsByClassName("indicator")[0];
    const direction = getDirection(latest);
    setArrow(latest);
    indicator.style.background = getDirectionColor(direction);
    value.innerHTML = `${direction} \u{00B0}`;
}
function setTemperature(latest) {
    const element = document.getElementById("temperature")
    const value = element.getElementsByClassName("value")[0];
    const indicator = element.getElementsByClassName("indicator")[0];
    const temp = getTemeperature(latest);
    indicator.style.background = getTemperatureColor(temp);
    value.innerHTML = `${temp} <span>\u{2103}</span>`;
}
function getSpeedColor(speed) {
    if (speed < 3) return "lightblue";
    else if (speed < 6) return "green";
    else if (speed < 10) return "yellow";
    else return "red";
}

function getDirectionColor(direction) {
    if (direction < possible_from) return "black";
    if (direction < recommended_from) return "yellow";
    else if (direction < recommended_to) return "green";
    else if (direction < possible_to) return "yellow";
    else return "black";
}
function getTemperatureColor(temp) {
    if (temp < 0) return "lightblue";
    else if (temp < 20) return "green";
    else if (temp < 30) return "yellow";
    else return "red";
}
function getGust(feed) {
    return Math.round(feed.field4*10)/10;
}
function getSpeed(feed) {
    return Math.round(feed.field5*10)/10;
}
function getTemeperature(feed) {
    return Math.round(feed.field1*10)/10;
}
function getDirection(feed) {
    return feed.field6;
}

var speedSpec = {
    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
    width: "container",
    height: 300,
    autosize: { type: "fit", resize: true},
    data: {
      name: "fetched",
      values: []
    },
    layer: [
      {
        mark: {
          opacity: 0.3, 
          type: "area", 
          color: "#85C5A6"
        },
        encoding: {
          y: {
            field: 'field4', 
            type: 'quantitative', 
          },
        }
      },
      {
        mark: {
          opacity: 0.7, 
          type: "area", 
          color: "#85C5A6"
        },
        encoding: {
          y: {
            field: 'field5', 
            type: 'quantitative', 
          },
        }
      }
    ],
    encoding: {
      x: {
        field: 'created_at',
        type: 'temporal',
        timeUnit: 'hoursminutes',
        axis: {
          title: 'Local Time',
          titleFontSize: 15,
          labelFontSize: 18
        }
      },
      y: {
        axis: {
          tickCount: 10,
          format: ".1f",
          title: 'Avg. wind & Gust m/s',
          titleFontSize: 15,
          labelFontSize: 18,
          labelSeparation: 3
        }
      }
    }
  };

  var directionSpec = {
    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
    width: "container",
    height: 300,
    autosize: { type: "fit", resize: true},
    data: {
      name: "fetched",
      values: []
    },
    mark: {type: "point", filled: true, size: 30, color: "red"},
    encoding: {
      y: {
        field: 'field6', 
        type: 'quantitative',
        scale: {
          domain: [0, 360],
        },
        axis: {
          tickCount: 5,
          values: [0,90,180,270,360],
          title: 'Wind Direction',
          titleFontSize: 15,
          labelFontSize: 18
        }
      },
      x: {
        field: 'created_at',
        type: 'temporal',
        timeUnit: 'hoursminutes',
        axis: {
          title: 'Local Time',
          titleFontSize: 15,
          labelFontSize: 18,
          labelSeparation: 3
        }
      }
    }
  };

  var tempSpec = {
    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
    width: "container",
    height: 300,
    autosize: { type: "fit", resize: true},
    data: {
      name: "fetched",
      values: []
    },
    mark: 'line',
    encoding: {
      y: {
        field: 'field1', 
        type: 'quantitative', 
        axis: {
          title: 'Temperature \u{2103}',
          titleFontSize: 15,
          labelFontSize: 18
        }
      },
      x: {
        field: 'created_at',
        type: 'temporal',
        timeUnit: 'hoursminutes',
        axis: {
          title: 'Local Time',
          titleFontSize: 15,
          labelFontSize: 18,
          labelSeparation: 3
        }
      }
    }    
  };

