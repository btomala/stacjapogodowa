function update(){
    const data = fetchData()
    const speed = vegaEmbed('#speedChart', speedSpec, {actions: false})
    const direction = vegaEmbed('#directionChart', directionSpec, {actions: false});
    const temp = vegaEmbed('#tempChart', tempSpec, {actions: false});
    Promise.all([data, speed, direction, temp])
    .then((res) => {
        res[1].view
            .insert('fetched', res[0].feeds)
            .run();
            res[2].view
            .insert('fetched', res[0].feeds)
            .run();
            res[3].view
            .insert('fetched', res[0].feeds)
            .run();
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
    }).finally(() => setTimeout(update, 60*1000));
}
  
async function fetchData() {
    const response = await fetch("https://api.thingspeak.com/channels/951169/feeds.json?results=100&timezone=Europe/Warsaw");
    const data = await response.json();
    return data;
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
    if (direction > 350) return "yellow";
    else if (direction < 20) return "yellow";
    else if (direction < 100) return "green";
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
    height: 150,
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
            axis: {
              title: 'Siła wiatru m/s'
            }
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
            axis: {
              title: 'Siła wiatru m/s'
            }
          },
        }
      }
    ],
    encoding: {
      x: {
        field: 'created_at',
        type: 'temporal',
        axis: {
          title: 'Czas'
        }
      }
    }
  };

  var directionSpec = {
    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
    width: "container",
    height: 150,
    autosize: { type: "fit", resize: true},
    data: {
      name: "fetched",
      values: []
    },
    mark: {type: "point", filled: true, size: 5},
    encoding: {
      y: {
        field: 'field6', 
        type: 'quantitative', 
        scale: {
          domain: [0, 360]
        },
        axis: {
          title: 'Kierunek'
        }
      },
      x: {
        field: 'created_at',
        type: 'temporal',
        axis: {
          title: 'Czas'
        }
      }
    }
  };

  var tempSpec = {
    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
    width: "container",
    height: 150,
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
          title: 'Temperatura \u{2103}'
        }
      },
      x: {
        field: 'created_at',
        type: 'temporal',
        axis: {
          title: 'Czas'
        }
      }
    }
  };

