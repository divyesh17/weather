
const resolvedUnit = {
    'F': 'imperial',
    'C': 'metric',
    'K': ''
};

const toFahrenheit = (temp) => {
    let tempF = (parseFloat(toCelcius(temp)))*9/5 + 32;
    return tempF.toString();
};

const toCelcius = (temp) => {
    let tempC = parseFloat(temp) - 273.15;
    return tempC;
};

const convert = (temp, unit) => {
                    if(unit === 'F'){
                        return toFahrenheit(temp);
                    }
                    if(unit === 'C'){
                        return toCelcius(temp);
                    }
                    return temp;
                };

class UnitSelector extends React.Component {
    constructor(props) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(e) {
        this.props.onUnitChange(e.target.value);
    }

    render() {
        return (
            <select className="unit-selector" value={this.props.unit} onChange={this.handleChange}>
                <option value="C">Celsius</option>
                <option value="F">Fahrenheit</option>
                <option value="K">Kelvin</option>
            </select>
        );
    }
}

class CitySelector extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            fetchedCities: ['Gurugram', 'Ahmedabad', 'Bangalore']
        };
        this.handleChange = this.handleChange.bind(this);
    }

    componentWillMount() {
        this.props.updateFetchedCities(this.state.fetchedCities);
    }

    handleChange(e) {
        this.props.onCityChange(e.target.value);
    }

    render() {
        let fetchedCities = this.state.fetchedCities;
        let cityList = fetchedCities.map((cityName) =>
            (<option value={cityName} key={cityName}>{cityName}</option>)
        );

        return (
            <select className="city-selector" value={this.props.cityName} onChange={this.handleChange}>
                <option value="Select">Select</option>
                {cityList}
            </select>
        );
    }
}

class TemperatureIndicator extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            fetchedTemp: '',
            currentStatus: 'Please select city.'
        };
        this.cityToTemp = {};
        this.showFetchedFailError = this.showFetchedFailError.bind(this);
        this.updateState = this.updateState.bind(this);
    }

    updateTemperature() {

    }

    showFetchedFailError(response) {
        console.log('Network request for weather failed with response '
            + response.status + ': ' + response.statusText);
        this.setState({
            currentStatus: "Sorry, request failed."
        });
    }

    updateState(temp,unit) {
        this.setState({
            fetchedTemp: convert(temp,unit),
            currentStatus: ''
        });
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            currentStatus: (nextProps.cityName === 'Select')?'Please select city':'Loading...'
        });

        if(nextProps.fetchedCities !== this.props.fetchedCities) {
            setInterval(() => {
                nextProps.fetchedCities.map((cityName) => {
                    this.fetchTemperature(cityName, (temp) => {
                        this.cityToTemp[cityName] = temp;
                    })
                })
            },600000);
        }

        if(this.cityToTemp[nextProps.cityName] !== undefined) {
            this.updateState(this.cityToTemp[nextProps.cityName],nextProps.unit);
        }
        else if(nextProps.cityName !== 'Select')
            this.fetchTemperature(nextProps.cityName, (temp) =>{
                this.updateState(temp,nextProps.unit);
            });
    }

    fetchTemperature(cityName,callBackFun) {
        let url = `http://api.openweathermap.org/data/2.5/find?q=${cityName},in&APPID=d3d742a3a686e03cbcb52eeff95506ee`;
        let temp;
        fetch(url).then((response) => {
            if(response.ok) {
                response.json().then((data) => {
                    //alert(data);
                    callBackFun(data.list[0].main.temp.toString())
                });
            }
            else {
                this.showFetchedFailError(response);
            }
        }).catch((response)=>{
            this.showFetchedFailError(response);
        });
        return temp;
    }

    render() {
        let tempElem = (this.state.currentStatus)?
            <span>{this.state.currentStatus}</span>:
            <span>{this.state.fetchedTemp}</span>
        return (
            <div>
                {tempElem}
            </div>
        );
    }
}

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currentCity: 'Select',
            currentUnit: 'C',
            fetchedCities: []
        };
        this.handleCityChange = this.handleCityChange.bind(this);
        this.handleUnitChange = this.handleUnitChange.bind(this);
        this.updateFetchedCities = this.updateFetchedCities.bind(this);
    }

    handleCityChange(cityName) {
        this.setState({
            currentCity: cityName
        });
    }

    handleUnitChange(unit) {
        this.setState({
            currentUnit: unit
        });
    }

    updateFetchedCities(fetchedCities) {
        this.setState({
           fetchedCities: fetchedCities
        });
    }

    render() {
        return (
            <div className='weather-app'>
                <TemperatureIndicator
                    cityName={this.state.currentCity}
                    fetchedCities={this.state.fetchedCities}
                    unit={this.state.currentUnit}
                />
                <CitySelector
                    cityName={this.state.currentCity}
                    onCityChange={this.handleCityChange}
                    updateFetchedCities={this.updateFetchedCities}
                />
                <UnitSelector
                    unit={this.state.currentUnit}
                    onUnitChange={this.handleUnitChange}
                />
            </div>
        );
    }
}

ReactDOM.render(<App/>, document.getElementById('root'));