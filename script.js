
//Variables
var city="";
var searchCity = $("#search-city");
var searchButton = $("#search-button");
var clearButton = $("#clear-history");
var currentCity = $("#current-city");
var currentTemperature = $("#temperature");
var currentHumidity = $("#humidity");
var currentWindSpeed = $("#wind-speed");
var currentUVIndex = $("#uv-index");
var sCity=[];

//Function to search if city exists in entries from storage
function find(c){
    for (var i=0; i<sCity.length; i++){
        if(c.toUpperCase()===sCity[i]){
            return -1;
        }
    }
    return 1;
}
//Set up API key
var APIKey="d38f9130c718c3a63b0f1042af28c63b";
//d38f9130c718c3a63b0f1042af28c63b
//console.log(APIKey);

//Display current weather and 5-day forecast after searching city from text box
function displayWeather(event){
    event.preventDefault();
    if(searchCity.val().trim()!==""){
        city=searchCity.val().trim();
        currentWeather(city);
    }
}


//Function for AJAX call
function currentWeather(city){
    //Request to servers to get data
    var queryURL = "https://api.openweathermap.org/data/2.5/weather?q="+city+"&appid=" +APIKey;
    $.ajax ({
        url: queryURL,
        method: "GET",
    }).then(function(response){
        //parse response to display city name, current weather, date, and weather icon
        var weathericon = response.weather[0].icon;
        var iconurl = "https://openweathermap.org/img/wn/"+weathericon+"@2x.png"
        //Format date
        var date=new Date(response.dt*1000).toLocaleDateString();
        //Parse response for city name, concatonate date and weather icon
        $(currentCity).html(response.name + "("+date+")" + "<img src="+iconurl+">");

        //Parse response to display current temperature in farenheit
        var tempF = (response.main.temp - 273.15)*1.80+32;
        $(currentTemperature).html((tempF).toFixed(2)+"&#8457");
        //Display humidity
        $(currentHumidity).html(response.main.humidity+"%");
        //Display wind speed in mph
        var ws=response.wind.speed;
        var windsmph=(ws*2.237).toFixed(1);
        $(currentWindSpeed).html(windsmph+"MPH");
        //Display UV index
        UVIndex(response.coord.lon,response.coord.lat);
        forecast(response.id);
        if(response.cod==200){
            sCity=JSON.parse(localStorage.getItem("cityname"));

            if(sCity==null){
                sCity=[];
                sCity.push(city.toUpperCase());
                localStorage.setItem("cityname",JSON.stringify(sCity));
                addToList(city);
            }
            else {
                if (find(city)>0){
                    sCity.push(city.toUpperCase());
                    localStorage.setItem("cityname",JSON.stringify(sCity));
                    addToList(city);
                }
            }
        }

    });
}

//Return UV Index 
function UVIndex(ln,lt){
    var uvURL = "http://api.openweathermap.org/data/2.5/uvi?appid="+APIKey+"&lat="+lt+"&lon="+ln;
    $.ajax({
        url:uvURL,
        method: "GET"
    }).then(function(response){
        $(currentUVIndex).html(response.value);
    });
}
//Changes UV index box color for intensity
if (currentUVIndex.value > 7) {
    document.querySelector("#uv-index").classList.add("bg-danger");
} else if (currentUVIndex.value >= 2 && currentUVIndex.value <= 7) {
    document.querySelector("#uv-index").classList.add("bg-warning");
} else if (currentUVIndex.value <= 2) {
    document.querySelector("#uv-index").classList.add("bg-success");
}
//5-day forecast
function forecast(cityid){
    var dayover = false;
    var queryforcastURL = "http://api.openweathermap.org/data/2.5/forecast?id="+cityid+"&appid="+APIKey;
    $.ajax({
        url: queryforcastURL,
        method: "GET"
    }).then(function(response){

        for (i=0; i<5; i++){
            var date = new Date((response.list[((i+1)*8)-1].dt)*1000).toLocaleDateString();
            var iconcode = response.list[((i+1)*8)-1].weather[0].icon;
            var iconurl = "http://openweathermap.org/img/wn/"+iconcode+".png";
            var tempK = response.list[((i+1)*8)-1].main.temp;
            var tempF = (((tempK-273.5)*1.80)+32).toFixed(2);
            var humidity = response.list[((i+1)*8)-1].main.humidity;

            $("#fDate"+i).html(date);
            $("#fImg"+i).html("<img src="+iconurl+">");
            $("#fTemp"+i).html(tempF+"&#8457");
            $("#fHumidity"+i).html(humidity+"%")
        }
    })

}

//Add last searched city to local storage and to list
function addToList(c){
    var listEl = $("<li>"+c.toUpperCase()+"<li>");
    $(listEl).attr("class", "list-group-item");
    $(listEl).attr("data-value",c.toUpperCase());
    $(".list-group").append(listEl);
}

//Display previously searched city results when selected
function invokePastSearch(event){
    var liEl=event.target;
    if (event.target.matches("li")){
        city=liEl.textContent.trim();
        currentWeather(city);
    }
}

//Render function
function loadLastCity(){
    $("ul").empty();
    var sCity = JSON.parse(localStorage.getItem("cityname"));
    if (sCity !== null){
        sCity = JSON.parse(localStorage.getItem("cityname"));
        for(i=0; i<sCity.length; i++){
            addToList(sCity[i]);
        }
        city=sCity[i-1];
        currentWeather(city);
    }
}

//Clear search button
function clearHistory(event){
    event.preventDefault();
    sCity = [];
    localStorage.removeItem("cityname");
    document.location.reload();
}

//Click Handlers
$("#search-button").on("click", displayWeather);
$(document).on("click", invokePastSearch);
$(window).on("load", loadLastCity);
$("#clear-history").on("click", clearHistory);

